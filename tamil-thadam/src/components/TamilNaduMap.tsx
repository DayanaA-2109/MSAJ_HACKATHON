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
import { geoArea, geoCentroid, geoMercator, geoPath } from "d3-geo";
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
  slug: string;
  path: string;
  centroid: [number, number];
  feature: DistrictFeature;
};

const GEOJSON_URL = "/data/tamil-nadu-districts.geojson";

function districtName(feature: DistrictFeature): string {
  return (
    feature.properties?.district ||
    feature.properties?.name ||
    "Unknown district"
  );
}

function pinPalette(name: string) {
  const palettes = [
    { from: "#8B1E1E", to: "#C45C26", ring: "rgba(139,30,30,0.3)" },
    { from: "#2D6A4F", to: "#40916C", ring: "rgba(45,106,79,0.3)" },
    { from: "#8A6300", to: "#D4A017", ring: "rgba(212,160,23,0.3)" },
    { from: "#4A3F35", to: "#8C7A6B", ring: "rgba(74,63,53,0.3)" },
    { from: "#6B1414", to: "#B8572A", ring: "rgba(107,20,20,0.3)" },
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
  const [zoomLevel, setZoomLevel] = useState(1);

  // Load and sanitize GeoJSON polygon winding order
  useEffect(() => {
    let cancelled = false;
    fetch(GEOJSON_URL)
      .then((res) => {
        if (!res.ok) throw new Error("GeoJSON missing");
        return res.json();
      })
      .then((data: FeatureCollection<Geometry, { district?: string; name?: string }>) => {
        if (cancelled) return;

        // Defensive rewind: Ensure spherical winding order is strictly counter-clockwise
        data.features.forEach((f) => {
          try {
            if (geoArea(f) > 2 * Math.PI) {
              if (f.geometry.type === "Polygon") {
                f.geometry.coordinates.forEach((ring) => ring.reverse());
              } else if (f.geometry.type === "MultiPolygon") {
                f.geometry.coordinates.forEach((poly) =>
                  poly.forEach((ring) => ring.reverse())
                );
              }
            }
          } catch {
            // Ignore geometry parsing edge cases
          }
        });

        setGeojson(data);
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
        width: Math.max(340, rect.width),
        height: Math.max(480, rect.height),
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

  // Compute D3 Mercator projection mapped to the container
  const districts = useMemo<DistrictView[]>(() => {
    if (!geojson || size.width === 0 || size.height === 0) return [];

    const padX = (isMobile ? 24 : 60) / zoomLevel;
    const padY = (isMobile ? 32 : 50) / zoomLevel;

    const projection = geoMercator().fitExtent(
      [
        [padX, padY],
        [size.width - padX, size.height - padY],
      ],
      geojson
    );

    const pathGen = geoPath(projection);

    return geojson.features.map((feature, index) => {
      const name = districtName(feature as DistrictFeature);
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const centroidRaw = projection(geoCentroid(feature)) ?? [0, 0];
      const centroid: [number, number] = [centroidRaw[0], centroidRaw[1]];

      return {
        id: `${name}-${index}`,
        name,
        slug,
        path: pathGen(feature) ?? "",
        centroid,
        feature: feature as DistrictFeature,
      };
    });
  }, [geojson, size.width, size.height, isMobile, zoomLevel]);

  const selectedDistrict = districts.find((d) => d.name === selected) ?? null;
  const selectedCaption = selectedDistrict
    ? getDistrictCaption(selectedDistrict.name)
    : MISSING_CAPTION_FALLBACK;

  const closePopup = useCallback(() => setSelected(null), []);

  // Outside click & Escape listener
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

  // Position popup card smoothly near the pin or docked on mobile
  const positionPopup = useCallback(() => {
    if (!selectedDistrict || !wrapRef.current) return;
    const wrap = wrapRef.current.getBoundingClientRect();
    const card = popupRef.current;
    const cardW = card?.offsetWidth ?? (isMobile ? Math.min(wrap.width - 24, 380) : 360);
    const cardH = card?.offsetHeight ?? 230;
    const pad = 14;
    const [pinX, pinY] = selectedDistrict.centroid;

    if (isMobile) {
      const left = Math.max(pad, (wrap.width - cardW) / 2);
      const top = Math.max(pad, wrap.height - cardH - 18);
      setPopupBox({ left, top, below: false });
      return;
    }

    let left = pinX - cardW / 2;
    let top = pinY - cardH - 30;
    let below = false;
    if (top < pad) {
      top = pinY + 28;
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
      className="relative w-full h-[calc(100vh-5rem)] min-h-[580px] overflow-hidden select-none bg-[#F7F3EB]"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at 15% 20%, rgba(220, 235, 227, 0.6) 0%, transparent 45%),
          radial-gradient(ellipse at 85% 75%, rgba(226, 236, 230, 0.55) 0%, transparent 45%),
          linear-gradient(180deg, #FBF8F2 0%, #EFECE3 100%)
        `,
      }}
    >
      {/* Subtle Map Grid Network Lines */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-30 mix-blend-multiply"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="road-grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path
              d="M 100 0 L 0 100 M 0 0 L 100 100"
              fill="none"
              stroke="#D4C9B4"
              strokeWidth="0.75"
              strokeDasharray="4 5"
            />
            <circle cx="50" cy="50" r="1.5" fill="#BFB29C" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#road-grid)" />
      </svg>

      {/* Title Badge Header (Top Left) */}
      <div className="absolute top-4 left-5 z-10 pointer-events-none">
        <span className="inline-block rounded-full bg-white/90 border border-[#D9C9A8] px-3 py-1 text-[11px] font-bold tracking-wider uppercase text-[#8B1E1E] shadow-xs">
          தமிழ்நாடு · 38 மாவட்டங்கள்
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B1810] mt-1.5 leading-tight">
          தமிழ்நாடு நிலப்படம்
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6A55] mt-0.5">
          மாவட்டத்தைத் தொட்டு அதற்கான குறிப்பைக் காண்க.
        </p>
      </div>

      {loadError && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-white/80 backdrop-blur-sm text-[#8B1E1E] font-semibold text-center p-4">
          <div className="rounded-2xl bg-white p-6 shadow-xl border border-[#E8DAC5] max-w-sm">
            <svg
              className="w-8 h-8 text-[#8B1E1E] mx-auto mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p>{loadError}</p>
          </div>
        </div>
      )}

      {!geojson && !loadError && (
        <div className="absolute inset-0 z-10 grid place-items-center text-[#7A6A55]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-[#8B1E1E] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">நிலப்படம் ஏற்றப்படுகிறது...</p>
          </div>
        </div>
      )}

      {/* SVG Map of Tamil Nadu and Districts */}
      <svg
        width={size.width}
        height={size.height}
        viewBox={`0 0 ${size.width || 1} ${size.height || 1}`}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="தமிழ்நாடு மாவட்ட வரைபடம்"
      >
        <g>
          {districts.map((district) => {
            const isHovered = hovered === district.name;
            const isSelected = selected === district.name;
            const active = isHovered || isSelected;

            return (
              <path
                key={district.id}
                d={district.path}
                fill={
                  isSelected
                    ? "#ECD9AF"
                    : isHovered
                    ? "#F3E7C9"
                    : "#FDFBF7"
                }
                stroke={active ? "#8B1E1E" : "#C9BAA2"}
                strokeWidth={active ? 2 : 1}
                strokeLinejoin="round"
                strokeLinecap="round"
                className="transition-[fill,stroke] duration-150 cursor-pointer"
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
        </g>
      </svg>

      {/* Centroid Pins Layer */}
      <div className="absolute inset-0 z-[5] pointer-events-none">
        {districts.map((district) => {
          const [x, y] = district.centroid;
          const palette = pinPalette(district.name);
          const caption = getDistrictCaption(district.name);
          const isSelected = selected === district.name;
          const isHovered = hovered === district.name;

          return (
            <div
              key={`pin-${district.id}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
              style={{ left: x, top: y }}
            >
              {/* Clean Dark Tooltip Badge above pin on Hover / Selection */}
              {(isSelected || isHovered) && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-30 whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5 rounded-full bg-[#1F2937] text-white px-3 py-1 text-xs font-semibold shadow-xl border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017]" />
                    <span className="text-[#F5D98B] font-bold">{caption.tamil}</span>
                    <span className="opacity-60 text-[11px] font-normal">
                      ({district.name})
                    </span>
                  </div>
                  <div className="mx-auto w-0 h-0 border-x-4 border-x-transparent border-t-5 border-t-[#1F2937]" />
                </motion.div>
              )}

              {/* District Centroid Pin Button */}
              <button
                type="button"
                data-map-pin
                aria-label={`${caption.tamil} (${district.name})`}
                aria-haspopup="dialog"
                aria-expanded={isSelected}
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
                className="group relative flex flex-col items-center focus-visible:outline-none"
              >
                {/* Gentle Pulse Animation Ring */}
                <span
                  className="map-pin-pulse absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ backgroundColor: palette.ring }}
                />

                {/* Professional SVG Pin Avatar */}
                <span
                  className={`relative z-[2] flex h-7 w-7 sm:h-7.5 sm:w-7.5 items-center justify-center rounded-full border-2 border-white shadow-[0_3px_10px_rgba(43,24,16,0.3)] transition-all duration-200 ${
                    isSelected
                      ? "scale-125 ring-2 ring-[#8B1E1E]"
                      : "group-hover:scale-115"
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
                  }}
                >
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </span>

                {/* District Name Label underneath */}
                <span
                  className={`mt-0.5 hidden sm:block max-w-[5.5rem] truncate rounded-full px-1.5 py-0.2 text-[9.5px] font-bold shadow-2xs transition-colors ${
                    isSelected
                      ? "bg-[#2B1810] text-white"
                      : "bg-white/95 text-[#2B1810] border border-[#D9C9A8]"
                  }`}
                >
                  {caption.tamil}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Animated Popup Card with District Details */}
      <AnimatePresence>
        {selectedDistrict && (
          <motion.div
            ref={popupRef}
            role="dialog"
            aria-modal="false"
            aria-labelledby={titleId}
            aria-describedby={captionId}
            initial={{ opacity: 0, scale: 0.94, y: isMobile ? 24 : 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: isMobile ? 24 : 6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute z-40 w-[min(94vw,24rem)] origin-center"
            style={{ left: popupBox.left, top: popupBox.top }}
          >
            <div className="relative overflow-hidden rounded-[24px] bg-white shadow-[0_20px_50px_-15px_rgba(43,24,16,0.5)] border border-[#E9DFCE]">
              {/* Header Visual with District Silhouette & Tag */}
              <div
                className="relative h-26 sm:h-28 p-4 flex flex-col justify-between overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #FBF5EA 0%, #EDE0C3 55%, #D4C19A 100%)",
                }}
              >
                {/* Silhouette SVG of district */}
                <svg
                  className="absolute -right-4 -bottom-4 h-32 w-32 opacity-25 text-[#8B1E1E]"
                  viewBox={`0 0 ${size.width || 1} ${size.height || 1}`}
                  aria-hidden
                >
                  <path
                    d={selectedDistrict.path}
                    fill="currentColor"
                    stroke="#D4A017"
                    strokeWidth={1.5}
                    transform={`translate(${-selectedDistrict.centroid[0] + 50} ${
                      -selectedDistrict.centroid[1] + 50
                    }) scale(1.6)`}
                  />
                </svg>

                {/* Top Badge & Close Button */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8B1E1E] px-3 py-1 text-[11px] font-bold text-white shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017]" />
                    <span>தமிழ்நாடு மாவட்டம்</span>
                  </span>

                  <button
                    ref={closeBtnRef}
                    type="button"
                    onClick={closePopup}
                    aria-label="Close district card"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 hover:bg-white text-[#2B1810] shadow-xs border border-[#E4D9C4] transition-transform hover:scale-110 active:scale-95 cursor-pointer font-bold text-lg leading-none"
                  >
                    ×
                  </button>
                </div>

                {/* Subtitle / English Name Tag */}
                <div className="relative z-10 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold text-[#8B1E1E] border border-[#E4D9C4]">
                    <svg
                      className="w-3 h-3 text-[#8B1E1E]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span>{selectedDistrict.name}</span>
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-5 pt-3.5 pb-5">
                <div className="flex items-baseline justify-between gap-2">
                  <h2
                    id={titleId}
                    className="text-2xl font-extrabold text-[#8B1E1E] leading-tight"
                  >
                    {selectedCaption.tamil}
                  </h2>
                  <span className="text-xs font-bold text-[#7A6A55] tracking-wide uppercase">
                    {selectedDistrict.name} District
                  </span>
                </div>

                {/* Exact Verified 2-line Tamil Caption */}
                <p
                  id={captionId}
                  className="mt-2.5 text-sm leading-relaxed text-[#2B1810] font-medium whitespace-pre-line bg-[#FDF9F2] p-3.5 rounded-xl border border-[#F0E4D0]"
                >
                  {selectedCaption.caption}
                </p>
              </div>

              {/* Triangular Pointer toward Pin (Desktop only) */}
              {!isMobile && (
                <span
                  aria-hidden
                  className={`absolute left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 bg-white border-[#E9DFCE] ${
                    popupBox.below
                      ? "top-[-7px] border-l border-t"
                      : "bottom-[-7px] border-r border-b"
                  }`}
                  style={{
                    left: Math.min(
                      Math.max(28, selectedDistrict.centroid[0] - popupBox.left),
                      340
                    ),
                  }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Map Zoom Controls (+ / - / Reset) with clean SVG Icons */}
      <div className="absolute bottom-5 right-4 z-20 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.2))}
          aria-label="பெரிதாக்கு (Zoom In)"
          title="பெரிதாக்கு (Zoom In)"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#2B1810] shadow-[0_6px_16px_rgba(43,24,16,0.18)] border border-[#E4DAC6] hover:bg-[#FDFBF7] active:scale-95 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.85))}
          aria-label="சிறிதாக்கு (Zoom Out)"
          title="சிறிதாக்கு (Zoom Out)"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#2B1810] shadow-[0_6px_16px_rgba(43,24,16,0.18)] border border-[#E4DAC6] hover:bg-[#FDFBF7] active:scale-95 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => {
            setZoomLevel(1);
            setSelected(null);
          }}
          aria-label="மறுசீரமை (Reset View)"
          title="மறுசீரமை (Reset View)"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#8B1E1E] shadow-[0_6px_16px_rgba(43,24,16,0.18)] border border-[#E4DAC6] hover:bg-[#FDFBF7] active:scale-95 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4 text-[#8B1E1E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <line x1="12" y1="2" x2="12" y2="6"/>
            <line x1="12" y1="18" x2="12" y2="22"/>
            <line x1="2" y1="12" x2="6" y2="12"/>
            <line x1="18" y1="12" x2="22" y2="12"/>
            <circle cx="12" cy="12" r="2" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
