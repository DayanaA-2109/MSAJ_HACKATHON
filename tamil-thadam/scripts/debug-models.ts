// scripts/debug-models.ts
import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileP = promisify(execFile);
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const SARVAM_KEY = process.env.SARVAM_API_KEY!;
const GEMINI_KEY = process.env.GEMINI_API_KEY!;
const SPEECHMATICS_KEY = process.env.SPEECHMATICS_API_KEY!;
const audioFile = path.join(process.cwd(), "public", "uploads", "rec_1792082259057.webm");

async function checkGeminiModels() {
  console.log("\n=== Checking Available Gemini Models ===");
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_KEY}`);
    const data: any = await res.json();
    if (data.models) {
      console.log("Available models:", data.models.map((m: any) => m.name.replace("models/", "")));
    } else {
      console.log("List models response:", data);
    }
  } catch (e) {
    console.error("List models failed:", e);
  }
}

async function testGeminiAudio(modelName: string) {
  console.log(`\n=== Testing Gemini Model [${modelName}] on Audio ===`);
  const buf = await fs.readFile(audioFile);
  const base64 = buf.toString("base64");
  const prompt = `Transcribe the spoken audio verbatim in Tamil script (தமிழ்).
STRICT RULES:
1. Output ONLY the exact spoken Tamil words.
2. Do NOT translate to English or any other language.
3. Do NOT summarize or paraphrase.
4. Do NOT add any preamble, explanation, notes, or quotes.
5. If non-Tamil words or English loan words are spoken, transcribe them phonetically in Tamil or exactly as spoken.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_KEY}`,
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
}

async function testSpeechmaticsMp3() {
  console.log("\n=== Testing Speechmatics with converted MP3 ===");
  // Convert webm to mp3 with ffmpeg
  const mp3File = path.join(process.cwd(), "public", "uploads", "test_speechmatics.mp3");
  await execFileP("ffmpeg", ["-y", "-i", audioFile, "-vn", "-ar", "16000", "-ac", "1", "-b:a", "128k", mp3File]);
  const buf = await fs.readFile(mp3File);
  console.log(`Converted MP3 size: ${buf.length} bytes`);

  const config = {
    type: "transcription",
    transcription_config: {
      language: "ta",
      operating_point: "enhanced",
    },
  };
  const form = new FormData();
  form.append("data_file", new Blob([new Uint8Array(buf)], { type: "audio/mp3" }), "audio.mp3");
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
  console.log(`Speechmatics HTTP ${status}`);
  console.log("RAW RESPONSE:", raw.slice(0, 1500));
}

async function main() {
  await checkGeminiModels();
  await testGeminiAudio("gemini-3.8-flash");
  await testSpeechmaticsMp3();
}

main();
