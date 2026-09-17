"use client";

import * as React from "react";
import { FileText, CheckCircle, Clock } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { markLessonCompleteAction } from "@/actions/learning";

interface ArticleViewerProps {
  lessonId: string;
  title: string;
  articleContent: string | null;
  durationMinutes?: number;
  completed?: boolean;
  onComplete?: () => void;
}

export function ArticleViewer({
  lessonId,
  title,
  articleContent,
  durationMinutes = 5,
  completed = false,
  onComplete,
}: ArticleViewerProps) {
  const [isCompleted, setIsCompleted] = React.useState(completed);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    setIsCompleted(completed);
  }, [completed]);

  const handleMarkComplete = async () => {
    setIsLoading(true);
    const result = await markLessonCompleteAction({ lesson_id: lessonId });
    setIsLoading(false);
    if (result.success) {
      setIsCompleted(true);
      if (onComplete) onComplete();
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-10 shadow-xs space-y-8 text-right max-w-4xl mx-auto">
      {/* Article Header */}
      <div className="border-b border-border/60 pb-6 space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <FileText className="h-4 w-4 text-primary" />
          <span>درس قراءة تطبيقي</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>وقت القراءة المقدر: {durationMinutes} دقائق</span>
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          {title}
        </h2>
      </div>

      {/* Article Content Body */}
      <div className="prose prose-neutral dark:prose-invert max-w-none text-foreground/90 text-sm sm:text-base leading-relaxed space-y-4 font-normal">
        {articleContent ? (
          articleContent.split("\n\n").map((para, idx) => (
            <p key={idx} className="leading-loose">
              {para}
            </p>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">
            محتوى المقال التوجيهي والشروحات التطبيقية لهذا الدرس ستتوفر قريباً من
            طرف المدرب.
          </p>
        )}
      </div>

      {/* Footer Completion CTA */}
      <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          عند الانتهاء من قراءة واستيعاب النقاط أعلاه، حدد الدرس كمكتمل لمتابعة
          تقدمك.
        </p>

        <Button
          variant={isCompleted ? "outline" : "primary"}
          size="md"
          onClick={handleMarkComplete}
          isLoading={isLoading}
          disabled={isCompleted}
          className="w-full sm:w-auto font-bold gap-2"
        >
          <CheckCircle className="h-4 w-4 text-success" />
          <span>{isCompleted ? "تم إتمام الدرس" : "تحديد الدرس كمكتمل"}</span>
        </Button>
      </div>
    </div>
  );
}
