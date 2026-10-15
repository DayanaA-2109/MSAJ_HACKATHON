// src/components/BackToHomeLink.tsx
"use client";

import Link from "next/link";
import { stopAllAudio } from "@/lib/audio-manager";

interface BackToHomeLinkProps {
  href?: string;
  className?: string;
  label?: string;
}

export default function BackToHomeLink({
  href = "/",
  className = "inline-flex items-center gap-1.5 text-sm font-semibold text-[#8B1E1E] hover:text-[#6B1414] transition-colors cursor-pointer",
  label = "முகப்புக்குத் திரும்பு",
}: BackToHomeLinkProps) {
  const handleClick = () => {
    // Stop all audio playing immediately upon clicking "முகப்புக்குத் திரும்பு"
    stopAllAudio();
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={className}
      aria-label={label}
    >
      <span>←</span>
      <span>{label}</span>
    </Link>
  );
}
