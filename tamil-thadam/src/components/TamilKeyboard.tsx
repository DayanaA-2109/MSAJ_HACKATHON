// src/components/TamilKeyboard.tsx
"use client";

import { useState, useEffect, useRef } from "react";

// உயிர் எழுத்துக்கள் (Vowels)
const UYIR_LETTERS = [
  "அ", "ஆ", "இ", "ஈ", "உ", "ஊ",
  "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ", "ஃ"
];

// மெய் / உயிர்மெய் அடிப்படை (Consonant bases)
const MEI_BASES = [
  "க", "ங", "ச", "ஞ", "ட", "ண",
  "த", "ந", "ப", "ம", "ய", "ர",
  "ல", "வ", "ழ", "ள", "ற", "ன"
];

// துணைக்குறிகள் (Vowel signs & Pulli)
const VOWEL_SIGNS = [
  { sign: "்", label: "் (புள்ளி)", example: "க்" },
  { sign: "ா", label: "ா (நெடில்)", example: "கா" },
  { sign: "ி", label: "ி (இ-கரம்)", example: "கி" },
  { sign: "ீ", label: "ீ (ஈ-காரம்)", example: "கீ" },
  { sign: "ு", label: "ு (உ-கரம்)", example: "கு" },
  { sign: "ூ", label: "ூ (ஊ-காரம்)", example: "கூ" },
  { sign: "ெ", label: "ெ (எ-கரம்)", example: "கெ" },
  { sign: "ே", label: "ே (ஏ-காரம்)", example: "கே" },
  { sign: "ை", label: "ை (ஐ-காரம்)", example: "கை" },
  { sign: "ொ", label: "ொ (ஒ-கரம்)", example: "கொ" },
  { sign: "ோ", label: "ோ (ஓ-காரம்)", example: "கோ" },
  { sign: "ௌ", label: "ௌ (ஔ-காரம்)", example: "கௌ" },
];

// கிரந்த எழுத்துக்கள் (Grantha Letters)
const GRANTHA_LETTERS = [
  "ஜ", "ஷ", "ஸ", "ஹ", "க்ஷ", "ஸ்ரீ"
];

// எண்கள்
const NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

// உயிர்மெய் வரிசைகள் உருவாக்குதல் (Full Syllables Helper for selected consonant)
const VOWEL_COMBINATIONS = [
  "", "ா", "ி", "ீ", "ு", "ூ", "ெ", "ே", "ை", "ொ", "ோ", "ௌ", "்"
];

export default function TamilKeyboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isCompact, setIsCompact] = useState(true);
  const [activeTab, setActiveTab] = useState<"standard" | "syllables" | "grantha">("standard");
  const [keyboardText, setKeyboardText] = useState("");
  const [selectedBase, setSelectedBase] = useState<string>("க");
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Position & Drag state
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Keep track of the last focused input/textarea across the entire page
  const lastActiveElementRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA") &&
        !target.closest(".tamil-keyboard-container")
      ) {
        lastActiveElementRef.current = target as HTMLInputElement | HTMLTextAreaElement;
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    return () => document.removeEventListener("focusin", handleFocusIn);
  }, []);

  // Handle Dragging Logic
  const handleDragStart = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      startX: rect.left,
      startY: rect.top,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current || !containerRef.current) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;

      const rect = containerRef.current.getBoundingClientRect();
      const maxX = Math.max(10, window.innerWidth - rect.width - 10);
      const maxY = Math.max(10, window.innerHeight - rect.height - 10);

      const nextX = Math.min(maxX, Math.max(10, dragStartRef.current.startX + dx));
      const nextY = Math.min(maxY, Math.max(10, dragStartRef.current.startY + dy));

      setPosition({ x: nextX, y: nextY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!dragStartRef.current || !containerRef.current || e.touches.length === 0) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.mouseX;
      const dy = touch.clientY - dragStartRef.current.mouseY;

      const rect = containerRef.current.getBoundingClientRect();
      const maxX = Math.max(10, window.innerWidth - rect.width - 10);
      const maxY = Math.max(10, window.innerHeight - rect.height - 10);

      const nextX = Math.min(maxX, Math.max(10, dragStartRef.current.startX + dx));
      const nextY = Math.min(maxY, Math.max(10, dragStartRef.current.startY + dy));

      setPosition({ x: nextX, y: nextY });
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleDragEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [isDragging]);

  // Insert character into active input or internal buffer
  const handleCharClick = (char: string) => {
    setKeyboardText((prev) => prev + char);

    const input = lastActiveElementRef.current;
    if (input && document.body.contains(input)) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const currentVal = input.value;
      const newVal = currentVal.substring(0, start) + char + currentVal.substring(end);

      const proto = window.HTMLInputElement.prototype;
      const nativeSetter = Object.getOwnPropertyDescriptor(
        input.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : proto,
        "value"
      )?.set;

      if (nativeSetter) {
        nativeSetter.call(input, newVal);
      } else {
        input.value = newVal;
      }

      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.setSelectionRange(start + char.length, start + char.length);
      input.focus();
    }
  };

  // Backspace
  const handleBackspace = () => {
    setKeyboardText((prev) => prev.slice(0, -1));

    const input = lastActiveElementRef.current;
    if (input && document.body.contains(input)) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const currentVal = input.value;
      if (start > 0 || start !== end) {
        const actualStart = start === end ? start - 1 : start;
        const newVal = currentVal.substring(0, actualStart) + currentVal.substring(end);

        const proto = window.HTMLInputElement.prototype;
        const nativeSetter = Object.getOwnPropertyDescriptor(
          input.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : proto,
          "value"
        )?.set;

        if (nativeSetter) {
          nativeSetter.call(input, newVal);
        } else {
          input.value = newVal;
        }

        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.setSelectionRange(actualStart, actualStart);
        input.focus();
      }
    }
  };

  const handleSpace = () => handleCharClick(" ");
  const handleClear = () => setKeyboardText("");

  const handleCopy = () => {
    if (keyboardText) {
      navigator.clipboard.writeText(keyboardText);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2000);
    }
  };

  const resetPosition = () => setPosition(null);

  return (
    <>
      {/* Floating Keyboard Trigger Button */}
      <aside aria-label="தமிழ் விசைப்பலகை பகுதி" className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (isMinimized) setIsMinimized(false);
          }}
          aria-expanded={isOpen}
          aria-label={isOpen ? "தமிழ் விசைப்பலகையை மூடு" : "தமிழ் விசைப்பலகையைத் திறக்க"}
          className="stamp-btn-primary !px-4 !py-3 !rounded-full shadow-2xl flex items-center gap-2 border-2 border-[#D4A017] hover:scale-105 transition-all text-xs sm:text-sm font-bold"
        >
          <span className="text-lg">⌨️</span>
          <span>{isOpen ? "விசைப்பலகை" : "தமிழ் தட்டச்சு"}</span>
        </button>
      </aside>

      {/* MINIMIZED FLOATING PILL */}
      {isOpen && isMinimized && (
        <div
          ref={containerRef}
          style={{
            left: position ? `${position.x}px` : undefined,
            top: position ? `${position.y}px` : undefined,
          }}
          className={`tamil-keyboard-container fixed z-50 ${
            !position ? "bottom-20 right-4 sm:right-6" : ""
          } bg-[#FFFDF7]/95 backdrop-blur-md border-2 border-[#D9C9A8] rounded-2xl shadow-2xl p-2.5 flex items-center gap-2.5 select-none animate-in zoom-in-95 duration-150`}
        >
          {/* Drag Handle */}
          <div
            onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
            onTouchStart={(e) => e.touches[0] && handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
            className="cursor-grab active:cursor-grabbing text-sm text-[#7A6A55] hover:text-[#8B1E1E] px-1 flex items-center"
            title="நகர்த்த இழுக்கவும் (Drag to move)"
          >
            ⋮⋮
          </div>

          <span className="text-base">⌨️</span>
          <span className="text-xs font-bold text-[#8B1E1E]">தமிழ் விசை</span>

          {keyboardText && (
            <span className="text-xs text-[#2B1810] font-medium max-w-[110px] sm:max-w-[160px] truncate bg-[#FDF8EE] px-2 py-0.5 rounded border border-[#D9C9A8]">
              {keyboardText}
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="px-2.5 py-1 text-xs font-bold bg-[#FDF1D0] border border-[#F5D98B] text-[#8B1E1E] rounded-lg hover:bg-[#8B1E1E] hover:text-white transition-all shadow-xs"
            title="பெரிதாக்கு (Expand)"
          >
            ⤢ விரி
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="மூடு"
            className="w-6 h-6 rounded-full border border-[#D9C9A8] bg-[#FDF8EE] text-[#7A6A55] hover:text-[#8B1E1E] flex items-center justify-center font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* FULL RESPONSIVE DRAGGABLE KEYBOARD */}
      {isOpen && !isMinimized && (
        <section
          ref={containerRef}
          aria-label="தமிழ் மெய்நிகர் விசைப்பலகை"
          style={{
            left: position ? `${position.x}px` : undefined,
            top: position ? `${position.y}px` : undefined,
          }}
          className={`tamil-keyboard-container fixed z-50 ${
            !position ? "bottom-20 right-4 sm:right-6" : ""
          } ${
            isCompact
              ? "w-[calc(100vw-1.5rem)] sm:w-[440px]"
              : "w-[calc(100vw-1.5rem)] sm:w-[560px]"
          } max-w-[95vw] bg-[#FFFDF7] border-2 border-[#D9C9A8] rounded-2xl shadow-[0_20px_50px_rgba(43,24,16,0.35)] p-3 sm:p-4 flex flex-col gap-2.5 animate-in zoom-in-95 duration-150`}
        >
          {/* Header Bar with Drag Handle & Window Controls */}
          <div
            onMouseDown={(e) => {
              // Only start dragging if clicking header background or title
              const target = e.target as HTMLElement;
              if (!target.closest("button") && !target.closest("input")) {
                handleDragStart(e.clientX, e.clientY);
              }
            }}
            onTouchStart={(e) => {
              const target = e.target as HTMLElement;
              if (!target.closest("button") && !target.closest("input") && e.touches[0]) {
                handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            className="flex items-center justify-between pb-2 border-b border-[#D9C9A8] cursor-grab active:cursor-grabbing select-none"
            title="விசைப்பலகையை திரையில் எங்கும் நகர்த்த இழுக்கவும் (Drag anywhere)"
          >
            <div className="flex items-center gap-2">
              <span className="text-base text-[#7A6A55]">⋮⋮</span>
              <span className="text-lg">⌨️</span>
              <h3 className="text-xs sm:text-sm font-bold text-[#8B1E1E]">
                தமிழ் விசைப்பலகை
              </h3>
            </div>

            {/* Window Controls: Compact Toggle, Minimize, Reset, Close */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsCompact(!isCompact)}
                className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FDF8EE] border border-[#D9C9A8] text-[#7A6A55] hover:text-[#8B1E1E] transition-colors"
                title={isCompact ? "இயல்பு அளவு (Standard size)" : "சிறிய அளவு (Compact size)"}
              >
                {isCompact ? "சிறியது" : "இயல்பு"}
              </button>

              {position && (
                <button
                  type="button"
                  onClick={resetPosition}
                  className="w-7 h-7 rounded-lg border border-[#D9C9A8] bg-[#FDF8EE] text-[#7A6A55] hover:text-[#8B1E1E] flex items-center justify-center font-bold text-xs"
                  title="ஆரம்ப இடத்துக்கு மீட்டமை (Reset position)"
                >
                  ↺
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                aria-label="மறை / சுருக்கு (Minimize)"
                className="w-7 h-7 rounded-lg border border-[#D9C9A8] bg-[#FDF8EE] text-[#7A6A55] hover:text-[#8B1E1E] flex items-center justify-center font-bold text-xs"
                title="சுருக்கு (Minimize)"
              >
                ─
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="மூடு"
                className="w-7 h-7 rounded-lg border border-[#D9C9A8] bg-[#FDF8EE] text-[#7A6A55] hover:text-[#8B1E1E] flex items-center justify-center font-bold text-xs"
                title="மூடு (Close)"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Text Preview Box with Copy & Clear */}
          <div className="relative">
            <input
              type="text"
              readOnly
              value={keyboardText}
              placeholder="தட்டச்சு செய்க (உள்ளீட்டுப் பெட்டியிலும் தானாக சேரும்)..."
              className="w-full px-3 py-1.5 rounded-lg bg-[#FDF8EE] border border-[#D9C9A8] text-xs sm:text-sm text-[#2B1810] pr-16 font-medium placeholder:text-[#7A6A55]/70"
            />
            <div className="absolute right-1 top-1 flex items-center gap-1">
              {keyboardText && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-1.5 py-0.5 text-[10px] rounded bg-[#EEE9DD] text-[#7A6A55] hover:text-[#8B1E1E]"
                  title="துடை"
                >
                  துடை
                </button>
              )}
              <button
                type="button"
                onClick={handleCopy}
                disabled={!keyboardText}
                className="px-2 py-0.5 text-[10px] rounded bg-[#8B1E1E] text-white font-semibold disabled:opacity-40"
              >
                {copiedNotice ? "நகலானது!" : "நகலெடு"}
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-[#D9C9A8]/70 pb-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("standard")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                activeTab === "standard"
                  ? "bg-[#8B1E1E] text-white"
                  : "bg-[#FDF8EE] text-[#7A6A55] hover:bg-[#F7EDD8]"
              }`}
            >
              உயிர் & மெய்
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("syllables")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                activeTab === "syllables"
                  ? "bg-[#8B1E1E] text-white"
                  : "bg-[#FDF8EE] text-[#7A6A55] hover:bg-[#F7EDD8]"
              }`}
            >
              உயிர்மெய் வரிசை
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("grantha")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                activeTab === "grantha"
                  ? "bg-[#8B1E1E] text-white"
                  : "bg-[#FDF8EE] text-[#7A6A55] hover:bg-[#F7EDD8]"
              }`}
            >
              கிரந்தம் & எண்கள்
            </button>
          </div>

          {/* TAB 1: STANDARD KEYBOARD (Uyir, Mei Base, Vowel Signs) */}
          {activeTab === "standard" && (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {/* உயிர் எழுத்துக்கள் (Vowels) */}
              <div>
                <span className="block text-[10px] font-bold text-[#D4A017] mb-1">
                  உயிர் எழுத்துக்கள் (12 + 1)
                </span>
                <div className="grid grid-cols-7 sm:grid-cols-13 gap-1">
                  {UYIR_LETTERS.map((char) => (
                    <button
                      key={char}
                      type="button"
                      onClick={() => handleCharClick(char)}
                      className="h-7 sm:h-8 rounded-md bg-[#FDF8EE] border border-[#D9C9A8] hover:border-[#D4A017] hover:bg-[#FDF1D0] text-[#2B1810] font-bold text-xs flex items-center justify-center transition-all active:scale-95 shadow-xs"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>

              {/* மெய் / உயிர்மெய் அடிப்படை (Consonants) */}
              <div>
                <span className="block text-[10px] font-bold text-[#8B1E1E] mb-1">
                  மெய் எழுத்துக்கள் / அடிப்படை (18)
                </span>
                <div className="grid grid-cols-6 sm:grid-cols-9 gap-1">
                  {MEI_BASES.map((char) => (
                    <button
                      key={char}
                      type="button"
                      onClick={() => handleCharClick(char)}
                      className="h-7 sm:h-8 rounded-md bg-[#FFFDF7] border border-[#D9C9A8] hover:border-[#8B1E1E] hover:bg-[#F7EDD8] text-[#2B1810] font-bold text-xs flex items-center justify-center transition-all active:scale-95 shadow-xs"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>

              {/* துணைக்குறிகள் (Vowel Signs) */}
              <div>
                <span className="block text-[10px] font-bold text-[#2D6A4F] mb-1">
                  உயிர்மெய் குறியீடுகள் (எழுத்தை அழுத்தி பின் குறியை அழுத்தவும்)
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
                  {VOWEL_SIGNS.map(({ sign, example }) => (
                    <button
                      key={sign}
                      type="button"
                      onClick={() => handleCharClick(sign)}
                      className="h-7 sm:h-8 px-1.5 rounded-md bg-[#FDF1D0] border border-[#F5D98B] hover:border-[#D4A017] hover:bg-[#F5D98B] text-[#2B1810] font-bold text-xs flex items-center justify-between transition-all active:scale-95 shadow-xs"
                    >
                      <span className="text-sm text-[#8B1E1E]">{sign}</span>
                      <span className="text-[9px] text-[#7A6A55] font-normal">{example}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FAST SYLLABLES PICKER */}
          {activeTab === "syllables" && (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              <div>
                <span className="block text-[10px] font-semibold text-[#7A6A55] mb-1">
                  1. மெய் எழுத்தைத் தேர்ந்தெடுக்கவும்:
                </span>
                <div className="flex flex-wrap gap-1">
                  {MEI_BASES.map((base) => (
                    <button
                      key={base}
                      type="button"
                      onClick={() => setSelectedBase(base)}
                      className={`w-7 h-7 rounded-md text-xs font-bold border transition-all ${
                        selectedBase === base
                          ? "bg-[#8B1E1E] text-white border-[#6B1414] shadow-xs"
                          : "bg-[#FDF8EE] text-[#2B1810] border-[#D9C9A8] hover:bg-[#FDF1D0]"
                      }`}
                    >
                      {base}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-semibold text-[#8B1E1E] mb-1">
                  2. &lsquo;{selectedBase}&rsquo; வரிசையின் முழு எழுத்துக்கள்:
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
                  {VOWEL_COMBINATIONS.map((comb, i) => {
                    const fullChar = selectedBase + comb;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleCharClick(fullChar)}
                        className="h-8 rounded-md bg-[#FFFDF7] border border-[#D9C9A8] hover:border-[#D4A017] hover:bg-[#FDF1D0] font-bold text-sm text-[#2B1810] flex items-center justify-center transition-all active:scale-95 shadow-xs"
                      >
                        {fullChar}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GRANTHA & NUMBERS */}
          {activeTab === "grantha" && (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              <div>
                <span className="block text-[10px] font-bold text-[#8B1E1E] mb-1">
                  கிரந்த எழுத்துக்கள்
                </span>
                <div className="grid grid-cols-6 gap-1">
                  {GRANTHA_LETTERS.map((char) => (
                    <button
                      key={char}
                      type="button"
                      onClick={() => handleCharClick(char)}
                      className="h-8 rounded-md bg-[#FDF8EE] border border-[#D9C9A8] hover:border-[#8B1E1E] hover:bg-[#FDF1D0] font-bold text-xs text-[#2B1810] flex items-center justify-center transition-all active:scale-95 shadow-xs"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-[#7A6A55] mb-1">
                  எண்கள்
                </span>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
                  {NUMBERS.map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleCharClick(num)}
                      className="h-8 rounded-md bg-[#FFFDF7] border border-[#D9C9A8] hover:border-[#D4A017] font-mono font-bold text-xs text-[#2B1810] flex items-center justify-center transition-all active:scale-95 shadow-xs"
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Common Action Bar: Space & Backspace */}
          <div className="pt-1.5 border-t border-[#D9C9A8]/70 flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleSpace}
              className="flex-1 h-8 rounded-lg bg-[#FDF8EE] border border-[#D9C9A8] hover:bg-[#F7EDD8] font-bold text-xs text-[#2B1810] flex items-center justify-center gap-1.5 transition-all active:scale-98 shadow-xs"
            >
              <span>␣</span>
              <span>இடைவெளி (Space)</span>
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="px-4 h-8 rounded-lg bg-[#FDF1D0] border border-[#F5D98B] hover:bg-[#F5D98B] font-bold text-xs text-[#8B1E1E] flex items-center justify-center gap-1 transition-all active:scale-98 shadow-xs"
            >
              <span>⌫</span>
              <span>அழி</span>
            </button>
          </div>
        </section>
      )}
    </>
  );
}
