"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Trophy,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { markLessonCompleteAction } from "@/actions/learning";

interface ClassroomFooterProps {
  currentLessonId: string;
  isCurrentLessonCompleted: boolean;
  previousLesson: { id: string; title: string } | null;
  nextLesson: { id: string; title: string } | null;
  isCourseCompleted: boolean;
  onSelectLesson: (lessonId: string) => void;
  onCompleteCurrentLesson: () => void;
}

export function ClassroomFooter({
  currentLessonId,
  isCurrentLessonCompleted,
  previousLesson,
  nextLesson,
  isCourseCompleted,
  onSelectLesson,
  onCompleteCurrentLesson,
}: ClassroomFooterProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleMarkComplete = async () => {
    setIsLoading(true);
    const result = await markLessonCompleteAction({
      lesson_id: currentLessonId,
    });
    setIsLoading(false);
    if (result.success) {
      onCompleteCurrentLesson();
    }
  };

  return (
    <div className="border-t border-border bg-surface p-4 sm:px-8 space-y-4">
      {/* Course Completed Celebration */}
      {isCourseCompleted && (
        <div className="rounded-2xl border border-success/30 bg-success/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/20 text-success shrink-0">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">
                🎉 تهانينا! لقد أتممت جميع دروس هذه الدورة بنجاح.
              </h4>
              <p className="text-xs text-muted-foreground">
                يمكنك دائماً مراجعة الدروس أو الانتقال لاكتشاف مسارات جديدة.
              </p>
            </div>
          </div>

          <Link href="/student/my-courses">
            <Button variant="primary" size="sm" className="bg-success hover:bg-success/90 font-bold text-xs">
              العودة لدوراتي
            </Button>
          </Link>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-2">
        {/* Previous Lesson */}
        {previousLesson ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectLesson(previousLesson.id)}
            className="gap-1.5 text-xs font-semibold"
          >
            <ArrowRight className="h-4 w-4" />
            <span className="hidden sm:inline">الدرس السابق:</span>
            <span className="truncate max-w-[120px] sm:max-w-[180px]">
              {previousLesson.title}
            </span>
          </Button>
        ) : (
          <div />
        )}

        {/* Complete Lesson CTA */}
        <Button
          variant={isCurrentLessonCompleted ? "outline" : "primary"}
          size="sm"
          onClick={handleMarkComplete}
          isLoading={isLoading}
          disabled={isCurrentLessonCompleted}
          className="gap-1.5 text-xs font-bold shadow-xs"
        >
          <CheckCircle className="h-4 w-4 text-success" />
          <span>{isCurrentLessonCompleted ? "الدرس مكتمل" : "تحديد كمكتمل"}</span>
        </Button>

        {/* Next Lesson */}
        {nextLesson ? (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onSelectLesson(nextLesson.id)}
            className="gap-1.5 text-xs font-bold"
          >
            <span className="hidden sm:inline">الدرس التالي:</span>
            <span className="truncate max-w-[120px] sm:max-w-[180px]">
              {nextLesson.title}
            </span>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
