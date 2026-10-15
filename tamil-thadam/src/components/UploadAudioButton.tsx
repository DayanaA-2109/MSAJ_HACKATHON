// src/components/UploadAudioButton.tsx
"use client";

import { useState, useRef } from "react";

interface UploadAudioButtonProps {
  storyId: string;
  currentAudioUrl?: string;
  className?: string;
  label?: string;
  compact?: boolean;
}

export default function UploadAudioButton({
  storyId,
  currentAudioUrl,
  className = "",
  label,
  compact = false,
}: UploadAudioButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatusMessage("Supabase Storage-க்கு பதிவேற்றப்படுகிறது...");
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("audio", file);

      const res = await fetch(`/api/stories/${encodeURIComponent(storyId)}/audio`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "ஒலிப்பதிவு பதிவேற்றம் தோல்வியடைந்தது");
      }

      setStatusMessage("ஒலிப்பதிவு வெற்றிகரமாக மாற்றப்பட்டது! புதுப்பிக்கப்படுகிறது...");

      // Short delay for user to read success message before refreshing the page
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (err: any) {
      console.error("Audio upload error:", err);
      setErrorMessage(err.message || "ஒலிப்பதிவு பதிவேற்றம் தோல்வியடைந்தது");
      setIsUploading(false);
      setStatusMessage(null);
    }
  };

  const hasAudio = !!(currentAudioUrl && currentAudioUrl.trim() !== "");
  const defaultLabel = hasAudio ? "ஒலிப்பதிவை மாற்று" : "ஒலிப்பதிவு பதிவேற்று";

  return (
    <div className={`inline-flex flex-col items-start ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.mpeg,.wav,.webm,.m4a,.ogg"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      <button
        type="button"
        onClick={handleClick}
        disabled={isUploading}
        aria-label="Upload story audio"
        className={
          compact
            ? "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F7EDD8] text-[#8B1E1E] border border-[#D9C9A8] hover:bg-[#8B1E1E] hover:text-white transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            : "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[#FFFDF7] border border-[#8B1E1E]/40 text-[#8B1E1E] hover:bg-[#8B1E1E] hover:text-white transition-all disabled:opacity-50 cursor-pointer shadow-sm"
        }
      >
        {isUploading ? (
          <>
            <svg
              className="animate-spin w-3.5 h-3.5 text-current"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="2" x2="12" y2="6" />
              <line x1="12" y1="18" x2="12" y2="22" />
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
              <line x1="2" y1="12" x2="6" y2="12" />
              <line x1="18" y1="12" x2="22" y2="12" />
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
              <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
            </svg>
            <span>பதிவேற்றப்படுகிறது...</span>
          </>
        ) : (
          <>
            <svg
              className={compact ? "w-3 h-3 text-current" : "w-4 h-4 text-current"}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
            <span>{label || defaultLabel}</span>
          </>
        )}
      </button>

      {statusMessage && (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2D6A4F] mt-1.5 animate-pulse">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{statusMessage}</span>
        </span>
      )}

      {errorMessage && (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8B1E1E] mt-1.5">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{errorMessage}</span>
        </span>
      )}
    </div>
  );
}
