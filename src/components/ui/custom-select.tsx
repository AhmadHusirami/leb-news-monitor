"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface CustomSelectOption<T extends string> {
  value: T;
  label: string;
  /** Optional accent color used for a small dot beside the label */
  color?: string;
}

interface CustomSelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: CustomSelectOption<T>[];
  placeholder?: string;
  className?: string;
  /** Restrict popover width; defaults to matching trigger */
  menuWidth?: number;
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function CustomSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder = "Select…",
  className = "",
  menuWidth,
}: CustomSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handlePick = useCallback(
    (v: T) => {
      onChange(v);
      setOpen(false);
    },
    [onChange]
  );

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`h-7 w-full pl-2 pr-7 rounded border text-[11px] font-medium flex items-center justify-between gap-1.5 transition-colors cursor-pointer ${
          open
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border/50 bg-background/80 text-foreground hover:border-border"
        }`}
      >
        <span className="flex items-center gap-1.5 truncate">
          {selected?.color && (
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: selected.color }}
            />
          )}
          <span className="truncate">
            {selected ? selected.label : <span className="text-muted-foreground/50">{placeholder}</span>}
          </span>
        </span>
        <ChevronDown
          className={`absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-50 rounded-md border border-border/50 bg-popover shadow-xl overflow-hidden"
          style={{ minWidth: menuWidth ?? "100%" }}
        >
          <div className="max-h-[240px] overflow-y-auto py-1">
            {options.map((opt) => {
              const isActive = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handlePick(opt.value)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] text-left transition-colors cursor-pointer ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-accent"
                  }`}
                >
                  {opt.color && (
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: opt.color }}
                    />
                  )}
                  <span className="flex-1 truncate">{opt.label}</span>
                  {isActive && <CheckIcon className="text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
