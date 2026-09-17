import * as React from "react";
import { CircleNotch } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

export function Spinner({ size = "md", className, ...props }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="جاري التحميل..."
      className={cn("flex items-center justify-center text-primary", className)}
      {...props}
    >
      <CircleNotch className={cn("animate-spin", sizeClasses[size])} />
      <span className="sr-only">جاري التحميل...</span>
    </div>
  );
}
