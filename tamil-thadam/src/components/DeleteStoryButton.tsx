// src/components/DeleteStoryButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteStoryButton({
  storyId,
  storyTitle,
}: {
  storyId: string;
  storyTitle: string;
}) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/stories/${storyId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        // Also remove from any localStorage cache if present
        if (typeof window !== "undefined") {
          try {
            const cached = JSON.parse(localStorage.getItem("tamil_thadam_user_stories") || "[]");
            const updated = cached.filter((s: any) => s.id !== storyId);
            localStorage.setItem("tamil_thadam_user_stories", JSON.stringify(updated));
          } catch {}
        }
        router.push("/browse");
        router.refresh();
      } else {
        alert("பிழை: " + (data.error || "கதையை நீக்க முடியவில்லை"));
        setIsDeleting(false);
        setIsConfirming(false);
      }
    } catch (err: any) {
      alert("கதையை நீக்குவதில் சிக்கல் ஏற்பட்டது: " + err.message);
      setIsDeleting(false);
      setIsConfirming(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-300 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-semibold transition-colors"
        title="இப்பதிவை நிரந்தரமாக நீக்கு"
      >
        <span>🗑</span>
        <span>பதிவை நீக்கு</span>
      </button>

      {/* Confirmation Modal */}
      {isConfirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#FFFDF7] border-2 border-[#8B1E1E] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4 text-[#8B1E1E]">
              <span className="text-3xl">⚠️</span>
              <h3 className="text-xl font-bold">கதையை நீக்க உறுதிப்படுத்துங்கள்</h3>
            </div>

            <p className="text-sm text-[#2B1810] leading-relaxed mb-6">
              &ldquo;<strong>{storyTitle}</strong>&rdquo; என்ற வாய்மொழிப் பதிவையும் அதன் ஆடியோ கோப்பையும் காப்பகத்திலிருந்து நிரந்தரமாக நீக்க விரும்புகிறீர்களா?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D9C9A8]">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsConfirming(false)}
                className="stamp-btn-outline !py-2 !px-4 text-xs"
              >
                ரத்து செய்
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-50"
              >
                {isDeleting ? "நீக்கப்படுகிறது..." : "ஆம், நிரந்தரமாக நீக்கு"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
