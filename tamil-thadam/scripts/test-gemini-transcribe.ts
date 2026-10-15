// scripts/test-gemini-transcribe.ts
import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs/promises";
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const GEMINI_KEY = process.env.GEMINI_API_KEY!;
const audioFile = path.join(process.cwd(), "public", "uploads", "rec_1792082259057.webm");

async function testGeminiModels() {
  const buf = await fs.readFile(audioFile);
  const base64 = buf.toString("base64");
  const prompt = `Transcribe the spoken audio verbatim in Tamil script (தமிழ்).
STRICT RULES:
1. Output ONLY the exact spoken Tamil words.
2. Do NOT translate to English or any other language.
3. Do NOT summarize or paraphrase.
4. Do NOT add any preamble, explanation, notes, or quotes.
5. If non-Tamil words or English loan words are spoken, transcribe them phonetically in Tamil or exactly as spoken.`;

  for (const model of ["gemini-3.5-transcribe", "gemini-3.5-flash", "gemini-flash-latest"]) {
    console.log(`\n=== Testing Gemini Model: ${model} ===`);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  { inline_data: { mime_type: "audio/webm", data: base64 } },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.0,
            },
          }),
        }
      );
      const status = res.status;
      const raw = await res.text();
      console.log(`HTTP ${status}`);
      console.log("RAW RESPONSE:", raw);
      if (res.ok) {
        const data = JSON.parse(raw);
        const transcript = data.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("").trim();
        console.log("PARSED VERBATIM TRANSCRIPT:", transcript);
      }
    } catch (e) {
      console.error(`Error with ${model}:`, e);
    }
  }
}

testGeminiModels();
