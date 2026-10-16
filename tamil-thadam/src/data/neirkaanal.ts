import data from "./neirkaanal.json";
import { PULAMS } from "@/data/mock-stories";

export type Locale = "ta" | "en";

export type LocalizedText = {
  ta: string;
  en: string;
};

export type PulamSlug =
  | "farming"
  | "festival"
  | "cooking"
  | "history"
  | "folklore"
  | "life"
  | "religion"
  | "medicine";

export type NeirkaanalInterview = {
  id: string;
  audioUrl: string;
  youtubeUrl: string;
  channelName: string;
  category: PulamSlug;
  title: LocalizedText;
  summary: LocalizedText;
  fullTranscript: LocalizedText;
};

export const PULAM_LABELS: Record<PulamSlug, LocalizedText> = {
  farming: { ta: "விவசாயம்", en: "Farming" },
  festival: { ta: "பண்டிகை", en: "Festival" },
  cooking: { ta: "சமையல்", en: "Cooking" },
  history: { ta: "வரலாறு", en: "History" },
  folklore: { ta: "நாட்டுப்புறம்", en: "Folklore" },
  life: { ta: "வாழ்க்கை", en: "Life" },
  religion: { ta: "சமயம்", en: "Religion" },
  medicine: { ta: "மருத்துவம்", en: "Medicine" },
};

export const NEIRKAANAL_COPY: Record<
  Locale,
  {
    heading: string;
    intro: string;
    expand: string;
    collapse: string;
    source: string;
    play: string;
    pause: string;
    missing: string;
    credit: string;
    langTa: string;
    langEn: string;
    langGroup: string;
  }
> = {
  ta: {
    heading: "நேர்காணல்",
    intro:
      "வாய்மொழி நேர்காணல்களின் சுருக்கமும் முழுப் படியெடுப்பும். ஒவ்வொன்றும் முகப்பின் புல வகையுடன் குறிக்கப்பட்டுள்ளது.",
    expand: "முழுப் படியெடுப்பைப் படி",
    collapse: "படியெடுப்பை மூடு",
    source: "மூலம்",
    play: "ஒலிப்பதிவை இயக்கு",
    pause: "ஒலிப்பதிவை நிறுத்து",
    missing: "படியெடுப்பு கிடைக்கவில்லை",
    credit:
      "சுருக்கங்கள் குறிப்பிற்காக மட்டும். முழுப் பெருமையும் யூடியூபில் உள்ள மூலப் படைப்பாளர்களுக்கே.",
    langTa: "தமிழ்",
    langEn: "ஆங்கிலம்",
    langGroup: "மொழி",
  },
  en: {
    heading: "Interview",
    intro:
      "Summaries and full transcripts of oral-history interviews. Each entry uses a homepage topic category.",
    expand: "Read full transcript",
    collapse: "Collapse transcript",
    source: "Source",
    play: "Play recording",
    pause: "Pause recording",
    missing: "Transcript not available",
    credit:
      "Summaries are for reference. All credit to the original creators on YouTube.",
    langTa: "Tamil",
    langEn: "English",
    langGroup: "Language",
  },
};

export const NEIRKAANAL_INTERVIEWS = data.interviews as NeirkaanalInterview[];

export function pulamLabel(slug: PulamSlug, lang: Locale): string {
  const fromHome = PULAMS.find((p) => p.slug === slug);
  if (lang === "ta" && fromHome) return fromHome.name_ta;
  return PULAM_LABELS[slug]?.[lang] || slug;
}

export function pickText(value: LocalizedText | string | undefined, lang: Locale): string {
  if (!value) return "";
  if (typeof value === "string") return lang === "ta" ? value : "";
  return (value[lang] || "").trim();
}

/** YouTube video IDs are 11 characters. Placeholder URLs are skipped. */
export function extractYoutubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    let id = "";

    if (parsed.hostname.includes("youtu.be")) {
      id = parsed.pathname.replace("/", "");
    } else if (parsed.searchParams.get("v")) {
      id = parsed.searchParams.get("v") || "";
    } else {
      const embed = parsed.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/);
      id = embed?.[1] || "";
    }

    return /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function youtubeThumbnailUrl(url: string): string | null {
  const id = extractYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}
