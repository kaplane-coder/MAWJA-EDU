"use client";

import * as React from "react";
import Link from "next/link";
import { Stack, ArrowRight, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";

interface ClassroomHeaderProps {
  courseTitle: string;
  progressPercentage: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  onToggleSidebarMobile: () => void;
}

export function ClassroomHeader({
  courseTitle,
  progressPercentage,
  completedLessonsCount,
  totalLessonsCount,
  onToggleSidebarMobile,
}: ClassroomHeaderProps) {
  const isCompleted = progressPercentage === 100 && totalLessonsCount > 0;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-surface/90 backdrop-blur-md px-4 sm:px-6 h-16 flex items-center justify-between gap-4 select-none">
      {/* Right/Start: Back to My Courses & Brand Logo */}
      <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
        <Link
          href="/student/my-courses"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ArrowRight className="h-4 w-4" />
          <span className="hidden sm:inline">العودة لدوراتي</span>
        </Link>

        <span className="text-muted-foreground/40 hidden sm:inline">|</span>

        {/* Brand */}
        <div className="flex items-center shrink-0">
          <Logo size="sm" />
        </div>

        <span className="text-muted-foreground/40 hidden md:inline">/</span>

        {/* Course Title */}
        <h1 className="text-xs sm:text-sm font-bold text-foreground truncate max-w-xs sm:max-w-md lg:max-w-lg">
          {courseTitle}
        </h1>
      </div>

      {/* Left/End: Progress & Mobile Curriculum Toggle */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Progress Badge */}
        <div className="hidden sm:flex items-center gap-2">
          {isCompleted ? (
            <Badge variant="success" size="sm" className="gap-1 font-bold">
              <CheckCircle className="h-3 w-3" />
              <span>مكتملة 100%</span>
            </Badge>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="font-mono font-bold text-primary text-xs">
                {progressPercentage}%
              </span>
            </div>
          )}
        </div>

        {/* Mobile Curriculum Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleSidebarMobile}
          className="lg:hidden gap-1.5 text-xs font-semibold"
        >
          <Stack className="h-4 w-4 text-primary" />
          <span>المنهج ({completedLessonsCount}/{totalLessonsCount})</span>
        </Button>
      </div>
    </header>
  );
}
