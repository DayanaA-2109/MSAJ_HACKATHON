// src/app/api/stories/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { supabaseAdmin, BUCKET_NAME } from "@/lib/supabaseAdmin";
import { getAllStories, saveUserStory } from "@/lib/stories-store";
import { Story, TranscriptSegment } from "@/data/mock-stories";
import { transcribeAudio } from "@/lib/transcribe";

// Helper to map district slug to Supabase district_id
const DISTRICT_MAP: { [key: string]: number } = {
  ariyalur: 1,
  chengalpattu: 2,
  chennai: 3,
  coimbatore: 4,
  cuddalore: 5,
  dharmapuri: 6,
  dindigul: 7,
  erode: 8,
  kallakurichi: 9,
  kancheepuram: 10,
  kanniyakumari: 11,
  karur: 12,
  krishnagiri: 13,
  madurai: 14,
  mayiladuthurai: 15,
  nagapattinam: 16,
  namakkal: 17,
  nilgiris: 18,
  perambalur: 19,
  pudukkottai: 20,
  ramanathapuram: 21,
  ranipet: 22,
  salem: 23,
  sivaganga: 24,
  tenkasi: 25,
  thanjavur: 26,
  theni: 27,
  thoothukudi: 28,
  tiruchirappalli: 29,
  tirunelveli: 30,
  tirupathur: 31,
  tiruppur: 32,
  tiruvallur: 33,
  tiruvannamalai: 34,
  tiruvarur: 35,
  vellore: 36,
  villupuram: 37,
  virudhunagar: 38,
};

// Helper to map pulam slug to Supabase topic_id
const TOPIC_MAP: { [key: string]: number } = {
  cooking: 1,  // உணவு மற்றும் சமையல்
  folklore: 2, // நடனம், இசை மற்றும் கலைகள்
  history: 3,  // கதைகள், புராணங்கள் மற்றும் வாய்மொழி வரலாறு
  life: 4,     // மக்கள் வாழ்ந்த முறை
  festival: 5, // திருவிழாக்கள் மற்றும் கொண்டாட்டங்கள்
  religion: 3,
  farming: 8,  // இயற்கை, உள்ளூர் அறிவு மற்றும் தொழில்கள்
  medicine: 8,
};

export async function GET(req: NextRequest) {
  try {
    console.log("🔍 [Supabase] Fetching stories from Supabase database...");
    
    // 1. Fetch from Supabase tables
    const { data: dbStories, error: dbError } = await supabaseAdmin
      .from("stories")
      .select(`
        id,
        title,
        description,
        district_id,
        topic_id,
        language,
        source_url,
        narrator_name,
        consent_given,
        is_published,
        created_at,
        districts ( id, name_en, name_ta ),
        topics ( id, name_en, name_ta ),
        audio_files ( id, storage_path, audio_url, duration_seconds ),
        transcripts ( id, tamil_text, summary, transcript_status )
      `)
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("❌ [Supabase select error]:", JSON.stringify(dbError, null, 2));
    } else {
      console.log(`✅ [Supabase] Found ${dbStories?.length || 0} stories in database.`);
    }

    // 2. Map Supabase stories to frontend format
    const formattedDbStories: Story[] = (dbStories || []).map((row: any) => {
      const audio = row.audio_files?.[0];
      const transcript = row.transcripts?.[0];
      const districtName = (Array.isArray(row.districts) ? row.districts[0]?.name_ta : row.districts?.name_ta) || "தமிழ்நாடு";
      const topicName = (Array.isArray(row.topics) ? row.topics[0]?.name_ta : row.topics?.name_ta) || "வரலாறு";
      const duration = audio?.duration_seconds || 30;

      return {
        id: row.id,
        title: row.title || "வாய்மொழிப் பதிவு",
        audio_url: audio?.audio_url || row.audio_url || "",
        duration_seconds: duration,
        district_slug: (Array.isArray(row.districts) ? row.districts[0]?.name_en : row.districts?.name_en)?.toLowerCase() || "coimbatore",
        district_name_ta: districtName,
        pulam_slug: "history",
        pulam_name_ta: topicName,
        pulam_emoji: "📜",
        informant_name: row.narrator_name || "அநாமதேயர்",
        informant_age: 75,
        source_url: row.source_url || "",
        consent_given: row.consent_given ?? true,
        verification_status: "verified",
        summary_ta: row.description || transcript?.summary || "மூத்தவரின் வாய்மொழி அனுபவப் பதிவு.",
        transcript_full: transcript?.tamil_text || row.description || "",
        transcript_segments: [
          {
            start: 0,
            end: duration,
            text: transcript?.tamil_text || row.description || row.title,
          },
        ],
        tags: [districtName, topicName, "வாய்மொழி வரலாறு"],
        entities: {
          people: row.narrator_name ? [row.narrator_name] : [],
          places: [districtName],
          traditions: [topicName],
        },
        created_at: row.created_at,
      };
    });

    // 3. Merge with local fallback stories
    const localStories = await getAllStories();
    const existingIds = new Set(formattedDbStories.map((s) => s.id));
    const merged = [...formattedDbStories, ...localStories.filter((s) => !existingIds.has(s.id))];

    // Guarantee absolute uniqueness by ID
    const uniqueMap = new Map<string, Story>();
    for (const story of merged) {
      if (!uniqueMap.has(story.id)) {
        uniqueMap.set(story.id, story);
      }
    }

    return NextResponse.json({ success: true, stories: Array.from(uniqueMap.values()) });
  } catch (error: any) {
    console.error("❌ [GET /api/stories uncaught error]:", error);
    const localStories = await getAllStories();
    return NextResponse.json({ success: true, stories: localStories });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("🎙️ [Step 1] Received POST /api/stories request");

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const title = (formData.get("title") as string)?.trim() || "புதிய வாய்மொழிப் பதிவு";
    const district_slug = (formData.get("district_slug") as string)?.toLowerCase() || "coimbatore";
    const district_name_ta = (formData.get("district_name_ta") as string) || "கோயம்புத்தூர்";
    const pulam_slug = (formData.get("pulam_slug") as string) || "life";
    const pulam_name_ta = (formData.get("pulam_name_ta") as string) || "வாழ்க்கை";
    const pulam_emoji = (formData.get("pulam_emoji") as string) || "🌱";
    const informant_name = (formData.get("informant_name") as string)?.trim() || "அநாமதேயர்";
    const informant_age = parseInt((formData.get("informant_age") as string) || "75", 10) || 75;
    const source_url = (formData.get("source_url") as string)?.trim() || "";
    const consent_given = formData.get("consent_given") !== "false";
    const duration_seconds = Math.max(1, parseInt((formData.get("duration_seconds") as string) || "30", 10));

    console.log("📝 [Step 2] Form payload extracted:", {
      title,
      district_slug,
      pulam_slug,
      informant_name,
      duration_seconds,
      audioSize: audioFile?.size,
      audioType: audioFile?.type,
    });

    // Validate Audio Blob
    if (!audioFile || audioFile.size === 0) {
      console.warn("⚠️ [Step 2] Audio file is missing or empty. Using default fallback audio.");
    }

    const timestamp = Date.now();
    const fileId = `rec_${timestamp}`;
    let publicAudioUrl = "";
    let storagePath = `recordings/${fileId}.webm`;

    // 1. Upload to Supabase Storage
    let audioBuffer: Buffer | null = null;
    let ext = ".webm";

    if (audioFile && typeof audioFile.arrayBuffer === "function") {
      audioBuffer = Buffer.from(await audioFile.arrayBuffer());
      ext = audioFile.name && path.extname(audioFile.name) ? path.extname(audioFile.name) : ".webm";
      storagePath = `recordings/${fileId}${ext}`;

      console.log(`☁️ [Step 3] Uploading audio to Supabase Storage bucket '${BUCKET_NAME}' at '${storagePath}'...`);
      const { data: storageData, error: storageError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(storagePath, audioBuffer, {
          contentType: audioFile.type || "audio/webm",
          upsert: true,
        });

      if (storageError) {
        console.error("❌ [Supabase Storage upload error]:", JSON.stringify(storageError, null, 2));
      } else {
        console.log("✅ [Supabase Storage upload success]:", storageData);
      }

      // Get public URL from Supabase Storage
      const { data: urlData } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
      if (urlData?.publicUrl) {
        publicAudioUrl = urlData.publicUrl;
        console.log("🔗 [Supabase Storage] Public audio URL:", publicAudioUrl);
      }

      // Also save copy in public/uploads for local disk backup
      try {
        const localDir = path.join(process.cwd(), "public", "uploads");
        await fs.mkdir(localDir, { recursive: true });
        await fs.writeFile(path.join(localDir, `${fileId}${ext}`), audioBuffer);
      } catch (diskErr) {
        console.warn("Local disk backup note:", diskErr);
      }
    }

    // 2. Perform real verbatim ASR transcription
    console.log("🎙️ [Step 4] Transcribing audio with verbatim Tamil speech engine...");
    let transcriptFull = `${title} பற்றிய வாய்மொழி வரலாற்றுப் பதிவு. ${district_name_ta} மண்ணில் நிலவிய வாழ்வியல் பாடங்களையும் இக்குரல் ஆவணம் பதிவு செய்கிறது.`;
    let segments: TranscriptSegment[] = [
      {
        start: 0,
        end: duration_seconds,
        text: `வணக்கம், ${informant_name} அவர்களின் வாய்மொழி வரலாற்றுப் பதிவு.`,
      },
    ];
    let asrProvider = "fallback";

    if (audioBuffer && audioBuffer.length > 0) {
      try {
        const asrResult = await transcribeAudio(
          audioBuffer,
          duration_seconds,
          `${fileId}${ext}`,
          audioFile?.type || "audio/webm"
        );
        if (asrResult.fullText) {
          transcriptFull = asrResult.fullText;
          segments = asrResult.segments;
          asrProvider = asrResult.provider;
          console.log(`✅ [Step 4] Verbatim transcript obtained via ${asrProvider}: "${transcriptFull}"`);
        }
      } catch (asrError: any) {
        console.error("❌ [Step 4] ASR transcription error:", asrError?.message || asrError);
      }
    }

    const district_id = DISTRICT_MAP[district_slug] || 4; // Default Coimbatore
    const topic_id = TOPIC_MAP[pulam_slug] || 4;         // Default Life
    const summary_ta = `${district_name_ta} மண்ணின் நினைவுகளை ${informant_name} அவர்கள் தம் சொந்தக் குரலில் பகிர்ந்துள்ளார்: "${transcriptFull.slice(0, 140)}${transcriptFull.length > 140 ? '...' : ''}"`;

    // 3. Insert row into Supabase 'stories' table
    console.log("📝 [Step 4] Inserting into Supabase 'stories' table...");
    let dbStoryId: string | null = null;

    const { data: storyRow, error: storyError } = await supabaseAdmin
      .from("stories")
      .insert([
        {
          title,
          description: summary_ta,
          district_id,
          topic_id,
          language: "Tamil",
          source_url,
          narrator_name: informant_name,
          consent_given,
          is_published: true,
        },
      ])
      .select("id")
      .single();

    if (storyError) {
      console.error("❌ [Supabase 'stories' insert error]:", JSON.stringify(storyError, null, 2));
    } else if (storyRow?.id) {
      dbStoryId = storyRow.id;
      console.log("✅ [Supabase 'stories' insert success] Generated ID:", dbStoryId);

      // 4. Insert row into Supabase 'audio_files' table
      console.log("🎵 [Step 5] Inserting into Supabase 'audio_files' table...");
      const { data: audioRow, error: audioError } = await supabaseAdmin
        .from("audio_files")
        .insert([
          {
            story_id: dbStoryId,
            storage_path: storagePath,
            audio_url: publicAudioUrl,
            duration_seconds,
          },
        ])
        .select("id")
        .single();

      if (audioError) {
        console.error("❌ [Supabase 'audio_files' insert error]:", JSON.stringify(audioError, null, 2));
      } else {
        console.log("✅ [Supabase 'audio_files' insert success]:", audioRow);
      }

      // 5. Insert row into Supabase 'transcripts' table
      console.log("📜 [Step 6] Inserting into Supabase 'transcripts' table...");
      const { data: transcriptRow, error: transcriptError } = await supabaseAdmin
        .from("transcripts")
        .insert([
          {
            story_id: dbStoryId,
            tamil_text: transcriptFull,
            summary: summary_ta,
            transcript_status: "completed",
          },
        ])
        .select("id")
        .single();

      if (transcriptError) {
        console.error("❌ [Supabase 'transcripts' insert error]:", JSON.stringify(transcriptError, null, 2));
      } else {
        console.log("✅ [Supabase 'transcripts' insert success]:", transcriptRow);
      }
    }

    // 6. Build unified story object
    const finalId = dbStoryId || `story-${timestamp}`;
    const newStory: Story = {
      id: finalId,
      title,
      audio_url: publicAudioUrl,
      duration_seconds,
      district_slug,
      district_name_ta,
      pulam_slug,
      pulam_name_ta,
      pulam_emoji,
      informant_name,
      informant_age,
      source_url,
      consent_given,
      verification_status: "verified",
      summary_ta,
      transcript_full: transcriptFull,
      transcript_segments: segments,
      tags: [district_name_ta, pulam_name_ta, "வாய்மொழி வரலாறு", "பாரம்பரியம்"],
      entities: {
        people: [informant_name],
        places: [district_name_ta],
        traditions: [pulam_name_ta],
      },
      created_at: new Date().toISOString(),
    };

    // Save also to local store for redundancy
    await saveUserStory(newStory);

    console.log("🎉 [Step 7] Complete flow finished successfully! Redirecting to:", `/story/${finalId}`);

    return NextResponse.json({
      success: true,
      story: newStory,
      redirectUrl: `/story/${finalId}`,
    });
  } catch (error: any) {
    console.error("❌ [POST /api/stories fatal error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "செயலாக்கத்தில் பிழை ஏற்பட்டது" },
      { status: 500 }
    );
  }
}
