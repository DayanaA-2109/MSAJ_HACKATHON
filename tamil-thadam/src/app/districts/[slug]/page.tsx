// src/app/districts/[slug]/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import OrnamentDivider from "@/components/OrnamentDivider";
import StoryCard from "@/components/StoryCard";
import PulamIcon from "@/components/PulamIcon";
import { DISTRICTS } from "@/data/mock-stories";
import { getAllStories } from "@/lib/stories-store";

export const instant = false;

export function generateStaticParams() {
  return DISTRICTS.map((d) => ({ slug: d.slug }));
}

async function DistrictDetailContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const district = DISTRICTS.find((d) => d.slug === slug);

  if (!district) {
    notFound();
  }

  const allStories = await getAllStories();
  const stories = allStories.filter((s) => s.district_slug === slug);

  // Pulam counts in this district
  const pulamCounts: { [key: string]: { name_ta: string; count: number } } = {};
  stories.forEach((s) => {
    if (!pulamCounts[s.pulam_slug]) {
      pulamCounts[s.pulam_slug] = {
        name_ta: s.pulam_name_ta,
        count: 0,
      };
    }
    pulamCounts[s.pulam_slug].count += 1;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          href="/districts"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8B1E1E] hover:text-[#6B1414]"
        >
          <span>←</span>
          <span>அனைத்து மாவட்டங்கள்</span>
        </Link>
      </div>

      {/* District Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-5xl font-bold text-[#8B1E1E] mb-2 flex items-center justify-center gap-3">
          <svg className="w-8 h-8 text-[#8B1E1E]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span>{district.name_ta}</span>
        </h1>
        <p className="text-base text-[#7A6A55]">
          {stories.length} கதைகள் காப்பகத்தில் உள்ளன
        </p>
      </div>

      <OrnamentDivider symbols="✦ ❋ புலம் வாரியாக ❋ ✦" />

      {/* Pulam Filter Breakdown */}
      {Object.keys(pulamCounts).length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3 my-6">
          <span className="px-4 py-2 rounded-full bg-[#8B1E1E] text-white text-xs sm:text-sm font-bold shadow-sm">
            அனைத்தும் ({stories.length})
          </span>
          {Object.entries(pulamCounts).map(([pSlug, data]) => (
            <Link
              key={pSlug}
              href={`/browse?district=${slug}&pulam=${pSlug}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFFDF7] border border-[#D9C9A8] text-xs sm:text-sm font-semibold text-[#2B1810] hover:border-[#8B1E1E] hover:bg-[#FDF1D0] transition-colors"
            >
              <PulamIcon slug={pSlug} className="w-4 h-4 text-[#8B1E1E]" />
              <span>{data.name_ta} ({data.count})</span>
            </Link>
          ))}
        </div>
      )}

      <OrnamentDivider className="!my-8" />

      {/* Story Grid / Empty State */}
      {stories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="manuscript-card text-center py-16 max-w-lg mx-auto my-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F7EDD8] flex items-center justify-center text-[#8B1E1E]">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#8B1E1E] mb-2">
            இன்னும் கதைகள் இல்லை
          </h2>
          <p className="text-sm text-[#7A6A55] mb-6">
            {district.name_ta} மாவட்டத்திலிருந்து இன்னும் கதைகள் பதிவாகவில்லை. உங்கள் ஊரின் முதல் கதையை நீங்களே பதிவு செய்யுங்கள்!
          </p>
          <Link href="/record" className="stamp-btn-primary">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
            <span>இப்போது பதிவு செய்யுங்கள்</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function DistrictDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<div className="text-center py-20 text-[#7A6A55]">ஏற்றப்படுகிறது...</div>}>
      <DistrictDetailContent params={params} />
    </Suspense>
  );
}
