// src/app/api/stories/[id]/audio/route.ts
import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { supabaseAdmin, BUCKET_NAME } from "@/lib/supabaseAdmin";
import { updateStoryAudio } from "@/lib/stories-store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Story ID is required" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const audioFile = (formData.get("audio") || formData.get("file")) as File | null;

    if (!audioFile || audioFile.size === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "ஒலிப்பதிவுக் கோப்பு தேர்ந்தெடுக்கப்படவில்லை அல்லது காலியாக உள்ளது (Audio file is missing or empty)",
        },
        { status: 400 }
      );
    }

    // Determine extension (e.g. .mp3, .mpeg, .wav, .webm)
    let ext = ".mp3";
    if (audioFile.name && path.extname(audioFile.name)) {
      ext = path.extname(audioFile.name).toLowerCase();
    } else if (audioFile.type) {
      if (audioFile.type.includes("webm")) ext = ".webm";
      else if (audioFile.type.includes("wav")) ext = ".wav";
      else if (audioFile.type.includes("ogg")) ext = ".ogg";
      else if (audioFile.type.includes("mp4") || audioFile.type.includes("m4a")) ext = ".m4a";
    }

    // Explicit path format required by user: stories/<story-id>.<ext>
    const storagePath = `stories/${id}${ext}`;
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    console.log(
      `☁️ [Supabase Storage] Uploading audio for story ${id} to ${storagePath} (${audioBuffer.length} bytes)...`
    );

    const { data: storageData, error: storageError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(storagePath, audioBuffer, {
        contentType: audioFile.type || "audio/mpeg",
        upsert: true,
      });

    if (storageError) {
      console.error("❌ [Supabase Storage upload error]:", storageError);
      return NextResponse.json(
        { success: false, error: `Supabase Storage error: ${storageError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);
    const publicAudioUrl = urlData.publicUrl;
    console.log(`✅ [Supabase Storage] Audio uploaded to: ${publicAudioUrl}`);

    // Update in Supabase database:
    // 1. Try updating 'audio_url' column on stories table directly
    try {
      const { error: storyColError } = await supabaseAdmin
        .from("stories")
        .update({ audio_url: publicAudioUrl })
        .eq("id", id);
      if (storyColError) {
        console.warn(
          "Notice: stories.audio_url column update (may not exist yet):",
          storyColError.message
        );
      } else {
        console.log(`✅ [Supabase DB] Updated stories.audio_url for ${id}`);
      }
    } catch (colErr) {
      console.warn("Notice: stories table audio_url update error:", colErr);
    }

    // 2. Upsert into audio_files table for relational consistency
    try {
      const { data: existingAudio } = await supabaseAdmin
        .from("audio_files")
        .select("id")
        .eq("story_id", id)
        .maybeSingle();

      if (existingAudio) {
        await supabaseAdmin
          .from("audio_files")
          .update({
            storage_path: storagePath,
            audio_url: publicAudioUrl,
          })
          .eq("id", existingAudio.id);
        console.log(`✅ [Supabase DB] Updated audio_files row for story ${id}`);
      } else {
        await supabaseAdmin
          .from("audio_files")
          .insert({
            story_id: id,
            storage_path: storagePath,
            audio_url: publicAudioUrl,
            duration_seconds: 45,
          });
        console.log(`✅ [Supabase DB] Created audio_files row for story ${id}`);
      }
    } catch (afErr) {
      console.warn("Notice: audio_files table update error:", afErr);
    }

    // 3. Update local store so that static/local stories also reflect the new audio immediately
    try {
      await updateStoryAudio(id, publicAudioUrl);
    } catch (storeErr) {
      console.warn("Notice: local store update error:", storeErr);
    }

    return NextResponse.json({
      success: true,
      audio_url: publicAudioUrl,
      storage_path: storagePath,
      message: "ஒலிப்பதிவு வெற்றிகரமாகப் பதிவேற்றப்பட்டது!",
    });
  } catch (error: any) {
    console.error("❌ [POST /api/stories/[id]/audio error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload audio" },
      { status: 500 }
    );
  }
}
