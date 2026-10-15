// src/lib/transcribe.ts
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { transcribeWithSpeechmatics } from "./speechmatics";

const execFileP = promisify(execFile);
const CHUNK_SEC = 15;


export type TranscriptSegment = {
  start: number;
  end: number;
  text: string;
};

export type TranscriptResult = {
  fullText: string;
  segments: TranscriptSegment[];
  language: string;
  confidence?: number;
};

export class TranscriptionError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "TranscriptionError";
  }
}

// ---------- helpers ----------
async function downloadToTemp(url: string): Promise<string> {
  const tmp = path.join(os.tmpdir(), `asr-${Date.now()}.mpeg`);

  // Case 1: local file:// URL → read directly from disk
  if (url.startsWith("file://")) {
    const { fileURLToPath } = await import("node:url");
    const localPath = fileURLToPath(url);
    await fs.copyFile(localPath, tmp);
    return tmp;
  }

  // Case 2: http/https URL → fetch it
  const res = await fetch(url);
  if (!res.ok) throw new TranscriptionError(`Download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(tmp, buf);
  return tmp;
}

async function getDuration(file: string): Promise<number> {
  const { stdout } = await execFileP("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    file,
  ]);
  return parseFloat(stdout.trim());
}

async function chunkAudio(file: string): Promise<string[]> {
  const tmpDir = path.join(os.tmpdir(), `asr-chunks-${Date.now()}`);
  await fs.mkdir(tmpDir, { recursive: true });
  const outPattern = path.join(tmpDir, "chunk-%03d.mp3");

  await execFileP("ffmpeg", [
    "-y", "-i", file,
    "-f", "segment",
    "-segment_time", String(CHUNK_SEC),
    "-c:a", "libmp3lame",   // ← re-encode as MP3
    "-b:a", "128k",
    outPattern,
  ]);

  return (await fs.readdir(tmpDir))
    .sort()
    .map((f) => path.join(tmpDir, f));
}

  

async function transcribeChunkSarvam(chunkPath: string): Promise<string> {
    const SARVAM_KEY = process.env.SARVAM_API_KEY; 
  if (!SARVAM_KEY) throw new TranscriptionError("SARVAM_API_KEY missing");
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

  if (!res.ok) {
    const err = await res.text();
    throw new TranscriptionError(`Sarvam ${res.status}: ${err}`);
  }

  const json: any = await res.json();
  return (json.transcript ?? "").trim();
}

// ---------- main ----------
export async function transcribeAudio(audioUrl: string): Promise<TranscriptResult> {
  const tmpFile = await downloadToTemp(audioUrl);

  try {
    const duration = await getDuration(tmpFile);
    const chunks = await chunkAudio(tmpFile);

    const segments: TranscriptSegment[] = [];
    let fullText = "";

    // ---- Try Sarvam first ----
    try {
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
      return { fullText, segments, language: "ta-IN" };
    } catch (sarvamErr) {
      console.warn("Sarvam failed, falling back to Speechmatics:", sarvamErr);
    }

    // ---- Fallback: Speechmatics ----
    const buf = await fs.readFile(tmpFile);
    return await transcribeWithSpeechmatics(buf, path.basename(tmpFile));
  } finally {
    await fs.unlink(tmpFile).catch(() => {});
  }
}