"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { geoCentroid, geoMercator, geoPath } from "d3-geo";
import { AnimatePresence, motion } from "framer-motion";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import {
  getDistrictCaption,
  MISSING_CAPTION_FALLBACK,
} from "@/data/districtCaptions";

type DistrictFeature = Feature<Geometry, { district?: string; name?: string }>;

type DistrictView = {
  id: string;
  name: string;
  path: string;
  centroid: [number, number];
  feature: DistrictFeature;
};

const GEOJSON_URL = "/data/tamil-nadu-districts.geojson";

const FILTER_CHIPS = [
  { id: "view", label: "காட்சி", sub: "Katchi" },
  { id: "districts", label: "மாவட்டங்கள்", sub: "Districts" },
  { id: "more", label: "மேலும்", sub: "More" },
];

function districtName(feature: DistrictFeature): string {
  return (
    feature.properties?.district ||
    feature.properties?.name ||
    "Unknown district"
  );
}

function pinPalette(name: string) {
  const palettes = [
    { from: "#8B1E1E", to: "#C45C26" },
    { from: "#2D6A4F", to: "#6B8F71" },
    { from: "#8A6300", to: "#D4A017" },
    { from: "#4A3F35", to: "#A68B5B" },
    { from: "#6B1414", to: "#B8572A" },
  ];
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h += name.charCodeAt(i);
  return palettes[h % palettes.length];
}

export default function TamilNaduMap() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const captionId = useId();

  const [geojson, setGeojson] = useState<FeatureCollection<
    Geometry,
    { district?: string; name?: string }
  > | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [popupBox, setPopupBox] = useState({ left: 12, top: 12, below: false });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(GEOJSON_URL)
      .then((res) => {
        if (!res.ok) throw new Error("GeoJSON missing");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setGeojson(data);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError("வரைபடத் தரவை ஏற்ற முடியவில்லை. பிறகு முயலவும்.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;

    const measure = () => {
      const rect = node.getBoundingClientRect();
      setSize({
        width: Math.max(320, rect.width),
        height: Math.max(420, rect.height),
      });
      setIsMobile(window.innerWidth < 768);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const districts = useMemo<DistrictView[]>(() => {
    if (!geojson || size.width === 0) return [];
    const projection = geoMercator().fitExtent(
      [
        [isMobile ? 16 : 48, isMobile ? 72 : 88],
        [size.width - (isMobile ? 16 : 48), size.height - (isMobile ? 28 : 40)],
      ],
      geojson
    );
    const pathGen = geoPath(projection);
    return geojson.features.map((feature, index) => {
      const name = districtName(feature as DistrictFeature);
      const centroid = projection(geoCentroid(feature)) ?? [0, 0];
      return {
        id: `${name}-${index}`,
        name,
        path: pathGen(feature) ?? "",
        centroid: [centroid[0], centroid[1]] as [number, number],
        feature: feature as DistrictFeature,
      };
    });
  }, [geojson, size.width, size.height, isMobile]);

  const selectedDistrict = districts.find((d) => d.name === selected) ?? null;
  const selectedCaption = selectedDistrict
    ? getDistrictCaption(selectedDistrict.name)
    : MISSING_CAPTION_FALLBACK;
  const captionMissing =
    selectedDistrict != null &&
    getDistrictCaption(selectedDistrict.name) === MISSING_CAPTION_FALLBACK;

  const closePopup = useCallback(() => setSelected(null), []);

  useEffect(() => {
    if (!selected) return;

    const onPointer = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (popupRef.current?.contains(target)) return;
      if (target instanceof Element && target.closest("[data-map-pin]")) return;
      closePopup();
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePopup();
    };

    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [selected, closePopup]);

  useEffect(() => {
    if (selected) closeBtnRef.current?.focus();
  }, [selected]);

  const positionPopup = useCallback(() => {
    if (!selectedDistrict || !wrapRef.current) return;
    const wrap = wrapRef.current.getBoundingClientRect();
    const card = popupRef.current;
    const cardW = card?.offsetWidth ?? (isMobile ? Math.min(wrap.width - 24, 360) : 340);
    const cardH = card?.offsetHeight ?? 220;
    const pad = 10;
    const [pinX, pinY] = selectedDistrict.centroid;

    if (isMobile) {
      const left = Math.max(pad, (wrap.width - cardW) / 2);
      const top = Math.max(pad, wrap.height - cardH - 16);
      setPopupBox({ left, top, below: false });
      return;
    }

    let left = pinX - cardW / 2;
    let top = pinY - cardH - 28;
    let below = false;
    if (top < pad) {
      top = pinY + 26;
      below = true;
    }
    left = Math.min(Math.max(pad, left), wrap.width - cardW - pad);
    top = Math.min(Math.max(pad, top), wrap.height - cardH - pad);
    setPopupBox({ left, top, below });
  }, [selectedDistrict, isMobile]);

  useLayoutEffect(() => {
    positionPopup();
  }, [positionPopup, selected, size]);

  return (
    <div
      ref={wrapRef}
      className="relative w-full min-h-[calc(100vh-5.5rem)] overflow-hidden"
      style={{
        backgroundColor: "#EFEBE3",
        backgroundImage: `
          radial-gradient(ellipse at 18% 20%, rgba(213, 227, 220, 0.7) 0%, transparent 42%),
          radial-gradient(ellipse at 78% 70%, rgba(213, 227, 220, 0.55) 0%, transparent 38%),
          linear-gradient(180deg, #F4F0E8 0%, #EAE4D8 100%)
        `,
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-multiply [background-image:radial-gradient(#c9bba4_0.6px,transparent_0.6px)] [background-size:18px_18px]" />

      <div className="absolute top-3 left-0 right-0 z-20 flex justify-center px-3 pointer-events-none">
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 rounded-full bg-white/90 backdrop-blur-md border border-[#E4D9C4] shadow-[0_8px_28px_-18px_rgba(43,24,16,0.45)] px-2 py-2">
          {FILTER_CHIPS.map((chip, index) => (
            <span
              key={chip.id}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold border ${
                index === 1
                  ? "bg-[#2B1810] text-white border-[#2B1810]"
                  : "bg-white text-[#2B1810] border-[#E4D9C4]"
              }`}
            >
              {chip.label}
              <span className="hidden sm:inline text-[11px] font-medium opacity-70">
                {chip.sub}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="absolute top-16 sm:top-18 left-4 z-10 max-w-[16rem] sm:max-w-sm">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#7A6A55] font-semibold">
          Tamil Nadu
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#8B1E1E] leading-tight">
          காட்சி
        </h1>
        <p className="text-sm text-[#7A6A55] mt-1">
          ஒரு மாவட்ட முள்ளைத் தேர்ந்தெடுத்து நினைவுக் குறிப்பைக் காணுங்கள்.
        </p>
      </div>

      {loadError && (
        <p className="absolute inset-0 z-10 grid place-items-center text-[#8B1E1E] font-semibold">
          {loadError}
        </p>
      )}

      {!geojson && !loadError && (
        <p className="absolute inset-0 z-10 grid place-items-center text-[#7A6A55]">
          வரைபடம் ஏற்றப்படுகிறது...
        </p>
      )}

      <svg
        width={size.width}
        height={size.height}
        viewBox={`0 0 ${size.width || 1} ${size.height || 1}`}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Tamil Nadu districts map"
      >
        {districts.map((district) => {
          const active =
            hovered === district.name || selected === district.name;
          return (
            <path
              key={district.id}
              d={district.path}
              fill={active ? "#E8D7B0" : "#F7F1E6"}
              stroke={active ? "#8B1E1E" : "#C9BBA4"}
              strokeWidth={active ? 1.6 : 0.9}
              className="transition-[fill,stroke] duration-200 cursor-pointer"
              onMouseEnter={() => setHovered(district.name)}
              onMouseLeave={() =>
                setHovered((current) =>
                  current === district.name ? null : current
                )
              }
              onClick={() => setSelected(district.name)}
            />
          );
        })}
      </svg>

      <div className="absolute inset-0 z-[5]">
        {districts.map((district) => {
          const [x, y] = district.centroid;
          const palette = pinPalette(district.name);
          const tamil = getDistrictCaption(district.name).tamil;
          const isOn = selected === district.name;
          return (
            <button
              key={`pin-${district.id}`}
              type="button"
              data-map-pin
              aria-label={`${district.name} / ${tamil}`}
              aria-haspopup="dialog"
              aria-expanded={isOn}
              onClick={() =>
                setSelected((current) =>
                  current === district.name ? null : district.name
                )
              }
              onMouseEnter={() => setHovered(district.name)}
              onMouseLeave={() =>
                setHovered((current) =>
                  current === district.name ? null : current
                )
              }
              className="absolute -translate-x-1/2 -translate-y-1/2 group focus-visible:z-20"
              style={{ left: x, top: y }}
            >
              <span className="map-pin-pulse absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8B1E1E]/25" />
              <span
                className={`relative z-[1] flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border-[3px] border-white shadow-[0_6px_16px_-6px_rgba(43,24,16,0.55)] transition-transform duration-200 ${
                  isOn ? "scale-110" : "group-hover:scale-105"
                }`}
                style={{
                  background: `linear-gradient(145deg, ${palette.from}, ${palette.to})`,
                }}
              >
                <span className="text-[11px] sm:text-xs" aria-hidden>
                  🛕
                </span>
              </span>
              <span className="mt-1 hidden max-w-[5.5rem] truncate rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-[#2B1810] shadow-sm sm:block">
                {district.name}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedDistrict && (
          <motion.div
            ref={popupRef}
            role="dialog"
            aria-modal="false"
            aria-labelledby={titleId}
            aria-describedby={captionId}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute z-30 w-[min(92vw,22rem)] origin-center"
            style={{ left: popupBox.left, top: popupBox.top }}
          >
            <div className="relative overflow-hidden rounded-[22px] bg-white shadow-[0_18px_50px_-24px_rgba(43,24,16,0.55)] border border-[#EDE4D4]">
              <div
                className="relative h-28 sm:h-32"
                style={{
                  background:
                    "linear-gradient(135deg, #F7EDD8 0%, #E8D4A8 55%, #C9BBA4 100%)",
                }}
              >
                <svg
                  className="absolute inset-0 h-full w-full opacity-80"
                  viewBox={`0 0 ${size.width || 1} ${size.height || 1}`}
                  aria-hidden
                >
                  <path
                    d={selectedDistrict.path}
                    fill="#8B1E1E"
                    stroke="#D4A017"
                    strokeWidth={2}
                    transform={`translate(${-selectedDistrict.centroid[0] + (size.width || 0) / 2} ${
                      -selectedDistrict.centroid[1] + (size.height || 0) / 2
                    })`}
                  />
                </svg>
                <span className="absolute left-3 top-3 rounded-full bg-[#2D6A4F] px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  மாவட்டம்
                </span>
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={closePopup}
                  aria-label="Close district card"
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#2B1810] border border-[#E4D9C4]"
                >
                  ×
                </button>
              </div>

              <div className="px-4 pt-3 pb-4">
                <h2
                  id={titleId}
                  className="text-xl font-bold text-[#2B1810] leading-tight"
                >
                  {selectedDistrict.name}
                </h2>
                <p className="text-[#8B1E1E] font-semibold mt-0.5">
                  {selectedCaption.tamil}
                </p>
                <p
                  id={captionId}
                  className="mt-2 text-sm leading-relaxed text-[#7A6A55] whitespace-pre-line"
                >
                  {selectedCaption.caption}
                </p>
                {captionMissing && (
                  <p className="mt-2 text-xs text-[#8A6300]">
                    Caption missing — showing fallback text.
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-[#F7EDD8] px-2.5 py-0.5 text-[11px] font-semibold text-[#6B1414] border border-[#E4D9C4]">
                    வாய்மொழி
                  </span>
                  <span className="rounded-full bg-[#F7EDD8] px-2.5 py-0.5 text-[11px] font-semibold text-[#6B1414] border border-[#E4D9C4]">
                    நினைவு
                  </span>
                </div>
              </div>

              <span
                aria-hidden
                className={`absolute left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white border-[#EDE4D4] ${
                  popupBox.below
                    ? "top-[-6px] border-l border-t"
                    : "bottom-[-6px] border-r border-b"
                }`}
                style={
                  isMobile
                    ? undefined
                    : {
                        left: Math.min(
                          Math.max(
                            24,
                            selectedDistrict.centroid[0] - popupBox.left
                          ),
                          320
                        ),
                      }
                }
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
