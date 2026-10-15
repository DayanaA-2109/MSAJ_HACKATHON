// scripts/test-enrich.ts
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

console.log("Env check:");
console.log("  GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "✅ set" : "❌ missing");

async function main() {
  const { enrichStory } = await import("../src/lib/enrich");

  // Use a real Tamil transcript (clip4 from earlier)
  const transcript = `படிப்பீங்களா? சரி அந்த இந்த குரல் தாத்தா உங்களுக்கு எல்லாம் சொல்லிக் கொடுத்திருக்கேன். இந்த குரல் தாத்தாவ இனிமே யார நான் மறக்க மாட்டீங்க. நான் மறக்க மாட்டீங்கன்னு அப்பன்னா எல்லாரும் படிப்பீங்க கேட்பீங்க சரியா? நான் நான் நான் நான் தாத்தா மறக்க மாட்டீங்கன்னு. ஆனா இத யாரும் படிக்க முடியல தானே? ஈஸியா படிக்க முடியுமா? சேக்கில போ. அப்புறம் இன்னொரு பாட்டு சொல்லுவோமா?`;

  console.log("\n🧠 Enriching transcript with Gemini...");
  const t0 = Date.now();
  const result = await enrichStory(transcript);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  console.log(`\n✅ Done in ${elapsed}s`);
  console.log("\n📋 Result:");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => { console.error("❌", e); process.exit(1); });