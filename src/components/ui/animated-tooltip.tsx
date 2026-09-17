"use client";

import * as React from "react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface TooltipItem {
  id: string;
  name: string;
  designation?: string | null;
  image?: string | null;
}

export interface AnimatedTooltipProps {
  items: TooltipItem[];
  className?: string;
}

export const AnimatedTooltip = ({ items, className }: AnimatedTooltipProps) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {items.map((item, index) => {
        const itemKey = item.id || `tooltip-${index}`;
        return (
          <div
            className="relative group"
            key={itemKey}
          >
            {/* Tooltip Popup (Pure CSS hover) */}
            <div
              className="absolute -top-14 start-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center justify-center rounded-xl bg-foreground text-background px-3 py-1.5 text-xs shadow-xl z-50 pointer-events-none whitespace-nowrap animate-fade-in"
            >
              <div className="font-bold text-xs leading-none">{item.name}</div>
              {item.designation && (
                <div className="text-[10px] text-background/80 mt-0.5 font-medium">
                  {item.designation}
                </div>
              )}
              {/* Micro caret */}
              <div className="absolute -bottom-1 start-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-foreground" />
            </div>

            <div className="relative rounded-full ring-2 ring-background transition-transform duration-200 group-hover:scale-110 group-hover:z-30 cursor-pointer">
              <Avatar
                src={item.image || undefined}
                alt={item.name}
                fallback={item.name}
                size="md"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnimatedTooltip;

