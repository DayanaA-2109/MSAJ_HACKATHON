/**
 * Finish interrupted Neirkaanal meta from existing Tamil transcripts.
 * Fills bilingual titles, ~100-word summaries, English transcripts, and category.
 *
 *   npm run enrich-neirkaanal
 *
 * Requires GEMINI_API_KEY in .env.local. Does not call APIs from the browser.
 * Safe to re-run; overwrites title / summary / fullTranscript.en / category.
 * Keeps fullTranscript.ta unless --repolish is passed.
 */
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const DATA_PATH = path.join(process.cwd(), "src", "data", "neirkaanal.json");
const REPOLISH = process.argv.includes("--repolish");

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

type DataFile = { interviews: Interview[] };

const MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-flash-latest",
  "gemini-3.8-flash",
  "gemini-1.5-flash",
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

function extractiveSummary(transcript: string, maxWords = 100): string {
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")}…`;
}

async function geminiText(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY missing in .env.local");

  const genAI = new GoogleGenerativeAI(key);
  let lastError: Error | null = null;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.25 },
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      if (!text) throw new Error("empty response");
      console.log(`  used model ${modelName}`);
      return text;
    } catch (err) {
      lastError = err as Error;
      console.warn(`  model ${modelName} failed:`, lastError.message.slice(0, 180));
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
- ஆங்கிலக் கடன் சொற்களைத் தமிழில் எழுதுங்கள்.
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
): Promise<{ title: Localized; summary: Localized; category: PulamSlug }> {
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
Map life topics to "life" (Vaazhkai) and historical topics to "history" (Varalaru) when those fit.
Summaries must stay inside the interview; do not invent facts.

Tamil transcript (excerpt):
${tamilTranscript.slice(0, 14000)}

English transcript (excerpt):
${englishTranscript.slice(0, 14000)}`;

  const raw = (await geminiText(prompt)).replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(raw);
  const category = PULAM_SLUGS.includes(parsed.category)
    ? (parsed.category as PulamSlug)
    : "life";
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
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY missing. Add it to .env.local then run: npm run enrich-neirkaanal"
    );
  }
  if (!fs.existsSync(DATA_PATH)) {
    throw new Error(`Data file not found: ${DATA_PATH}`);
  }

  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8")) as DataFile;

  for (const entry of data.interviews) {
    console.log(`\n=== ${entry.id} ===`);
    const tamilSource = (entry.fullTranscript?.ta || "").trim();
    if (!tamilSource) {
      console.log("  skip: no Tamil transcript");
      continue;
    }

    let transcriptTa = tamilSource;
    if (REPOLISH) {
      try {
        transcriptTa = await polishTamil(tamilSource);
        entry.fullTranscript.ta = transcriptTa;
      } catch (err) {
        console.warn("  polish failed, keeping existing Tamil:", (err as Error).message);
      }
    }

    let transcriptEn = (entry.fullTranscript?.en || "").trim();
    if (!transcriptEn) {
      try {
        transcriptEn = await translateEnglish(transcriptTa);
        entry.fullTranscript.en = transcriptEn;
        console.log(`  EN words: ${wordCount(transcriptEn)}`);
      } catch (err) {
        console.warn("  EN translate failed:", (err as Error).message);
      }
    } else {
      console.log(`  EN already present (${wordCount(transcriptEn)} words)`);
    }

    try {
      const meta = await titlesSummaryCategory(transcriptTa, transcriptEn);
      entry.category = meta.category;
      entry.title = meta.title;
      entry.summary = {
        ta: meta.summary.ta || extractiveSummary(transcriptTa),
        en:
          meta.summary.en ||
          (transcriptEn ? extractiveSummary(transcriptEn) : ""),
      };
      console.log(`  title: ${entry.title.ta} / ${entry.title.en}`);
      console.log(`  category: ${entry.category}`);
      console.log(
        `  summary words ta/en: ${wordCount(entry.summary.ta)}/${wordCount(entry.summary.en)}`
      );
    } catch (err) {
      console.warn("  meta failed, using extractive summaries:", (err as Error).message);
      entry.summary = {
        ta: entry.summary.ta || extractiveSummary(transcriptTa),
        en:
          entry.summary.en ||
          (transcriptEn ? extractiveSummary(transcriptEn) : ""),
      };
    }

    fs.writeFileSync(DATA_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    console.log(`  wrote ${DATA_PATH}`);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
