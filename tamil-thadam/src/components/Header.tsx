// src/components/Header.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import KolamStrip from "./KolamStrip";
import { stopAllAudio } from "@/lib/audio-manager";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#FDF8EE]/95 backdrop-blur-md border-b border-[#D9C9A8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" onClick={stopAllAudio} className="flex flex-col group">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#8B1E1E] group-hover:text-[#6B1414] transition-colors">
            தமிழ்த் தடம்
          </span>
          <span className="text-xs sm:text-sm font-medium text-[#7A6A55] tracking-wide">
            வாய்மொழி வரலாற்றுக் காப்பகம்
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 font-semibold text-[#2B1810]">
          <Link
            href="/"
            onClick={stopAllAudio}
            className="hover:text-[#8B1E1E] transition-colors py-2 relative hover:after:w-full after:w-0 after:h-[2px] after:bg-[#D4A017] after:absolute after:bottom-0 after:left-0 after:transition-all"
          >
            முகப்பு
          </Link>
          <Link
            href="/browse"
            className="hover:text-[#8B1E1E] transition-colors py-2 relative hover:after:w-full after:w-0 after:h-[2px] after:bg-[#D4A017] after:absolute after:bottom-0 after:left-0 after:transition-all"
          >
            உலாவு
          </Link>
          <Link
            href="/districts"
            className="hover:text-[#8B1E1E] transition-colors py-2 relative hover:after:w-full after:w-0 after:h-[2px] after:bg-[#D4A017] after:absolute after:bottom-0 after:left-0 after:transition-all"
          >
            மாவட்டங்கள்
          </Link>
          <Link
            href="/about"
            className="hover:text-[#8B1E1E] transition-colors py-2 relative hover:after:w-full after:w-0 after:h-[2px] after:bg-[#D4A017] after:absolute after:bottom-0 after:left-0 after:transition-all"
          >
            எங்களைப் பற்றி
          </Link>

          <Link href="/record" className="stamp-btn-primary ml-2">
            <span>🎙</span>
            <span>பதிவு செய்</span>
          </Link>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "மெனுவை மூடு" : "மெனுவைத் திற"}
          className="md:hidden flex items-center justify-center w-11 h-11 rounded-lg border border-[#D9C9A8] text-[#8B1E1E] bg-[#FFFDF7]"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Kolam Strip under header */}
      <KolamStrip />

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFFDF7] border-b border-[#D9C9A8] px-6 py-6 shadow-xl animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-4 font-semibold text-lg text-[#2B1810]">
            <Link
              href="/"
              onClick={() => {
                stopAllAudio();
                setMobileMenuOpen(false);
              }}
              className="py-2 border-b border-[#F7EDD8] hover:text-[#8B1E1E]"
            >
              முகப்பு
            </Link>
            <Link
              href="/browse"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#F7EDD8] hover:text-[#8B1E1E]"
            >
              உலாவு
            </Link>
            <Link
              href="/districts"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#F7EDD8] hover:text-[#8B1E1E]"
            >
              மாவட்டங்கள்
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#F7EDD8] hover:text-[#8B1E1E]"
            >
              எங்களைப் பற்றி
            </Link>

            <Link
              href="/record"
              onClick={() => setMobileMenuOpen(false)}
              className="stamp-btn-primary w-full text-center mt-2 justify-center"
            >
              <span>🎙</span>
              <span>பதிவு செய்</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
