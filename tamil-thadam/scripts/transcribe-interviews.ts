/**
 * One-time script: transcribe public/audio/interview-1..3.mp3 and write
 * bilingual (Tamil + English) transcripts/summaries into src/data/neirkaanal.json.
 *
 *   npm run transcribe-interviews
 */
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const DATA_PATH = path.join(process.cwd(), "src", "data", "neirkaanal.json");
const AUDIO_DIR = path.join(process.cwd(), "public", "audio");
const SM_API = "https://asr.api.speechmatics.com/v2";

const PULAM_SLUGS = [
  "farming",
  "festival",
  "cooking",
  "history",
  "folklore",
  "life",
  "religion",
  "medicine",
] as const;

type PulamSlug = (typeof PULAM_SLUGS)[number];

type Localized = { ta: string; en: string };

type Interview = {
  id: string;
  audioUrl: string;
  youtubeUrl: string;
  channelName: string;
  category: PulamSlug;
  title: Localized;
  summary: Localized;
  fullTranscript: Localized;
};

const SEED: Omit<Interview, "title" | "summary" | "fullTranscript" | "category">[] = [
  {
    id: "interview-1",
    audioUrl: "/audio/interview-1.mp3",
    youtubeUrl: "https://youtu.be/P3ofWxp4K3E",
    channelName: "Wow Tamizhaa",
  },
  {
    id: "interview-2",
    audioUrl: "/audio/interview-2.mp3",
    youtubeUrl: "https://youtu.be/y_3s3OAyEvQ",
    channelName: "Miss Wow Tamizhaa",
  },
  {
    id: "interview-3",
    audioUrl: "/audio/interview-3.mp3",
    youtubeUrl: "https://youtu.be/jGG1AyOSVkI",
    channelName: "Gobinath",
  },
];

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function chunkText(text: string, maxChars: number): string[] {
  const parts: string[] = [];
  let rest = text.trim();
  while (rest.length > maxChars) {
    let cut = rest.lastIndexOf(" ", maxChars);
    if (cut < maxChars * 0.6) cut = maxChars;
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) parts.push(rest);
  return parts;
}

async function speechmaticsTranscript(filePath: string): Promise<string> {
  const key = process.env.SPEECHMATICS_API_KEY;
  if (!key) throw new Error("SPEECHMATICS_API_KEY missing");

  const buf = fs.readFileSync(filePath);
  const form = new FormData();
  form.append(
    "data_file",
    new Blob([new Uint8Array(buf)], { type: "audio/mpeg" }),
    path.basename(filePath)
  );
  form.append(
    "config",
    JSON.stringify({
      type: "transcription",
      transcription_config: {
        language: "ta",
        operating_point: "enhanced",
      },
    })
  );

  console.log(`  Speechmatics submit ${path.basename(filePath)} (${buf.length} bytes)`);
  const createRes = await fetch(`${SM_API}/jobs/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  const createText = await createRes.text();
  if (!createRes.ok) {
    throw new Error(`Speechmatics create ${createRes.status}: ${createText.slice(0, 500)}`);
  }
  const created = JSON.parse(createText);
  const jobId = created.id || created.job?.id;
  if (!jobId) throw new Error(`No job id: ${createText.slice(0, 400)}`);
  console.log(`  job ${jobId}`);

  const started = Date.now();
  while (Date.now() - started < 25 * 60 * 1000) {
    await new Promise((r) => setTimeout(r, 12000));
    const stRes = await fetch(`${SM_API}/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    const stJson = await stRes.json();
    const status = stJson.job?.status || stJson.status;
    console.log(`  status ${status}`);
    if (status === "done") break;
    if (status === "rejected" || status === "deleted") {
      throw new Error(`Speechmatics job ${status}: ${JSON.stringify(stJson).slice(0, 400)}`);
    }
  }

  const trRes = await fetch(`${SM_API}/jobs/${jobId}/transcript?format=txt`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  const transcript = (await trRes.text()).trim();
  if (!trRes.ok || !transcript) {
    throw new Error(`Transcript fetch failed ${trRes.status}: ${transcript.slice(0, 300)}`);
  }
  return transcript.replace(/\s+/g, " ").trim();
}

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-flash-latest",
  "gemini-3.8-flash",
  "gemini-1.5-flash",
];

async function geminiText(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY missing");
  const genAI = new GoogleGenerativeAI(key);
  let lastError: Error | null = null;
  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.2 },
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      if (text) return text;
    } catch (err) {
      lastError = err as Error;
    }
  }
  throw lastError || new Error("All Gemini models failed");
}

async function polishTamil(raw: string): Promise<string> {
  const chunks = chunkText(raw, 6000);
  const out: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    console.log(`  polish Tamil chunk ${i + 1}/${chunks.length}`);
    const text = await geminiText(`நீங்கள் தமிழ் வாய்மொழி ஆவணக் காப்பகத்திற்கு உதவுகிறீர்கள்.
கீழே ASR படியெடுப்பு உள்ளது. இதைச் சுத்தமான தமிழில் மீண்டும் எழுதுங்கள்.

விதிகள்:
- வெளியீடு முழுவதும் தமிழ் எழுத்து மட்டுமே.
- ஆங்கில எழுத்துகள், ரோமன் தமிழ் (Tanglish), கலப்பு எழுத்து ஆகியவை வேண்டாம்.
- ஆங்கிலக் கடன் சொற்களைத் தமிழில் எழுதுங்கள் (எ.கா. home → இல்லம், video → காணொளி).
- இயல்பான தமிழ்ப் பெயர்களைத் தமிழ் எழுத்திலேயே எழுதுங்கள்.
- பொருளை மாற்ற வேண்டாம். சுருக்க வேண்டாம்.
- முன்னுரை, தலைப்பு, மேற்கோள் வேண்டாம். படியெடுப்பு மட்டும்.

படியெடுப்பு:
${chunks[i]}`);
    out.push(text.replace(/^```[\w]*\n?|\n?```$/g, "").trim());
  }
  return out.join(" ");
}

async function translateEnglish(tamil: string): Promise<string> {
  const chunks = chunkText(tamil, 6000);
  const out: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    console.log(`  translate EN chunk ${i + 1}/${chunks.length}`);
    const text = await geminiText(`Translate the following Tamil interview transcript into clear, natural English.
Rules:
- English only. No Tamil script. No Tanglish.
- Do not summarize. Translate the full meaning.
- No preamble or quotes.
- Keep it faithful.

Tamil:
${chunks[i]}`);
    out.push(text.replace(/^```[\w]*\n?|\n?```$/g, "").trim());
  }
  return out.join(" ");
}

async function titlesSummaryCategory(
  tamilTranscript: string,
  englishTranscript: string
): Promise<{
  title: Localized;
  summary: Localized;
  category: PulamSlug;
}> {
  const prompt = `You catalog Tamil oral-history interviews.

Return JSON only:
{
  "title_ta": "Tamil title only, no English letters",
  "title_en": "English title only, no Tamil script",
  "category": "one of: ${PULAM_SLUGS.join("|")}",
  "summary_ta": "about 100 words, Tamil script only, no English letters, no Tanglish",
  "summary_en": "about 100 words, English only, no Tamil script"
}

Pick the single best homepage category.
Summaries must stay inside the interview; do not invent facts.

Tamil transcript (excerpt):
${tamilTranscript.slice(0, 14000)}

English transcript (excerpt):
${englishTranscript.slice(0, 14000)}`;

  const raw = (await geminiText(prompt)).replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(raw);
  const category = PULAM_SLUGS.includes(parsed.category) ? parsed.category : "life";
  return {
    category,
    title: {
      ta: String(parsed.title_ta || "").trim(),
      en: String(parsed.title_en || "").trim(),
    },
    summary: {
      ta: String(parsed.summary_ta || "").trim(),
      en: String(parsed.summary_en || "").trim(),
    },
  };
}

async function main() {
  if (!process.env.SPEECHMATICS_API_KEY) {
    throw new Error("SPEECHMATICS_API_KEY missing in .env.local");
  }
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY missing in .env.local");
  }

  const interviews: Interview[] = [];

  for (const seed of SEED) {
    const filePath = path.join(AUDIO_DIR, path.basename(seed.audioUrl));
    console.log(`\n=== ${seed.id} ===`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing audio: ${filePath}`);
    }

    const rawTa = await speechmaticsTranscript(filePath);
    console.log(`  ASR words: ${wordCount(rawTa)}`);

    let transcriptTa = "";
    try {
      transcriptTa = await polishTamil(rawTa);
    } catch (err) {
      console.warn("  Tamil polish failed, using ASR text:", (err as Error).message);
      transcriptTa = rawTa;
    }

    let transcriptEn = "";
    try {
      transcriptEn = await translateEnglish(transcriptTa || rawTa);
    } catch (err) {
      console.warn("  EN translate failed:", (err as Error).message);
    }

    let meta: { title: Localized; summary: Localized; category: PulamSlug } = {
      category: "life",
      title: { ta: "நேர்காணல்", en: "Interview" },
      summary: { ta: "", en: "" },
    };
    try {
      meta = await titlesSummaryCategory(transcriptTa || rawTa, transcriptEn);
    } catch (err) {
      console.warn("  meta failed:", (err as Error).message);
    }

    interviews.push({
      ...seed,
      category: meta.category,
      title: meta.title,
      summary: meta.summary,
      fullTranscript: {
        ta: transcriptTa || rawTa,
        en: transcriptEn,
      },
    });

    fs.writeFileSync(
      DATA_PATH,
      `${JSON.stringify({ interviews }, null, 2)}\n`,
      "utf8"
    );
    console.log(`  wrote partial ${DATA_PATH} (${interviews.length} entries)`);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
