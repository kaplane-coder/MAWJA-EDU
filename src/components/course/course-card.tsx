import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, BookOpen, User, Sparkle } from "@phosphor-icons/react/dist/ssr";
import type { CourseWithInstructor } from "@/lib/courses";
import { formatDZD } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import type { Course } from "@/types";

export type CourseCardData = CourseWithInstructor | Course;

export interface CourseCardProps {
  course: CourseCardData;
  className?: string;
}

const levelLabels: Record<string, string> = {
  BEGINNER: "مبتدئ",
  INTERMEDIATE: "متوسط",
  ADVANCED: "متقدم",
  ALL_LEVELS: "جميع المستويات",
};

export function CourseCard({ course, className }: CourseCardProps) {
  if (!course) return null;

  const isDbModel = "instructor" in course;

  const title = course.title;
  const slug = course.slug;
  const shortDescription = isDbModel
    ? course.short_description || course.description
    : course.shortDescription;
  const price = course.price;
  const level = course.level;
  const category = course.category;
  const thumbnail = isDbModel
    ? course.thumbnail_path || "/images/placeholder-course.jpg"
    : course.thumbnailUrl;

  const instructorName = isDbModel
    ? course.instructor?.full_name || "مدرب معتمد"
    : course.formateur?.fullName || "مدرب معتمد";
  const instructorAvatar = isDbModel
    ? course.instructor?.avatar_url || undefined
    : course.formateur?.avatarUrl;

  const lessonCount = isDbModel
    ? course.stats?.lessonCount || 0
    : course.lessonsCount || 0;

  const totalDurationSeconds = isDbModel
    ? course.stats?.totalDurationSeconds || 0
    : (course.durationMinutes || 0) * 60;

  const hours = Math.floor(totalDurationSeconds / 3600);
  const minutes = Math.floor((totalDurationSeconds % 3600) / 60);
  const durationText =
    hours > 0 ? `${hours} س ${minutes > 0 ? `${minutes} د` : ""}` : `${minutes} د`;

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-md",
        className
      )}
    >
      {/* Thumbnail Container */}
      <Link
        href={`/courses/${slug}`}
        className="relative aspect-video w-full overflow-hidden bg-muted block"
      >
        {thumbnail && (thumbnail.startsWith("http://") || thumbnail.startsWith("https://") || thumbnail.startsWith("/")) ? (
          <Image
            src={thumbnail}
            alt={title || "دورة تعليمية"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={thumbnail.startsWith("http")}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary">
            <Sparkle className="h-10 w-10 opacity-40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40" />

        {/* Top Badges */}
        <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 z-10">
          {category && (
            <Badge variant="secondary" className="backdrop-blur-md bg-surface/90 font-medium text-[11px]">
              {category}
            </Badge>
          )}
          {level && (
            <Badge variant="outline" className="backdrop-blur-md bg-surface/80 text-[10px]">
              {levelLabels[level] || level}
            </Badge>
          )}
        </div>
      </Link>

      {/* Content Container */}
      <div className="flex flex-1 flex-col p-5 text-right space-y-3.5">
        {/* Course Title */}
        <Link href={`/courses/${slug}`} className="block group-hover:text-primary transition-colors">
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground">
            {title}
          </h3>
        </Link>

        {/* Short Description */}
        {shortDescription && (
          <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {shortDescription}
          </p>
        )}

        {/* Instructor Info */}
        <div className="flex items-center gap-2.5 pt-1">
          <Avatar
            src={instructorAvatar}
            alt={instructorName}
            fallback={instructorName}
            size="sm"
          />
          <div className="overflow-hidden">
            <p className="truncate text-xs font-semibold text-foreground">
              {instructorName}
            </p>
            <p className="truncate text-[11px] text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>مدرب معتمد في MAWJA</span>
            </p>
          </div>
        </div>

        {/* Meta Specs (Duration & Lessons) */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border/60 pt-3">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>{durationText}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <span>{lessonCount} درس</span>
          </div>
        </div>

        {/* Pricing & Footer */}
        <div className="flex items-center justify-between pt-2 mt-auto border-t border-border/40">
          <div className="space-y-0.5">
            <span className="block text-lg font-extrabold text-primary">
              {price === 0 ? "مجاناً" : formatDZD(price)}
            </span>
          </div>
          <Link
            href={`/courses/${slug}`}
            className="inline-flex items-center justify-center rounded-lg bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            التفاصيل والمنهج
          </Link>
        </div>
      </div>
    </div>
  );
}
