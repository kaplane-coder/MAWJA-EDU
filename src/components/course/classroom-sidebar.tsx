"use client";

import * as React from "react";
import {
  CheckCircle,
  PlayCircle,
  Circle,
  FileText,
  Question,
  Paperclip,
  CaretDown,
  CaretUp,
  X,
  Stack,
} from "@phosphor-icons/react/dist/ssr";
import { CourseProgress } from "./course-progress";
import { cn } from "@/lib/utils";
import type { ClassroomSectionItem } from "@/lib/learning";

interface ClassroomSidebarProps {
  sections: ClassroomSectionItem[];
  currentLessonId: string;
  completedLessonsCount: number;
  totalLessonsCount: number;
  progressPercentage: number;
  onSelectLesson: (lessonId: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  className?: string;
}

export function ClassroomSidebar({
  sections,
  currentLessonId,
  completedLessonsCount,
  totalLessonsCount,
  progressPercentage,
  onSelectLesson,
  isOpenMobile = false,
  onCloseMobile,
  className,
}: ClassroomSidebarProps) {
  // Track open/collapsed state of sections
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    sections.forEach((sec) => {
      map[sec.id] = true;
    });
    return map;
  });

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "VIDEO":
        return <PlayCircle className="h-4 w-4 shrink-0" />;
      case "ARTICLE":
        return <FileText className="h-4 w-4 shrink-0" />;
      case "QUIZ":
        return <Question className="h-4 w-4 shrink-0" />;
      case "ATTACHMENT":
        return <Paperclip className="h-4 w-4 shrink-0" />;
      default:
        return <PlayCircle className="h-4 w-4 shrink-0" />;
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface text-right select-none">
      {/* Sidebar Header with Progress */}
      <div className="p-5 border-b border-border/80 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
            <Stack className="h-4 w-4 text-primary" />
            <span>منهج ومحتوى الدورة</span>
          </h3>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden rounded-lg p-1.5 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              aria-label="إغلاق القائمة"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <CourseProgress
          completedLessons={completedLessonsCount}
          totalLessons={totalLessonsCount}
          progressPercentage={progressPercentage}
          variant="classroom"
        />
      </div>

      {/* Sections & Lessons Accordion */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/60">
        {sections.map((section, sIdx) => {
          const isOpen = openSections[section.id] !== false;
          const sectionCompletedCount = section.lessons.filter((l) => l.completed).length;

          return (
            <div key={section.id} className="border-b border-border/40 last:border-b-0">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 transition-colors text-right"
              >
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-foreground">
                    {sIdx + 1}. {section.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    {sectionCompletedCount} / {section.lessons.length} مكتمل
                  </p>
                </div>

                <div className="text-muted-foreground">
                  {isOpen ? (
                    <CaretUp className="h-4 w-4" />
                  ) : (
                    <CaretDown className="h-4 w-4" />
                  )}
                </div>
              </button>

              {/* Section Lessons List */}
              {isOpen && (
                <div className="bg-surface divide-y divide-border/30">
                  {section.lessons.map((lesson) => {
                    const isCurrent = lesson.id === currentLessonId;

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          onSelectLesson(lesson.id);
                          if (onCloseMobile) onCloseMobile();
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-3.5 px-4 text-xs transition-all text-right",
                          isCurrent
                            ? "bg-primary/10 text-primary font-bold border-r-4 border-primary"
                            : "text-foreground/90 hover:bg-muted/30"
                        )}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          {/* Completion / Status Icon */}
                          {lesson.completed ? (
                            <CheckCircle className="h-4 w-4 text-success shrink-0" />
                          ) : isCurrent ? (
                            <PlayCircle className="h-4 w-4 text-primary animate-pulse shrink-0" />
                          ) : (
                            <Circle className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                          )}

                          <div className="flex items-center gap-2 truncate">
                            {getLessonIcon(lesson.content_type)}
                            <span className="truncate">{lesson.title}</span>
                          </div>
                        </div>

                        {/* Duration */}
                        {lesson.duration_seconds > 0 && (
                          <span className="text-[10px] font-mono text-muted-foreground shrink-0 mr-2">
                            {Math.ceil(lesson.duration_seconds / 60)} د
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Panel */}
      <aside
        className={cn(
          "hidden lg:flex flex-col w-80 shrink-0 border-r border-border h-full bg-surface shadow-xs",
          className
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-fade-in"
            onClick={onCloseMobile}
          />
          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-surface shadow-2xl animate-slide-up border-l border-border">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
