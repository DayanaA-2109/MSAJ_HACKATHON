// src/app/story/[id]/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import OrnamentDivider from "@/components/OrnamentDivider";
import StoryPlayer from "@/components/StoryPlayer";
import StoryCard from "@/components/StoryCard";
import DeleteStoryButton from "@/components/DeleteStoryButton";
import BackToHomeLink from "@/components/BackToHomeLink";
import { getStoryById, getAllStories } from "@/lib/stories-store";

export const instant = false;

export async function generateStaticParams() {
  const stories = await getAllStories();
  return stories.map((s) => ({ id: s.id }));
}

async function StoryDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const story = await getStoryById(id);

  if (!story) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <span className="text-5xl block mb-4">📜</span>
        <h1 className="text-2xl font-bold text-[#8B1E1E] mb-3">
          கதை கிடைக்கவில்லை
        </h1>
        <p className="text-[#7A6A55] mb-6">
          நீங்கள் தேடும் பதிவு காப்பகத்தில் இல்லை அல்லது நீக்கப்பட்டிருக்கலாம்.
        </p>
        <Link href="/browse" className="stamp-btn-primary">
          கதைகளை உலாவுங்கள்
        </Link>
      </div>
    );
  }

  // Related stories from same district or pulam
  const allStories = await getAllStories();
  const relatedStories = allStories
    .filter(
      (s) =>
        s.id !== story.id &&
        (s.district_slug === story.district_slug || s.pulam_slug === story.pulam_slug)
    )
    .slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Back Link & Delete Action */}
      <div className="flex items-center justify-between mb-6">
        <BackToHomeLink />

        {/* Delete Story Option */}
        <DeleteStoryButton storyId={story.id} storyTitle={story.title} />
      </div>

      {/* Story Header Card */}
      <div className="manuscript-card mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Link
            href={`/districts/${story.district_slug}`}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#F7EDD8] text-[#8B1E1E] hover:bg-[#F5D98B]"
          >
            <span>📍</span>
            <span>{story.district_name_ta}</span>
          </Link>

          <Link
            href={`/browse?pulam=${story.pulam_slug}`}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#FDF8EE] text-[#7A6A55] border border-[#D9C9A8]"
          >
            <span>{story.pulam_emoji}</span>
            <span>{story.pulam_name_ta}</span>
          </Link>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFFDF7] text-[#2B1810] border border-[#D9C9A8]">
            <span>👤</span>
            <span>
              {story.informant_name} {story.informant_age ? `(${story.informant_age})` : ""}
            </span>
          </span>

          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ml-auto ${
              story.verification_status === "verified"
                ? "bg-[#DCF3E4] text-[#2D6A4F] border border-[#B8E4C4]"
                : story.verification_status === "in_review"
                ? "bg-[#FDF1D0] text-[#8A6300] border border-[#F5D98B]"
                : "bg-[#EEE9DD] text-[#6B5B45] border border-[#D9C9A8]"
            }`}
          >
            <span>
              {story.verification_status === "verified"
                ? "✅ சரிபார்க்கப்பட்டது"
                : story.verification_status === "in_review"
                ? "🕓 சரிபார்ப்பில் உள்ளது"
                : "⚪ சரிபார்க்கப்படவில்லை"}
            </span>
          </span>
        </div>

        {/* H1 Title */}
        <h1 className="text-2xl sm:text-4xl font-bold text-[#8B1E1E] leading-tight mb-4">
          {story.title}
        </h1>

        <OrnamentDivider symbols="✦ ❋ ✦" className="!my-4 opacity-70" />

        {/* AI Summary Excerpt */}
        <div className="bg-[#FDF8EE] border-l-4 border-[#D4A017] p-4 sm:p-5 rounded-r-xl">
          <h2 className="text-xs font-bold text-[#D4A017] uppercase tracking-wider mb-1">
            கதைச் சுருக்கம் (செயற்கை நுண்ணறிவு பகுப்பாய்வு)
          </h2>
          <p className="text-base sm:text-lg text-[#2B1810] italic leading-relaxed">
            &ldquo;{story.summary_ta}&rdquo;
          </p>
        </div>
      </div>

      {/* Story Player with Click-to-Seek segments */}
      <div className="mb-10">
        <h3 className="text-lg font-bold text-[#8B1E1E] mb-3">
          🎧 குரல் பதிவு & ஒத்திசைவு இயக்கம்
        </h3>
        <StoryPlayer
          storyId={story.id}
          audioUrl={story.audio_url}
          durationSeconds={story.duration_seconds}
          segments={story.transcript_segments}
        />
      </div>

      {/* Full Transcript */}
      <div className="manuscript-card mb-10">
        <h3 className="text-xl font-bold text-[#8B1E1E] mb-3">
          முழு உரை வடிவம் (Full Transcript)
        </h3>
        <p className="text-base sm:text-lg leading-loose text-[#2B1810]/90 whitespace-pre-line">
          {story.transcript_full}
        </p>
      </div>

      {/* Cultural Tags & Entities */}
      <div className="bg-[#FFFDF7] border border-[#D9C9A8] rounded-2xl p-6 mb-12">
        <h3 className="text-base font-bold text-[#8B1E1E] mb-3">
          கலாச்சாரக் குறிச்சொற்கள் & மரபுகள்
        </h3>
        <div className="flex flex-wrap gap-2">
          {story.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-full text-xs font-medium bg-[#F7EDD8] text-[#8B1E1E] border border-[#D9C9A8]"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <OrnamentDivider />

      {/* Related Stories */}
      {relatedStories.length > 0 && (
        <section className="mt-12">
          <h3 className="text-2xl font-bold text-[#8B1E1E] mb-6 text-center">
            தொடர்புடைய பிற கதைகள்
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedStories.map((rel) => (
              <StoryCard key={rel.id} story={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function StoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="text-center py-20 text-[#7A6A55]">ஏற்றப்படுகிறது...</div>}>
      <StoryDetailContent params={params} />
    </Suspense>
  );
}
