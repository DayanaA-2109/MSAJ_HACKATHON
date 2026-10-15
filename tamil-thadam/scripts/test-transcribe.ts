// scripts/test-transcribe.ts
import dotenv from "dotenv";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Load env FIRST, before any project code runs
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

console.log("Env check:");
console.log("  SARVAM_API_KEY:", process.env.SARVAM_API_KEY ? "✅ set" : "❌ missing");
console.log("  SPEECHMATICS_API_KEY:", process.env.SPEECHMATICS_API_KEY ? "✅ set" : "❌ missing");

async function main() {
  // DYNAMIC import — runs AFTER dotenv.config() above
  const { transcribeAudio } = await import("../src/lib/transcribe");

  const file = path.join(process.cwd(), "test-audio", "clip5.mpeg.ogg");
  const url = pathToFileURL(file).href;

  console.log("\n🎧 Transcribing:", url);
  const t0 = Date.now();
  const result = await transcribeAudio(url);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  console.log(`\n✅ Done in ${elapsed}s`);
  console.log(`📝 Language: ${result.language}`);
  console.log(`📊 Segments: ${result.segments.length}`);
  console.log(`\n📄 Full text:\n${result.fullText}`);
  console.log(`\n🧩 Segments:\n${JSON.stringify(result.segments, null, 2)}`);
}

main().catch((e) => { console.error("❌", e); process.exit(1); });