"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import type { EntityType, TagInfo } from "@/lib/entity-extractor";

/* ── Icons ────────────────────────────────────────────────────── */
function PersonIcon({ className }: { className?: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function PlaceIcon({ className }: { className?: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function OrgIcon({ className }: { className?: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  );
}

function ChevronIcon({ up, className }: { up?: boolean; className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ transform: up ? "rotate(180deg)" : undefined }}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function TypeBadgeIcon({ type }: { type: EntityType }) {
  switch (type) {
    case "person": return <PersonIcon />;
    case "place": return <PlaceIcon />;
    case "org": return <OrgIcon />;
  }
}

const TYPE_COLORS: Record<EntityType, string> = {
  person: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  place: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  org: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

const TYPE_ACTIVE_COLORS: Record<EntityType, string> = {
  person: "bg-blue-500/30 text-blue-700 dark:text-blue-300 border-blue-500/40 ring-1 ring-blue-500/30",
  place: "bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/30",
  org: "bg-amber-500/30 text-amber-700 dark:text-amber-300 border-amber-500/40 ring-1 ring-amber-500/30",
};

const TYPE_LABELS: Record<EntityType, string> = {
  person: "People",
  place: "Places",
  org: "Organizations",
};

/* ── Props ────────────────────────────────────────────────────── */
interface TagBrowserProps {
  allTags: TagInfo[];
  activeTags: Set<string>;
  onToggleTag: (tag: string) => void;
  onClear: () => void;
  hasActiveTags: boolean;
  /** Optional controlled open state */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/* ── Component ────────────────────────────────────────────────── */
export function TagBrowser({
  allTags,
  activeTags,
  onToggleTag,
  onClear,
  hasActiveTags,
  open: controlledOpen,
  onOpenChange,
}: TagBrowserProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;
  const setIsOpen = (v: boolean) => {
    if (!isControlled) setUncontrolledOpen(v);
    onOpenChange?.(v);
  };
  const containerRef = useRef<HTMLDivElement>(null);
  const [typeFilter, setTypeFilter] = useState<EntityType | "all">("all");
  const [showAll, setShowAll] = useState(false);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const filteredTags = useMemo(() => {
    if (typeFilter === "all") return allTags;
    return allTags.filter((t) => t.type === typeFilter);
  }, [allTags, typeFilter]);

  const displayTags = showAll ? filteredTags : filteredTags.slice(0, 30);

  const typeCounts = useMemo(() => {
    const counts: Record<EntityType, number> = { person: 0, place: 0, org: 0 };
    for (const t of allTags) counts[t.type]++;
    return counts;
  }, [allTags]);

  if (allTags.length === 0) return null;

  return (
    <div className="relative" ref={containerRef}>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`shrink-0 h-8 px-2.5 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
          isOpen || hasActiveTags
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border/50 bg-background/80 text-muted-foreground hover:text-foreground hover:border-border"
        }`}
      >
        <TagIcon />
        <span>Tags</span>
        {hasActiveTags && (
          <span className="ml-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-semibold">
            {activeTags.size}
          </span>
        )}
        <ChevronIcon up={isOpen} className="opacity-60" />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute top-full mt-1 right-0 z-50 w-[340px] sm:w-[380px] max-h-[70vh] overflow-hidden rounded-lg border border-border/60 bg-popover shadow-lg flex flex-col">
          {/* Header */}
          <div className="px-3 py-2 border-b border-border/40 flex items-center justify-between">
            <span className="text-xs font-medium text-foreground/80">
              Entity Tags
              <span className="ml-1 text-muted-foreground/50 font-normal">({allTags.length})</span>
            </span>
            {hasActiveTags && (
              <button
                onClick={onClear}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Type filter tabs */}
          <div className="px-3 py-1.5 border-b border-border/30 flex items-center gap-1">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                typeFilter === "all"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {(["person", "place", "org"] as EntityType[]).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                  typeFilter === type
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TypeBadgeIcon type={type} />
                {TYPE_LABELS[type]}
                <span className="text-muted-foreground/50 ml-0.5">{typeCounts[type]}</span>
              </button>
            ))}
          </div>

          {/* Active tags */}
          {hasActiveTags && (
            <div className="px-3 py-2 border-b border-border/30 bg-accent/20">
              <div className="text-[10px] text-muted-foreground/60 mb-1">Active filters:</div>
              <div className="flex flex-wrap gap-1">
                {[...activeTags].map((tag) => {
                  const info = allTags.find((t) => t.tag === tag);
                  if (!info) return null;
                  return (
                    <button
                      key={tag}
                      onClick={() => onToggleTag(tag)}
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border transition-colors cursor-pointer ${TYPE_ACTIVE_COLORS[info.type]}`}
                    >
                      <TypeBadgeIcon type={info.type} />
                      {tag}
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5 opacity-60">
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tag grid */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            <div className="flex flex-wrap gap-1">
              {displayTags.map(({ tag, type, count }) => {
                const isActive = activeTags.has(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => onToggleTag(tag)}
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border transition-colors cursor-pointer ${
                      isActive ? TYPE_ACTIVE_COLORS[type] : TYPE_COLORS[type]
                    } hover:opacity-80`}
                  >
                    <TypeBadgeIcon type={type} />
                    {tag}
                    <span className="opacity-50">{count}</span>
                  </button>
                );
              })}
            </div>

            {filteredTags.length > 30 && (
              <button
                onClick={() => setShowAll((v) => !v)}
                className="mt-2 w-full text-center text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {showAll ? "Show fewer" : `Show all ${filteredTags.length} tags`}
              </button>
            )}

            {filteredTags.length === 0 && (
              <p className="text-[10px] text-muted-foreground/50 text-center py-4">
                No tags found for this type.
              </p>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-3 py-1.5 border-t border-border/30 text-[9px] text-muted-foreground/40">
            Click tags to add/remove filters — multiple tags can be active
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Inline tag chips for article cards ───────────────────────── */
interface ArticleTagsProps {
  tags: string[];
  tagIndex: Map<string, TagInfo>;
  onTagClick?: (tag: string) => void;
}

export function ArticleTags({ tags, tagIndex, onTagClick }: ArticleTagsProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-0.5 mt-1.5">
      {tags.slice(0, 4).map((tag) => {
        const info = tagIndex.get(tag);
        const type = info?.type ?? "org";
        return (
          <button
            key={tag}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onTagClick?.(tag);
            }}
            className={`inline-flex items-center gap-0.5 px-1 py-px rounded text-[9px] font-medium border transition-colors cursor-pointer ${TYPE_COLORS[type]} hover:opacity-80`}
          >
            <TypeBadgeIcon type={type} />
            {tag}
          </button>
        );
      })}
      {tags.length > 4 && (
        <span className="text-[9px] text-muted-foreground/40 self-center ml-0.5">
          +{tags.length - 4}
        </span>
      )}
    </div>
  );
}
