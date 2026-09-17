import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Eye } from "@phosphor-icons/react/dist/ssr";
import { requireAdmin } from "@/lib/auth";
import { getAdminCourses } from "@/lib/courses";
import { formatDZD } from "@/lib/utils";
import { AdminCourseActions } from "./admin-course-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import type { CourseLevel, CourseStatus } from "@/types/database.types";

export const dynamic = "force-dynamic";

interface AdminCoursesPageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

interface AdminSectionItem {
  id: string;
  title: string;
  lessons?: Array<{ id: string }>;
}

interface AdminCourseItem {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  category: string | null;
  price: number;
  level: CourseLevel;
  status: CourseStatus;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  instructor?: {
    id?: string;
    full_name?: string;
    email?: string;
    avatar_url?: string | null;
  };
  stats: {
    sectionCount: number;
    lessonCount: number;
    totalDurationSeconds: number;
  };
  course_sections?: AdminSectionItem[];
}

const statusBadges: Record<CourseStatus, { label: string; variant: "secondary" | "warning" | "success" | "outline" }> = {
  DRAFT: { label: "مسودة", variant: "secondary" },
  PENDING_REVIEW: { label: "بانتظار المراجعة", variant: "warning" },
  PUBLISHED: { label: "منشورة في الكتالوج", variant: "success" },
  ARCHIVED: { label: "مؤرشفة", variant: "outline" },
};

export default async function AdminCoursesPage({
  searchParams,
}: AdminCoursesPageProps) {
  await requireAdmin("/admin/courses");
  const { status } = await searchParams;

  const allCourses = (await getAdminCourses()) as unknown as AdminCourseItem[];
  const pendingCount = allCourses.filter((c) => c.status === "PENDING_REVIEW").length;
  const publishedCount = allCourses.filter((c) => c.status === "PUBLISHED").length;
  const draftCount = allCourses.filter((c) => c.status === "DRAFT").length;

  const filteredCourses = status
    ? allCourses.filter((c) => c.status === status)
    : allCourses;

  return (
    <div className="space-y-8 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="exclusive" className="gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>مساحة الإدارة المركزية</span>
            </Badge>
          </div>
          <h1 className="text-h1 font-bold text-foreground">
            مراجعة واعتماد الدورات التدريبية
          </h1>
          <p className="text-sm text-muted-foreground">
            فحص مسودات ومناهج الدورات المقدمة من المدربين، اعتماد النشر، أو إرجاعها
            بالملاحظات.
          </p>
        </div>

        <Link href="/admin">
          <Button variant="outline" size="sm">
            العودة للوحة الإدارة
          </Button>
        </Link>
      </div>

      {/* Stats row & Tabs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Link href="/admin/courses?status=PENDING_REVIEW">
          <Card
            variant={status === "PENDING_REVIEW" ? "elevated" : "default"}
            className="cursor-pointer hover:border-warning/60 transition-colors"
          >
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">بانتظار المراجعة</CardDescription>
              <CardTitle className="text-2xl font-bold text-warning">
                {pendingCount}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/courses?status=PUBLISHED">
          <Card
            variant={status === "PUBLISHED" ? "elevated" : "default"}
            className="cursor-pointer hover:border-success/60 transition-colors"
          >
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">الدورات المنشورة</CardDescription>
              <CardTitle className="text-2xl font-bold text-success">
                {publishedCount}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/courses?status=DRAFT">
          <Card
            variant={status === "DRAFT" ? "elevated" : "default"}
            className="cursor-pointer hover:border-border/80 transition-colors"
          >
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">المسودات</CardDescription>
              <CardTitle className="text-2xl font-bold text-muted-foreground">
                {draftCount}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/courses">
          <Card
            variant={!status ? "elevated" : "default"}
            className="cursor-pointer hover:border-primary/60 transition-colors"
          >
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">إجمالي الدورات</CardDescription>
              <CardTitle className="text-2xl font-bold text-primary">
                {allCourses.length}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Course Review List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-h3 font-bold text-foreground">
            {status === "PENDING_REVIEW"
              ? "الدورات بانتظار الاعتماد والمراجعة"
              : status === "PUBLISHED"
              ? "الدورات المنشورة في الكتالوج"
              : "جميع الدورات في النظام"}
          </h2>
          {status && (
            <Link
              href="/admin/courses"
              className="text-xs font-semibold text-primary hover:underline"
            >
              عرض الكل
            </Link>
          )}
        </div>

        {filteredCourses.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-12 text-center text-sm text-muted-foreground">
            لا توجد دورات في هذا القسم حالياً.
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCourses.map((course) => {
              const statusInfo =
                statusBadges[course.status] || {
                  label: course.status,
                  variant: "outline",
                };

              const sections = course.course_sections || [];

              return (
                <div
                  key={course.id}
                  className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6"
                >
                  {/* Top Bar: Title, Formateur, Price, Status */}
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-border/60 pb-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                        {course.category && (
                          <Badge variant="secondary" size="sm">
                            {course.category}
                          </Badge>
                        )}
                        <Badge variant="outline" size="sm">
                          {course.level}
                        </Badge>
                        <span className="text-sm font-black text-primary mr-2">
                          {course.price === 0 ? "مجاناً" : formatDZD(course.price)}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-foreground">
                        {course.title}
                      </h3>

                      <p className="text-xs text-muted-foreground">
                        الرابط: /courses/{course.slug} • آخر تحديث:{" "}
                        {new Date(course.updated_at).toLocaleDateString("ar-DZ")}
                      </p>
                    </div>

                    {/* Instructor Card */}
                    <div className="flex items-center gap-3 bg-muted/40 p-3 rounded-xl border border-border/60">
                      <Avatar
                        src={course.instructor?.avatar_url || undefined}
                        alt={course.instructor?.full_name || "مدرب"}
                        fallback={course.instructor?.full_name || "مدرب"}
                        size="md"
                      />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-foreground">
                          {course.instructor?.full_name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {course.instructor?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Course Details Snippet */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                    <div className="space-y-1">
                      <span className="font-bold text-foreground">
                        الوصف المختصر:
                      </span>
                      <p className="text-muted-foreground">
                        {course.short_description || "لا يوجد وصف مختصر."}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-foreground">
                        الوصف الكامل:
                      </span>
                      <p className="text-muted-foreground line-clamp-3">
                        {course.description || "لا يوجد وصف تفصيلي."}
                      </p>
                    </div>
                  </div>

                  {/* Curriculum Breakdown */}
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">
                        هيكل المنهج التدريبي ({sections.length} فصول •{" "}
                        {course.stats.lessonCount} دروس):
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sections.map((sec, sIdx) => (
                        <div
                          key={sec.id}
                          className="rounded-xl border border-border/60 bg-muted/20 p-3 text-xs space-y-1.5"
                        >
                          <p className="font-bold text-foreground truncate">
                            {sIdx + 1}. {sec.title}
                          </p>
                          <p className="text-muted-foreground text-[11px]">
                            {sec.lessons ? sec.lessons.length : 0} دروس متضمنة
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rejection Notes if exists */}
                  {course.rejection_reason && (
                    <div className="p-3.5 rounded-xl bg-error/10 border border-error/20 text-xs text-error">
                      <strong>ملاحظات الرفض المسجلة:</strong>{" "}
                      {course.rejection_reason}
                    </div>
                  )}

                  {/* Review Actions Footer */}
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                    <AdminCourseActions course={course} />
                    {course.status === "PUBLISHED" && (
                      <Link href={`/courses/${course.slug}`}>
                        <Button variant="ghost" size="sm" className="gap-1 text-xs">
                          <Eye className="h-3.5 w-3.5" />
                          <span>معاينة في الكتالوج</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
