// src/components/StoryCard.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Story, VerificationStatus } from "@/data/mock-stories";
import UploadAudioButton from "@/components/UploadAudioButton";
import PulamIcon from "@/components/PulamIcon";

function StatusBadge({ status }: { status: VerificationStatus }) {
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DCF3E4] text-[#2D6A4F] border border-[#B8E4C4]">
        <svg
          className="w-3.5 h-3.5 text-[#2D6A4F]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>சரிபார்க்கப்பட்டது</span>
      </span>
    );
  }
  if (status === "in_review") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FDF1D0] text-[#8A6300] border border-[#F5D98B]">
        <svg
          className="w-3.5 h-3.5 text-[#8A6300]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>சரிபார்ப்பில் உள்ளது</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EEE9DD] text-[#6B5B45] border border-[#D9C9A8]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#8C7A6B]" />
      <span>சரிபார்க்கப்படவில்லை</span>
    </span>
  );
}

export default function StoryCard({ story }: { story: Story }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Global play listener: If another audio starts playing anywhere on the page, stop this one!
  useEffect(() => {
    const handleGlobalPlay = (e: Event) => {
      if (e.target !== audioRef.current && audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };

    const handleStopAll = () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch {}
      }
      setIsPlaying(false);
    };

    window.addEventListener("play", handleGlobalPlay, true);
    window.addEventListener("tamil-thadam:stop-all-audio", handleStopAll);

    return () => {
      window.removeEventListener("play", handleGlobalPlay, true);
      window.removeEventListener("tamil-thadam:stop-all-audio", handleStopAll);
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch {}
      }
    };
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Pause all other audio elements currently playing anywhere in the DOM
      if (typeof document !== "undefined") {
        document.querySelectorAll("audio").forEach((el) => {
          if (el !== audioRef.current && !el.paused) {
            try {
              el.pause();
            } catch {}
          }
        });
      }
      audioRef.current.play().catch((err) => console.log("Audio play error:", err));
      setIsPlaying(true);
    }
  };

  const hasAudio = !!(story.audio_url && story.audio_url.trim() !== "");

  return (
    <article className="manuscript-card flex flex-col justify-between group">
      {hasAudio && (
        <audio
          ref={audioRef}
          src={story.audio_url}
          preload="none"
          onPlay={() => {
            setIsPlaying(true);
            if (typeof document !== "undefined") {
              document.querySelectorAll("audio").forEach((el) => {
                if (el !== audioRef.current && !el.paused) {
                  try {
                    el.pause();
                  } catch {}
                }
              });
            }
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      <div>
        {/* Chips row */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Link
            href={`/districts/${story.district_slug}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F7EDD8] text-[#8B1E1E] hover:bg-[#F5D98B] transition-colors"
          >
            <svg
              className="w-3 h-3 text-[#8B1E1E]"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <span>{story.district_name_ta}</span>
          </Link>

          <Link
            href={`/browse?pulam=${story.pulam_slug}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FDF8EE] text-[#7A6A55] border border-[#D9C9A8] hover:border-[#D4A017] transition-colors"
          >
            <PulamIcon slug={story.pulam_slug} className="w-3.5 h-3.5 text-[#7A6A55]" />
            <span>{story.pulam_name_ta}</span>
          </Link>

          {/* Inline Audio Play / Pause Button */}
          {hasAudio ? (
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? `${story.title} ஆடியோவை நிறுத்து` : `${story.title} ஆடியோவைக் கேள்`}
              className={`ml-auto inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                isPlaying
                  ? "bg-[#8B1E1E] text-white ring-2 ring-[#D4A017] animate-pulse"
                  : "bg-[#FDF1D0] text-[#8B1E1E] border border-[#F5D98B] hover:bg-[#8B1E1E] hover:text-white"
              }`}
            >
              {isPlaying ? (
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
              <span>{isPlaying ? "நிறுத்து" : "கேள்"}</span>
              <span className="font-mono text-[11px] opacity-80">
                {story.duration_seconds}வி
              </span>
            </button>
          ) : (
            <span className="ml-auto text-xs text-[#7A6A55] font-mono">
              {story.duration_seconds}வி
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-[#8B1E1E] group-hover:text-[#6B1414] transition-colors mb-2 leading-snug">
          <Link href={`/story/${story.id}`} className="hover:underline">
            {story.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <blockquote className="border-l-3 border-[#D4A017] pl-3 py-1 my-3 text-sm italic text-[#2B1810]/85 line-clamp-2">
          &ldquo;{story.summary_ta}&rdquo;
        </blockquote>
      </div>

      {/* Footer info */}
      <div className="pt-3 mt-4 border-t border-[#D9C9A8]/60 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#7A6A55]">
          <svg
            className="w-3.5 h-3.5 text-[#7A6A55]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>
            {story.informant_name} {story.informant_age ? `(${story.informant_age})` : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <UploadAudioButton
            storyId={story.id}
            currentAudioUrl={story.audio_url}
            compact
          />
          <StatusBadge status={story.verification_status} />
        </div>
      </div>
    </article>
  );
}
