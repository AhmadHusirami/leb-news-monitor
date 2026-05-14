"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import type { FeedItem } from "@/app/api/feeds/route";
import { CATEGORY_ORDER, type FeedCategory } from "@/config/feeds";
import { TooltipProvider } from "@/components/ui/tooltip";
import Link from "next/link";
import { useFeedPrefs } from "@/hooks/use-feed-prefs";
import { useFeedStream } from "@/hooks/use-feed-stream";
import { useLayout } from "@/hooks/use-layout";
import { useSearch, applySearchFilters } from "@/hooks/use-search";
import { useDateFilter, applyDateFilter } from "@/hooks/use-date-filter";
import { useSimilar } from "@/hooks/use-similar";
import { useTags } from "@/hooks/use-tags";
import { AnnouncementBanner } from "./announcement-banner";
import { FeedHeader } from "./feed-header";
import { FeedFilterBar } from "./feed-filter-bar";
import { FeedContent } from "./feed-content";
import { SearchBar } from "./search-bar";
import { DatePickerFilter } from "./date-picker-filter";
import { TagBrowser } from "./tag-browser";

const ITEMS_PER_PAGE = 30;

interface SourceGroup {
  color?: string;
  category: FeedCategory;
  items: FeedItem[];
}

export function LiveFeed() {
  const { items: allItems, newIds, sources: sourceCount, fetchedAt, isLoading, isStreaming } = useFeedStream();
  const { prefs, toggleSource, syncSources, setSourcesVisible } = useFeedPrefs();
  const { layout } = useLayout();
  const {
    filters,
    setQuery,
    commitSearch,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    recentSearches,
    removeRecent,
    clearRecent,
  } = useSearch();
  const {
    dateRange,
    setFrom: setDateFrom,
    setTo: setDateTo,
    setRange: setDateRange,
    clearDate,
    hasDateFilter,
  } = useDateFilter();

  const {
    anchorItem,
    similarItems,
    isActive: isSimilarMode,
    showSimilar,
    clearSimilar,
  } = useSimilar(allItems);

  const {
    allTags,
    activeTags,
    toggleTag,
    clearTags,
    filterByTags,
    getItemTags,
    hasActiveTags: hasActiveTagFilters,
  } = useTags(allItems);

  // Build tagIndex map for article cards
  const tagIndex = useMemo(() => {
    const map = new Map<string, import("@/lib/entity-extractor").TagInfo>();
    for (const t of allTags) map.set(t.tag, t);
    return map;
  }, [allTags]);

  const [activeCategory, setActiveCategory] = useState<FeedCategory | "all">("all");
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  // Coordinate mutually-exclusive popovers (date picker vs tags) in the search bar
  const [openPicker, setOpenPicker] = useState<"date" | "tags" | null>(null);

  // Group items by source
  const grouped = useMemo(() => {
    if (!allItems.length) return new Map<string, SourceGroup>();
    const map = new Map<string, SourceGroup>();
    for (const item of allItems) {
      const existing = map.get(item.source);
      if (existing) {
        existing.items.push(item);
      } else {
        map.set(item.source, {
          color: item.sourceColor,
          category: item.sourceCategory || "general",
          items: [item],
        });
      }
    }
    return map;
  }, [allItems]);

  // Sync discovered sources into prefs
  useEffect(() => {
    if (!isStreaming && grouped.size > 0) {
      syncSources([...grouped.keys()]);
    }
  }, [isStreaming, grouped, syncSources]);

  // Filtered items (category/source bar + search filters)
  const filteredItems = useMemo(() => {
    if (!allItems.length) return [];
    // First: apply the existing category/source/hidden filters
    const preFiltered = allItems.filter((item) => {
      if (prefs.hidden.has(item.source)) return false;
      if (activeCategory !== "all" && item.sourceCategory !== activeCategory) return false;
      if (activeSource && item.source !== activeSource) return false;
      return true;
    });
    // Then: apply search + combined filters
    const searched = applySearchFilters(preFiltered, filters);
    // Then: apply standalone date picker filter
    const dated = applyDateFilter(searched, dateRange);
    // Then: apply tag filters
    return filterByTags(dated);
  }, [allItems, prefs.hidden, activeCategory, activeSource, filters, dateRange, filterByTags]);

  // When "More like this" is active, override with similar items
  const displayItems = isSimilarMode && similarItems ? similarItems : filteredItems;
  const visibleItems = displayItems.slice(0, visibleCount);

  // Filter handlers
  const handleCategoryChange = useCallback((cat: FeedCategory | "all") => {
    setActiveCategory(cat);
    setActiveSource(null);
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  const handleSourceChange = useCallback((source: string | null) => {
    setActiveSource(source);
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => {
      if (prev >= filteredItems.length) return prev;
      return Math.min(prev + ITEMS_PER_PAGE, filteredItems.length);
    });
  }, [filteredItems.length]);

  // Derived data for child components
  const allSourceInfo = useMemo(() => {
    return [...grouped.entries()].map(([name, { color, items, category }]) => ({
      name,
      color,
      count: items.length,
      category,
    }));
  }, [grouped]);

  const sourceChips = useMemo(() => {
    const chips: { name: string; color?: string; count: number; category: FeedCategory }[] = [];
    for (const cat of CATEGORY_ORDER) {
      for (const [name, group] of grouped) {
        if (group.category === cat && !prefs.hidden.has(name)) {
          chips.push({ name, color: group.color, count: group.items.length, category: cat });
        }
      }
    }
    return chips;
  }, [grouped, prefs.hidden]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    for (const cat of CATEGORY_ORDER) counts[cat] = 0;
    for (const item of allItems) {
      if (prefs.hidden.has(item.source)) continue;
      counts.all++;
      const cat = item.sourceCategory || "general";
      if (cat in counts) counts[cat]++;
    }
    return counts;
  }, [allItems, prefs.hidden]);

  // All source names for the search filter dropdown
  const allSourceNames = useMemo(() => [...grouped.keys()].sort(), [grouped]);

  return (
    <TooltipProvider>
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <FeedHeader
        visibleSourceCount={sourceChips.length}
        totalSourceCount={sourceCount}
        totalItems={allItems.length}
        fetchedAt={fetchedAt}
        isStreaming={isStreaming}
        sources={allSourceInfo}
        prefs={prefs}
        onToggleSource={toggleSource}
        onSetSourcesVisible={setSourcesVisible}
      />

      <AnnouncementBanner />

      <div className="shrink-0 border-b border-border/40 bg-secondary/5 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        <div className="px-3 sm:px-4 py-2">
          <SearchBar
            filters={filters}
            onQueryChange={setQuery}
            onCommitSearch={commitSearch}
            onFilterChange={updateFilter}
            onReset={resetFilters}
            hasActiveFilters={hasActiveFilters}
            recentSearches={recentSearches}
            onRemoveRecent={removeRecent}
            onClearRecent={clearRecent}
            sourceNames={allSourceNames}
            datePicker={
              <DatePickerFilter
                dateRange={dateRange}
                onFromChange={setDateFrom}
                onToChange={setDateTo}
                onRangeChange={setDateRange}
                onClear={clearDate}
                hasDateFilter={hasDateFilter}
                open={openPicker === "date"}
                onOpenChange={(o) => setOpenPicker(o ? "date" : null)}
              />
            }
            tagBrowser={
              <TagBrowser
                allTags={allTags}
                activeTags={activeTags}
                onToggleTag={toggleTag}
                onClear={clearTags}
                hasActiveTags={hasActiveTagFilters}
                open={openPicker === "tags"}
                onOpenChange={(o) => setOpenPicker(o ? "tags" : null)}
              />
            }
          />
        </div>
      </div>

      {/* "More like this" banner */}
      {isSimilarMode && anchorItem && (
        <div className="shrink-0 border-b border-primary/20 bg-primary/5 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
          <div className="px-3 sm:px-4 py-2 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary shrink-0">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
              <path d="M8 11h6" />
              <path d="M11 8v6" />
            </svg>
            <span className="text-xs sm:text-[11px] text-foreground/80 truncate">
              Similar to: <strong className="font-semibold">{anchorItem.title}</strong>
            </span>
            <span className="text-[10px] text-muted-foreground/60 shrink-0">
              {similarItems?.length ?? 0} result{similarItems?.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={clearSimilar}
              className="ml-auto shrink-0 p-1 rounded hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <FeedFilterBar
        activeCategory={activeCategory}
        activeSource={activeSource}
        categoryCounts={categoryCounts}
        sourceChips={sourceChips}
        filteredCount={filteredItems.length}
        onCategoryChange={handleCategoryChange}
        onSourceChange={handleSourceChange}
      />

      <FeedContent
        items={visibleItems}
        newIds={newIds}
        filteredCount={displayItems.length}
        visibleCount={visibleCount}
        layout={layout}
        isLoading={isLoading}
        hasData={grouped.size > 0}
        onLoadMore={handleLoadMore}
        highlightQuery={filters.query.trim()}
        onSimilar={showSimilar}
        getItemTags={getItemTags}
        tagIndex={tagIndex}
        onTagClick={toggleTag}
      />

      <footer className="hidden sm:flex shrink-0 px-4 py-1 border-t border-border/30 bg-secondary/10 items-center justify-between text-[9px] text-muted-foreground/40 uppercase tracking-widest">
        <span>Auto-refresh 30s</span>
        <Link href="/changelog" className="hover:text-muted-foreground transition-colors">Changelog</Link>
        <span>LEB Monitor v1.0</span>
      </footer>
    </div>
    </TooltipProvider>
  );
}
