import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const { supabaseAdmin } = await import("../src/lib/supabaseAdmin");
  
  // Test common table names
  const tables = ["stories", "transcripts", "audio_files", "districts", "topics", "users", "profiles", "sessions", "login_logs"];
  for (const t of tables) {
    const { data, error } = await supabaseAdmin.from(t).select("*").limit(1);
    console.log(`Table '${t}':`, error ? error.message : `OK (count: ${data?.length})`);
  }
}

run();
