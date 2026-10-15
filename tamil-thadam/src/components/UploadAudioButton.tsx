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

      setStatusMessage("✅ ஒலிப்பதிவு வெற்றிகரமாக மாற்றப்பட்டது! புதுப்பிக்கப்படுகிறது...");

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
            <span className="animate-spin text-sm">⏳</span>
            <span>பதிவேற்றப்படுகிறது...</span>
          </>
        ) : (
          <>
            <span>🎙️</span>
            <span>{label || defaultLabel}</span>
          </>
        )}
      </button>

      {statusMessage && (
        <span className="text-xs font-medium text-[#2D6A4F] mt-1.5 animate-pulse">
          {statusMessage}
        </span>
      )}

      {errorMessage && (
        <span className="text-xs font-medium text-[#8B1E1E] mt-1.5">
          ⚠️ {errorMessage}
        </span>
      )}
    </div>
  );
}
