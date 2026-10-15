// src/components/StoryCard.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Story, VerificationStatus } from "@/data/mock-stories";
import UploadAudioButton from "@/components/UploadAudioButton";

function StatusBadge({ status }: { status: VerificationStatus }) {
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DCF3E4] text-[#2D6A4F] border border-[#B8E4C4]">
        <span>✅</span>
        <span>சரிபார்க்கப்பட்டது</span>
      </span>
    );
  }
  if (status === "in_review") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FDF1D0] text-[#8A6300] border border-[#F5D98B]">
        <span>🕓</span>
        <span>சரிபார்ப்பில் உள்ளது</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EEE9DD] text-[#6B5B45] border border-[#D9C9A8]">
      <span>⚪</span>
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
            // Ensure any other playing audio stops
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
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F7EDD8] text-[#8B1E1E] hover:bg-[#F5D98B] transition-colors"
          >
            <span>📍</span>
            <span>{story.district_name_ta}</span>
          </Link>

          <Link
            href={`/browse?pulam=${story.pulam_slug}`}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FDF8EE] text-[#7A6A55] border border-[#D9C9A8] hover:border-[#D4A017] transition-colors"
          >
            <span>{story.pulam_emoji}</span>
            <span>{story.pulam_name_ta}</span>
          </Link>

          {/* Inline Audio Play / Pause Button with Concurrency Control */}
          {hasAudio ? (
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? `${story.title} ஆடியோவை நிறுத்து` : `${story.title} ஆடியோவைக் கேள்`}
              className={`ml-auto inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                isPlaying
                  ? "bg-[#8B1E1E] text-white ring-2 ring-[#D4A017] animate-pulse"
                  : "bg-[#FDF1D0] text-[#8B1E1E] border border-[#F5D98B] hover:bg-[#8B1E1E] hover:text-white"
              }`}
            >
              <span>{isPlaying ? "⏸" : "▶"}</span>
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
          <span>👤</span>
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
