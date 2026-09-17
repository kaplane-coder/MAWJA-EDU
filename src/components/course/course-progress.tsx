"use client";

import * as React from "react";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

interface CourseProgressProps {
  completedLessons: number;
  totalLessons: number;
  progressPercentage?: number;
  variant?: "compact" | "dashboard" | "classroom";
  className?: string;
}

export function CourseProgress({
  completedLessons,
  totalLessons,
  progressPercentage,
  variant = "dashboard",
  className,
}: CourseProgressProps) {
  const percentage =
    typeof progressPercentage === "number"
      ? progressPercentage
      : totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

  const isCompleted = percentage === 100 && totalLessons > 0;

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2 text-xs", className)}>
        <div className="h-1.5 w-20 sm:w-28 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              isCompleted ? "bg-success" : "bg-primary"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="font-mono font-bold text-foreground">{percentage}%</span>
      </div>
    );
  }

  if (variant === "classroom") {
    return (
      <div className={cn("space-y-1.5 text-right", className)}>
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground flex items-center gap-1">
            {isCompleted ? (
              <>
                <CheckCircle className="h-3.5 w-3.5 text-success" />
                <span className="text-success font-bold">دورة مكتملة</span>
              </>
            ) : (
              <span>
                {completedLessons} من {totalLessons} دروس مكتملة
              </span>
            )}
          </span>
          <span className="font-mono font-bold text-primary">{percentage}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isCompleted ? "bg-success" : "bg-primary shadow-xs"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  // Dashboard variant
  return (
    <div className={cn("space-y-2 text-right", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">
          {completedLessons} / {totalLessons} درساً
        </span>
        <span className="font-mono font-bold text-foreground">{percentage}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            isCompleted ? "bg-success" : "bg-primary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
