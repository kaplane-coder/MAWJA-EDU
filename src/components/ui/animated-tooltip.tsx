"use client";

import React, { useState } from "react";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
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
  const [mounted, setMounted] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<string | null>(null);
  const springConfig = { stiffness: 100, damping: 15 };
  const x = useMotionValue(0);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Rotate tooltip smoothly based on cursor offset
  const rotate = useSpring(
    useTransform(x, [-50, 50], [-20, 20]),
    springConfig
  );
  const translateX = useSpring(
    useTransform(x, [-50, 50], [-25, 25]),
    springConfig
  );

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    if (!target) return;
    const halfWidth = target.offsetWidth / 2;
    const offsetX = typeof event.nativeEvent?.offsetX === "number" ? event.nativeEvent.offsetX : halfWidth;
    x.set(offsetX - halfWidth);
  };

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
          onMouseEnter={() => mounted && setHoveredIndex(itemKey)}
          onMouseLeave={() => setHoveredIndex(null)}
          onMouseMove={handleMouseMove}
        >
          <AnimatePresence mode="wait">
            {hoveredIndex === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.7 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  },
                }}
                exit={{ opacity: 0, y: 10, scale: 0.7 }}
                style={{
                  translateX: translateX,
                  rotate: rotate,
                  whiteSpace: "nowrap",
                }}
                className="absolute -top-14 start-1/2 -translate-x-1/2 flex flex-col items-center justify-center rounded-xl bg-foreground text-background px-3 py-1.5 text-xs shadow-xl z-50 pointer-events-none"
              >
                <div className="font-bold text-xs leading-none">{item.name}</div>
                {item.designation && (
                  <div className="text-[10px] text-background/80 mt-0.5 font-medium">
                    {item.designation}
                  </div>
                )}
                {/* Micro caret */}
                <div className="absolute -bottom-1 start-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-foreground" />
              </motion.div>
            )}
          </AnimatePresence>

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
