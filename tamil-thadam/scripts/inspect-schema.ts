// scripts/inspect-schema.ts
import "dotenv/config";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const { supabaseAdmin } = await import("../src/lib/supabaseAdmin");
  
  // Inspect a sample row from stories
  const { data: s, error: sErr } = await supabaseAdmin.from("stories").select("*").limit(1);
  console.log("stories sample:", s, sErr);

  // Inspect a sample row from transcripts
  const { data: t, error: tErr } = await supabaseAdmin.from("transcripts").select("*").limit(1);
  console.log("transcripts sample:", t, tErr);

  // Inspect a sample row from audio_files
  const { data: a, error: aErr } = await supabaseAdmin.from("audio_files").select("*").limit(1);
  console.log("audio_files sample:", a, aErr);
}

run();
