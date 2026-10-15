// scripts/test-asr.ts
// v2: chunks audio into 25s pieces to bypass Sarvam's 30s free-tier cap
import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import os from "node:os";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const execFileP = promisify(execFile);

const SARVAM_KEY = process.env.SARVAM_API_KEY!;
const GEMINI_KEY = process.env.GEMINI_API_KEY!;
if (!SARVAM_KEY || !GEMINI_KEY) {
  console.error("❌ Missing keys in .env.local");
  process.exit(1);
}

const AUDIO_DIR = path.join(process.cwd(), "test-audio");
const TMP_DIR = path.join(os.tmpdir(), "asr-chunks");
const CHUNK_SEC = 25;

type Segment = { start: number; end: number; text: string };
type AsrResult = {
  provider: "sarvam" | "gemini";
  clip: string;
  ok: boolean;
  elapsedSec: number;
  durationSec: number;
  chunks: number;
  fullText: string;
  segments: Segment[];
  error?: string;
};

// ---------- ffmpeg helpers ----------
async function getDuration(file: string): Promise<number> {
  const { stdout } = await execFileP("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    file,
  ]);
  return parseFloat(stdout.trim());
}

async function chunkAudio(file: string, chunkSec: number): Promise<string[]> {
  await fs.mkdir(TMP_DIR, { recursive: true });
  const base = path.basename(file, path.extname(file));
  const outPattern = path.join(TMP_DIR, `${base}-%03d.mpeg`);

  // Clean previous
  for (const f of await fs.readdir(TMP_DIR)) {
    if (f.startsWith(base)) await fs.unlink(path.join(TMP_DIR, f));
  }

  await execFileP("ffmpeg", [
    "-y",
    "-i", file,
    "-f", "segment",
    "-segment_time", String(chunkSec),
    "-c", "copy",
    outPattern,
  ]);

  const chunks = (await fs.readdir(TMP_DIR))
    .filter((f) => f.startsWith(base))
    .sort()
    .map((f) => path.join(TMP_DIR, f));

  return chunks;
}

// ---------- Sarvam ----------
async function transcribeChunkSarvam(chunkPath: string): Promise<string> {
  const buf = await fs.readFile(chunkPath);
  const form = new FormData();
  form.append("file", new Blob([buf]), path.basename(chunkPath));
  form.append("model", "saarika:v2.5");
  form.append("language_code", "ta-IN");

  const res = await fetch("https://api.sarvam.ai/speech-to-text", {
    method: "POST",
    headers: { "api-subscription-key": SARVAM_KEY },
    body: form,
  });
  const json: any = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return (json.transcript ?? "").trim();
}

async function runSarvam(file: string): Promise<AsrResult> {
  const clip = path.basename(file);
  const start = Date.now();
  try {
    const duration = await getDuration(file);
    const chunks = await chunkAudio(file, CHUNK_SEC);

    const segments: Segment[] = [];
    let fullText = "";

    for (let i = 0; i < chunks.length; i++) {
      const offset = i * CHUNK_SEC;
      const text = await transcribeChunkSarvam(chunks[i]);
      if (!text) continue;
      segments.push({
        start: offset,
        end: Math.min(offset + CHUNK_SEC, duration),
        text,
      });
      fullText += (fullText ? " " : "") + text;
    }

    return {
      provider: "sarvam",
      clip,
      ok: true,
      elapsedSec: (Date.now() - start) / 1000,
      durationSec: duration,
      chunks: chunks.length,
      fullText,
      segments,
    };
  } catch (err: any) {
    return {
      provider: "sarvam",
      clip,
      ok: false,
      elapsedSec: (Date.now() - start) / 1000,
      durationSec: 0,
      chunks: 0,
      fullText: "",
      segments: [],
      error: err?.message ?? String(err),
    };
  }
}

// ---------- Gemini (with updated model name) ----------
async function runGemini(file: string): Promise<AsrResult> {
  const clip = path.basename(file);
  const start = Date.now();
  try {
    const duration = await getDuration(file);
    const chunks = await chunkAudio(file, CHUNK_SEC);

    const segments: Segment[] = [];
    let fullText = "";

    for (let i = 0; i < chunks.length; i++) {
      const offset = i * CHUNK_SEC;
      const buf = await fs.readFile(chunks[i]);
      const base64 = buf.toString("base64");

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: "Transcribe this Tamil audio. Return ONLY Tamil script. No translation, no commentary." },
                { inline_data: { mime_type: "audio/mpeg", data: base64 } },
              ],
            }],
          }),
        }
      );
      const json: any = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(json));
      const text = (json.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "").trim();
      if (!text) continue;
      segments.push({ start: offset, end: Math.min(offset + CHUNK_SEC, duration), text });
      fullText += (fullText ? " " : "") + text;
    }

    return {
      provider: "gemini",
      clip,
      ok: true,
      elapsedSec: (Date.now() - start) / 1000,
      durationSec: duration,
      chunks: chunks.length,
      fullText,
      segments,
    };
  } catch (err: any) {
    return {
      provider: "gemini",
      clip,
      ok: false,
      elapsedSec: (Date.now() - start) / 1000,
      durationSec: 0,
      chunks: 0,
      fullText: "",
      segments: [],
      error: err?.message ?? String(err),
    };
  }
}

// ---------- Main ----------
async function main() {
  const files = (await fs.readdir(AUDIO_DIR))
    .filter((f) => /\.(mp3|mpeg|m4a|wav|ogg|opus|webm)$/i.test(f))
    .sort();

  if (files.length === 0) {
    console.error("❌ No audio in test-audio/");
    process.exit(1);
  }

  console.log(`\n🎧 ${files.length} clip(s): ${files.join(", ")}\n`);
  const results: AsrResult[] = [];

  for (const f of files) {
    const full = path.join(AUDIO_DIR, f);
    console.log(`\n━━━ ${f} ━━━`);

    console.log("  → Sarvam …");
    const s = await runSarvam(full);
    results.push(s);
    console.log(s.ok
      ? `  ✅ Sarvam ${s.elapsedSec.toFixed(1)}s, ${s.chunks} chunks, ${s.segments.length} segments\n     ${s.fullText.slice(0, 220)}${s.fullText.length > 220 ? "…" : ""}`
      : `  ❌ Sarvam: ${s.error}`);

    console.log("  → Gemini …");
    const g = await runGemini(full);
    results.push(g);
    console.log(g.ok
      ? `  ✅ Gemini ${g.elapsedSec.toFixed(1)}s, ${g.chunks} chunks\n     ${g.fullText.slice(0, 220)}${g.fullText.length > 220 ? "…" : ""}`
      : `  ❌ Gemini: ${g.error}`);
  }

  await fs.writeFile(
    path.join(AUDIO_DIR, "results.json"),
    JSON.stringify(results, null, 2),
    "utf-8"
  );

  console.log("\n📊 SUMMARY");
  console.log("─".repeat(80));
  for (const r of results) {
    console.log(
      `${r.provider.padEnd(8)} | ${r.clip.padEnd(14)} | ${r.ok ? "✅" : "❌"} | ${r.elapsedSec.toFixed(1)}s | chunks=${r.chunks} | segs=${r.segments.length} | chars=${r.fullText.length}`
    );
  }
  console.log(`\n📄 ${path.join(AUDIO_DIR, "results.json")}\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });