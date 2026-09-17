import * as React from "react";
import { CourseCard } from "./course-card";
import { EmptyState } from "@/components/ui/empty-state";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

import type { CourseCardData } from "./course-card";

export interface CourseGridProps {
  courses: CourseCardData[];
  className?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function CourseGrid({
  courses,
  className,
  emptyTitle = "لم يتم العثور على دورات",
  emptyDescription = "جرب تغيير خيارات البحث أو التصفية للعثور على ما تبحث عنه.",
}: CourseGridProps) {
  if (courses.length === 0) {
    return (
      <EmptyState
        icon={<MagnifyingGlass className="h-6 w-6" />}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
