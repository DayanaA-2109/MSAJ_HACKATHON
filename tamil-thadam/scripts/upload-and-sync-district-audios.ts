// scripts/upload-and-sync-district-audios.ts
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import fs from "node:fs";

interface StoryMapping {
  district: string;
  localFile: string;
  durationSeconds: number;
  supabaseStoryId: string;
  mockStoryId: string;
}

const MAPPINGS: StoryMapping[] = [
  {
    district: "chennai",
    localFile: "public/audio/chennai-story-1.mp3",
    durationSeconds: 67,
    supabaseStoryId: "0a0a4f0c-e03c-4415-a674-b9bf91251013",
    mockStoryId: "chennai-kudumbam-valarppu",
  },
  {
    district: "coimbatore",
    localFile: "public/audio/coimbatore-story-1.mp3",
    durationSeconds: 41,
    supabaseStoryId: "37d60c94-90f2-4d30-a0bf-d50ced067683",
    mockStoryId: "kongu-bhashai-1970",
  },
  {
    district: "madurai",
    localFile: "public/audio/madurai-story-1.mp3",
    durationSeconds: 46,
    supabaseStoryId: "8c092057-2c44-439a-bb18-455ff4c37bf3",
    mockStoryId: "madurai-thinnai-school",
  },
  {
    district: "salem",
    localFile: "public/audio/salem-story-1.mp3",
    durationSeconds: 58,
    supabaseStoryId: "b0931f5b-cda0-495d-abbc-d4cf9c923675",
    mockStoryId: "salem-mambazham-vivasaayam",
  },
  {
    district: "thoothukudi",
    localFile: "public/audio/thoothukudi-story-1.mp3",
    durationSeconds: 55,
    supabaseStoryId: "98e86b37-d5b4-4394-89ae-390fe8535b1d",
    mockStoryId: "thoothukudi-uppalam-history",
  },
  {
    district: "villupuram",
    localFile: "public/audio/villupuram-story-1.mp3",
    durationSeconds: 51,
    supabaseStoryId: "a0fbcd5f-08e1-4081-92b6-3809c408dd34",
    mockStoryId: "villupuram-mariamman-koothu",
  },
];

async function sync() {
  const { supabaseAdmin, BUCKET_NAME } = await import("../src/lib/supabaseAdmin");
  console.log("🚀 Starting audio sync to Supabase Storage and Database...\n");

  for (const m of MAPPINGS) {
    console.log(`Processing [${m.district.toUpperCase()}] audio: ${m.localFile}`);
    if (!fs.existsSync(m.localFile)) {
      console.error(`File not found: ${m.localFile}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(m.localFile);

    // 1. Upload for Supabase story ID
    const sbStoragePath = `stories/${m.supabaseStoryId}.mp3`;
    const { error: sbUploadErr } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(sbStoragePath, fileBuffer, { contentType: "audio/mpeg", upsert: true });

    if (sbUploadErr) {
      console.error(`❌ Error uploading ${sbStoragePath}:`, sbUploadErr);
    } else {
      console.log(`✅ Uploaded to Supabase Storage: ${sbStoragePath}`);
    }

    const { data: sbUrlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(sbStoragePath);
    const sbPublicUrl = sbUrlData.publicUrl;

    // 2. Also upload for mock story ID so stories/<mockStoryId>.mp3 exists in storage
    const mockStoragePath = `stories/${m.mockStoryId}.mp3`;
    await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(mockStoragePath, fileBuffer, { contentType: "audio/mpeg", upsert: true });

    // 3. Upsert into Supabase `audio_files` table
    const { data: existingAf } = await supabaseAdmin
      .from("audio_files")
      .select("id")
      .eq("story_id", m.supabaseStoryId)
      .maybeSingle();

    if (existingAf) {
      const { error: updErr } = await supabaseAdmin
        .from("audio_files")
        .update({
          storage_path: sbStoragePath,
          audio_url: sbPublicUrl,
          duration_seconds: m.durationSeconds,
        })
        .eq("id", existingAf.id);
      if (updErr) console.error("Error updating audio_files:", updErr);
      else console.log(`✅ Updated audio_files for Supabase story ${m.supabaseStoryId}`);
    } else {
      const { error: insErr } = await supabaseAdmin
        .from("audio_files")
        .insert({
          story_id: m.supabaseStoryId,
          storage_path: sbStoragePath,
          audio_url: sbPublicUrl,
          duration_seconds: m.durationSeconds,
        });
      if (insErr) console.error("Error inserting audio_files:", insErr);
      else console.log(`✅ Inserted audio_files row for Supabase story ${m.supabaseStoryId}`);
    }

    // 4. Try updating stories.audio_url if the column exists
    try {
      await supabaseAdmin
        .from("stories")
        .update({ audio_url: sbPublicUrl })
        .eq("id", m.supabaseStoryId);
    } catch {
      // Column may not exist
    }

    console.log(`🔗 Public URL: ${sbPublicUrl}\n`);
  }

  console.log("🎉 Audio sync completed successfully!");
}

sync().catch(console.error);
