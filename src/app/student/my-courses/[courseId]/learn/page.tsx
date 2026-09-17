import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock } from "@phosphor-icons/react/dist/ssr";
import { requireStudent } from "@/lib/auth";
import { checkStudentEnrollment } from "@/lib/payments";
import { getCourseClassroomData } from "@/lib/learning";
import { ClassroomClient } from "./classroom-client";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface LearnPageProps {
  params: Promise<{
    courseId: string;
  }>;
  searchParams: Promise<{
    lessonId?: string;
  }>;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(id?: string | null): boolean {
  if (!id || typeof id !== "string") return false;
  return UUID_REGEX.test(id);
}

export default async function StudentCourseLearnPage({
  params,
  searchParams,
}: LearnPageProps) {
  const { courseId } = await params;
  const { lessonId } = await searchParams;

  // 1. Strict UUID Validation Guard (Rejects malformed IDs before touching database)
  if (!isValidUUID(courseId)) {
    notFound();
  }

  if (lessonId && !isValidUUID(lessonId)) {
    notFound();
  }

  const profile = await requireStudent(
    `/student/my-courses/${courseId}/learn`
  );

  // 2. Strict Enrollment Verification Guard
  const isEnrolled = await checkStudentEnrollment(courseId, profile.id);

  if (!isEnrolled) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-right space-y-6">
        <div className="rounded-2xl border border-error/40 bg-error/5 p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-error/10 text-error">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            وصول غير مصرح به للمحتوى التدريبي
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
            يتطلب الوصول إلى هذا المحتوى تسجيلاً مفعّلاً ومعتمداً من قِبل إدارة
            المنصة بعد التحقق من دفع الرسوم.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link href="/courses">
              <Button variant="outline" size="sm">
                تصفح الكتالوج العام
              </Button>
            </Link>
            <Link href="/student/orders">
              <Button variant="primary" size="sm" className="font-bold">
                متابعة حالة طلباتي
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Fetch Full Classroom Data & Current Lesson
  const classroomData = await getCourseClassroomData(
    courseId,
    profile.id,
    lessonId
  );

  if (!classroomData) {
    notFound();
  }

  // 3. Render Interactive Cinematic Classroom
  return <ClassroomClient initialData={classroomData} />;
}
