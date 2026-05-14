"use client";

import { memo, useState, type ReactNode } from "react";
import type { FeedItem } from "@/app/api/feeds/route";
import type { TagInfo } from "@/lib/entity-extractor";
import { ArticleTags } from "./tag-browser";

const RTL_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

function isRtl(text: string): boolean {
  return RTL_REGEX.test(text);
}

/** Highlight all occurrences of `query` within `text` */
function highlightText(text: string, query: string): ReactNode {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  if (parts.length <= 1) return text;
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-primary/25 text-foreground rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function timeAgo(dateStr: string): string {
  const then = new Date(dateStr).getTime();
  if (!dateStr || isNaN(then)) return "—";
  const diffSec = Math.floor((Date.now() - then) / 1000);

  if (diffSec < 60) return "now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
  return `${Math.floor(diffSec / 86400)}d`;
}

export const FeedCard = memo(function FeedCard({
  item,
  isNew,
  highlightQuery,
  onSimilar,
  itemTags,
  tagIndex,
  onTagClick,
}: {
  item: FeedItem;
  isNew?: boolean;
  highlightQuery?: string;
  onSimilar?: (item: FeedItem) => void;
  itemTags?: string[];
  tagIndex?: Map<string, TagInfo>;
  onTagClick?: (tag: string) => void;
}) {
  const rtl = isRtl(item.title);
  const [imgError, setImgError] = useState(false);
  const showImage = item.image && !imgError;

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`block group ${isNew ? "card-enter" : ""}`}
    >
      <article className="relative h-full rounded-lg border border-border/40 bg-card/50 active:bg-accent/50 hover:bg-accent/40 hover:border-border/60 transition-colors duration-150 overflow-hidden">
        {/* Accent bar (left edge) */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{ backgroundColor: item.sourceColor || "oklch(0.65 0.22 25)" }}
        />

        <div className="px-3.5 py-3 sm:px-3 sm:py-2.5">
          {/* Source + time row */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: item.sourceColor || "oklch(0.50 0 0)" }}
              />
              <span
                className="feed-source font-semibold uppercase tracking-wider truncate"
                style={{ color: item.sourceColor || "oklch(0.65 0.22 25)" }}
              >
                {item.source}
              </span>
            </div>
            <span className="text-[11px] sm:text-[10px] text-muted-foreground/60 tabular-nums shrink-0">
              {timeAgo(item.pubDate)}
            </span>
          </div>

          {/* Content: text + optional thumbnail */}
          <div className="flex gap-3 sm:gap-2.5">
            <div className="flex-1 min-w-0">
              <h3
                className="feed-title font-medium leading-[1.4] text-foreground/90 group-hover:text-foreground transition-colors line-clamp-2"
                dir={rtl ? "rtl" : "ltr"}
                lang={rtl ? "ar" : undefined}
              >
                {highlightQuery ? highlightText(item.title, highlightQuery) : item.title}
              </h3>

              {item.snippet && (
                <p
                  className="feed-snippet mt-1 leading-normal text-muted-foreground line-clamp-2"
                  dir={rtl ? "rtl" : "ltr"}
                  lang={rtl ? "ar" : undefined}
                >
                  {highlightQuery ? highlightText(item.snippet, highlightQuery) : item.snippet}
                </p>
              )}
            </div>

            {showImage && (
              <div className="shrink-0 w-14 h-14 sm:w-12 sm:h-12 rounded overflow-hidden bg-muted/30 mt-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt=""
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  onError={() => setImgError(true)}
                />
              </div>
            )}
          </div>

          {/* Entity tags */}
          {itemTags && itemTags.length > 0 && tagIndex && (
            <ArticleTags tags={itemTags} tagIndex={tagIndex} onTagClick={onTagClick} />
          )}

          {/* More like this */}
          {onSimilar && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSimilar(item);
              }}
              className="mt-1.5 flex items-center gap-1 text-[11px] sm:text-[10px] text-muted-foreground/50 hover:text-primary transition-colors cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
                <path d="M8 11h6" />
                <path d="M11 8v6" />
              </svg>
              More like this
            </button>
          )}
        </div>
      </article>
    </a>
  );
});

export function FeedCardSkeleton() {
  return (
    <div className="rounded-lg border border-border/40 bg-card/50 px-3 py-2.5">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-2 h-2 rounded-full bg-muted/50 animate-pulse" />
        <div className="h-2.5 w-16 rounded-sm bg-muted/40 animate-pulse" />
        <div className="flex-1" />
        <div className="h-2.5 w-6 rounded-sm bg-muted/30 animate-pulse" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3.5 w-full rounded-sm bg-muted/40 animate-pulse" />
        <div className="h-3.5 w-3/4 rounded-sm bg-muted/40 animate-pulse" />
        <div className="h-2.5 w-1/2 rounded-sm bg-muted/30 animate-pulse" />
      </div>
    </div>
  );
}
