// test-all-three.ts
import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs/promises";
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const SARVAM_KEY = process.env.SARVAM_API_KEY!;
const GEMINI_KEY = process.env.GEMINI_API_KEY!;
const SPEECHMATICS_KEY = process.env.SPEECHMATICS_API_KEY!;

const audioFile = path.join(process.cwd(), "public", "uploads", "rec_1792082259057.webm");

async function testSarvam(buf: Buffer) {
  console.log("\n=================== 1. SARVAM ASR ===================");
  try {
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(buf)], { type: "audio/webm" }), "recording.webm");
    form.append("model", "saarika:v2.5");
    form.append("language_code", "ta-IN");
    form.append("with_diacritics", "true");

    const res = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: { "api-subscription-key": SARVAM_KEY },
      body: form,
    });
    const status = res.status;
    const raw = await res.text();
    console.log(`HTTP ${status}`);
    console.log("RAW RESPONSE:", raw);
    if (res.ok) {
      const data = JSON.parse(raw);
      console.log("PARSED TRANSCRIPT (Verbatim):", data.transcript);
    }
  } catch (err) {
    console.error("Sarvam error:", err);
  }
}

async function testSpeechmatics(buf: Buffer) {
  console.log("\n=================== 2. SPEECHMATICS ASR ===================");
  try {
    // Note: enable_partials is removed because batch jobs reject it
    const config = {
      type: "transcription",
      transcription_config: {
        language: "ta",
        operating_point: "enhanced",
      },
    };
    const form = new FormData();
    form.append("data_file", new Blob([new Uint8Array(buf)], { type: "audio/webm" }), "recording.webm");
    form.append("config", JSON.stringify(config));

    const res = await fetch("https://asr.api.speechmatics.com/v2/jobs/?wait=120&format=json-v2", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SPEECHMATICS_KEY}`,
      },
      body: form,
    });
    const status = res.status;
    const raw = await res.text();
    console.log(`HTTP ${status}`);
    console.log("RAW RESPONSE (truncated):", raw.slice(0, 1000));
    if (res.ok) {
      const data = JSON.parse(raw);
      console.log("Job status:", data.status);
      const results = data.results || [];
      const words = results.map((r: any) => r.alternatives?.[0]?.content).filter(Boolean).join(" ");
      console.log("PARSED WORDS (Verbatim):", words);
    }
  } catch (err) {
    console.error("Speechmatics error:", err);
  }
}

async function testGemini(buf: Buffer) {
  console.log("\n=================== 3. GEMINI ASR ===================");
  try {
    const base64 = buf.toString("base64");
    const prompt = `Transcribe the spoken audio verbatim in Tamil script (தமிழ்).
STRICT RULES:
1. Output ONLY the exact spoken Tamil words.
2. Do NOT translate to English or any other language.
3. Do NOT summarize or paraphrase.
4. Do NOT add any preamble, explanation, notes, or quotes.
5. If non-Tamil words or English loan words are spoken, transcribe them phonetically in Tamil or exactly as spoken.`;

    // Try gemini-2.5-flash or gemini-1.5-flash or gemini-2.0-flash-exp
    for (const model of ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash-exp"]) {
      console.log(`Trying Gemini model: ${model}...`);
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
      console.log(`Model ${model} -> HTTP ${status}`);
      if (res.ok) {
        console.log("RAW RESPONSE:", raw);
        const data = JSON.parse(raw);
        const transcript = data.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("").trim();
        console.log("PARSED TRANSCRIPT (Verbatim):", transcript);
        break;
      } else {
        console.log("Error body:", raw.slice(0, 300));
      }
    }
  } catch (err) {
    console.error("Gemini error:", err);
  }
}

async function run() {
  const buf = await fs.readFile(audioFile);
  console.log(`Loaded ${audioFile}, size = ${buf.length} bytes`);
  await testSarvam(buf);
  await testSpeechmatics(buf);
  await testGemini(buf);
}

run();
