"use client";

import * as React from "react";
import { X, CheckCircle, WarningCircle, Info, Warning } from "@phosphor-icons/react/dist/ssr";
import { useToast, ToastItem } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const toastIcons = {
  default: Info,
  success: CheckCircle,
  warning: Warning,
  error: WarningCircle,
  info: Info,
};

const toastColors = {
  default: "bg-surface border-border text-foreground",
  success: "bg-surface border-success/30 text-foreground [&_svg]:text-success",
  warning: "bg-surface border-warning/30 text-foreground [&_svg]:text-warning",
  error: "bg-surface border-error/30 text-foreground [&_svg]:text-error",
  info: "bg-surface border-info/30 text-foreground [&_svg]:text-info",
};

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="الإشعارات"
      className="fixed bottom-4 left-4 z-50 flex max-h-screen w-full max-w-sm flex-col gap-2 pointer-events-none"
    >
      {toasts.map((item: ToastItem) => {
        const IconComponent = toastIcons[item.variant || "default"];
        return (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg transition-all animate-slide-up text-right",
              toastColors[item.variant || "default"]
            )}
          >
            <IconComponent className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              {item.title && (
                <p className="text-sm font-bold leading-tight">{item.title}</p>
              )}
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
            <button
              onClick={() => dismiss(item.id)}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="إغلاق الإشعار"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
