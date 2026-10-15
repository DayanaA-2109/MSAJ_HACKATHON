"use client";

import { useId, useState } from "react";
import {
  CATEGORY_LABELS,
  NeirkaanalInterview,
  youtubeThumbnailUrl,
} from "@/data/neirkaanal";

export default function NeirkaanalCard({
  interview,
}: {
  interview: NeirkaanalInterview;
}) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const thumbnail = youtubeThumbnailUrl(interview.youtubeUrl);
  const hasTranscript = interview.fullTranscript.trim().length > 0;

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
              {interview.title}
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FDF1D0] text-[#8A6300] border border-[#F5D98B] shrink-0">
              {CATEGORY_LABELS[interview.category]}
            </span>
          </div>

          <p className="text-sm sm:text-base text-[#2B1810] leading-relaxed">
            {interview.summary}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => setExpanded((v) => !v)}
              className="stamp-btn-outline !text-sm !py-2 !px-4"
            >
              {expanded ? "Collapse transcript" : "Read full transcript"}
              <span aria-hidden="true">{expanded ? " ▲" : " ▼"}</span>
            </button>

            <a
              href={interview.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8B1E1E] hover:text-[#6B1414] hover:underline min-h-11"
            >
              Source
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
            {interview.fullTranscript}
          </p>
        ) : (
          <p className="text-sm text-[#7A6A55] italic">Transcript not available</p>
        )}
      </div>
    </article>
  );
}
