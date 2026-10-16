// src/components/Header.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { stopAllAudio } from "@/lib/audio-manager";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";

  return (
    <header className="sticky top-0 z-50 bg-[#FDF8EE]/95 backdrop-blur-md border-b border-[#D9C9A8]">
      <div className="w-full max-w-[90rem] mx-auto pl-3 pr-4 sm:pl-4 sm:pr-6 min-h-20 py-3 flex items-center justify-between gap-4 overflow-visible">
        {/* Brand */}
        <Link
          href="/"
          onClick={stopAllAudio}
          className="flex flex-col items-start justify-center gap-0.5 shrink-0 min-w-0 group"
        >
          <span className="brand-tamil text-2xl sm:text-3xl lg:text-[2.15rem] leading-normal text-[#8B1E1E] group-hover:text-[#6B1414] transition-colors whitespace-nowrap">
            தமிழ்த் தடம்
          </span>
          <span className="text-[11px] sm:text-xs lg:text-sm font-medium leading-snug text-[#7A6A55] whitespace-nowrap">
            வாய்மொழி வரலாற்றுக் காப்பகம்
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-3 lg:gap-5 font-semibold text-[#2B1810] whitespace-nowrap shrink min-w-0">
          {!isLoginPage && (
            <>
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
                href="/neirkaanal"
                className="hover:text-[#8B1E1E] transition-colors py-2 relative hover:after:w-full after:w-0 after:h-[2px] after:bg-[#D4A017] after:absolute after:bottom-0 after:left-0 after:transition-all"
              >
                நேர்காணல்
              </Link>
              <Link
                href="/districts"
                className="hover:text-[#8B1E1E] transition-colors py-2 relative hover:after:w-full after:w-0 after:h-[2px] after:bg-[#D4A017] after:absolute after:bottom-0 after:left-0 after:transition-all"
              >
                மாவட்டங்கள்
              </Link>
              <Link
                href="/map"
                className="hover:text-[#8B1E1E] transition-colors py-2 relative hover:after:w-full after:w-0 after:h-[2px] after:bg-[#D4A017] after:absolute after:bottom-0 after:left-0 after:transition-all"
              >
                காட்சி
              </Link>
              <Link
                href="/about"
                className="hover:text-[#8B1E1E] transition-colors py-2 relative hover:after:w-full after:w-0 after:h-[2px] after:bg-[#D4A017] after:absolute after:bottom-0 after:left-0 after:transition-all"
              >
                எங்களைப் பற்றி
              </Link>

              <Link href="/record" className="stamp-btn-primary ml-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 02-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span>பதிவு செய்</span>
              </Link>
            </>
          )}

          {/* User Auth Section (Desktop) */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 border-l border-[#D9C9A8] pl-3 ml-2">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F7EDD8] border border-[#D9C9A8] text-xs font-semibold text-[#2B1810]"
                title={`${user.name} (${user.email})`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="max-w-[120px] truncate">{user.name || user.email.split("@")[0]}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopAllAudio();
                  logout();
                }}
                title="கணக்கிலிருந்து வெளியேறு"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#8B1E1E]/40 text-[#8B1E1E] hover:bg-[#8B1E1E] hover:text-white transition-all text-xs font-bold cursor-pointer shadow-sm hover:shadow active:scale-95"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>வெளியேறு</span>
              </button>
            </div>
          ) : (
            !isLoginPage && (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D4A017] text-[#2B1810] bg-[#F5D98B]/30 hover:bg-[#F5D98B]/70 transition-all text-xs font-bold ml-2 cursor-pointer"
              >
                <span>உள்நுழைக</span>
              </Link>
            )
          )}
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFFDF7] border-b border-[#D9C9A8] px-6 py-6 shadow-xl animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-4 font-semibold text-lg text-[#2B1810]">
            {!isLoginPage && (
              <>
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
                  href="/neirkaanal"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 border-b border-[#F7EDD8] hover:text-[#8B1E1E]"
                >
                  நேர்காணல்
                </Link>
                <Link
                  href="/districts"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 border-b border-[#F7EDD8] hover:text-[#8B1E1E]"
                >
                  மாவட்டங்கள்
                </Link>
                <Link
                  href="/map"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 border-b border-[#F7EDD8] hover:text-[#8B1E1E]"
                >
                  காட்சி
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
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 02-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <span>பதிவு செய்</span>
                </Link>
              </>
            )}

            {/* Mobile Auth Actions */}
            {isAuthenticated && user ? (
              <div className="pt-4 mt-2 border-t border-[#D9C9A8] flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm text-[#7A6A55] bg-[#F7EDD8] p-3 rounded-lg border border-[#D9C9A8]">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <div className="flex flex-col">
                    <span className="font-bold text-[#2B1810]">{user.name}</span>
                    <span className="text-xs text-[#7A6A55]">{user.email}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    stopAllAudio();
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#8B1E1E] text-[#8B1E1E] hover:bg-[#8B1E1E] hover:text-white transition-all text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>வெளியேறு (Logout)</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-4 rounded-xl border border-[#D4A017] text-[#2B1810] bg-[#F5D98B] text-center font-bold text-sm mt-2"
              >
                உள்நுழைக (Sign In)
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
