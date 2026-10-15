// src/lib/speechmatics.ts
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileP = promisify(execFile);
const SPEECHMATICS_API_URL = "https://asr.api.speechmatics.com/v2";

export type SpeechmaticsResult = {
  fullText: string;
  segments: { start: number; end: number; text: string }[];
  language: string;
  rawResponse?: any;
};

export async function transcribeWithSpeechmatics(
  audioBuffer: Buffer,
  filename: string = "audio.webm"
): Promise<SpeechmaticsResult> {
  const SPEECHMATICS_API_KEY = process.env.SPEECHMATICS_API_KEY;
  if (!SPEECHMATICS_API_KEY) {
    throw new Error("SPEECHMATICS_API_KEY is not set in .env.local");
  }

  // Ensure audio is in standard 16kHz mono MP3 format for reliable Speechmatics ingestion
  const tmpInput = path.join(os.tmpdir(), `sm-in-${Date.now()}-${filename}`);
  const tmpMp3 = path.join(os.tmpdir(), `sm-out-${Date.now()}.mp3`);
  await fs.writeFile(tmpInput, audioBuffer);

  let sendBuffer: Buffer = audioBuffer;
  let sendFilename = filename;

  try {
    await execFileP("ffmpeg", [
      "-y",
      "-i", tmpInput,
      "-vn",
      "-ar", "16000",
      "-ac", "1",
      "-b:a", "128k",
      tmpMp3,
    ]);
    sendBuffer = await fs.readFile(tmpMp3);
    sendFilename = "audio.mp3";
  } catch (convErr) {
    console.warn("⚠️ [Speechmatics] ffmpeg conversion warning, trying raw buffer:", convErr);
  } finally {
    await fs.unlink(tmpInput).catch(() => {});
    await fs.unlink(tmpMp3).catch(() => {});
  }

  // 1. Create the job configuration (explicit verbatim Tamil)
  const config = {
    type: "transcription",
    transcription_config: {
      language: "ta", // Explicit Tamil language code
      operating_point: "enhanced", // Highest accuracy acoustic & language model
    },
  };

  // 2. Build multipart form data
  const formData = new FormData();
  formData.append(
    "data_file",
    new Blob([new Uint8Array(sendBuffer)], { type: "audio/mp3" }),
    sendFilename
  );
  formData.append("config", JSON.stringify(config));

  console.log("📡 [Speechmatics] Submitting verbatim transcription job (language=ta)...");
  const jobResponse = await fetch(`${SPEECHMATICS_API_URL}/jobs/?wait=120&format=json-v2`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SPEECHMATICS_API_KEY}`,
    },
    body: formData,
  });

  const rawText = await jobResponse.text();
  console.log(`📡 [Speechmatics Raw Response Status]: HTTP ${jobResponse.status}`);
  console.log(`📡 [Speechmatics Raw Response Body]:\n${rawText.slice(0, 1500)}`);

  if (!jobResponse.ok) {
    throw new Error(`Speechmatics job failed: ${jobResponse.status} ${rawText}`);
  }

  let jobData: any;
  try {
    jobData = JSON.parse(rawText);
  } catch (e) {
    throw new Error(`Speechmatics invalid JSON response: ${rawText}`);
  }

  const results = jobData.results || jobData["json-v2"]?.results || [];

  // Parse verbatim words and timestamps
  const segments: { start: number; end: number; text: string }[] = [];
  let currentSegment = { start: 0, end: 0, text: "" };

  for (const result of results) {
    const alt = result.alternatives?.[0];
    if (!alt) continue;

    const word = alt.content;
    const isPunctuation = result.type === "punctuation";
    const gap = currentSegment.text ? result.start_time - currentSegment.end : 0;

    if (currentSegment.text && gap > 1.0) {
      if (currentSegment.text.trim()) segments.push({ ...currentSegment });
      currentSegment = { start: result.start_time, end: result.end_time, text: word };
    } else {
      if (!currentSegment.text) currentSegment.start = result.start_time;
      currentSegment.end = result.end_time;
      currentSegment.text += (isPunctuation ? "" : " ") + word;
    }
  }

  if (currentSegment.text.trim()) {
    segments.push({ ...currentSegment });
  }

  // Construct final verbatim text strictly from word tokens
  const fullText = segments
    .map((s) => s.text.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+([.,!?])/g, "$1")
    .trim();

  return {
    fullText,
    segments,
    language: "ta",
    rawResponse: jobData,
  };
}