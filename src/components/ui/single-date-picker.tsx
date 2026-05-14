"use client";

import { useEffect, useRef, useState, useCallback } from "react";

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
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[month]} ${day}, ${year}`;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ── Icons ─────────────────────────────────────────────────────

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
    <svg className={className} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

// ── Calendar Grid ─────────────────────────────────────────────

function CalendarGrid({
  year,
  month,
  selected,
  minIso,
  maxIso,
  onSelect,
}: {
  year: number;
  month: number;
  selected: string;
  minIso?: string;
  maxIso?: string;
  onSelect: (iso: string) => void;
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayIso = toIso(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[9px] font-medium text-muted-foreground/50 uppercase py-1"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`e-${i}`} className="h-7" />;
          }
          const iso = toIso(year, month, day);
          const isToday = iso === todayIso;
          const isSelected = iso === selected;
          const isFuture = iso > todayIso;
          const beforeMin = !!minIso && iso < minIso;
          const afterMax = !!maxIso && iso > maxIso;
          const disabled = isFuture || beforeMin || afterMax;

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(iso)}
              className={`
                h-7 w-full text-[11px] rounded-md transition-colors relative cursor-pointer
                ${disabled ? "text-muted-foreground/20 cursor-not-allowed" : "hover:bg-accent"}
                ${isSelected ? "bg-primary text-primary-foreground font-semibold hover:bg-primary/90" : ""}
                ${isToday && !isSelected ? "font-semibold text-primary" : ""}
                ${!isSelected && !isToday && !disabled ? "text-foreground/80" : ""}
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

// ── Component ─────────────────────────────────────────────────

interface SingleDatePickerProps {
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  /** Min date as ISO yyyy-mm-dd (inclusive) */
  minIso?: string;
  /** Max date as ISO yyyy-mm-dd (inclusive) */
  maxIso?: string;
  className?: string;
}

export function SingleDatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  minIso,
  maxIso,
  className = "",
}: SingleDatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const initial = value ? parseIso(value) : null;
  const [viewYear, setViewYear] = useState(initial?.year ?? now.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial?.month ?? now.getMonth());

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  const handleSelect = useCallback(
    (iso: string) => {
      onChange(iso);
      setOpen(false);
    },
    [onChange]
  );

  const prevMonth = () => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  };

  const nextMonth = () => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`h-7 w-full pl-2 pr-2 rounded border text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer ${
          open
            ? "border-primary/40 bg-primary/10 text-primary"
            : value
            ? "border-border/50 bg-background/80 text-foreground hover:border-border"
            : "border-border/50 bg-background/80 text-muted-foreground/60 hover:text-foreground hover:border-border"
        }`}
      >
        <CalendarIcon className="shrink-0 opacity-70" />
        <span className="flex-1 truncate text-left">
          {value ? formatDisplay(value) : placeholder}
        </span>
        {value && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onChange("");
              }
            }}
            className="ml-0.5 text-muted-foreground/40 hover:text-foreground transition-colors cursor-pointer"
          >
            <XIcon />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 rounded-lg border border-border/50 bg-popover shadow-xl overflow-hidden">
          <div className="p-3 w-[260px]">
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

            <CalendarGrid
              year={viewYear}
              month={viewMonth}
              selected={value}
              minIso={minIso}
              maxIso={maxIso}
              onSelect={handleSelect}
            />
          </div>
        </div>
      )}
    </div>
  );
}
