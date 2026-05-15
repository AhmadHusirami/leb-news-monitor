"use client";

import { useState } from "react";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_ORDER,
  type FeedCategory,
} from "@/config/feeds";
import { useLayout } from "@/hooks/use-layout";

interface SourceChip {
  name: string;
  color?: string;
  count: number;
  category: FeedCategory;
}

interface FeedFilterBarProps {
  activeCategory: FeedCategory | "all";
  activeSource: string | null;
  categoryCounts: Record<string, number>;
  sourceChips: SourceChip[];
  filteredCount: number;
  onCategoryChange: (cat: FeedCategory | "all") => void;
  onSourceChange: (source: string | null) => void;
}

export function FeedFilterBar({
  activeCategory,
  activeSource,
  categoryCounts,
  sourceChips,
  filteredCount,
  onCategoryChange,
  onSourceChange,
}: FeedFilterBarProps) {
  const { layout } = useLayout();
  const [isListFiltersOpen, setIsListFiltersOpen] = useState(false);
  const isListCollapsed = layout === "list" && !isListFiltersOpen;

  const visibleCategories = isListCollapsed ? CATEGORY_ORDER.slice(0, 3) : CATEGORY_ORDER;

  const filteredSources = sourceChips.filter(
    (s) => activeCategory === "all" || s.category === activeCategory
  );

  const visibleSources = isListCollapsed ? filteredSources.slice(0, 6) : filteredSources;

  return (
    <div className="shrink-0 border-b border-border/40 bg-secondary/10 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      {/* Category tabs */}
      <div
        className={`px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1 ${
          layout === "list" ? "flex-wrap overflow-visible" : "flex-wrap overflow-visible"
        }`}
        role="tablist"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeCategory === "all"}
          onClick={() => onCategoryChange("all")}
          className={`shrink-0 px-3 py-1.5 sm:py-1 rounded-full text-xs sm:text-[11px] font-medium tracking-wide transition-colors cursor-pointer ${
            activeCategory === "all"
              ? "bg-foreground/10 text-foreground"
              : "text-muted-foreground hover:text-foreground/70 hover:bg-foreground/5"
          }`}
        >
          All
          <span className="ml-1.5 text-[10px] sm:text-[9px] opacity-60 tabular-nums">
            {categoryCounts.all}
          </span>
        </button>

        {visibleCategories.map((cat) => (
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === cat}
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`shrink-0 px-3 py-1.5 sm:py-1 rounded-full text-xs sm:text-[11px] font-medium tracking-wide transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeCategory === cat
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/70 hover:bg-foreground/5"
            }`}
            style={
              activeCategory === cat
                ? { backgroundColor: `${CATEGORY_COLORS[cat]}20`, color: CATEGORY_COLORS[cat] }
                : undefined
            }
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[cat] }}
            />
            {CATEGORY_LABELS[cat]}
            <span className="text-[10px] sm:text-[9px] opacity-60 tabular-nums">
              {categoryCounts[cat]}
            </span>
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2 shrink-0">
          {layout === "list" && (
            <button
              type="button"
              onClick={() => setIsListFiltersOpen((prev) => !prev)}
              className="px-2.5 py-1 rounded-full text-[11px] sm:text-[10px] font-medium tracking-wide text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors cursor-pointer"
            >
              <span className="inline-flex items-center gap-1.5">
                {isListFiltersOpen ? "Show less" : "Show all"}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={isListFiltersOpen ? "rotate-180" : ""}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </button>
          )}
          <div className="hidden sm:block text-[10px] text-muted-foreground/50 tabular-nums">
            {filteredCount} results
          </div>
        </div>
      </div>

      {/* Source chips */}
      <div
        className={`px-3 sm:px-4 pb-1.5 sm:pb-2 flex items-center gap-1.5 sm:gap-1.5 ${
          layout === "list" ? "flex-wrap overflow-visible" : "flex-wrap overflow-visible"
        }`}
      >
        {activeSource && (
          <button
            type="button"
            onClick={() => onSourceChange(null)}
            className="shrink-0 px-2.5 py-1 sm:px-2 sm:py-0.5 rounded-full text-[11px] sm:text-[10px] font-medium bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
            Clear
          </button>
        )}

        {visibleSources.map((source) => (
            <button
              type="button"
              aria-pressed={activeSource === source.name}
              key={source.name}
              onClick={() => onSourceChange(activeSource === source.name ? null : source.name)}
              className={`shrink-0 px-2.5 py-1 sm:px-2 sm:py-0.5 rounded-full text-[11px] sm:text-[10px] transition-colors flex items-center gap-1 border cursor-pointer ${
                activeSource === source.name
                  ? "bg-foreground/10 text-foreground border-foreground/20"
                  : "text-muted-foreground/70 hover:text-muted-foreground border-border/40 hover:border-border/60"
              }`}
            >
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: source.color || "oklch(0.50 0 0)" }}
              />
              {source.name}
              <span className="text-[10px] sm:text-[9px] opacity-50 tabular-nums">
                {source.count}
              </span>
            </button>
          ))}
      </div>
    </div>
  );
}
