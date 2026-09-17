import * as React from "react";
import Link from "next/link";
import {
  Stack,
  Plus,
  PencilSimple,
  BookOpen,
  PaperPlaneRight,
  Trash,
  Eye,
} from "@phosphor-icons/react/dist/ssr";
import { requireFormateur } from "@/lib/auth";
import { getFormateurCourses } from "@/lib/courses";
import { formatDZD } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  submitCourseForReviewAction,
  deleteCourseAction,
} from "@/actions/courses";
import type { CourseLevel, CourseStatus } from "@/types/database.types";

export const dynamic = "force-dynamic";

interface FormateurCourseItem {
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
  stats: {
    sectionCount: number;
    lessonCount: number;
    totalDurationSeconds: number;
  };
}

const statusBadges: Record<CourseStatus, { label: string; variant: "secondary" | "warning" | "success" | "outline" }> = {
  DRAFT: { label: "مسودة", variant: "secondary" },
  PENDING_REVIEW: { label: "قيد مراجعة الإدارة", variant: "warning" },
  PUBLISHED: { label: "منشورة", variant: "success" },
  ARCHIVED: { label: "مؤرشفة", variant: "outline" },
};

export default async function FormateurCoursesPage() {
  const profile = await requireFormateur("/formateur/courses");
  const { courses, stats } = await getFormateurCourses(profile.id);
  const typedCourses = courses as unknown as FormateurCourseItem[];

  return (
    <div className="space-y-8 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="exclusive" className="gap-1">
              <Stack className="h-3.5 w-3.5" />
              <span>إدارة الدورات التدريبية</span>
            </Badge>
          </div>
          <h1 className="text-h1 font-bold text-foreground">
            دوراتي التعليمية
          </h1>
          <p className="text-sm text-muted-foreground">
            أنشئ دوراتك، أدر المناهج والدروس، وتابع حالات الاعتماد والنشر.
          </p>
        </div>

        <Link href="/formateur/courses/new">
          <Button variant="primary" size="md" className="gap-1.5 font-bold shadow-xs">
            <Plus className="h-4 w-4" />
            <span>إنشاء دورة جديدة</span>
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card variant="default">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">إجمالي الدورات</CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">
              {stats.total}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card variant="default">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">الدورات المنشورة</CardDescription>
            <CardTitle className="text-2xl font-bold text-success">
              {stats.published}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card variant="default">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">قيد مراجعة الإدارة</CardDescription>
            <CardTitle className="text-2xl font-bold text-warning">
              {stats.pendingReview}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card variant="default">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">المسودات</CardDescription>
            <CardTitle className="text-2xl font-bold text-muted-foreground">
              {stats.draft}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        <h2 className="text-h3 font-bold text-foreground">قائمة الدورات</h2>

        {typedCourses.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-12 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BookOpen className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              لم تقم بإنشاء أي دورة تدريبية بعد
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              ابدأ الآن بإنشاء مسودة دورتك الأولى، حدد المنهج التعليمي، وقم
              بإرسالها للمراجعة والاعتماد من قِبل إدارة المنصة.
            </p>
            <div className="pt-2">
              <Link href="/formateur/courses/new">
                <Button variant="primary" size="sm" className="font-bold">
                  إنشاء دورتي الأولى
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {typedCourses.map((course) => {
              const statusInfo =
                statusBadges[course.status] || {
                  label: course.status,
                  variant: "outline",
                };

              return (
                <div
                  key={course.id}
                  className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4 transition-all hover:border-border/80"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                        {course.category && (
                          <Badge variant="secondary" size="sm">
                            {course.category}
                          </Badge>
                        )}
                        <span className="text-xs font-bold text-primary mr-2">
                          {course.price === 0 ? "مجاناً" : formatDZD(course.price)}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-foreground">
                        {course.title}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                        <span>{course.stats.sectionCount} فصول</span>
                        <span>•</span>
                        <span>{course.stats.lessonCount} درساً</span>
                        <span>•</span>
                        <span>الرابط: /courses/{course.slug}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-border/60">
                      {course.status === "PUBLISHED" && (
                        <Link href={`/courses/${course.slug}`}>
                          <Button variant="outline" size="sm" className="gap-1 text-xs">
                            <Eye className="h-3.5 w-3.5" />
                            <span>معاينة عامة</span>
                          </Button>
                        </Link>
                      )}

                      <Link href={`/formateur/courses/${course.id}/curriculum`}>
                        <Button variant="primary" size="sm" className="gap-1 text-xs font-bold">
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>المنهج والدروس</span>
                        </Button>
                      </Link>

                      <Link href={`/formateur/courses/${course.id}/edit`}>
                        <Button variant="outline" size="sm" className="gap-1 text-xs">
                          <PencilSimple className="h-3.5 w-3.5" />
                          <span>تعديل</span>
                        </Button>
                      </Link>

                      {course.status === "DRAFT" && (
                        <form
                          action={async () => {
                            "use server";
                            await submitCourseForReviewAction(course.id);
                          }}
                        >
                          <Button
                            type="submit"
                            variant="secondary"
                            size="sm"
                            className="gap-1 text-xs text-warning border-warning/30 hover:bg-warning/10"
                          >
                            <PaperPlaneRight className="h-3.5 w-3.5" />
                            <span>إرسال للمراجعة</span>
                          </Button>
                        </form>
                      )}

                      {(course.status === "DRAFT" || course.status === "ARCHIVED") && (
                        <form
                          action={async () => {
                            "use server";
                            await deleteCourseAction(course.id);
                          }}
                        >
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="text-error hover:bg-error/10 hover:text-error"
                            title="حذف المسودة"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </Button>
                        </form>
                      )}
                    </div>
                  </div>

                  {/* Rejection notice if returned with notes */}
                  {course.rejection_reason && course.status === "DRAFT" && (
                    <Alert
                      variant="warning"
                      title="ملاحظات المراجعة من إدارة المنصة"
                      className="text-xs leading-relaxed"
                    >
                      <p>{course.rejection_reason}</p>
                      <p className="pt-1 text-[11px] font-semibold text-foreground/80">
                        يرجى تعديل النقاط المذكورة أعلاه ثم إعادة إرسال الدورة للمراجعة.
                      </p>
                    </Alert>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
