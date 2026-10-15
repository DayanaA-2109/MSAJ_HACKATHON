// src/app/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import OrnamentDivider from "@/components/OrnamentDivider";
import PulamBar from "@/components/PulamBar";
import StoryCard from "@/components/StoryCard";
import KolamStrip from "@/components/KolamStrip";
import { INITIAL_STORIES, DISTRICTS, Story } from "@/data/mock-stories";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);

  useEffect(() => {
    fetch("/api/stories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.stories)) {
          const map = new Map<string, Story>();
          for (const s of data.stories) {
            if (s && s.id && !map.has(s.id)) {
              map.set(s.id, s);
            }
          }
          setStories(Array.from(map.values()));
        }
      })
      .catch((err) => console.log("Failed to fetch stories:", err));
  }, []);

  const filteredStories = useMemo(() => {
    const list = stories.filter((story) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        story.title.toLowerCase().includes(q) ||
        story.summary_ta.toLowerCase().includes(q) ||
        story.district_name_ta.toLowerCase().includes(q) ||
        story.pulam_name_ta.toLowerCase().includes(q) ||
        story.tags.some((t) => t.toLowerCase().includes(q))
      );
    });

    const uniqueMap = new Map<string, Story>();
    for (const item of list) {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    }
    return Array.from(uniqueMap.values());
  }, [stories, searchQuery]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* =========================================================================
          SECTION 1 — ANIMATED HERO (68vh height)
          ========================================================================= */}
      <section className="relative min-h-[68vh] flex flex-col justify-center items-center text-center overflow-hidden px-4 sm:px-6 py-16 bg-[#2B1810]">
        {/* Kolam strip across the top */}
        <div className="absolute top-0 left-0 right-0 z-20">
          <KolamStrip />
        </div>

        {/* Hero Background with Darkening & Warm Radial Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-bg.jpg"
            alt="பாரம்பரிய தமிழ் இல்லம்"
            fill
            priority
            className="object-cover opacity-35 scale-100 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2B1810] via-[#2B1810]/70 to-[#8B1E1E]/40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,160,23,0.18)_0%,transparent_75%)]" />
        </div>

        {/* Floating Ornaments */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          <span className="absolute top-12 left-10 text-2xl text-[#D4A017]/40 animate-floating">✦</span>
          <span className="absolute top-24 right-16 text-3xl text-[#F5D98B]/30 animate-floating" style={{ animationDelay: "1.5s" }}>❋</span>
          <span className="absolute bottom-20 left-16 text-2xl text-[#D4A017]/35 animate-floating" style={{ animationDelay: "2.5s" }}>✺</span>
          <span className="absolute bottom-24 right-20 text-3xl text-[#F5D98B]/25 animate-floating" style={{ animationDelay: "3.5s" }}>❁</span>
        </div>

        {/* Content Container */}
        <div className="relative z-20 max-w-4xl mx-auto flex flex-col items-center">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4A017]/80 bg-[#D4A017]/10 backdrop-blur-sm text-[#F5D98B] text-xs sm:text-sm font-semibold mb-6 shadow-sm">
            <span>🪔</span>
            <span>தமிழ் வாய்மொழி காப்பகம்</span>
          </div>

          {/* Staggered Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight mb-5 drop-shadow-md">
            <span className="block text-[#FDF8EE]">பெரியவர்களின்</span>
            <span className="block text-[#F5D98B] my-1">கதைகள்</span>
            <span className="block text-[#D4A017] text-2xl sm:text-4xl md:text-5xl">— நம் மண்</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-[#FDF8EE]/90 max-w-2xl leading-relaxed mb-8">
            நம் தாத்தா பாட்டிகளின் குரலில், தமிழ் மண்ணின் நினைவுகளைப் பாதுகாப்போம். ஒவ்வொரு கதையும் ஒரு தலைமுறையின் சாட்சி.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-8">
            <Link
              href="/record"
              className="stamp-btn-primary w-full sm:w-auto !py-3.5 !px-8 !text-lg"
            >
              <span>🎙</span>
              <span>இப்போது பதிவு செய்யுங்கள்</span>
            </Link>

            <Link
              href="/browse"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-[#D4A017] bg-[#FFFDF7]/10 backdrop-blur-md text-[#FDF8EE] hover:bg-[#D4A017]/20 hover:text-white font-semibold transition-all text-center"
            >
              கதைகளை உலாவுங்கள்
            </Link>
          </div>

          {/* Stat Pills */}
          <div className="flex items-center gap-4">
            <div className="px-4 py-1.5 rounded-full bg-[#FFFDF7]/15 border border-[#D9C9A8]/30 backdrop-blur-sm text-[#F5D98B] text-xs sm:text-sm font-semibold">
              {stories.length} கதைகள்
            </div>
            <div className="px-4 py-1.5 rounded-full bg-[#FFFDF7]/15 border border-[#D9C9A8]/30 backdrop-blur-sm text-[#F5D98B] text-xs sm:text-sm font-semibold">
              {DISTRICTS.length} மாவட்டங்கள்
            </div>
          </div>

          {/* Scroll Hint */}
          <div className="mt-10 text-xs sm:text-sm text-[#FDF8EE]/70 flex items-center gap-2 animate-bounce">
            <span>கீழே உருட்டுங்கள்</span>
            <span>↓</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2 — PULAM (Domain) CHIPS
          ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full">
        <OrnamentDivider symbols="✦ ❋ புலம் வாரியாக ❋ ✦" />
        <PulamBar />
      </section>

      {/* =========================================================================
          SECTION 3 — NEW STORIES
          ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#8B1E1E]">புதிய கதைகள்</h2>
            <p className="text-sm text-[#7A6A55] mt-1">மண்ணின் மணமும் மூத்தவர்களின் அனுபவங்களும்</p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 தேடு — தலைப்பு, விளக்கம், குறிச்சொல்"
              className="w-full px-4 py-2.5 rounded-xl bg-[#FFFDF7] border border-[#D9C9A8] text-sm text-[#2B1810] focus:border-[#8B1E1E] focus:outline-none focus:ring-1 focus:ring-[#8B1E1E] placeholder:text-[#7A6A55]/70"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-xs text-[#7A6A55] hover:text-[#8B1E1E]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Story Grid */}
        {filteredStories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <div className="manuscript-card text-center py-12 my-6">
            <span className="text-4xl block mb-3">📜</span>
            <h3 className="text-xl font-bold text-[#8B1E1E] mb-2">கதைகள் எதுவும் கிடைக்கவில்லை</h3>
            <p className="text-sm text-[#7A6A55] mb-4">
              &quot;{searchQuery}&quot; என்ற சொல்லுக்குப் பொருத்தமான கதைகள் இல்லை.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="stamp-btn-outline !py-2 !px-4 text-sm"
            >
              அனைத்து கதைகளையும் பார்க்க
            </button>
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/browse" className="stamp-btn-outline">
            <span>அனைத்து கதைகளையும் உலாவுங்கள்</span>
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4 — DISTRICTS
          ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full">
        <OrnamentDivider symbols="✦ ❋ மாவட்டங்கள் ❋ ✦" />

        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {DISTRICTS.map((d) => (
            <Link
              key={d.slug}
              href={`/districts/${d.slug}`}
              className="px-5 py-2.5 rounded-full bg-[#FFFDF7] border border-[#D9C9A8] hover:border-[#8B1E1E] hover:bg-[#FDF1D0] font-semibold text-[#2B1810] text-sm transition-all shadow-sm"
            >
              📍 {d.name_ta}
            </Link>
          ))}
          <Link
            href="/districts"
            className="px-5 py-2.5 rounded-full border border-dashed border-[#8B1E1E] text-[#8B1E1E] font-semibold text-sm hover:bg-[#8B1E1E]/5 transition-all"
          >
            அனைத்து மாவட்டங்களும் →
          </Link>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5 — திட்ட நோக்கம் & நாம் தீர்க்கும் பிரச்சினைகள் (PROJECT VISION & PROBLEMS)
          ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full">
        <OrnamentDivider symbols="✦ ❋ திட்ட நோக்கம் ❋ ✦" />

        <div className="manuscript-card p-6 sm:p-10 border-2 border-[#D4A017]/70 shadow-md my-4 bg-gradient-to-b from-[#FFFDF7] to-[#FDF8EE]">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B1E1E]/10 text-[#8B1E1E] text-xs font-bold uppercase tracking-wider mb-2">
              📜 திட்ட நோக்கம் · Project Vision &amp; Problem
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#8B1E1E] mb-3">
              நாம் தீர்க்கும் 4 முக்கியப் பிரச்சினைகள்
            </h2>
            <p className="text-sm sm:text-base text-[#7A6A55] leading-relaxed">
              ஒவ்வொரு நாளும் நாம் நமது மூத்த தலைமுறையினரின் அறிவை இழக்கிறோம். பாட்டி சொன்ன கதை, தாத்தா காட்டிய வழி, ஊரின் வரலாறு — இவை <strong>எழுதப்படாதவை</strong>. ஒரு மூத்தவர் போனால், ஒரு முழு கிராமத்தின் நினைவும் போய்விடும்.
            </p>
          </div>

          {/* 4 Problem Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            <div className="p-5 rounded-xl bg-[#FFFDF7] border-l-4 border-l-[#8B1E1E] border border-[#D9C9A8]/80 shadow-2xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🔴</span>
                <h3 className="font-bold text-[#8B1E1E] text-base">பிரச்சினை 1 — மறையும் மொழி அறிவு</h3>
              </div>
              <p className="text-xs sm:text-sm text-[#2B1810] leading-relaxed">
                பாரம்பரிய விவசாய முறைகள், நாட்டுப்புற மருத்துவம், பண்டிகை முறைகள் — இவை பெரும்பாலும் எழுதப்படாதவை. மூத்தவர் போனால் அறிவு நிரந்தரமாக மறைகிறது.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#FFFDF7] border-l-4 border-l-[#D4A017] border border-[#D9C9A8]/80 shadow-2xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🔴</span>
                <h3 className="font-bold text-[#8B1E1E] text-base">பிரச்சினை 2 — இளைய தலைமுறை இணைப்பு இல்லை</h3>
              </div>
              <p className="text-xs sm:text-sm text-[#2B1810] leading-relaxed">
                நகர்ப்புறத்தில் வளரும் இளைய தலைமுறைக்கு தங்கள் குடும்ப வரலாறு, கிராம அடையாளம் தெரியாது. பெரும்பாலான குடும்பங்களில் இந்த தொடர்பு இழந்துவிட்டது.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#FFFDF7] border-l-4 border-l-[#8B1E1E] border border-[#D9C9A8]/80 shadow-2xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🔴</span>
                <h3 className="font-bold text-[#8B1E1E] text-base">பிரச்சினை 3 — டிஜிட்டல் பாதுகாப்பு இல்லை</h3>
              </div>
              <p className="text-xs sm:text-sm text-[#2B1810] leading-relaxed">
                யூடியூப், வாட்ஸ்அப் பதிவுகள் ஆடியோவின் உரை வழியே தேட முடியாதவை, வகைப்படுத்தப்படாதவை மற்றும் நிரந்தரமாக பாதுகாக்கப்படுவதில்லை.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#FFFDF7] border-l-4 border-l-[#D4A017] border border-[#D9C9A8]/80 shadow-2xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🔴</span>
                <h3 className="font-bold text-[#8B1E1E] text-base">பிரச்சினை 4 — வட்டார வழக்குகள் அழிகின்றன</h3>
              </div>
              <p className="text-xs sm:text-sm text-[#2B1810] leading-relaxed">
                கொங்கு, மதுரை, நெல்லை என ஒவ்வொரு மாவட்டத்தின் தனித்துவமான பேச்சு வழக்குகளும் வட்டாரச் சொற்களும் முறையான ஆவணமின்றி மறைந்து வருகின்றன.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-[#D9C9A8]/70">
            <Link
              href="/mission"
              className="stamp-btn-primary !py-2.5 !px-6 text-sm sm:text-base shadow-sm"
            >
              <span>முழு திட்ட நோக்கம் &amp; AI தீர்வைக் காண்க</span>
              <span>→</span>
            </Link>
            <Link
              href="/record"
              className="stamp-btn-outline !py-2.5 !px-6 text-sm sm:text-base"
            >
              <span>🎙 புதிய கதை பதிவு செய்ய</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
