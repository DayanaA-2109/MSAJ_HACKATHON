// src/app/browse/page.tsx
"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import StoryCard from "@/components/StoryCard";
import OrnamentDivider from "@/components/OrnamentDivider";
import { INITIAL_STORIES, DISTRICTS, PULAMS, Story } from "@/data/mock-stories";

function BrowseContent() {
  const searchParams = useSearchParams();
  const initialPulam = searchParams.get("pulam") || "all";
  const initialDistrict = searchParams.get("district") || "all";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);
  const [selectedPulam, setSelectedPulam] = useState(initialPulam);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);

  // Load fresh stories from API
  const fetchStories = () => {
    fetch("/api/stories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.stories)) {
          const map = new Map<string, Story>();
          for (const s of data.stories) {
            if (s && s.id && !map.has(s.id)) {
              map.set(s.id, s);
            }
          }
          setStories(Array.from(map.values()));
        }
      })
      .catch((err) => console.log("Failed to fetch stories:", err));
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // Filter logic
  const filteredStories = useMemo(() => {
    const list = stories.filter((story) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          story.title.toLowerCase().includes(q) ||
          story.summary_ta.toLowerCase().includes(q) ||
          story.informant_name.toLowerCase().includes(q) ||
          story.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // District filter
      if (selectedDistrict !== "all" && story.district_slug !== selectedDistrict) {
        return false;
      }

      // Pulam filter
      if (selectedPulam !== "all" && story.pulam_slug !== selectedPulam) {
        return false;
      }

      // Status filter
      if (selectedStatus !== "all" && story.verification_status !== selectedStatus) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });

    const uniqueMap = new Map<string, Story>();
    for (const item of list) {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    }
    return Array.from(uniqueMap.values());
  }, [stories, searchQuery, selectedDistrict, selectedPulam, selectedStatus, sortOrder]);

  // Active filter checks
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedDistrict !== "all" ||
    selectedPulam !== "all" ||
    selectedStatus !== "all";

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedDistrict("all");
    setSelectedPulam("all");
    setSelectedStatus("all");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Page Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#8B1E1E] mb-2">
          கதைகளை உலாவுங்கள்
        </h1>
        <p className="text-base text-[#7A6A55] max-w-xl mx-auto">
          தமிழ்நாட்டின் பல மாவட்டங்களிலிருந்து பதிவான மூத்தவர்களின் வாய்மொழி வரலாற்று ஆவணங்கள்.
        </p>
      </div>

      {/* Filter Bar (Sticky below header) */}
      <div className="bg-[#FFFDF7] border border-[#D9C9A8] rounded-2xl p-4 sm:p-5 shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-[#7A6A55] mb-1">
              தேடு
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 தலைப்பு, விளக்கம், குறிச்சொல்..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDF8EE] border border-[#D9C9A8] text-sm text-[#2B1810] focus:border-[#8B1E1E] focus:outline-none"
            />
          </div>

          {/* District Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-[#7A6A55] mb-1">
              மாவட்டம்
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#FDF8EE] border border-[#D9C9A8] text-sm text-[#2B1810] focus:border-[#8B1E1E] focus:outline-none"
            >
              <option value="all">எல்லா மாவட்டங்களும்</option>
              {DISTRICTS.map((d) => (
                <option key={d.slug} value={d.slug}>
                  📍 {d.name_ta}
                </option>
              ))}
            </select>
          </div>

          {/* Pulam Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-[#7A6A55] mb-1">
              புலம்
            </label>
            <select
              value={selectedPulam}
              onChange={(e) => setSelectedPulam(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#FDF8EE] border border-[#D9C9A8] text-sm text-[#2B1810] focus:border-[#8B1E1E] focus:outline-none"
            >
              <option value="all">எல்லா புலங்களும்</option>
              {PULAMS.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.emoji} {p.name_ta}
                </option>
              ))}
            </select>
          </div>

          {/* Verification Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-[#7A6A55] mb-1">
              சரிபார்ப்பு நிலை
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#FDF8EE] border border-[#D9C9A8] text-sm text-[#2B1810] focus:border-[#8B1E1E] focus:outline-none"
            >
              <option value="all">எல்லா நிலைகளும்</option>
              <option value="verified">✅ சரிபார்க்கப்பட்டது</option>
              <option value="in_review">🕓 சரிபார்ப்பில் உள்ளது</option>
              <option value="unverified">⚪ சரிபார்க்கப்படவில்லை</option>
            </select>
          </div>
        </div>

        {/* Sort & Filter Chips Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-[#D9C9A8]/50">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#7A6A55]">
              {filteredStories.length} கதைகள்
            </span>

            {/* Active Chips */}
            {selectedDistrict !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F7EDD8] text-[#8B1E1E] border border-[#D9C9A8]">
                <span>📍 {DISTRICTS.find((d) => d.slug === selectedDistrict)?.name_ta}</span>
                <button
                  type="button"
                  onClick={() => setSelectedDistrict("all")}
                  className="hover:font-bold"
                >
                  ✕
                </button>
              </span>
            )}

            {selectedPulam !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FDF1D0] text-[#2B1810] border border-[#F5D98B]">
                <span>
                  {PULAMS.find((p) => p.slug === selectedPulam)?.emoji}{" "}
                  {PULAMS.find((p) => p.slug === selectedPulam)?.name_ta}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPulam("all")}
                  className="hover:font-bold"
                >
                  ✕
                </button>
              </span>
            )}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-[#8B1E1E] hover:underline ml-2 font-medium"
              >
                அனைத்தையும் நீக்கு
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#7A6A55]">வரிசைப்படுத்து:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
              className="px-2.5 py-1.5 rounded-lg bg-[#FDF8EE] border border-[#D9C9A8] text-xs font-medium text-[#2B1810] focus:outline-none"
            >
              <option value="newest">புதியவை முதலில்</option>
              <option value="oldest">பழையவை முதலில்</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Grid / Empty State */}
      {filteredStories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="manuscript-card text-center py-16 my-8 max-w-xl mx-auto">
          <span className="text-5xl block mb-4">📜</span>
          <h3 className="text-2xl font-bold text-[#8B1E1E] mb-2">
            கதைகள் எதுவும் கிடைக்கவில்லை
          </h3>
          <p className="text-base text-[#7A6A55] mb-6">
            நீங்கள் தேர்ந்தெடுத்த வடிகட்டிகளுக்கு ஏற்ற கதைகள் இல்லை. வடிகட்டிகளை மாற்றி முயற்சிக்கவும்.
          </p>
          <button
            type="button"
            onClick={clearAllFilters}
            className="stamp-btn-primary"
          >
            அனைத்து வடிகட்டிகளையும் நீக்கு
          </button>
        </div>
      )}

      {/* Pagination Bar */}
      <div className="flex items-center justify-center gap-2 mt-12">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          className="px-4 py-2 rounded-xl border border-[#D9C9A8] bg-[#FFFDF7] text-sm font-semibold text-[#7A6A55] disabled:opacity-40"
        >
          முன்
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded-xl bg-[#8B1E1E] text-white text-sm font-bold shadow-sm"
        >
          1
        </button>
        <button
          type="button"
          disabled
          className="px-4 py-2 rounded-xl border border-[#D9C9A8] bg-[#FFFDF7] text-sm font-semibold text-[#7A6A55] disabled:opacity-40"
        >
          அடுத்து
        </button>
      </div>

      <OrnamentDivider className="mt-16" />
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="text-center py-20">ஏற்றப்படுகிறது...</div>}>
      <BrowseContent />
    </Suspense>
  );
}
