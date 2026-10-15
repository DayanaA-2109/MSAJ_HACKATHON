// src/components/StoryPlayer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { TranscriptSegment } from "@/data/mock-stories";
import UploadAudioButton from "@/components/UploadAudioButton";

interface StoryPlayerProps {
  storyId?: string;
  audioUrl: string;
  durationSeconds: number;
  segments: TranscriptSegment[];
}

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export default function StoryPlayer({
  storyId,
  audioUrl,
  durationSeconds,
  segments,
}: StoryPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const segmentRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds || 0);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(-1);

  // If audioUrl prop changes, reset duration and playing state
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(durationSeconds || 0);
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [audioUrl, durationSeconds]);

  // Ensure only ONE audio plays across the entire page, handle global stop, and clean up on unmount
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
      setCurrentTime(0);
    };

    window.addEventListener("play", handleGlobalPlay, true);
    window.addEventListener("tamil-thadam:stop-all-audio", handleStopAll);

    return () => {
      window.removeEventListener("play", handleGlobalPlay, true);
      window.removeEventListener("tamil-thadam:stop-all-audio", handleStopAll);
      // Immediately stop audio when component unmounts (e.g. route navigation)
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch {}
      }
    };
  }, []);

  // Helper to pause all other audio elements in DOM
  const pauseOtherAudios = () => {
    if (typeof document !== "undefined") {
      document.querySelectorAll("audio").forEach((el) => {
        if (el !== audioRef.current && !el.paused) {
          try {
            el.pause();
          } catch {}
        }
      });
    }
  };

  // Play / Pause toggle
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      pauseOtherAudios();
      audioRef.current.play().catch((err) => console.log("Audio play error:", err));
    }
  };

  // Seek to specific timestamp
  const seekTo = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
    if (!isPlaying) {
      pauseOtherAudios();
      audioRef.current.play().catch((err) => console.log("Audio play error:", err));
    }
  };

  // Progress bar scrub/click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = percentage * duration;
    seekTo(targetTime);
  };

  // Update current time & active segment
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const curr = audioRef.current.currentTime;
    setCurrentTime(curr);

    // Find which segment matches current time
    const idx = segments.findIndex(
      (seg) => curr >= seg.start && curr < (seg.end || seg.start + 10)
    );
    if (idx !== -1 && idx !== activeSegmentIndex) {
      setActiveSegmentIndex(idx);
      // Auto-scroll active segment gently into view
      const elem = segmentRefs.current[idx];
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.code === "Space") {
      e.preventDefault();
      togglePlay();
    } else if (e.code === "ArrowLeft") {
      e.preventDefault();
      seekTo(Math.max(0, currentTime - 5));
    } else if (e.code === "ArrowRight") {
      e.preventDefault();
      seekTo(Math.min(duration, currentTime + 5));
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const hasAudio = !!(audioUrl && audioUrl.trim() !== "");

  // If no audio is assigned, show informative state with Upload button
  if (!hasAudio) {
    return (
      <div className="bg-[#FFFDF7] border-2 border-dashed border-[#D9C9A8] rounded-2xl p-8 text-center shadow-xs">
        <span className="text-4xl block mb-3">🎙️</span>
        <h4 className="text-lg font-bold text-[#8B1E1E] mb-2">
          ஒலிப்பதிவு இன்னும் பதிவேற்றப்படவில்லை
        </h4>
        <p className="text-sm text-[#7A6A55] max-w-md mx-auto mb-6">
          இக்கதைக்கான சொந்த ஒலிப்பதிவை Supabase Storage-ல் பதிவேற்றி இணைக்கவும்.
        </p>

        {storyId && (
          <div className="flex justify-center">
            <UploadAudioButton
              storyId={storyId}
              currentAudioUrl=""
              label="இப்போதே ஒலிப்பதிவைப் பதிவேற்றுங்கள் (Upload Audio)"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="bg-[#FFFDF7] border border-[#D9C9A8] rounded-2xl p-6 sm:p-8 shadow-md"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="ஒலி இயக்கி விசைப்பலகை கட்டுப்பாடு (Space: இயக்கு/நிறுத்து, அம்புக்குறிகள்: முன்னே பின்னே)"
    >
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onPlay={() => {
          setIsPlaying(true);
          pauseOtherAudios();
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (audioRef.current && audioRef.current.duration) {
            setDuration(audioRef.current.duration);
          }
        }}
      />

      {/* Top Header with Upload / Replace Audio Option */}
      {storyId && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-[#D9C9A8]/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#7A6A55]">
            <span className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-pulse"></span>
            <span>சொந்த ஒலிப்பதிவு இணைக்கப்பட்டுள்ளது</span>
          </div>

          <UploadAudioButton
            storyId={storyId}
            currentAudioUrl={audioUrl}
            label="ஒலிப்பதிவை மாற்று (Replace Audio)"
            compact
          />
        </div>
      )}

      {/* Primary Player Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 pb-6 border-b border-[#D9C9A8]/70">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "ஒலிப்பதிவை நிறுத்து" : "ஒலிப்பதிவை இயக்கு"}
          className="stamp-btn-primary !px-7 !py-3.5 !text-lg !rounded-full shadow-lg"
        >
          <span className="text-xl">{isPlaying ? "⏸" : "▶"}</span>
          <span>{isPlaying ? "நிறுத்து" : "இயக்கு"}</span>
        </button>

        {/* Progress Bar & Time */}
        <div className="w-full flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm font-semibold text-[#7A6A55] font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div
            onClick={handleProgressClick}
            className="w-full h-3.5 bg-[#F7EDD8] rounded-full overflow-hidden cursor-pointer relative border border-[#D9C9A8]"
            role="slider"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
            aria-label="ஒலி இயக்க முன்னேற்றப் பட்டை"
          >
            <div
              className="h-full bg-gradient-to-r from-[#8B1E1E] to-[#D4A017] transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[#7A6A55]">
            <span>விசைப்பலகை: Space = இயக்கு/நிறுத்து</span>
            <span>← 5வி பின்னே | 5வி முன்னே →</span>
          </div>
        </div>
      </div>

      {/* Click-to-Seek Synchronized Transcript Segments */}
      {segments && segments.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-bold text-[#8B1E1E]">
              ஒலிவடிவ எழுத்துரை (வரிகளைத் தொட்டு அந்த இடத்திலிருந்து கேட்கலாம்)
            </h4>
            <span className="text-xs text-[#7A6A55] hidden sm:inline">
              கிளிக்-டூ-சீக் ஒத்திசைவு
            </span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {segments.map((segment, index) => {
              const isActive = activeSegmentIndex === index;
              return (
                <button
                  key={index}
                  ref={(el) => {
                    segmentRefs.current[index] = el;
                  }}
                  type="button"
                  onClick={() => seekTo(segment.start)}
                  className={`w-full text-left p-3.5 rounded-xl transition-all flex items-start gap-3.5 border ${
                    isActive
                      ? "bg-[#FDF1D0] border-l-4 border-l-[#D4A017] border-[#F5D98B] shadow-sm font-semibold text-[#2B1810]"
                      : "bg-[#FFFDF7] border-[#D9C9A8]/50 hover:bg-[#FAF3E0] hover:border-[#D4A017] text-[#2B1810]"
                  }`}
                >
                  <span
                    className={`text-xs font-mono px-2 py-0.5 rounded shrink-0 mt-0.5 ${
                      isActive
                        ? "bg-[#8B1E1E] text-white font-bold"
                        : "bg-[#F7EDD8] text-[#7A6A55]"
                    }`}
                  >
                    {formatTime(segment.start)}
                  </span>
                  <span className="text-sm sm:text-base leading-relaxed">
                    {segment.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
