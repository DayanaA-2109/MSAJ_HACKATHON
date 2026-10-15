// src/components/PulamBar.tsx
import Link from "next/link";
import { PULAMS } from "@/data/mock-stories";

export default function PulamBar({ activePulam }: { activePulam?: string }) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-none sm:flex-wrap sm:justify-center">
        {PULAMS.map((p) => {
          const isActive = activePulam === p.slug;
          return (
            <Link
              key={p.slug}
              href={`/browse?pulam=${p.slug}`}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
                isActive
                  ? "bg-[#8B1E1E] text-white shadow-md border border-[#6B1414]"
                  : "bg-[#FFFDF7] text-[#2B1810] border border-[#D9C9A8] hover:border-[#D4A017] hover:bg-[#FDF1D0] hover:text-[#8B1E1E]"
              }`}
            >
              <span className="text-base">{p.emoji}</span>
              <span>{p.name_ta}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
