"use client";

import { useCallback, useSyncExternalStore } from "react";

const DISMISSED_KEY = "lebmon-banner-dismissed-v1";

function getIsDismissed(): boolean {
  return localStorage.getItem(DISMISSED_KEY) === "1";
}

function getServerSnapshot(): boolean {
  return true; // hidden on server to avoid flash
}

let listeners: Array<() => void> = [];

function subscribe(cb: () => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

export function AnnouncementBanner() {
  const isDismissed = useSyncExternalStore(subscribe, getIsDismissed, getServerSnapshot);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, "1");
    for (const l of listeners) l();
  }, []);

  if (isDismissed) return null;

  return (
    <div className="shrink-0 bg-primary/10 border-b border-primary/20 px-3 py-2 sm:px-4 sm:py-2 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] sm:text-xs text-foreground/80 leading-snug">
          <span className="font-semibold text-primary">New!</span>{" "}
          <span className="hidden sm:inline">
            LEB Monitor is now live at{" "}
            <a
              href="https://lebmonitor.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              lebmonitor.com
            </a>
            . We&apos;re always working on improving this project to bring you the latest news in the best way possible.
          </span>
          <span className="sm:hidden">
            We&apos;re now on{" "}
            <a
              href="https://lebmonitor.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-2"
            >
              lebmonitor.com
            </a>
            {" "}&mdash; always improving to bring you the best experience.
          </span>
        </p>

        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors cursor-pointer"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
