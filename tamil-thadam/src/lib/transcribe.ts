// src/lib/transcribe.ts
import { transcribeWithSpeechmatics } from "./speechmatics";

export type TranscriptSegment = {
  start: number;
  end: number;
  text: string;
};

export type TranscriptResult = {
  fullText: string;
  segments: TranscriptSegment[];
  language: string;
  provider: "sarvam" | "gemini" | "speechmatics";
  confidence?: number;
};

export class TranscriptionError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "TranscriptionError";
  }
}

// -------------------------------------------------------------
// 1. SARVAM ASR (Primary Tamil Voice Engine)
// -------------------------------------------------------------
export async function transcribeWithSarvam(
  audioBuffer: Buffer,
  filename: string = "recording.webm"
): Promise<{ fullText: string; rawResponse: any }> {
  const SARVAM_KEY = process.env.SARVAM_API_KEY;
  if (!SARVAM_KEY) {
    throw new TranscriptionError("SARVAM_API_KEY is not configured in .env.local");
  }

  const form = new FormData();
  form.append(
    "file",
    new Blob([new Uint8Array(audioBuffer)], { type: "audio/webm" }),
    filename
  );
  // Explicit verbatim parameters:
  form.append("model", "saarika:v2.5");
  form.append("language_code", "ta-IN"); // Explicit Tamil (India) language code
  form.append("with_diacritics", "true"); // Preserve verbatim Tamil diacritics

  console.log("🎙️ [Sarvam ASR] Sending audio for verbatim transcription (model: saarika:v2.5, lang: ta-IN)...");
  const res = await fetch("https://api.sarvam.ai/speech-to-text", {
    method: "POST",
    headers: {
      "api-subscription-key": SARVAM_KEY,
    },
    body: form,
  });

  const rawText = await res.text();
  console.log(`🎙️ [Sarvam Raw Response HTTP ${res.status}]:\n${rawText}`);

  if (!res.ok) {
    throw new TranscriptionError(`Sarvam ASR error (${res.status}): ${rawText}`);
  }

  let json: any;
  try {
    json = JSON.parse(rawText);
  } catch (err) {
    throw new TranscriptionError(`Sarvam invalid JSON: ${rawText}`);
  }

  // Use ONLY the final transcript field from the API
  const transcript = (json.transcript ?? "").trim();
  if (!transcript) {
    throw new TranscriptionError("Sarvam returned empty transcript");
  }

  return { fullText: transcript, rawResponse: json };
}

// -------------------------------------------------------------
// 2. GOOGLE GEMINI ASR (Verbatim Multimodal Audio Model)
// -------------------------------------------------------------
export async function transcribeWithGemini(
  audioBuffer: Buffer,
  mimeType: string = "audio/webm"
): Promise<{ fullText: string; rawResponse: any }> {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) {
    throw new TranscriptionError("GEMINI_API_KEY is not configured in .env.local");
  }

  const base64 = audioBuffer.toString("base64");
  const prompt = `Transcribe the spoken audio verbatim in Tamil script (தமிழ்).
STRICT RULES:
1. Output ONLY the exact spoken Tamil words.
2. Do NOT translate to English or any other language.
3. Do NOT summarize or paraphrase.
4. Do NOT add any preamble, explanation, notes, or quotes.
5. If non-Tamil words or English loan words are spoken, transcribe them phonetically in Tamil or exactly as spoken.`;

  // Try candidate audio-capable models
  const candidateModels = [
    "gemini-3.5-transcribe",
    "gemini-3.8-flash",
    "gemini-3.5-flash",
    "gemini-flash-latest",
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      console.log(`🤖 [Gemini ASR] Requesting verbatim transcription (model: ${model}, temp: 0.0)...`);
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
                  { inline_data: { mime_type: mimeType, data: base64 } },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.0, // Strict deterministic verbatim transcription
            },
          }),
        }
      );

      const rawText = await res.text();
      console.log(`🤖 [Gemini Raw Response HTTP ${res.status}] (model: ${model}):\n${rawText}`);

      if (!res.ok) {
        lastError = new Error(`Gemini ${model} error (${res.status}): ${rawText}`);
        continue;
      }

      const json = JSON.parse(rawText);
      const candidate = json.candidates?.[0];
      const parts = candidate?.content?.parts || [];

      // Extract ONLY the final transcript field (support both audioTranscription and text)
      let text = "";
      for (const part of parts) {
        if (part.audioTranscription?.text) {
          text += (text ? " " : "") + part.audioTranscription.text;
        } else if (part.text && !part.thought) {
          text += (text ? " " : "") + part.text;
        }
      }

      text = text.trim();
      // Remove any unwanted surrounding quotes or markdown code markers
      text = text.replace(/^```[a-z]*\s*/i, "").replace(/```$/, "").trim();
      text = text.replace(/^["'“](.*)["'”]$/, "$1").trim();

      if (text) {
        return { fullText: text, rawResponse: json };
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw new TranscriptionError(`All Gemini models failed: ${lastError?.message || lastError}`);
}

// -------------------------------------------------------------
// 3. SEGMENT BUILDER (Creates click-to-seek synchronized chunks)
// -------------------------------------------------------------
export function buildVerbatimSegments(
  fullText: string,
  totalDuration: number
): TranscriptSegment[] {
  if (!fullText.trim()) {
    return [{ start: 0, end: Math.max(1, totalDuration), text: "பதிவு பெறப்பட்டது." }];
  }

  // Split into natural sentences or clauses (periods, commas, question marks, semicolons)
  const rawParts = fullText
    .split(/([.,!?;\n]+)/)
    .reduce<string[]>((acc, cur, idx) => {
      if (idx % 2 === 0 && cur.trim()) {
        acc.push(cur.trim());
      } else if (idx % 2 === 1 && acc.length > 0) {
        acc[acc.length - 1] += cur;
      }
      return acc;
    }, [])
    .map((s) => s.trim())
    .filter(Boolean);

  // Group very short phrases so each segment has substance
  const chunks: string[] = [];
  let currentChunk = "";

  for (const part of rawParts) {
    if ((currentChunk + " " + part).trim().length < 40 && chunks.length < 6) {
      currentChunk = currentChunk ? `${currentChunk} ${part}` : part;
    } else {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = part;
    }
  }
  if (currentChunk) chunks.push(currentChunk);

  if (chunks.length === 0) chunks.push(fullText);

  // Calculate proportional timestamps based on character counts
  const totalChars = chunks.reduce((sum, c) => sum + c.length, 0) || 1;
  const segments: TranscriptSegment[] = [];
  let currentStart = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunkChars = chunks[i].length;
    const chunkDuration = (chunkChars / totalChars) * totalDuration;
    const end = i === chunks.length - 1 ? totalDuration : Math.min(totalDuration, currentStart + chunkDuration);

    segments.push({
      start: Math.round(currentStart * 10) / 10,
      end: Math.round(end * 10) / 10,
      text: chunks[i],
    });
    currentStart = end;
  }

  return segments;
}

// -------------------------------------------------------------
// 4. MAIN ASR ORCHESTRATOR (Waterfall: Sarvam -> Gemini -> Speechmatics)
// -------------------------------------------------------------
export async function transcribeAudio(
  audioBuffer: Buffer,
  durationSeconds: number = 30,
  filename: string = "recording.webm",
  mimeType: string = "audio/webm"
): Promise<TranscriptResult> {
  console.log(`\n🎧 [Audio ASR Waterfall] Starting transcription for ${filename} (${durationSeconds}s, ${audioBuffer.length} bytes)...`);

  // ---- STEP 1: Sarvam AI (State-of-the-Art Indian Language ASR) ----
  try {
    const sarvamResult = await transcribeWithSarvam(audioBuffer, filename);
    if (sarvamResult.fullText) {
      console.log(`✅ [ASR Success: Sarvam] Verbatim transcript:\n"${sarvamResult.fullText}"`);
      const segments = buildVerbatimSegments(sarvamResult.fullText, durationSeconds);
      return {
        fullText: sarvamResult.fullText,
        segments,
        language: "ta-IN",
        provider: "sarvam",
      };
    }
  } catch (sarvamErr: any) {
    console.warn("⚠️ [Sarvam ASR Failed, trying Gemini]:", sarvamErr?.message || sarvamErr);
  }

  // ---- STEP 2: Google Gemini (Multimodal Native Audio) ----
  try {
    const geminiResult = await transcribeWithGemini(audioBuffer, mimeType);
    if (geminiResult.fullText) {
      console.log(`✅ [ASR Success: Gemini] Verbatim transcript:\n"${geminiResult.fullText}"`);
      const segments = buildVerbatimSegments(geminiResult.fullText, durationSeconds);
      return {
        fullText: geminiResult.fullText,
        segments,
        language: "ta-IN",
        provider: "gemini",
      };
    }
  } catch (geminiErr: any) {
    console.warn("⚠️ [Gemini ASR Failed, trying Speechmatics]:", geminiErr?.message || geminiErr);
  }

  // ---- STEP 3: Speechmatics (Enterprise Batch ASR) ----
  try {
    const speechmaticsResult = await transcribeWithSpeechmatics(audioBuffer, filename);
    if (speechmaticsResult.fullText) {
      console.log(`✅ [ASR Success: Speechmatics] Verbatim transcript:\n"${speechmaticsResult.fullText}"`);
      const segments =
        speechmaticsResult.segments.length > 0
          ? speechmaticsResult.segments
          : buildVerbatimSegments(speechmaticsResult.fullText, durationSeconds);
      return {
        fullText: speechmaticsResult.fullText,
        segments,
        language: "ta",
        provider: "speechmatics",
      };
    }
  } catch (smErr: any) {
    console.error("❌ [Speechmatics ASR Failed]:", smErr?.message || smErr);
  }

  throw new TranscriptionError("All transcription services (Sarvam, Gemini, Speechmatics) failed to transcribe audio.");
}