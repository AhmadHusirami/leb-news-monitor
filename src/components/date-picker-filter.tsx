"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { DateRange } from "@/hooks/use-date-filter";

// ── Helpers ───────────────────────────────────────────────────

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toIso(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function parseIso(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return { year: y, month: m - 1, day: d };
}

function formatDisplay(iso: string) {
  if (!iso) return "";
  const { year, month, day } = parseIso(iso);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[month]} ${day}, ${year}`;
}

function isSameDay(a: string, b: string) {
  return a === b;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ── Icons (inline SVG) ───────────────────────────────────────

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

// ── Presets ───────────────────────────────────────────────────

interface Preset {
  label: string;
  getRange: () => DateRange;
}

function getPresets(): Preset[] {
  const today = new Date();
  const iso = (d: Date) => toIso(d.getFullYear(), d.getMonth(), d.getDate());

  return [
    {
      label: "Today",
      getRange: () => ({ from: iso(today), to: iso(today) }),
    },
    {
      label: "Yesterday",
      getRange: () => {
        const d = new Date(today);
        d.setDate(d.getDate() - 1);
        return { from: iso(d), to: iso(d) };
      },
    },
    {
      label: "Last 3 days",
      getRange: () => {
        const d = new Date(today);
        d.setDate(d.getDate() - 2);
        return { from: iso(d), to: iso(today) };
      },
    },
    {
      label: "Last 7 days",
      getRange: () => {
        const d = new Date(today);
        d.setDate(d.getDate() - 6);
        return { from: iso(d), to: iso(today) };
      },
    },
    {
      label: "Last 30 days",
      getRange: () => {
        const d = new Date(today);
        d.setDate(d.getDate() - 29);
        return { from: iso(d), to: iso(today) };
      },
    },
    {
      label: "This month",
      getRange: () => {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        return { from: iso(start), to: iso(today) };
      },
    },
  ];
}

// ── Calendar Grid ─────────────────────────────────────────────

function CalendarGrid({
  year,
  month,
  range,
  onSelect,
}: {
  year: number;
  month: number;
  range: DateRange;
  onSelect: (iso: string) => void;
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayIso = toIso(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[9px] font-medium text-muted-foreground/50 uppercase py-1">
            {d}
          </div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`e-${i}`} className="h-7" />;
          }

          const iso = toIso(year, month, day);
          const isToday = iso === todayIso;
          const isFrom = range.from && isSameDay(iso, range.from);
          const isTo = range.to && isSameDay(iso, range.to);
          const isSelected = isFrom || isTo;

          // In range highlight
          let inRange = false;
          if (range.from && range.to) {
            inRange = iso > range.from && iso < range.to;
          }

          // Future dates disabled
          const isFuture = iso > todayIso;

          return (
            <button
              key={iso}
              type="button"
              disabled={isFuture}
              onClick={() => onSelect(iso)}
              className={`
                h-7 w-full text-[11px] rounded-md transition-colors relative cursor-pointer
                ${isFuture ? "text-muted-foreground/20 cursor-not-allowed" : "hover:bg-accent"}
                ${isSelected ? "bg-primary text-primary-foreground font-semibold hover:bg-primary/90" : ""}
                ${inRange ? "bg-primary/10" : ""}
                ${isToday && !isSelected ? "font-semibold text-primary" : ""}
                ${!isSelected && !inRange && !isToday && !isFuture ? "text-foreground/80" : ""}
              `}
            >
              {day}
              {isToday && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────

interface DatePickerFilterProps {
  dateRange: DateRange;
  onFromChange: (from: string) => void;
  onToChange: (to: string) => void;
  onRangeChange: (range: DateRange) => void;
  onClear: () => void;
  hasDateFilter: boolean;
  /** Optional controlled open state */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DatePickerFilter({
  dateRange,
  onFromChange,
  onToChange,
  onRangeChange,
  onClear,
  hasDateFilter,
  open: controlledOpen,
  onOpenChange,
}: DatePickerFilterProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (v: boolean) => {
    if (!isControlled) setUncontrolledOpen(v);
    onOpenChange?.(v);
  };
  const [selecting, setSelecting] = useState<"from" | "to">("from");
  const containerRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const presets = useMemo(() => getPresets(), []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleDaySelect = useCallback(
    (iso: string) => {
      if (selecting === "from") {
        onFromChange(iso);
        // If current "to" is before the new "from", clear it
        if (dateRange.to && iso > dateRange.to) {
          onToChange("");
        }
        setSelecting("to");
      } else {
        // If picked date is before "from", swap
        if (dateRange.from && iso < dateRange.from) {
          onRangeChange({ from: iso, to: dateRange.from });
        } else {
          onToChange(iso);
        }
        setSelecting("from");
      }
    },
    [selecting, dateRange, onFromChange, onToChange, onRangeChange]
  );

  const handlePreset = useCallback(
    (preset: Preset) => {
      const range = preset.getRange();
      onRangeChange(range);
      // Navigate calendar to the "from" month
      const { year, month } = parseIso(range.from);
      setViewYear(year);
      setViewMonth(month);
      setSelecting("from");
    },
    [onRangeChange, setViewYear, setViewMonth]
  );

  const prevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, [setViewYear]);

  const nextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, [setViewYear]);

  const displayText = useMemo(() => {
    if (!dateRange.from && !dateRange.to) return null;
    if (dateRange.from && dateRange.to) {
      if (dateRange.from === dateRange.to) return `On ${formatDisplay(dateRange.from)}`;
      return `${formatDisplay(dateRange.from)} to ${formatDisplay(dateRange.to)}`;
    }
    if (dateRange.from) return `After ${formatDisplay(dateRange.from)}`;
    return `Before ${formatDisplay(dateRange.to)}`;
  }, [dateRange]);

  return (
    <div className="shrink-0 relative" ref={containerRef}>
      {/* Trigger button */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`h-8 px-3 rounded-md border text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
            open || hasDateFilter
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border/50 bg-background/80 text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          <CalendarIcon />
          {displayText ? (
            <span className="max-w-[220px] truncate">{displayText}</span>
          ) : (
            <span>Pick a date</span>
          )}
        </button>

        {hasDateFilter && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer"
          >
            <XIcon />
          </button>
        )}
      </div>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full right-0 mt-1.5 z-50 rounded-lg border border-border/50 bg-popover shadow-xl overflow-hidden flex">
          {/* Presets sidebar */}
          <div className="w-[120px] border-r border-border/30 bg-secondary/20 py-2 px-1.5 flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-medium px-2 pb-1">
              Quick Select
            </span>
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePreset(preset)}
                className="text-left px-2 py-1.5 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Calendar body */}
          <div className="p-3 w-[260px]">
            {/* Month/year nav */}
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={prevMonth}
                className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <ChevronLeft />
              </button>
              <span className="text-xs font-semibold text-foreground">
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <ChevronRight />
              </button>
            </div>

            {/* Calendar grid */}
            <CalendarGrid
              year={viewYear}
              month={viewMonth}
              range={dateRange}
              onSelect={handleDaySelect}
            />

            {/* From / To indicator */}
            <div className="mt-2.5 pt-2 border-t border-border/30 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelecting("from")}
                className={`flex-1 rounded-md px-2 py-1.5 text-center text-[10px] font-medium transition-colors cursor-pointer border ${
                  selecting === "from"
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border/30 text-muted-foreground hover:border-border/60"
                }`}
              >
                <div className="text-[8px] uppercase tracking-wider opacity-60 mb-0.5">From</div>
                {dateRange.from ? formatDisplay(dateRange.from) : "—"}
              </button>
              <span className="text-muted-foreground/30 text-[10px]">→</span>
              <button
                type="button"
                onClick={() => setSelecting("to")}
                className={`flex-1 rounded-md px-2 py-1.5 text-center text-[10px] font-medium transition-colors cursor-pointer border ${
                  selecting === "to"
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border/30 text-muted-foreground hover:border-border/60"
                }`}
              >
                <div className="text-[8px] uppercase tracking-wider opacity-60 mb-0.5">To</div>
                {dateRange.to ? formatDisplay(dateRange.to) : "—"}
              </button>
            </div>

            {/* Actions */}
            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  onClear();
                  setSelecting("from");
                }}
                className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-[11px] font-medium hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
