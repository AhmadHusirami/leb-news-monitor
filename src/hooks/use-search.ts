"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import type { FeedItem } from "@/app/api/feeds/route";
import type { FeedCategory } from "@/config/feeds";

// Recent searches are stored in localStorage and shared across tabs via useSyncExternalStore.

const STORAGE_KEY = "lebmon-recent-searches";
const MAX_RECENT = 8;

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]).slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function saveRecent(list: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
}

const EMPTY_RECENT: string[] = [];
let recentCache: string[] = EMPTY_RECENT;
let recentInit = false;
let recentListeners: Array<() => void> = [];

function getRecentSnapshot(): string[] {
  if (!recentInit) {
    recentCache = loadRecent();
    recentInit = true;
  }
  return recentCache;
}
function getRecentServerSnapshot(): string[] {
  return EMPTY_RECENT;
}
function subscribeRecent(cb: () => void) {
  recentListeners.push(cb);
  return () => {
    recentListeners = recentListeners.filter((l) => l !== cb);
  };
}
function emitRecentChange() {
  recentCache = loadRecent();
  for (const l of recentListeners) l();
}

function addRecent(term: string) {
  const trimmed = term.trim();
  if (!trimmed) return;
  const list = loadRecent().filter((t) => t !== trimmed);
  list.unshift(trimmed);
  saveRecent(list);
  emitRecentChange();
}

function removeRecent(term: string) {
  const list = loadRecent().filter((t) => t !== term);
  saveRecent(list);
  emitRecentChange();
}

function clearRecent() {
  saveRecent([]);
  emitRecentChange();
}

// Search filters and logic

export interface SearchFilters {
  query: string;
  dateFrom: string; // ISO date string or ""
  dateTo: string;
  category: FeedCategory | "all";
  source: string; // source name or ""
  language: "all" | "en" | "ar";
  hasImage: boolean | null; // null = either
}

export const DEFAULT_FILTERS: SearchFilters = {
  query: "",
  dateFrom: "",
  dateTo: "",
  category: "all",
  source: "",
  language: "all",
  hasImage: null,
};

// ── RTL detection (reuse from feed-card) ──────────────────────
const RTL_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

function detectLang(text: string): "ar" | "en" {
  // Count RTL characters
  const rtlChars = (text.match(RTL_REGEX) || []).length;
  return rtlChars > text.length * 0.3 ? "ar" : "en";
}

// Filter items based on active search filters

export function applySearchFilters(
  items: FeedItem[],
  filters: SearchFilters
): FeedItem[] {
  const q = filters.query.trim().toLowerCase();

  return items.filter((item) => {
    // Keyword search across title + snippet
    if (q) {
      const text = `${item.title} ${item.snippet}`.toLowerCase();
      if (!text.includes(q)) return false;
    }

    // Date range
    if (filters.dateFrom) {
      const itemDate = new Date(item.pubDate);
      if (!isNaN(itemDate.getTime()) && itemDate < new Date(filters.dateFrom)) return false;
    }
    if (filters.dateTo) {
      const itemDate = new Date(item.pubDate);
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      if (!isNaN(itemDate.getTime()) && itemDate > to) return false;
    }

    // Category
    if (filters.category !== "all" && item.sourceCategory !== filters.category) return false;

    // Source
    if (filters.source && item.source !== filters.source) return false;

    // Language
    if (filters.language !== "all") {
      const lang = detectLang(item.title);
      if (lang !== filters.language) return false;
    }

    // Has image
    if (filters.hasImage === true && !item.image) return false;
    if (filters.hasImage === false && item.image) return false;

    return true;
  });
}

// ── Hook ──────────────────────────────────────────────────────

export function useSearch() {
  const recentSearches = useSyncExternalStore(
    subscribeRecent,
    getRecentSnapshot,
    getRecentServerSnapshot
  );

  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);

  const setQuery = useCallback((q: string) => {
    setFilters((prev) => ({ ...prev, query: q }));
  }, []);

  const commitSearch = useCallback((q: string) => {
    const trimmed = q.trim();
    if (trimmed) addRecent(trimmed);
  }, []);

  const updateFilter = useCallback(
    <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters =
    filters.query.trim() !== "" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== "" ||
    filters.category !== "all" ||
    filters.source !== "" ||
    filters.language !== "all" ||
    filters.hasImage !== null;

  return {
    filters,
    setQuery,
    commitSearch,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    recentSearches,
    removeRecent,
    clearRecent,
  };
}
