import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, PlayCircle, GraduationCap, Compass } from "@phosphor-icons/react/dist/ssr";
import { requireStudent } from "@/lib/auth";
import { getStudentEnrolledCourses } from "@/lib/payments";
import { CourseProgress } from "@/components/course/course-progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function StudentMyCoursesPage() {
  const profile = await requireStudent("/student/my-courses");
  const enrollments = await getStudentEnrolledCourses(profile.id);

  return (
    <div className="space-y-8 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="exclusive" className="gap-1 text-xs">
              <BookOpen className="h-3.5 w-3.5" />
              <span>مساحة التعلّم الشخصية</span>
            </Badge>
            <Badge variant="success" size="sm">
              {enrollments.length} دورات مفعلة
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            دوراتي التدريبية
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            جميع الدورات التدريبية المعتمدة والمفتوحة لحسابك. واصل تعلّم المهارات التطبيقية.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/courses">
            <Button variant="outline" size="sm" className="text-xs font-bold gap-1">
              <Compass className="h-3.5 w-3.5 text-primary" />
              <span>استكشاف المزيد</span>
            </Button>
          </Link>
          <Link href="/student/orders">
            <Button variant="ghost" size="sm" className="text-xs">
              سجل الطلبات
            </Button>
          </Link>
        </div>
      </div>

      {/* Enrolled Courses Grid */}
      {enrollments.length === 0 ? (
        <Card variant="default" className="text-center py-16 px-4 border-dashed border-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <BookOpen className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            لم تسجل في أي دورة تدريبية بعد
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6 leading-relaxed">
            استعرض كتالوج الدورات المتاح واختر دورتك الأولى للبدء في رحلتك التعليمية.
          </p>
          <Link href="/courses">
            <Button variant="primary" size="sm" className="gap-2 font-bold text-xs">
              <Compass className="h-4 w-4" />
              <span>استعراض كتالوج الدورات</span>
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enr) => {
            const course = enr.course;
            if (!course) return null;

            return (
              <Card
                key={enr.enrollment_id}
                variant="default"
                className="overflow-hidden border border-border bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg flex flex-col justify-between"
              >
                {/* Course Cover */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {course.thumbnail_path ? (
                    <Image
                      src={course.thumbnail_path}
                      alt={course.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-surface to-background text-primary">
                      <GraduationCap className="h-10 w-10 opacity-70" />
                    </div>
                  )}
                  <div className="absolute top-2.5 right-2.5">
                    <Badge variant="success" size="sm" className="shadow-xs">
                      مفعلة
                    </Badge>
                  </div>
                </div>

                {/* Body Content */}
                <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Avatar
                        src={course.instructor?.avatar_url || undefined}
                        alt={course.instructor?.full_name || "Instructor"}
                        fallback={course.instructor?.full_name || "M"}
                        size="sm"
                      />
                      <span className="truncate font-medium">
                        {course.instructor?.full_name || "مدرب معتمد"}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground line-clamp-2 leading-snug">
                      {course.title}
                    </h3>
                  </div>

                  {/* Progress & Entry Button */}
                  <div className="space-y-3 border-t border-border/60 pt-3">
                    <CourseProgress
                      completedLessons={course.stats.completedLessons}
                      totalLessons={course.stats.lessonCount}
                      progressPercentage={course.stats.progressPercentage}
                    />

                    <Link
                      href={`/student/my-courses/${course.id}/learn`}
                      className="block pt-1"
                    >
                      <Button
                        variant="primary"
                        className="w-full gap-2 font-bold text-xs"
                      >
                        <PlayCircle className="h-4 w-4" />
                        <span>
                          {course.stats.progressPercentage > 0
                            ? "متابعة التعلّم"
                            : "بدء التعلّم"}
                        </span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
