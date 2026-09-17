import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  href?: string | null;
}

const sizeMap = {
  sm: { width: 110, height: 24, className: "h-6 w-auto" },
  md: { width: 135, height: 29, className: "h-7 sm:h-8 w-auto" },
  lg: { width: 165, height: 35, className: "h-9 sm:h-10 w-auto" },
  xl: { width: 210, height: 45, className: "h-11 sm:h-12 w-auto" },
};

export function Logo({ className, size = "md", href = "/" }: LogoProps) {
  const config = sizeMap[size];

  const image = (
    <Image
      src="/images/logo.png"
      alt="MAWJA — موجة"
      width={config.width}
      height={config.height}
      className={cn(config.className, "object-contain shrink-0 transition-transform duration-200 group-hover:scale-105")}
      priority
    />
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn("inline-flex items-center group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg", className)}
      >
        {image}
      </Link>
    );
  }

  return (
    <div className={cn("inline-flex items-center group shrink-0", className)}>
      {image}
    </div>
  );
}
