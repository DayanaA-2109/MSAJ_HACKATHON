// src/components/Footer.tsx
"use client";

import Link from "next/link";
import KolamStrip from "./KolamStrip";
import OrnamentDivider from "./OrnamentDivider";
import { stopAllAudio } from "@/lib/audio-manager";

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#F7EDD8] border-t border-[#D9C9A8] text-[#2B1810]">
      <KolamStrip />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-center">
        <OrnamentDivider symbols="✦ ❋ ✺ ❋ ✦" className="!my-4 opacity-75" />
        <h2 className="text-xl font-bold text-[#8B1E1E] mb-2">தமிழ்த் தடம்</h2>
        <p className="text-sm sm:text-base text-[#7A6A55] max-w-xl mx-auto mb-6">
          நம் முன்னோர்களின் வாழ்வியல் அனுபவங்களையும் பண்பாட்டுக் கூறுகளையும் அவர்களின் சொந்தக் குரலிலேயே அடுத்த தலைமுறைக்குக் கொண்டு சேர்க்கும் வாய்மொழி வரலாற்று ஆவணக் காப்பகம்.
        </p>
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-sm font-semibold text-[#8B1E1E] mb-6">
          <Link
            href="/mission"
            onClick={stopAllAudio}
            className="hover:text-[#6B1414] hover:underline px-2.5 py-1 rounded-md bg-[#FFFDF7] border border-[#D9C9A8]/80 shadow-2xs"
          >
            📜 திட்ட நோக்கம்
          </Link>
          <span className="text-[#D9C9A8]">·</span>
          <Link
            href="/about"
            onClick={stopAllAudio}
            className="hover:text-[#6B1414] hover:underline"
          >
            எங்களைப் பற்றி
          </Link>
          <span className="text-[#D9C9A8]">·</span>
          <Link
            href="/browse"
            onClick={stopAllAudio}
            className="hover:text-[#6B1414] hover:underline"
          >
            களக் கதைகள்
          </Link>
          <span className="text-[#D9C9A8]">·</span>
          <Link
            href="/record"
            onClick={stopAllAudio}
            className="hover:text-[#6B1414] hover:underline"
          >
            புதிய பதிவு
          </Link>
          <span className="text-[#D9C9A8]">·</span>
          <Link
            href="/districts"
            onClick={stopAllAudio}
            className="hover:text-[#6B1414] hover:underline"
          >
            மாவட்டங்கள்
          </Link>
        </div>
        <p className="text-xs sm:text-sm text-[#7A6A55]">
          © தமிழ்த் தடம் · 2026 · தமிழ் வாய்மொழி வரலாற்றை பாதுகாப்போம்.
        </p>
      </div>
    </footer>
  );
}
