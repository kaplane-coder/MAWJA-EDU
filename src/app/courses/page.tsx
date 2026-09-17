import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Sparkle, CaretRight, CaretLeft } from "@phosphor-icons/react/dist/ssr";
import { getPublishedCourses } from "@/lib/courses";
import { CatalogFilters } from "@/components/course/catalog-filters";
import { CourseGrid } from "@/components/course/course-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "دليل الدورات التدريبية | MAWJA",
  description: "استكشف دورات البرمجة والتقنية المعتمدة في الجزائر بجودة عالمية وتطبيق عملي حقيقي.",
};

interface CoursesCatalogPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    level?: string;
    sort?: "newest" | "price-asc" | "price-desc";
    page?: string;
  }>;
}

export default async function CoursesCatalogPage({
  searchParams,
}: CoursesCatalogPageProps) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1", 10);
  const limit = 8;

  let courses: Awaited<ReturnType<typeof getPublishedCourses>>["courses"] = [];
  let total = 0;
  let totalPages = 0;

  try {
    const result = await getPublishedCourses({
      q: resolvedParams.q,
      category: resolvedParams.category,
      level: resolvedParams.level,
      sort: resolvedParams.sort,
      page,
      limit,
    });
    courses = result.courses;
    total = result.total;
    totalPages = result.totalPages;
  } catch (error) {
    console.error("Courses catalog fetch failed:", error);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-right">
      {/* Header Banner */}
      <div className="space-y-2 border-b border-border pb-6">
        <Badge variant="default" className="gap-1 mb-1">
          <Sparkle className="h-3.5 w-3.5" />
          <span>كتالوج الدورات المعتمدة</span>
        </Badge>
        <h1 className="text-h1 font-bold text-foreground">
          استكشف المسارات والبرامج التدريبية
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          اختر من بين مجموعة مختارة من الدورات המوجهة للإنتاج الفعلي من نخبة
          المهندسين والمطورين في الجزائر.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <React.Suspense fallback={<div className="h-20 bg-muted/20 animate-pulse rounded-2xl" />}>
        <CatalogFilters />
      </React.Suspense>

      {/* Results Header & Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/40 pb-3">
          <span>
            عرض <strong className="text-foreground">{courses.length}</strong> من أصل{" "}
            <strong className="text-foreground">{total}</strong> دورة منشورة
          </span>
          {resolvedParams.q && (
            <span>
              نتائج البحث عن: &ldquo;<strong className="text-primary">{resolvedParams.q}</strong>&rdquo;
            </span>
          )}
        </div>

        <CourseGrid
          courses={courses}
          emptyTitle="لا توجد دورات مطابقة لخيارات البحث"
          emptyDescription="جرّب تغيير كلمات البحث أو إزالة بعض الفلاتر لاستعراض المزيد من الدورات."
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6 border-t border-border">
            {page > 1 && (
              <Link
                href={{
                  pathname: "/courses",
                  query: { ...resolvedParams, page: (page - 1).toString() },
                }}
              >
                <Button variant="outline" size="sm" className="gap-1 text-xs">
                  <CaretRight className="h-4 w-4" />
                  <span>الصفحة السابقة</span>
                </Button>
              </Link>
            )}

            <div className="text-xs font-semibold px-4 text-muted-foreground">
              صفحة {page} من {totalPages}
            </div>

            {page < totalPages && (
              <Link
                href={{
                  pathname: "/courses",
                  query: { ...resolvedParams, page: (page + 1).toString() },
                }}
              >
                <Button variant="outline" size="sm" className="gap-1 text-xs">
                  <span>الصفحة التالية</span>
                  <CaretLeft className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
