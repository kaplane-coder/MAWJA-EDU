import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary border border-primary/20",
        secondary:
          "bg-secondary text-secondary-foreground border border-border",
        success:
          "bg-success-subtle text-success border border-success/20",
        warning:
          "bg-warning-subtle text-warning-foreground border border-warning/30",
        error:
          "bg-error-subtle text-error border border-error/20",
        info:
          "bg-info-subtle text-info border border-info/20",
        outline:
          "border border-border text-foreground bg-transparent",
        bestseller:
          "bg-amber-500/15 text-amber-700 border border-amber-500/30 font-bold",
        exclusive:
          "bg-primary text-primary-foreground font-bold shadow-xs",
        new:
          "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 font-bold",
      },
      size: {
        sm: "px-2 py-0.2 text-[11px]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
