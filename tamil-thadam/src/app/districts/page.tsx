// src/app/districts/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import OrnamentDivider from "@/components/OrnamentDivider";
import { DISTRICTS } from "@/data/mock-stories";
import { getAllStories } from "@/lib/stories-store";

export const instant = false;

async function DistrictsContent() {
  const allStories = await getAllStories();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Page Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#8B1E1E] mb-2">
          மாவட்டங்கள்
        </h1>
        <p className="text-base text-[#7A6A55]">
          {DISTRICTS.length} மாவட்டங்கள் · {allStories.length} கதைகள்
        </p>
      </div>

      <OrnamentDivider />

      {/* Grid of District Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-10">
        {DISTRICTS.map((district) => {
          const stories = allStories.filter(
            (s) => s.district_slug === district.slug
          );
          const count = stories.length;

          // Domain breakdown
          const pulamCounts: { [key: string]: number } = {};
          stories.forEach((s) => {
            pulamCounts[s.pulam_name_ta] = (pulamCounts[s.pulam_name_ta] || 0) + 1;
          });

          return (
            <Link
              key={district.slug}
              href={`/districts/${district.slug}`}
              className="manuscript-card group flex flex-col justify-between hover:border-[#8B1E1E] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-2xl font-bold text-[#8B1E1E] group-hover:text-[#6B1414] transition-colors flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#8B1E1E] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span>{district.name_ta}</span>
                  </h2>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F7EDD8] text-[#8B1E1E] border border-[#D9C9A8]">
                    {count > 0 ? `${count} கதைகள்` : "இன்னும் கதைகள் இல்லை"}
                  </span>
                </div>

                <p className="text-sm text-[#7A6A55] mb-4">
                  {district.name_ta} மண்ணின் பாரம்பரிய பண்பாடும் வாய்மொழி நினைவுகளும்.
                </p>

                {/* Pulam breakdown chips */}
                {count > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {Object.entries(pulamCounts).map(([pulamName, pCount]) => (
                      <span
                        key={pulamName}
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFFDF7] text-[#2B1810] border border-[#D9C9A8]"
                      >
                        {pulamName} · {pCount}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-6 border-t border-[#D9C9A8]/60 flex items-center justify-end text-sm font-semibold text-[#8B1E1E] group-hover:underline">
                <span>கதைகளைக் காண்க →</span>
              </div>
            </Link>
          );
        })}
      </div>

      <OrnamentDivider className="mt-16" />
    </div>
  );
}

export default function DistrictsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-[#7A6A55]">ஏற்றப்படுகிறது...</div>}>
      <DistrictsContent />
    </Suspense>
  );
}
