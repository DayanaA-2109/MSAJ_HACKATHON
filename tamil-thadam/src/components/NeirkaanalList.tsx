"use client";

import { useMemo, useState } from "react";
import NeirkaanalCard from "@/components/NeirkaanalCard";
import {
  CATEGORY_LABELS,
  NeirkaanalCategory,
  NeirkaanalInterview,
} from "@/data/neirkaanal";

type Filter = "all" | NeirkaanalCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "vaazhkai", label: CATEGORY_LABELS.vaazhkai },
  { id: "varalaru", label: CATEGORY_LABELS.varalaru },
];

export default function NeirkaanalList({
  interviews,
}: {
  interviews: NeirkaanalInterview[];
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(
    () =>
      filter === "all"
        ? interviews
        : interviews.filter((item) => item.category === filter),
    [filter, interviews]
  );

  return (
    <div>
      <div
        role="tablist"
        aria-label="Interview category"
        className="flex flex-wrap items-center gap-2 mb-6"
      >
        {FILTERS.map((tab) => {
          const selected = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setFilter(tab.id)}
              className={`shrink-0 inline-flex items-center px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all min-h-11 ${
                selected
                  ? "bg-[#8B1E1E] text-white shadow-sm border border-[#6B1414]"
                  : "bg-white text-[#2B1810] border border-[#D9C9A8] hover:border-[#8B1E1E] hover:bg-[#FDF8EE] hover:text-[#8B1E1E]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="text-center text-[#7A6A55] py-10">
          No interviews in this category yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-6">
          {visible.map((interview) => (
            <li key={interview.id}>
              <NeirkaanalCard interview={interview} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
