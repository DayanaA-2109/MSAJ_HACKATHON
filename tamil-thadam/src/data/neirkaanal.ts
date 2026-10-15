import data from "./neirkaanal.json";

export type NeirkaanalCategory = "vaazhkai" | "varalaru";

export type NeirkaanalInterview = {
  id: string;
  title: string;
  category: NeirkaanalCategory;
  youtubeUrl: string;
  channelName: string;
  summary: string;
  fullTranscript: string;
};

export const CATEGORY_LABELS: Record<NeirkaanalCategory, string> = {
  vaazhkai: "Vaazhkai (வாழ்க்கை)",
  varalaru: "Varalaru (வரலாறு)",
};

export const NEIRKAANAL_INTERVIEWS = data.interviews as NeirkaanalInterview[];

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
