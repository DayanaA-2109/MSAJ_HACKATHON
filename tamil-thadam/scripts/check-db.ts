// scripts/check-db.ts
import "dotenv/config";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const { supabaseAdmin } = await import("../src/lib/supabaseAdmin");
  const { data, error } = await supabaseAdmin
    .from("stories")
    .select("id, title, narrator_name, created_at, audio_files(audio_url), transcripts(id, tamil_text)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("DB Error:", error);
    return;
  }
  console.log("Found", data?.length, "stories in Supabase:");
  for (const s of data || []) {
    console.log(`- ID: ${s.id} | Title: ${s.title} | Narrator: ${s.narrator_name}`);
    console.log(`  Audio: ${(s.audio_files as any)?.[0]?.audio_url}`);
    console.log(`  Transcript: ${(s.transcripts as any)?.[0]?.tamil_text?.slice(0, 100)}...`);
  }
}

run();
