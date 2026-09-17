import * as React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  BookOpen,
  ShieldCheck,
  PlayCircle,
  FileText,
  Question,
  Paperclip,
  Sparkle,
  User,
} from "@phosphor-icons/react/dist/ssr";
import { getPublishedCourseBySlug, type CourseSectionItem, type CourseLessonItem } from "@/lib/courses";
import { getCurrentUser } from "@/lib/auth";
import { checkStudentEnrollment } from "@/lib/payments";
import { EnrollButton } from "@/components/course/enroll-button";
import { formatDZD } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface CoursePageProps {
  params: Promise<{
    slug: string;
  }>;
}

const levelLabels: Record<string, string> = {
  BEGINNER: "مبتدئ",
  INTERMEDIATE: "متوسط",
  ADVANCED: "متقدم",
  ALL_LEVELS: "جميع المستويات",
};

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getPublishedCourseBySlug(slug);

  if (!course) {
    return {
      title: "الدورة غير موجودة | MAWJA",
      description: "لم يتم العثور على الدورة المطلوبة.",
    };
  }

  return {
    title: `${course.title} | MAWJA`,
    description:
      course.short_description ||
      course.description?.slice(0, 160) ||
      "دورة تدريبية احترافية على منصة موجة للتعليم الرقمي.",
    openGraph: {
      title: course.title,
      description: course.short_description || undefined,
      images: course.thumbnail_path ? [course.thumbnail_path] : [],
    },
  };
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = await getPublishedCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  const user = await getCurrentUser();
  const isEnrolled = user ? await checkStudentEnrollment(course.id, user.id) : false;

  const hours = Math.floor(course.stats.totalDurationSeconds / 3600);
  const minutes = Math.floor((course.stats.totalDurationSeconds % 3600) / 60);
  const durationText =
    hours > 0
      ? `${hours} س ${minutes > 0 ? `${minutes} د` : ""}`
      : `${minutes} د`;

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "VIDEO":
        return <PlayCircle className="h-4 w-4 text-primary" />;
      case "ARTICLE":
        return <FileText className="h-4 w-4 text-primary" />;
      case "QUIZ":
        return <Question className="h-4 w-4 text-primary" />;
      case "ATTACHMENT":
        return <Paperclip className="h-4 w-4 text-primary" />;
      default:
        return <PlayCircle className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-right">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">
          الرئيسية
        </Link>
        <span>/</span>
        <Link href="/courses" className="hover:text-primary transition-colors">
          دليل الدورات
        </Link>
        <span>/</span>
        <span className="text-foreground truncate max-w-xs">{course.title}</span>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Main Content (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Info */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {course.category && <Badge variant="default">{course.category}</Badge>}
              <Badge variant="secondary">
                {levelLabels[course.level] || course.level}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
              {course.title}
            </h1>

            {course.short_description && (
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {course.short_description}
              </p>
            )}

            {/* Metrics */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Clock className="h-4 w-4 text-primary" />
                <span>{durationText} محتوى تدريبي</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <BookOpen className="h-4 w-4 text-primary" />
                <span>{course.stats.lessonCount} درساً</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-success" />
                <span>معتمد في MAWJA</span>
              </div>
            </div>
          </div>

          {/* Instructor Box */}
          <div className="flex items-start gap-4 rounded-xl border border-border bg-surface p-5 shadow-xs">
            <Avatar
              src={course.instructor.avatar_url || undefined}
              alt={course.instructor.full_name}
              fallback={course.instructor.full_name}
              size="lg"
            />
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">مدرب الدورة:</span>
              <h3 className="text-base font-bold text-foreground">
                {course.instructor.full_name}
              </h3>
              {course.instructor.headline && (
                <p className="text-xs text-primary font-medium">
                  {course.instructor.headline}
                </p>
              )}
              {course.instructor.bio && (
                <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                  {course.instructor.bio}
                </p>
              )}
            </div>
          </div>

          {/* Course Detailed Description */}
          {course.description && (
            <div className="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-foreground">عن هذه الدورة</h3>
              <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                {course.description}
              </div>
            </div>
          )}

          {/* Curriculum / Syllabus Outline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">
                منهاج الدورة والمحتوى التعليمي
              </h3>
              <span className="text-xs text-muted-foreground">
                {course.sections.length} فصول • {course.stats.lessonCount} درساً
              </span>
            </div>

            {course.sections.length === 0 ? (
              <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
                لم يتم إدراج دروس في هذا المنهج بعد.
              </div>
            ) : (
              <div className="space-y-3">
                {course.sections.map((section: CourseSectionItem, idx: number) => (
                  <div
                    key={section.id}
                    className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs"
                  >
                    <div className="bg-muted/40 p-4 font-bold text-sm text-foreground flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">
                          {idx + 1}
                        </span>
                        <span>{section.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-normal">
                        {section.lessons ? section.lessons.length : 0} دروس
                      </span>
                    </div>

                    <div className="divide-y divide-border/60">
                      {(section.lessons || []).map((lesson: CourseLessonItem) => (
                        <div
                          key={lesson.id}
                          className="p-3.5 px-4 flex items-center justify-between text-xs text-muted-foreground hover:bg-muted/20 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            {getLessonIcon(lesson.content_type)}
                            <span className="text-foreground font-medium">
                              {lesson.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            {lesson.duration_seconds > 0 && (
                              <span className="text-[11px] text-muted-foreground">
                                {Math.ceil(lesson.duration_seconds / 60)} د
                              </span>
                            )}
                            {lesson.is_free_preview && (
                              <Badge variant="outline" size="sm">
                                معاينة مجانية
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Checkout Card (1 Col) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-border bg-surface p-6 shadow-md space-y-6 text-right">
            {/* Thumbnail Preview */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
              {course.thumbnail_path ? (
                <Image
                  src={course.thumbnail_path}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary">
                  <Sparkle className="h-10 w-10 opacity-40" />
                </div>
              )}
            </div>

            {/* Price Box */}
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">
                السعر الكامل للدورة:
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-primary">
                  {course.price === 0 ? "مجاناً" : formatDZD(course.price)}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5">
              <EnrollButton
                courseId={course.id}
                courseSlug={course.slug}
                courseTitle={course.title}
                price={course.price}
                isEnrolled={isEnrolled}
                isAuthenticated={Boolean(user)}
              />
            </div>

            <Separator />

            {/* Guarantees */}
            <div className="space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-success" />
                <span>وصول دائم وشامل لجميع التحديثات القادمة</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkle className="h-4 w-4 text-success" />
                <span>شهادة إتمام معتمدة من منصة MAWJA</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-success" />
                <span>متابعة وتواصل مباشر مع مدرب الدورة</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
