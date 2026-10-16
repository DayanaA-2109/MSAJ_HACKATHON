/**
 * One-time / on-demand script: fetch YouTube captions into src/data/neirkaanal.json.
 *
 * Usage (from tamil-thadam/):
 *   npm run fetch-transcripts
 *
 * How to add an interview:
 *   1. Append an object to src/data/neirkaanal.json → interviews[]
 *      { id, title, category: "vaazhkai" | "varalaru", youtubeUrl, channelName, summary: "", fullTranscript: "" }
 *   2. Re-run this script. It fills fullTranscript from captions (Tamil preferred, else English).
 *
 * Summary:
 *   - If GEMINI_API_KEY is set in .env.local, Gemini writes ~100 words in the transcript language.
 *   - Otherwise the first ~100 words of the transcript are used (extractive fallback).
 *   - TODO: set GEMINI_API_KEY for a better abstractive summary. Never call APIs from the browser.
 *
 * Captions unavailable → fullTranscript stays "" (UI shows "Transcript not available").
 */
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

type Category = "vaazhkai" | "varalaru";

type Interview = {
  id: string;
  title: string;
  category: Category;
  youtubeUrl: string;
  channelName: string;
  summary: string;
  fullTranscript: string;
};

type DataFile = { interviews: Interview[] };

const DATA_PATH = path.join(process.cwd(), "src", "data", "neirkaanal.json");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36";

function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return /^[\w-]{11}$/.test(id) ? id : null;
    }
    const v = parsed.searchParams.get("v");
    if (v && /^[\w-]{11}$/.test(v)) return v;
    const embed = parsed.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/);
    if (embed?.[1] && /^[\w-]{11}$/.test(embed[1])) return embed[1];
    return null;
  } catch {
    return null;
  }
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function parseCaptionPayload(body: string): string {
  const trimmed = body.trim();
  if (trimmed.startsWith("{")) {
    try {
      const json = JSON.parse(trimmed) as {
        events?: { segs?: { utf8?: string }[] }[];
      };
      const parts: string[] = [];
      for (const event of json.events || []) {
        for (const seg of event.segs || []) {
          if (seg.utf8) parts.push(seg.utf8);
        }
      }
      return parts.join(" ").replace(/\s+/g, " ").trim();
    } catch {
      /* fall through to XML */
    }
  }

  const texts = [...body.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)].map((m) =>
    decodeXmlEntities(m[1].replace(/<[^>]+>/g, " "))
  );
  return texts.join(" ").replace(/\s+/g, " ").trim();
}

type CaptionTrack = { baseUrl?: string; languageCode?: string; kind?: string };

function pickTrack(tracks: CaptionTrack[]): CaptionTrack | undefined {
  const withUrl = tracks.filter((t) => t.baseUrl);
  return (
    withUrl.find((t) => t.languageCode?.startsWith("ta") && t.kind !== "asr") ||
    withUrl.find((t) => t.languageCode?.startsWith("ta")) ||
    withUrl.find((t) => t.languageCode?.startsWith("en") && t.kind !== "asr") ||
    withUrl.find((t) => t.languageCode?.startsWith("en")) ||
    withUrl[0]
  );
}

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { "User-Agent": UA, ...(init?.headers || {}) },
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function tracksFromInnertube(videoId: string): Promise<CaptionTrack[]> {
  const body = {
    context: {
      client: {
        clientName: "WEB",
        clientVersion: "2.20241001.00.00",
        hl: "en",
        gl: "IN",
      },
    },
    videoId,
  };

  const json = await fetchJson(
    "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const tracks =
    json?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  return Array.isArray(tracks) ? tracks : [];
}

async function tracksFromWatchPage(videoId: string): Promise<CaptionTrack[]> {
  const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: { "User-Agent": UA, "Accept-Language": "ta,en;q=0.8" },
  });
  if (!res.ok) return [];
  const html = await res.text();
  const match = html.match(/ytInitialPlayerResponse\s*=\s*(\{[\s\S]+?\});/);
  if (!match) return [];
  try {
    const json = JSON.parse(match[1]);
    const tracks =
      json?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    return Array.isArray(tracks) ? tracks : [];
  } catch {
    return [];
  }
}

async function fetchTranscript(videoId: string): Promise<string> {
  let tracks: CaptionTrack[] = [];
  try {
    tracks = await tracksFromInnertube(videoId);
  } catch (err) {
    console.warn(`  innertube failed for ${videoId}:`, (err as Error).message);
  }
  if (!tracks.length) {
    tracks = await tracksFromWatchPage(videoId);
  }

  const track = pickTrack(tracks);
  if (!track?.baseUrl) return "";

  const captionUrl = track.baseUrl.includes("fmt=")
    ? track.baseUrl
    : `${track.baseUrl}${track.baseUrl.includes("?") ? "&" : "?"}fmt=json3`;

  const res = await fetch(captionUrl, { headers: { "User-Agent": UA } });
  if (!res.ok) return "";
  return parseCaptionPayload(await res.text());
}

function extractiveSummary(transcript: string, maxWords = 100): string {
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")}…`;
}

async function geminiSummary(transcript: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const genAI = new GoogleGenerativeAI(key);
  const models = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-flash-latest",
    "gemini-3.8-flash",
    "gemini-1.5-flash",
  ];

  const prompt = `Write a concise summary of the following interview transcript.
Rules:
- Use the SAME language as the transcript (Tamil if Tamil, English if English).
- About 100 words, never much more.
- No title, no bullet points, no quotes around the whole answer.
- Do not add facts that are not in the transcript.

Transcript:
${transcript.slice(0, 24000)}`;

  let lastError: Error | null = null;
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.3 },
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      if (text) return text;
    } catch (err) {
      lastError = err as Error;
    }
  }
  if (lastError) throw lastError;
  return null;
}

async function main() {
  if (!fs.existsSync(DATA_PATH)) {
    throw new Error(`Data file not found: ${DATA_PATH}`);
  }

  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8")) as DataFile;
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  console.log(
    `GEMINI_API_KEY: ${hasGemini ? "set (abstractive ~100-word summaries)" : "missing — using first ~100 words. TODO: add key in .env.local"}`
  );

  for (const entry of data.interviews) {
    const videoId = extractVideoId(entry.youtubeUrl);
    console.log(`\n• ${entry.id} — ${entry.title}`);
    if (!videoId) {
      console.log("  skip: placeholder or invalid YouTube URL");
      continue;
    }

    try {
      const transcript = await fetchTranscript(videoId);
      if (!transcript) {
        entry.fullTranscript = "";
        console.log("  transcript not available");
        continue;
      }

      entry.fullTranscript = transcript;
      console.log(`  transcript: ${transcript.split(/\s+/).length} words`);

      try {
        const ai = await geminiSummary(transcript);
        entry.summary = ai || extractiveSummary(transcript);
        console.log(ai ? "  summary: Gemini" : "  summary: extractive fallback");
      } catch (err) {
        entry.summary = extractiveSummary(transcript);
        console.warn("  Gemini failed, used extractive summary:", (err as Error).message);
      }
    } catch (err) {
      entry.fullTranscript = "";
      console.warn("  failed:", (err as Error).message);
    }
  }

  fs.writeFileSync(DATA_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`\nWrote ${DATA_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
