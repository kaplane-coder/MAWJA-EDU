import * as React from "react";
import Link from "next/link";
import {
  Certificate,
  PlusCircle,
  BookOpen,
  Users,
  CheckCircle,
  Clock,
  PencilSimple,
  Eye,
  TreeStructure,
  PaperPlaneRight,
  GraduationCap,
} from "@phosphor-icons/react/dist/ssr";
import { requireFormateur } from "@/lib/auth";
import { getFormateurDashboardStats } from "@/lib/formateur";
import { formatDZD } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

export const dynamic = "force-dynamic";

const statusBadges: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "success" | "warning" | "error" | "exclusive" | "info" }
> = {
  DRAFT: { label: "مسودة", variant: "secondary" },
  PENDING_REVIEW: { label: "قيد المراجعة", variant: "warning" },
  PUBLISHED: { label: "منشورة", variant: "success" },
  ARCHIVED: { label: "مؤرشفة", variant: "outline" },
};

export default async function FormateurDashboardPage() {
  const profile = await requireFormateur("/formateur");
  const stats = await getFormateurDashboardStats(profile.id);

  return (
    <div className="space-y-8 text-right">
      {/* ==========================================
          1. HEADER & ACTIONS
          ========================================== */}
      <div className="rounded-3xl border border-border/80 bg-gradient-to-r from-primary/10 via-surface to-surface p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar
              src={profile.avatar_url || undefined}
              alt={profile.full_name}
              fallback={profile.full_name}
              size="lg"
              className="ring-4 ring-primary/20 shadow-md"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="exclusive" className="gap-1 text-xs">
                  <Certificate className="h-3.5 w-3.5" />
                  <span>مساحة المدرب</span>
                </Badge>
                <Badge variant="outline" size="sm">
                  مدرب معتمد
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                أهلاً بك، {profile.full_name} 👨‍🏫
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                إدارة دوراتك التدريبية، مناهج الدروس، ومتابعة تقدم طلابك
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Link href="/formateur/students">
              <Button variant="outline" size="sm" className="gap-1.5 font-bold text-xs">
                <Users className="h-4 w-4 text-primary" />
                <span>الطلاب ({stats.totalStudents})</span>
              </Button>
            </Link>
            <Link href="/formateur/courses/new">
              <Button variant="primary" size="sm" className="gap-1.5 font-bold text-xs shadow-md">
                <PlusCircle className="h-4 w-4" />
                <span>إنشاء دورة جديدة</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ==========================================
          2. METRICS CARDS
          ========================================== */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Card variant="default" className="p-4 text-right space-y-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary mb-1">
            <BookOpen className="h-4 w-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-foreground">
            {stats.totalCourses}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">
            إجمالي الدورات
          </p>
        </Card>

        <Card variant="default" className="p-4 text-right space-y-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success mb-1">
            <CheckCircle className="h-4 w-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-foreground">
            {stats.publishedCourses}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">
            الدورات المنشورة
          </p>
        </Card>

        <Card variant="default" className="p-4 text-right space-y-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning mb-1">
            <Clock className="h-4 w-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-foreground">
            {stats.pendingCourses}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">
            قيد المراجعة
          </p>
        </Card>

        <Card variant="default" className="p-4 text-right space-y-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground mb-1">
            <PencilSimple className="h-4 w-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-foreground">
            {stats.draftCourses}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">
            المسودات
          </p>
        </Card>

        <Card variant="default" className="p-4 text-right space-y-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10 text-info mb-1">
            <Users className="h-4 w-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-foreground">
            {stats.totalStudents}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">
            الطلاب المسجلين
          </p>
        </Card>

        <Card variant="default" className="p-4 text-right space-y-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary mb-1">
            <GraduationCap className="h-4 w-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-foreground">
            {stats.totalEnrollments}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">
            إجمالي الاشتراكات
          </p>
        </Card>
      </div>

      {/* ==========================================
          3. COURSES MANAGEMENT LIST
          ========================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              قائمة الدورات التدريبية
            </h2>
            <p className="text-xs text-muted-foreground">
              إدارة الفصول والدروس وحالات النشر
            </p>
          </div>
          <Link href="/formateur/courses/new">
            <Button variant="primary" size="sm" className="gap-1.5 text-xs font-bold">
              <PlusCircle className="h-3.5 w-3.5" />
              <span>دورة جديدة</span>
            </Button>
          </Link>
        </div>

        {stats.recentCourses.length === 0 ? (
          <Card variant="default" className="text-center py-16 px-4 border-dashed border-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
              <BookOpen className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              لم تقم بإنشاء أي دورة تدريبية بعد
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6 leading-relaxed">
              ابدأ في تأليف دورتك الأولى، حدد فصولها ومحتواها، وشارك خبرتك مع آلاف المتعلمين.
            </p>
            <Link href="/formateur/courses/new">
              <Button variant="primary" size="sm" className="gap-2 font-bold text-xs">
                <PlusCircle className="h-4 w-4" />
                <span>إنشاء الدورة الأولى الآن</span>
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {stats.recentCourses.map((course) => {
              const badgeInfo = statusBadges[course.status] || {
                label: course.status,
                variant: "outline",
              };

              return (
                <Card
                  key={course.id}
                  variant="default"
                  className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={badgeInfo.variant} size="sm">
                        {badgeInfo.label}
                      </Badge>
                      <span className="text-xs font-bold text-foreground font-mono">
                        {formatDZD(course.price)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground">
                      {course.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-0.5">
                      <span className="flex items-center gap-1">
                        <TreeStructure className="h-3.5 w-3.5 text-primary" />
                        <span>{course.sectionCount} فصول</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5 text-primary" />
                        <span>{course.lessonCount} دروس</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <span>{course.studentCount} طلاب مسجلين</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto border-t md:border-t-0 border-border/50 pt-3 md:pt-0">
                    <Link href={`/formateur/courses/${course.id}/curriculum`}>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
                        <TreeStructure className="h-3.5 w-3.5 text-primary" />
                        <span>إدارة المنهج</span>
                      </Button>
                    </Link>

                    <Link href={`/formateur/courses/${course.id}/edit`}>
                      <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                        <PencilSimple className="h-3.5 w-3.5" />
                        <span>التفاصيل</span>
                      </Button>
                    </Link>

                    {course.status === "PUBLISHED" ? (
                      <Link href={`/courses/${course.slug}`}>
                        <Button variant="ghost" size="sm" className="gap-1 text-xs text-primary">
                          <Eye className="h-3.5 w-3.5" />
                          <span>معاينة في الكتالوج</span>
                        </Button>
                      </Link>
                    ) : course.status === "DRAFT" ? (
                      <Link href={`/formateur/courses/${course.id}/curriculum`}>
                        <Button variant="primary" size="sm" className="gap-1 text-xs font-bold">
                          <PaperPlaneRight className="h-3.5 w-3.5" />
                          <span>تقديم للمراجعة</span>
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
