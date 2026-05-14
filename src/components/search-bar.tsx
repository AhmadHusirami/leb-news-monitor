"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import type { FeedCategory } from "@/config/feeds";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_ORDER,
} from "@/config/feeds";
import type { SearchFilters } from "@/hooks/use-search";
import type { ReactNode } from "react";
import { CustomSelect } from "@/components/ui/custom-select";
import { SingleDatePicker } from "@/components/ui/single-date-picker";

// Icons

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

// Props

interface SearchBarProps {
  filters: SearchFilters;
  onQueryChange: (q: string) => void;
  onCommitSearch: (q: string) => void;
  onFilterChange: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  recentSearches: string[];
  onRemoveRecent: (term: string) => void;
  onClearRecent: () => void;
  sourceNames: string[];
  /** Slot for the date picker rendered next to the Filters button */
  datePicker?: ReactNode;
  /** Slot for the tag browser rendered next to the date picker */
  tagBrowser?: ReactNode;
}

export function SearchBar({
  filters,
  onQueryChange,
  onCommitSearch,
  onFilterChange,
  onReset,
  hasActiveFilters,
  recentSearches,
  onRemoveRecent,
  onClearRecent,
  sourceNames,
  datePicker,
  tagBrowser,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showRecent, setShowRecent] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Close recent dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowRecent(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        onCommitSearch(filters.query);
        setShowRecent(false);
        inputRef.current?.blur();
      }
      if (e.key === "Escape") {
        setShowRecent(false);
        inputRef.current?.blur();
      }
    },
    [filters.query, onCommitSearch]
  );

  const handleRecentClick = useCallback(
    (term: string) => {
      onQueryChange(term);
      onCommitSearch(term);
      setShowRecent(false);
    },
    [onQueryChange, onCommitSearch]
  );

  const categoryOptions = useMemo(
    () => [
      { value: "all" as const, label: "All Categories" },
      ...CATEGORY_ORDER.map((cat) => ({
        value: cat,
        label: CATEGORY_LABELS[cat],
        color: CATEGORY_COLORS[cat],
      })),
    ],
    []
  );

  const sourceOptions = useMemo(
    () => [
      { value: "", label: "All Sources" },
      ...sourceNames.map((name) => ({ value: name, label: name })),
    ],
    [sourceNames]
  );

  const languageOptions = useMemo(
    () => [
      { value: "all" as const, label: "All Languages" },
      { value: "en" as const, label: "English" },
      { value: "ar" as const, label: "Arabic" },
    ],
    []
  );

  const hasImageOptions = useMemo(
    () => [
      { value: "any" as const, label: "Any" },
      { value: "yes" as const, label: "With image" },
      { value: "no" as const, label: "Without image" },
    ],
    []
  );

  const activeFilterCount = [
    filters.dateFrom,
    filters.dateTo,
    filters.category !== "all" ? filters.category : "",
    filters.source,
    filters.language !== "all" ? filters.language : "",
    filters.hasImage !== null ? "1" : "",
  ].filter(Boolean).length;

  return (
    <div>
      <div className="flex items-center gap-2" ref={containerRef}>
        {/* Search input */}
        <div className="relative flex-1 max-w-xl">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search articles..."
            value={filters.query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => setShowRecent(true)}
            onKeyDown={handleKeyDown}
            className="w-full h-8 pl-8 pr-8 rounded-md border border-border/50 bg-background/80 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-colors"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => {
                onQueryChange("");
                inputRef.current?.focus();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-pointer"
            >
              <XIcon />
            </button>
          )}

          {/* Recent searches dropdown */}
          {showRecent && recentSearches.length > 0 && !filters.query && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-md border border-border/50 bg-popover shadow-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/30">
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                  <ClockIcon />
                  Recent Searches
                </span>
                <button
                  type="button"
                  onClick={onClearRecent}
                  className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              </div>
              <div className="p-1.5 flex flex-wrap gap-1">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleRecentClick(term)}
                    className="group flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
                  >
                    <span>{term}</span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveRecent(term);
                      }}
                      className="opacity-0 group-hover:opacity-100 ml-0.5 hover:text-destructive transition-all cursor-pointer"
                    >
                      <XIcon className="w-2.5 h-2.5" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filter toggle button */}
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`shrink-0 h-8 px-2.5 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
            showFilters || activeFilterCount > 0
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          <FilterIcon />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-semibold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Date picker (slot) */}
        {datePicker}

        {/* Tag browser (slot) */}
        {tagBrowser}

        {/* Reset all */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="shrink-0 h-8 px-2.5 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      {/* Combined filter panel */}
      {showFilters && (
        <div className="mt-2 rounded-lg border border-border/40 bg-secondary/20 p-3 sm:p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {/* Date From */}
            <FilterField label="From">
              <SingleDatePicker
                value={filters.dateFrom}
                onChange={(v) => onFilterChange("dateFrom", v)}
                placeholder="Pick a date"
                maxIso={filters.dateTo || undefined}
              />
            </FilterField>

            {/* Date To */}
            <FilterField label="To">
              <SingleDatePicker
                value={filters.dateTo}
                onChange={(v) => onFilterChange("dateTo", v)}
                placeholder="Pick a date"
                minIso={filters.dateFrom || undefined}
              />
            </FilterField>

            {/* Category */}
            <FilterField label="Category">
              <CustomSelect<FeedCategory | "all">
                value={filters.category}
                onChange={(v) => onFilterChange("category", v)}
                options={categoryOptions}
              />
            </FilterField>

            {/* Source */}
            <FilterField label="Source">
              <CustomSelect<string>
                value={filters.source}
                onChange={(v) => onFilterChange("source", v)}
                options={sourceOptions}
                placeholder="All sources"
              />
            </FilterField>

            {/* Language */}
            <FilterField label="Language">
              <CustomSelect<"all" | "en" | "ar">
                value={filters.language}
                onChange={(v) => onFilterChange("language", v)}
                options={languageOptions}
              />
            </FilterField>

            {/* Has image */}
            <FilterField label="Image">
              <CustomSelect<"any" | "yes" | "no">
                value={
                  filters.hasImage === null
                    ? "any"
                    : filters.hasImage
                    ? "yes"
                    : "no"
                }
                onChange={(v) =>
                  onFilterChange("hasImage", v === "any" ? null : v === "yes")
                }
                options={hasImageOptions}
              />
            </FilterField>
          </div>

          {/* Active filter summary chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-border/30">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-medium mr-1">
                Active
              </span>
              {filters.dateFrom && (
                <FilterChip
                  label={`From: ${filters.dateFrom}`}
                  onRemove={() => onFilterChange("dateFrom", "")}
                />
              )}
              {filters.dateTo && (
                <FilterChip
                  label={`To: ${filters.dateTo}`}
                  onRemove={() => onFilterChange("dateTo", "")}
                />
              )}
              {filters.category !== "all" && (
                <FilterChip
                  label={CATEGORY_LABELS[filters.category]}
                  color={CATEGORY_COLORS[filters.category]}
                  onRemove={() => onFilterChange("category", "all")}
                />
              )}
              {filters.source && (
                <FilterChip
                  label={filters.source}
                  onRemove={() => onFilterChange("source", "")}
                />
              )}
              {filters.language !== "all" && (
                <FilterChip
                  label={filters.language === "en" ? "English" : "Arabic"}
                  onRemove={() => onFilterChange("language", "all")}
                />
              )}
              {filters.hasImage !== null && (
                <FilterChip
                  label={filters.hasImage ? "Has image" : "No image"}
                  onRemove={() => onFilterChange("hasImage", null)}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Small labeled wrapper for a single filter control inside the panel grid.

function FilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}

// Small filter chip used in the active filters summary in the SearchBar and in the source filter bar in the Feed component.

function FilterChip({
  label,
  color,
  onRemove,
}: {
  label: string;
  color?: string;
  onRemove: () => void;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary/80 text-muted-foreground border border-border/30"
      style={color ? { borderColor: `${color}40`, backgroundColor: `${color}15`, color } : undefined}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="hover:text-destructive transition-colors cursor-pointer ml-0.5"
      >
        <XIcon className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}
