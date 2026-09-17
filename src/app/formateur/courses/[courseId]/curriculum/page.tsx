import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireFormateur } from "@/lib/auth";
import { getCourseForEditing } from "@/lib/courses";
import { CurriculumEditor } from "./curriculum-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, PencilSimple, Eye } from "@phosphor-icons/react/dist/ssr";

export const dynamic = "force-dynamic";

interface CurriculumPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function CourseCurriculumPage({
  params,
}: CurriculumPageProps) {
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
    <div className="max-w-5xl mx-auto space-y-8 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/formateur/courses"
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              <span>العودة لقائمة الدورات</span>
            </Link>
            <span>/</span>
            <Badge variant="outline" size="sm">
              {course.status}
            </Badge>
          </div>
          <h1 className="text-h1 font-bold text-foreground">
            محرر المنهج والدروس: {course.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            قم بتنظيم الفصول، إضافة الدروس، وتحديد المعاينات المجانية قبل إرسال
            الدورة للمراجعة.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {course.status === "PUBLISHED" && (
            <Link href={`/courses/${course.slug}`}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Eye className="h-3.5 w-3.5" />
                <span>معاينة عامة</span>
              </Button>
            </Link>
          )}
          <Link href={`/formateur/courses/${course.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <PencilSimple className="h-3.5 w-3.5" />
              <span>تعديل البيانات الأساسية</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Interactive Curriculum Builder */}
      <CurriculumEditor course={course} />
    </div>
  );
}
