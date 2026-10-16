"use client";

import { useEffect, useState } from "react";
import NeirkaanalCard from "@/components/NeirkaanalCard";
import {
  Locale,
  NEIRKAANAL_COPY,
  NeirkaanalInterview,
} from "@/data/neirkaanal";

const LANG_KEY = "thadam-lang";

export default function NeirkaanalList({
  interviews,
}: {
  interviews: NeirkaanalInterview[];
}) {
  const [lang, setLang] = useState<Locale>("ta");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANG_KEY);
      if (stored === "ta" || stored === "en") setLang(stored);
    } catch {
      /* ignore */
    }
  }, []);

  function chooseLang(next: Locale) {
    setLang(next);
    try {
      window.localStorage.setItem(LANG_KEY, next);
    } catch {
      /* ignore */
    }
  }

  const copy = NEIRKAANAL_COPY[lang];

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-5xl font-bold text-[#8B1E1E] mb-3">
          {copy.heading}
        </h1>
        <p className="text-base sm:text-lg text-[#7A6A55] max-w-xl mx-auto leading-relaxed">
          {copy.intro}
        </p>
      </div>

      <div
        role="group"
        aria-label={copy.langGroup}
        className="flex justify-center mb-8"
      >
        <div className="inline-flex rounded-full border border-[#D9C9A8] bg-[#FFFDF7] p-1">
          <button
            type="button"
            aria-pressed={lang === "ta"}
            onClick={() => chooseLang("ta")}
            className={`min-h-11 px-4 sm:px-5 rounded-full text-sm font-semibold transition-colors ${
              lang === "ta"
                ? "bg-[#8B1E1E] text-white"
                : "text-[#2B1810] hover:text-[#8B1E1E]"
            }`}
          >
            {copy.langTa}
          </button>
          <button
            type="button"
            aria-pressed={lang === "en"}
            onClick={() => chooseLang("en")}
            className={`min-h-11 px-4 sm:px-5 rounded-full text-sm font-semibold transition-colors ${
              lang === "en"
                ? "bg-[#8B1E1E] text-white"
                : "text-[#2B1810] hover:text-[#8B1E1E]"
            }`}
          >
            {copy.langEn}
          </button>
        </div>
      </div>

      <ul className="flex flex-col gap-6">
        {interviews.map((interview) => (
          <li key={interview.id}>
            <NeirkaanalCard interview={interview} lang={lang} />
          </li>
        ))}
      </ul>

      <p className="mt-10 text-center text-xs sm:text-sm text-[#7A6A55] leading-relaxed">
        {copy.credit}
      </p>
    </div>
  );
}
