"use client";

import { useId, useState } from "react";
import PulamIcon from "@/components/PulamIcon";
import {
  Locale,
  NEIRKAANAL_COPY,
  NeirkaanalInterview,
  pickText,
  pulamLabel,
  youtubeThumbnailUrl,
} from "@/data/neirkaanal";

export default function NeirkaanalCard({
  interview,
  lang,
}: {
  interview: NeirkaanalInterview;
  lang: Locale;
}) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const copy = NEIRKAANAL_COPY[lang];
  const thumbnail = youtubeThumbnailUrl(interview.youtubeUrl);
  const title = pickText(interview.title, lang);
  const summary = pickText(interview.summary, lang);
  const transcript = pickText(interview.fullTranscript, lang);
  const hasTranscript = transcript.length > 0;
  const categoryName = pulamLabel(interview.category, lang);

  return (
    <article className="manuscript-card p-5 sm:p-7">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
        {thumbnail ? (
          <a
            href={interview.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block shrink-0 sm:w-56 overflow-hidden rounded-xl border border-[#D9C9A8] bg-[#F7EDD8]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnail}
              alt=""
              className="w-full h-40 sm:h-full object-cover"
            />
          </a>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <h2 className="text-lg sm:text-xl font-bold text-[#8B1E1E] leading-snug">
              {title}
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FDF1D0] text-[#8A6300] border border-[#F5D98B] shrink-0">
              <PulamIcon slug={interview.category} className="w-3.5 h-3.5 text-[#8A6300]" />
              {categoryName}
            </span>
          </div>

          {summary ? (
            <p className="text-sm sm:text-base text-[#2B1810] leading-relaxed">
              {summary}
            </p>
          ) : (
            <p className="text-sm text-[#7A6A55] italic">{copy.missing}</p>
          )}

          {interview.audioUrl ? (
            <div className="mt-4">
              <audio
                src={interview.audioUrl}
                preload="none"
                className="w-full"
                controls
                onPlay={(event) => {
                  const current = event.currentTarget;
                  document.querySelectorAll("audio").forEach((el) => {
                    if (el !== current && !el.paused) el.pause();
                  });
                }}
              />
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => setExpanded((v) => !v)}
              className="stamp-btn-outline !text-sm !py-2 !px-4"
            >
              {expanded ? copy.collapse : copy.expand}
              <span aria-hidden="true">{expanded ? " ▲" : " ▼"}</span>
            </button>

            <a
              href={interview.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8B1E1E] hover:text-[#6B1414] hover:underline min-h-11"
            >
              {copy.source}
              {interview.channelName ? (
                <span className="font-medium text-[#7A6A55]">
                  — {interview.channelName}
                </span>
              ) : null}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>

      <div
        id={panelId}
        hidden={!expanded}
        className="mt-5 pt-5 border-t border-[#D9C9A8]"
      >
        {hasTranscript ? (
          <p className="text-sm sm:text-base text-[#2B1810] leading-loose whitespace-pre-wrap">
            {transcript}
          </p>
        ) : (
          <p className="text-sm text-[#7A6A55] italic">{copy.missing}</p>
        )}
      </div>
    </article>
  );
}
