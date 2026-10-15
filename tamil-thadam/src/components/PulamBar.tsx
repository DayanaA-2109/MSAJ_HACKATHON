// src/components/PulamBar.tsx
import Link from "next/link";
import { PULAMS } from "@/data/mock-stories";
import PulamIcon from "@/components/PulamIcon";

export default function PulamBar({ activePulam }: { activePulam?: string }) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-none sm:flex-wrap sm:justify-center">
        {PULAMS.map((p) => {
          const isActive = activePulam === p.slug;
          return (
            <Link
              key={p.slug}
              href={`/browse?pulam=${p.slug}`}
              className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? "bg-[#8B1E1E] text-white shadow-sm border border-[#6B1414]"
                  : "bg-white text-[#2B1810] border border-[#D9C9A8] hover:border-[#8B1E1E] hover:bg-[#FDF8EE] hover:text-[#8B1E1E] shadow-2xs"
              }`}
            >
              <PulamIcon
                slug={p.slug}
                className={`w-4 h-4 ${isActive ? "text-white" : "text-[#8B1E1E]"}`}
              />
              <span>{p.name_ta}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
