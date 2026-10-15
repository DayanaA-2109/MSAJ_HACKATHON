// scripts/find-all-supabase-stories.ts
import "dotenv/config";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const { supabaseAdmin } = await import("../src/lib/supabaseAdmin");
  const { data, error } = await supabaseAdmin
    .from("stories")
    .select("*, audio_files(*), transcripts(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("DB Error:", error);
    return;
  }
  console.log(`Found ${data.length} stories in Supabase:`);
  for (const s of data) {
    console.log(`ID: ${s.id}`);
    console.log(`  Title: ${s.title}`);
    console.log(`  Narrator: ${s.narrator_name}`);
    console.log(`  Audio: ${s.audio_files?.[0]?.audio_url}`);
    console.log(`  Transcript: ${s.transcripts?.[0]?.tamil_text}`);
    console.log("-----------------------------------------");
  }
}

run();
