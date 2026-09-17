import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireFormateur } from "@/lib/auth";
import { getCourseForEditing } from "@/lib/courses";
import { EditCourseForm } from "./edit-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stack, BookOpen } from "@phosphor-icons/react/dist/ssr";

export const dynamic = "force-dynamic";

interface EditCoursePageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { courseId } = await params;
  const profile = await requireFormateur();

  const course = await getCourseForEditing(
    courseId,
    profile.id,
    profile.role === "ADMIN"
  );

  if (!course) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-right">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="default" className="gap-1">
              <Stack className="h-3.5 w-3.5" />
              <span>تعديل الدورة</span>
            </Badge>
            <Badge variant="outline" size="sm">
              {course.status}
            </Badge>
          </div>
          <h1 className="text-h1 font-bold text-foreground">
            تعديل بيانات: {course.title}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href={`/formateur/courses/${course.id}/curriculum`}>
            <Button variant="primary" size="sm" className="gap-1.5 font-bold">
              <BookOpen className="h-4 w-4" />
              <span>محرر المنهج والدروس</span>
            </Button>
          </Link>
          <Link href="/formateur/courses">
            <Button variant="outline" size="sm">
              العودة للدورات
            </Button>
          </Link>
        </div>
      </div>

      <EditCourseForm course={course} />
    </div>
  );
}
