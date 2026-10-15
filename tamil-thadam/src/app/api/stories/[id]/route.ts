// src/app/api/stories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, BUCKET_NAME } from "@/lib/supabaseAdmin";
import { getStoryById, deleteStory } from "@/lib/stories-store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`🔍 [Supabase] Fetching single story: ${id}`);

    // Try Supabase first
    const { data: dbStory, error: dbError } = await supabaseAdmin
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
      .eq("id", id)
      .maybeSingle();

    if (dbError) {
      console.error("❌ [Supabase GET by ID error]:", JSON.stringify(dbError, null, 2));
    }

    if (dbStory) {
      const row = dbStory as any;
      const audio = row.audio_files?.[0];
      const transcript = row.transcripts?.[0];
      const districtName = (Array.isArray(row.districts) ? row.districts[0]?.name_ta : row.districts?.name_ta) || "தமிழ்நாடு";
      const topicName = (Array.isArray(row.topics) ? row.topics[0]?.name_ta : row.topics?.name_ta) || "வரலாறு";
      const duration = audio?.duration_seconds || 30;

      const story = {
        id: row.id,
        title: row.title,
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
        consent_given: dbStory.consent_given ?? true,
        verification_status: "verified" as const,
        summary_ta: dbStory.description || transcript?.summary || "வாய்மொழி வரலாற்று ஆவணம்.",
        transcript_full: transcript?.tamil_text || dbStory.description || "",
        transcript_segments: [
          {
            start: 0,
            end: duration,
            text: transcript?.tamil_text || dbStory.description || dbStory.title,
          },
        ],
        tags: [districtName, topicName, "வாய்மொழி வரலாறு"],
        entities: {
          people: dbStory.narrator_name ? [dbStory.narrator_name] : [],
          places: [districtName],
          traditions: [topicName],
        },
        created_at: dbStory.created_at,
      };

      return NextResponse.json({ success: true, story });
    }

    // Fallback to local store
    const localStory = await getStoryById(id);
    if (!localStory) {
      return NextResponse.json(
        { success: false, error: "கதை கிடைக்கவில்லை" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, story: localStory });
  } catch (error: any) {
    console.error("❌ [GET /api/stories/[id] error]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`🗑️ [Step 1] Request to delete story: ${id}`);

    // 1. Delete associated audio from Supabase Storage
    const { data: audioData } = await supabaseAdmin
      .from("audio_files")
      .select("storage_path")
      .eq("story_id", id);

    if (audioData && audioData.length > 0) {
      const paths = audioData.map((a: any) => a.storage_path).filter(Boolean);
      if (paths.length > 0) {
        console.log(`🗑️ [Step 2] Deleting storage files:`, paths);
        const { error: removeStorageError } = await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .remove(paths);
        if (removeStorageError) {
          console.error("❌ [Supabase Storage remove error]:", removeStorageError);
        }
      }
    }

    // 2. Delete from Supabase DB tables (audio_files and transcripts cascade or manual)
    await supabaseAdmin.from("audio_files").delete().eq("story_id", id);
    await supabaseAdmin.from("transcripts").delete().eq("story_id", id);
    const { error: deleteStoryError } = await supabaseAdmin
      .from("stories")
      .delete()
      .eq("id", id);

    if (deleteStoryError) {
      console.error("❌ [Supabase stories delete error]:", deleteStoryError);
    } else {
      console.log(`✅ [Supabase] Story deleted from database: ${id}`);
    }

    // 3. Delete from local backup store
    await deleteStory(id);

    return NextResponse.json({
      success: true,
      message: "கதை வெற்றிகரமாக நீக்கப்பட்டது",
    });
  } catch (error: any) {
    console.error("❌ [DELETE /api/stories/[id] error]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
