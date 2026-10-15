// src/components/Footer.tsx
"use client";

import Link from "next/link";
import { stopAllAudio } from "@/lib/audio-manager";
import Icon from "./Icon";

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#F7EDD8] border-t border-[#D9C9A8] text-[#2B1810]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid gap-8 border-b border-[#D9C9A8] pb-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div className="max-w-xl">
            <h2 className="text-xl font-bold text-[#8B1E1E] mb-2">தமிழ்த் தடம்</h2>
            <p className="text-sm sm:text-base text-[#7A6A55] leading-relaxed">
              நம் முன்னோர்களின் வாழ்வியல் அனுபவங்களையும் பண்பாட்டுக் கூறுகளையும் அவர்களின் சொந்தக் குரலிலேயே அடுத்த தலைமுறைக்குக் கொண்டு சேர்க்கும் வாய்மொழி வரலாற்று ஆவணக் காப்பகம்.
            </p>
          </div>
          <nav
            aria-label="அடிக்குறிப்பு வழிசெலுத்தல்"
            className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[#8B1E1E]"
          >
            <Link
              href="/mission"
              onClick={stopAllAudio}
              className="inline-flex items-center gap-2 hover:text-[#6B1414] hover:underline"
            >
              <Icon name="target" className="h-4 w-4" />
              திட்ட நோக்கம்
            </Link>
            <Link
              href="/about"
              onClick={stopAllAudio}
              className="inline-flex items-center gap-2 hover:text-[#6B1414] hover:underline"
            >
              <Icon name="info" className="h-4 w-4" />
              எங்களைப் பற்றி
            </Link>
            <Link
              href="/browse"
              onClick={stopAllAudio}
              className="hover:text-[#6B1414] hover:underline"
            >
              களக் கதைகள்
            </Link>
            <Link
              href="/record"
              onClick={stopAllAudio}
              className="hover:text-[#6B1414] hover:underline"
            >
              புதிய பதிவு
            </Link>
            <Link
              href="/districts"
              onClick={stopAllAudio}
              className="hover:text-[#6B1414] hover:underline"
            >
              மாவட்டங்கள்
            </Link>
          </nav>
        </div>
        <p className="pt-5 text-xs sm:text-sm text-[#7A6A55]">
          © தமிழ்த் தடம் · 2026 · தமிழ் வாய்மொழி வரலாற்றை பாதுகாப்போம்.
        </p>
      </div>
    </footer>
  );
}
