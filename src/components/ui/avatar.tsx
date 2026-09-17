"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

export function Avatar({
  src,
  alt = "صورة المستخدم",
  fallback = "م",
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const safeFallback =
    typeof fallback === "string" && fallback.trim().length > 0
      ? fallback.trim().slice(0, 2)
      : "م";

  const isValidSrc =
    typeof src === "string" &&
    src.trim().length > 0 &&
    (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/"));

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted font-medium text-muted-foreground",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {isValidSrc && !imageError ? (
        <Image
          src={src}
          alt={alt || "صورة المستخدم"}
          fill
          className="aspect-square h-full w-full object-cover"
          onError={() => setImageError(true)}
          sizes="(max-width: 768px) 64px, 64px"
          unoptimized={typeof src === "string" && src.startsWith("http")}
        />
      ) : (
        <span className="uppercase select-none">{safeFallback}</span>
      )}
    </div>
  );
}
