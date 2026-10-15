// src/lib/stories-store.ts
import fs from "node:fs/promises";
import path from "node:path";
import { INITIAL_STORIES, Story } from "@/data/mock-stories";

const USER_STORIES_FILE = path.join(process.cwd(), "src", "data", "user-stories.json");
const DELETED_STORIES_FILE = path.join(process.cwd(), "src", "data", "deleted-stories.json");

// Ensure files exist
async function ensureFiles() {
  try {
    await fs.access(USER_STORIES_FILE);
  } catch {
    await fs.writeFile(USER_STORIES_FILE, "[]", "utf-8");
  }
  try {
    await fs.access(DELETED_STORIES_FILE);
  } catch {
    await fs.writeFile(DELETED_STORIES_FILE, "[]", "utf-8");
  }
}

// Read user-stories.json
export async function getUserStories(): Promise<Story[]> {
  await ensureFiles();
  try {
    const data = await fs.readFile(USER_STORIES_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Read deleted stories list
export async function getDeletedStoryIds(): Promise<string[]> {
  await ensureFiles();
  try {
    const data = await fs.readFile(DELETED_STORIES_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Get all stories (User stories + Initial stories, excluding deleted)
export async function getAllStories(): Promise<Story[]> {
  const [userStories, deletedIds] = await Promise.all([
    getUserStories(),
    getDeletedStoryIds(),
  ]);

  const deletedSet = new Set(deletedIds);

  // Filter out deleted ones
  const activeUserStories = userStories.filter((s) => !deletedSet.has(s.id));
  const userStoryIds = new Set(activeUserStories.map((s) => s.id));

  // Exclude initial stories that are deleted OR already overridden in user stories
  const activeInitialStories = INITIAL_STORIES.filter(
    (s) => !deletedSet.has(s.id) && !userStoryIds.has(s.id)
  );

  // Merge with latest user stories first, and ensure absolute uniqueness by ID
  const map = new Map<string, Story>();
  for (const s of activeUserStories) {
    if (!map.has(s.id)) map.set(s.id, s);
  }
  for (const s of activeInitialStories) {
    if (!map.has(s.id)) map.set(s.id, s);
  }

  return Array.from(map.values());
}

// Get a single story by ID
export async function getStoryById(id: string): Promise<Story | undefined> {
  const stories = await getAllStories();
  const localFound = stories.find((s) => s.id === id);
  if (localFound) return localFound;

  // Fallback: check Supabase directly
  try {
    const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
    const { data: row } = await supabaseAdmin
      .from("stories")
      .select(`
        id, title, description, district_id, topic_id, language, source_url, narrator_name, consent_given, is_published, created_at,
        districts ( id, name_en, name_ta ),
        topics ( id, name_en, name_ta ),
        audio_files ( id, storage_path, audio_url, duration_seconds ),
        transcripts ( id, tamil_text, summary, transcript_status )
      `)
      .eq("id", id)
      .maybeSingle();

    if (row) {
      const audio = (row as any).audio_files?.[0];
      const transcript = (row as any).transcripts?.[0];
      const districtName = (Array.isArray((row as any).districts) ? (row as any).districts[0]?.name_ta : (row as any).districts?.name_ta) || "தமிழ்நாடு";
      const topicName = (Array.isArray((row as any).topics) ? (row as any).topics[0]?.name_ta : (row as any).topics?.name_ta) || "வரலாறு";
      const duration = audio?.duration_seconds || 30;
      const text = transcript?.tamil_text || (row as any).description || (row as any).title;

      return {
        id: (row as any).id,
        title: (row as any).title || "வாய்மொழிப் பதிவு",
        audio_url: audio?.audio_url || (row as any).audio_url || "",
        duration_seconds: duration,
        district_slug: (Array.isArray((row as any).districts) ? (row as any).districts[0]?.name_en : (row as any).districts?.name_en)?.toLowerCase() || "chennai",
        district_name_ta: districtName,
        pulam_slug: "life",
        pulam_name_ta: topicName,
        pulam_emoji: "🌱",
        informant_name: (row as any).narrator_name || "அநாமதேயர்",
        informant_age: 75,
        source_url: (row as any).source_url || "",
        consent_given: (row as any).consent_given ?? true,
        verification_status: "verified",
        summary_ta: (row as any).description || transcript?.summary || "வாய்மொழி வரலாற்றுப் பதிவு.",
        transcript_full: text,
        transcript_segments: [
          { start: 0, end: duration, text },
        ],
        tags: [districtName, topicName, "வாய்மொழி வரலாறு"],
        entities: {
          people: (row as any).narrator_name ? [(row as any).narrator_name] : [],
          places: [districtName],
          traditions: [topicName],
        },
        created_at: (row as any).created_at,
      };
    }
  } catch (err) {
    console.warn("Supabase lookup error in getStoryById:", err);
  }

  return undefined;
}

// Add a new user story
export async function saveUserStory(story: Story): Promise<void> {
  await ensureFiles();
  const userStories = await getUserStories();
  // Prepend to top
  const updated = [story, ...userStories.filter((s) => s.id !== story.id)];
  await fs.writeFile(USER_STORIES_FILE, JSON.stringify(updated, null, 2), "utf-8");
}

// Update audio URL for a story (user story or initial story override)
export async function updateStoryAudio(
  id: string,
  audioUrl: string,
  durationSeconds?: number
): Promise<boolean> {
  await ensureFiles();
  const userStories = await getUserStories();
  const existingIdx = userStories.findIndex((s) => s.id === id);

  if (existingIdx !== -1) {
    userStories[existingIdx].audio_url = audioUrl;
    if (durationSeconds) {
      userStories[existingIdx].duration_seconds = durationSeconds;
    }
    await fs.writeFile(USER_STORIES_FILE, JSON.stringify(userStories, null, 2), "utf-8");
    return true;
  }

  // Check if it's an initial story; save an updated copy into userStories so it takes precedence
  const initial = INITIAL_STORIES.find((s) => s.id === id);
  if (initial) {
    const updatedInitial: Story = {
      ...initial,
      audio_url: audioUrl,
      duration_seconds: durationSeconds || initial.duration_seconds,
    };
    userStories.unshift(updatedInitial);
    await fs.writeFile(USER_STORIES_FILE, JSON.stringify(userStories, null, 2), "utf-8");
    return true;
  }

  return false;
}

// Delete a story by ID
export async function deleteStory(id: string): Promise<boolean> {
  await ensureFiles();

  // 1. Add to deleted IDs
  const deletedIds = await getDeletedStoryIds();
  if (!deletedIds.includes(id)) {
    deletedIds.push(id);
    await fs.writeFile(DELETED_STORIES_FILE, JSON.stringify(deletedIds, null, 2), "utf-8");
  }

  // 2. Remove from user-stories.json
  const userStories = await getUserStories();
  const storyToDelete = userStories.find((s) => s.id === id);
  const updatedUserStories = userStories.filter((s) => s.id !== id);
  await fs.writeFile(USER_STORIES_FILE, JSON.stringify(updatedUserStories, null, 2), "utf-8");

  // 3. Remove uploaded audio file if exists
  if (storyToDelete && storyToDelete.audio_url && storyToDelete.audio_url.startsWith("/uploads/")) {
    try {
      const fileName = path.basename(storyToDelete.audio_url);
      const filePath = path.join(process.cwd(), "public", "uploads", fileName);
      await fs.unlink(filePath);
    } catch (err) {
      console.warn("Could not delete audio file:", err);
    }
  }

  return true;
}
