"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ClassroomHeader } from "@/components/course/classroom-header";
import { ClassroomSidebar } from "@/components/course/classroom-sidebar";
import { LessonRenderer } from "@/components/course/lesson-renderer";
import { ClassroomFooter } from "@/components/course/classroom-footer";
import type { ClassroomData, ClassroomLessonItem, ClassroomSectionItem } from "@/lib/learning";

interface ClassroomClientProps {
  initialData: ClassroomData;
}

export function ClassroomClient({ initialData }: ClassroomClientProps) {
  const router = useRouter();
  const [sections, setSections] = React.useState<ClassroomSectionItem[]>(
    initialData.sections
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  // Sync state if initialData changes on server re-render
  React.useEffect(() => {
    setSections(initialData.sections);
  }, [initialData]);

  // Current lesson is strictly the authoritative server-validated lesson
  const currentLesson = initialData.currentLesson;
  const previousLesson = initialData.previousLesson;
  const nextLesson = initialData.nextLesson;

  // Calculate live statistics across sections
  const flatLessons = React.useMemo(() => {
    const list: ClassroomLessonItem[] = [];
    sections.forEach((sec) => {
      sec.lessons.forEach((l) => list.push(l));
    });
    return list;
  }, [sections]);

  const totalLessons = flatLessons.length;
  const completedLessons = flatLessons.filter((l) => l.completed).length;
  const progressPercentage =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const isCourseCompleted = completedLessons === totalLessons && totalLessons > 0;

  // Security: Handler for selecting a lesson routes via server-side pipeline
  const handleSelectLesson = (lessonId: string) => {
    if (lessonId === currentLesson.id) return;
    router.push(
      `/student/my-courses/${initialData.course.id}/learn?lessonId=${lessonId}`
    );
  };

  // Handler when video or viewer updates progress
  const handleProgressUpdate = (progressSeconds: number, completed: boolean) => {
    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        lessons: sec.lessons.map((les) => {
          if (les.id === currentLesson.id) {
            return {
              ...les,
              progress_seconds: progressSeconds,
              completed: completed || les.completed,
            };
          }
          return les;
        }),
      }))
    );
  };

  // Handler for explicit complete action
  const handleCompleteCurrentLesson = () => {
    handleProgressUpdate(currentLesson.duration_seconds || 0, true);
    // If next lesson exists, move to next lesson automatically
    if (nextLesson) {
      setTimeout(() => {
        handleSelectLesson(nextLesson.id);
      }, 500);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* 1. Minimalist Top Classroom Header */}
      <ClassroomHeader
        courseTitle={initialData.course.title}
        progressPercentage={progressPercentage}
        completedLessonsCount={completedLessons}
        totalLessonsCount={totalLessons}
        onToggleSidebarMobile={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 flex flex-col justify-between">
          <div className="max-w-5xl w-full mx-auto space-y-6">
            <LessonRenderer
              lesson={currentLesson}
              posterUrl={initialData.course.thumbnail_path}
              onProgressUpdate={handleProgressUpdate}
              onComplete={handleCompleteCurrentLesson}
            />
          </div>

          {/* Bottom Navigation Controls */}
          <div className="max-w-5xl w-full mx-auto pt-6">
            <ClassroomFooter
              currentLessonId={currentLesson.id}
              isCurrentLessonCompleted={currentLesson.completed}
              previousLesson={previousLesson}
              nextLesson={nextLesson}
              isCourseCompleted={isCourseCompleted}
              onSelectLesson={handleSelectLesson}
              onCompleteCurrentLesson={handleCompleteCurrentLesson}
            />
          </div>
        </main>

        {/* 3. Curriculum Sidebar Panel (Desktop + Mobile Drawer) */}
        <ClassroomSidebar
          sections={sections}
          currentLessonId={currentLesson.id}
          completedLessonsCount={completedLessons}
          totalLessonsCount={totalLessons}
          progressPercentage={progressPercentage}
          onSelectLesson={handleSelectLesson}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      </div>
    </div>
  );
}
