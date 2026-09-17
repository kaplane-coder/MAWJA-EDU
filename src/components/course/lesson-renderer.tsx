"use client";

import * as React from "react";
import { VideoPlayer } from "./video-player";
import { ArticleViewer } from "./article-viewer";
import { AttachmentViewer } from "./attachment-viewer";
import { QuizViewer } from "./quiz-viewer";
import type { ClassroomLessonItem } from "@/lib/learning";

interface LessonRendererProps {
  lesson: ClassroomLessonItem;
  posterUrl?: string | null;
  onProgressUpdate?: (progressSeconds: number, completed: boolean) => void;
  onComplete?: () => void;
}

export function LessonRenderer({
  lesson,
  posterUrl,
  onProgressUpdate,
  onComplete,
}: LessonRendererProps) {
  switch (lesson.content_type) {
    case "VIDEO":
      return (
        <div className="space-y-6">
          <VideoPlayer
            key={lesson.id}
            lessonId={lesson.id}
            videoUrl={lesson.video_signed_url || lesson.video_path}
            title={lesson.title}
            posterUrl={posterUrl}
            initialProgressSeconds={lesson.progress_seconds}
            onProgressUpdate={onProgressUpdate}
          />
          {lesson.article_content && (
            <div className="rounded-2xl border border-border bg-surface p-6 space-y-2 text-right shadow-xs">
              <h3 className="text-sm font-bold text-foreground">
                شرح وملاحظات الدرس
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {lesson.article_content}
              </p>
            </div>
          )}
        </div>
      );

    case "ARTICLE":
      return (
        <ArticleViewer
          key={lesson.id}
          lessonId={lesson.id}
          title={lesson.title}
          articleContent={lesson.article_content}
          durationMinutes={Math.max(Math.ceil(lesson.duration_seconds / 60), 3)}
          completed={lesson.completed}
          onComplete={onComplete}
        />
      );

    case "ATTACHMENT":
      return (
        <AttachmentViewer
          key={lesson.id}
          lessonId={lesson.id}
          title={lesson.title}
          attachmentUrl={lesson.video_signed_url || lesson.video_path}
          completed={lesson.completed}
          onComplete={onComplete}
        />
      );

    case "QUIZ":
      return (
        <QuizViewer
          key={lesson.id}
          lessonId={lesson.id}
          title={lesson.title}
          articleContent={lesson.article_content}
          completed={lesson.completed}
          onComplete={onComplete}
        />
      );

    default:
      return (
        <ArticleViewer
          key={lesson.id}
          lessonId={lesson.id}
          title={lesson.title}
          articleContent={lesson.article_content}
          completed={lesson.completed}
          onComplete={onComplete}
        />
      );
  }
}
