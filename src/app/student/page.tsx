import * as React from "react";
import Link from "next/link";
import {
  GraduationCap,
  ArrowLeft,
  BookOpen,
  Clock,
  Certificate,
  PlayCircle,
  Sparkle,
  Compass,
  CheckCircle,
  User,
} from "@phosphor-icons/react/dist/ssr";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { requireStudent } from "@/lib/auth";
import { getStudentLearningDashboardData } from "@/lib/learning";
import { getPublishedCourses } from "@/lib/courses";
import { CourseCard } from "@/components/course/course-card";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const profile = await requireStudent("/student");
  const dashboardData = await getStudentLearningDashboardData(profile.id);

  // Fetch recommendations
  const { courses: recommendedCourses } = await getPublishedCourses({
    limit: 3,
  });

  // Calculate profile completion percentage
  const totalProfileFields = 7;
  let filledFields = 0;
  if (profile.full_name) filledFields++;
  if (profile.username) filledFields++;
  if (profile.avatar_url) filledFields++;
  if (profile.bio) filledFields++;
  if (profile.phone) filledFields++;
  if (profile.wilaya) filledFields++;
  if (profile.interests && profile.interests.length > 0) filledFields++;
  const profileCompletion = Math.round((filledFields / totalProfileFields) * 100);

  const {
    enrolledCount,
    watchHours,
    completedCoursesCount,
    continueLearningCourse,
    courses: enrolledCoursesList,
  } = dashboardData;

  const totalLessonsCompleted = (enrolledCoursesList || []).reduce(
    (acc, curr) => acc + (curr.completedLessons || 0),
    0
  );

  return (
    <div className="space-y-8 text-right">
      {/* ==========================================
          1. PERSONALIZED WELCOME & STATS BANNER
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
                <Badge variant="default" className="gap-1 text-xs">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>مساحة الطالب</span>
                </Badge>
                <Badge variant="secondary" size="sm">
                  طالب
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                مرحباً بك، {profile.full_name} 👋
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                واصل رحلتك التعليمية وحقق أهدافك البرمجية والمهنية اليوم
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Link href="/courses">
              <Button variant="outline" size="sm" className="gap-1.5 font-bold text-xs">
                <Compass className="h-4 w-4 text-primary" />
                <span>استكشاف الدورات</span>
              </Button>
            </Link>
            <Link href="/student/my-courses">
              <Button variant="primary" size="sm" className="gap-1.5 font-bold text-xs">
                <BookOpen className="h-4 w-4" />
                <span>دوراتي ({enrolledCount})</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Completion Alert / Bar if not 100% */}
        {profileCompletion < 100 && (
          <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  ملفك الشخصي مكتمل بنسبة {profileCompletion}%
                </p>
                <p className="text-[11px] text-muted-foreground">
                  أضف نبذة تعريفية واهتماماتك التقنية لتخصيص مسارك التعليمي
                </p>
              </div>
            </div>
            <Link href="/student/profile">
              <Button variant="outline" size="sm" className="text-xs font-semibold">
                إكمال الملف الشخصي
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* ==========================================
          2. LEARNING METRICS CARDS
          ========================================== */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card variant="default" className="p-4 sm:p-5 text-right space-y-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-foreground">
              {enrolledCount}
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              الدورات المسجلة
            </p>
          </div>
        </Card>

        <Card variant="default" className="p-4 sm:p-5 text-right space-y-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/10 text-success">
            <Certificate className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-foreground">
              {completedCoursesCount}
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              الدورات المكتملة
            </p>
          </div>
        </Card>

        <Card variant="default" className="p-4 sm:p-5 text-right space-y-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-info/10 text-info">
            <CheckCircle className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-foreground">
              {totalLessonsCompleted}
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              الدروس المنجزة
            </p>
          </div>
        </Card>

        <Card variant="default" className="p-4 sm:p-5 text-right space-y-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning/10 text-warning">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-foreground">
              {watchHours}
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              ساعات التعلم التطبيقي
            </p>
          </div>
        </Card>
      </div>

      {/* ==========================================
          3. ACTIVE LEARNING / CONTINUE LEARNING HERO
          ========================================== */}
      {continueLearningCourse ? (
        <Card variant="elevated" className="border-primary/30 overflow-hidden">
          <CardHeader className="bg-primary/5 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="exclusive" size="sm" className="gap-1">
                  <PlayCircle className="h-3.5 w-3.5" />
                  <span>متابعة التعلّم النشط</span>
                </Badge>
              </div>
              <span className="text-xs font-bold text-primary">
                {continueLearningCourse.progressPercentage}% منجز
              </span>
            </div>
            <CardTitle className="text-lg font-bold mt-2">
              {continueLearningCourse.title}
            </CardTitle>
            <CardDescription className="text-xs">
              المدرب: {continueLearningCourse.instructorName} • {continueLearningCourse.completedLessons} من {continueLearningCourse.totalLessons} درس مكتمل
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${continueLearningCourse.progressPercentage}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                يمكنك متابعة المشاهدة والتطبيق العملي من حيث توقفت
              </span>
              <Link href={`/student/my-courses/${continueLearningCourse.id}/learn`}>
                <Button variant="primary" className="gap-2 font-bold text-xs shadow-md">
                  <PlayCircle className="h-4 w-4" />
                  <span>متابعة الدرس الآن</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Empty State for new students */
        <Card variant="default" className="text-center py-12 px-4 border-dashed border-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Sparkle className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            لم تسجل في أي دورة تدريبية بعد
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
            استكشف مكتبة دورات موجة الشاملة واختر المسار الذي يناسب أهدافك للبدء في اكتساب مهارات تقنية احترافية.
          </p>
          <Link href="/courses">
            <Button variant="primary" className="gap-2 font-bold text-xs">
              <Compass className="h-4 w-4" />
              <span>استعراض كتالوج الدورات</span>
            </Button>
          </Link>
        </Card>
      )}

      {/* ==========================================
          4. MY ENROLLED COURSES (Summary Grid)
          ========================================== */}
      {enrolledCoursesList && enrolledCoursesList.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                دوراتي التدريبية
              </h2>
              <p className="text-xs text-muted-foreground">
                قائمة بالدورات المفعلة ونسبة التقدم في كل منها
              </p>
            </div>
            <Link
              href="/student/my-courses"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>عرض الكل</span>
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCoursesList.map((course) => (
              <Card key={course.id} variant="default" className="p-5 flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={course.progressPercentage === 100 ? "success" : "default"} size="sm">
                      {course.progressPercentage === 100 ? "مكتملة" : "قيد التعلّم"}
                    </Badge>
                    <span className="text-xs font-bold text-primary font-mono">
                      {course.progressPercentage}%
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    المدرب: {course.instructorName}
                  </p>
                </div>

                <div className="space-y-3 border-t border-border/50 pt-3">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${course.progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground text-[11px]">
                      {course.completedLessons} / {course.totalLessons} درس
                    </span>
                    <Link href={`/student/my-courses/${course.id}/learn`}>
                      <Button variant="outline" size="sm" className="h-7 text-xs font-bold gap-1">
                        <span>دخول الفصل</span>
                        <ArrowLeft className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================
          5. RECOMMENDED COURSES (From Supabase)
          ========================================== */}
      {recommendedCourses && recommendedCourses.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Sparkle className="h-4 w-4 text-primary" />
                <span>دورات مقترحة لك</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                أحدث المسارات التدريبية المعتمدة على منصة موجة
              </p>
            </div>
            <Link
              href="/courses"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>جميع الدورات</span>
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
