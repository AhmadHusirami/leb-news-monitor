"use client";

import { ALargeSmall } from "lucide-react";
import { useFontSize } from "@/hooks/use-font-size";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const LABELS = {
  small: "S",
  medium: "M",
  large: "L",
  xlarge: "XL",
} as const;

const TOOLTIP_LABELS = {
  small: "Font size: Small",
  medium: "Font size: Medium",
  large: "Font size: Large",
  xlarge: "Font size: Extra Large",
} as const;

export function FontSizeToggle() {
  const { fontSize, cycleFontSize } = useFontSize();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={cycleFontSize}
          className="flex items-center gap-1 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors cursor-pointer"
        >
          <ALargeSmall size={14} />
          <span className="text-[9px] font-bold uppercase tracking-wider w-4 text-center">
            {LABELS[fontSize]}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {TOOLTIP_LABELS[fontSize]}
      </TooltipContent>
    </Tooltip>
  );
}
