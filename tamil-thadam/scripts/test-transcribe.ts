// scripts/test-transcribe.ts
import "dotenv/config";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import path from "node:path";
import fs from "node:fs/promises";

async function main() {
  const { transcribeAudio } = await import("../src/lib/transcribe");

  const file = path.join(process.cwd(), "public", "uploads", "rec_1792082259057.webm");
  const buf = await fs.readFile(file);

  console.log(`\n🎧 Testing transcribeAudio on ${file} (${buf.length} bytes)...`);
  const t0 = Date.now();
  const result = await transcribeAudio(buf, 17, "recording.webm", "audio/webm");
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  console.log(`\n✅ Completed in ${elapsed}s`);
  console.log(`🏷️ Provider used: ${result.provider}`);
  console.log(`🌐 Language: ${result.language}`);
  console.log(`\n📄 Verbatim Full Text:\n"${result.fullText}"`);
  console.log(`\n🧩 Synchronized Segments:\n`, JSON.stringify(result.segments, null, 2));
}

main().catch((e) => {
  console.error("❌ Test failed:", e);
  process.exit(1);
});