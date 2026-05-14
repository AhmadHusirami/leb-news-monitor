"use client";

import { useLayout } from "@/hooks/use-layout";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export function LayoutToggle() {
  const { layout, toggleLayout } = useLayout();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={toggleLayout}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors cursor-pointer"
        >
          {layout === "grid" ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {layout === "grid" ? "List view" : "Grid view"}
      </TooltipContent>
    </Tooltip>
  );
}
