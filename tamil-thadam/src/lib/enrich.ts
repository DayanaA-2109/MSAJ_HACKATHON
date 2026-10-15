// src/lib/enrich.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export type EnrichResult = {
  summary_ta: string;
  tags: string[];
  entities: {
    people: string[];
    places: string[];
    traditions: string[];
  };
};

export class EnrichError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "EnrichError";
  }
}

export async function enrichStory(transcript: string): Promise<EnrichResult> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new EnrichError("GEMINI_API_KEY missing in .env.local");
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-3.8-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,
    },
  });

  const prompt = `நீங்கள் தமிழ் வாய்மொழி வரலாற்று காப்பகத்திற்கு உதவுகிறீர்கள். கீழே ஒரு தமிழ் பேச்சின் எழுத்துப்பிழைகள் இருக்கக்கூடிய டிரான்ஸ்கிரிப்ட் உள்ளது.

கீழே உள்ள JSON வடிவத்தில் மட்டுமே பதிலளிக்கவும். வேறு எந்த உரையும் சேர்க்க வேண்டாம். அனைத்து உள்ளடக்கமும் தமிழ் மொழியில் மட்டுமே இருக்க வேண்டும் (tags மற்றும் entities உட்பட).

{
  "summary_ta": "2-3 வாக்கியங்களில் தமிழ் சுருக்கம்",
  "tags": ["5-8 கலாச்சார தலைப்பு குறிச்சொற்கள் - எடுத்துக்காட்டு: பொங்கல், விவசாயம், நாட்டுப்புற பாடல்"],
  "entities": {
    "people": ["பெயர்கள்"],
    "places": ["இடங்கள்"],
    "traditions": ["பாரம்பரியங்கள்"]
  }
}

குறிப்பு: tags எப்போதும் ஒரே சொல்லாக இருக்கட்டும் (எடுத்துக்காட்டு: "பொங்கல்", "பொங்கல் பண்டிகை" அல்ல).

Transcript:
${transcript}`;

  const maxRetries = 4;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json|```/g, "").trim();

      let parsed: any;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        throw new EnrichError(`Gemini returned invalid JSON: ${cleaned.slice(0, 200)}`);
      }

      const summary_ta = typeof parsed.summary_ta === "string" ? parsed.summary_ta : "";
      const tags = Array.isArray(parsed.tags)
        ? parsed.tags.filter((t: any) => typeof t === "string")
        : [];
      const entities = {
        people: Array.isArray(parsed.entities?.people) ? parsed.entities.people : [],
        places: Array.isArray(parsed.entities?.places) ? parsed.entities.places : [],
        traditions: Array.isArray(parsed.entities?.traditions) ? parsed.entities.traditions : [],
      };

      return { summary_ta, tags, entities };
    } catch (err: any) {
      lastError = err;

      const isRetryable =
        err?.message?.includes("503") ||
        err?.message?.includes("UNAVAILABLE") ||
        err?.message?.includes("high demand") ||
        err?.message?.includes("429");

      if (!isRetryable || attempt === maxRetries) break;

      const delayMs = Math.pow(2, attempt) * 1000 + Math.random() * 500;
      console.log(
        `⏳ Attempt ${attempt}/${maxRetries} — retryable error. Retrying in ${(delayMs / 1000).toFixed(1)}s...`
      );
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  throw new EnrichError("Gemini enrichment failed after retries", lastError);
}