import { createClient } from "@/lib/supabase/server";
import { MOCK_COURSES } from "@/lib/constants";
import type { CourseLevel, CourseStatus, LessonContentType } from "@/types/database.types";

export interface CourseWithInstructor {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  category: string | null;
  thumbnail_path: string | null;
  preview_video_path: string | null;
  price: number;
  level: CourseLevel;
  status: CourseStatus;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  instructor: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    headline?: string | null;
    bio?: string | null;
  };
  stats: {
    sectionCount: number;
    lessonCount: number;
    totalDurationSeconds: number;
  };
}

export interface CourseLessonItem {
  id: string;
  section_id?: string;
  title: string;
  content_type: LessonContentType;
  video_path: string | null;
  article_content: string | null;
  duration_seconds: number;
  is_free_preview: boolean;
  order_index: number;
  created_at?: string;
}

export interface CourseSectionItem {
  id: string;
  course_id?: string;
  title: string;
  order_index: number;
  lessons: CourseLessonItem[];
}

export interface CourseDetailModel extends CourseWithInstructor {
  sections: CourseSectionItem[];
}

export interface CatalogQueryParams {
  q?: string;
  category?: string;
  level?: string;
  sort?: "newest" | "price-asc" | "price-desc";
  page?: number;
  limit?: number;
}

interface RawLessonRecord {
  id: string;
  section_id?: string;
  title?: string;
  content_type?: LessonContentType;
  video_path?: string | null;
  article_content?: string | null;
  duration_seconds?: number;
  is_free_preview?: boolean;
  order_index?: number;
  created_at?: string;
}

interface RawSectionRecord {
  id: string;
  course_id?: string;
  title: string;
  order_index: number;
  lessons?: RawLessonRecord[];
}

interface RawInstructorProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  email?: string;
  formateur_profiles?: Array<{
    headline: string | null;
    bio: string | null;
  }>;
}

interface RawCourseRecord {
  id: string;
  formateur_id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  category: string | null;
  thumbnail_path: string | null;
  preview_video_path: string | null;
  price: number;
  level: CourseLevel;
  status: CourseStatus;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
  profiles?: RawInstructorProfile;
  course_sections?: RawSectionRecord[];
}

/**
 * Retrieves public PUBLISHED courses with filtering, search, sorting, and pagination
 */
export async function getPublishedCourses(params: CatalogQueryParams = {}) {
  const {
    q,
    category,
    level,
    sort = "newest",
    page = 1,
    limit = 9,
  } = params;

  const supabase = await createClient();

  let query = supabase
    .from("courses")
    .select(
      `
      id,
      title,
      slug,
      short_description,
      description,
      category,
      thumbnail_path,
      preview_video_path,
      price,
      level,
      status,
      created_at,
      updated_at,
      profiles:formateur_id (
        id,
        full_name,
        avatar_url
      ),
      course_sections (
        id,
        lessons (
          id,
          duration_seconds
        )
      )
    `,
      { count: "exact" }
    )
    .eq("status", "PUBLISHED");

  // Search filter
  if (q && q.trim()) {
    query = query.ilike("title", `%${q.trim()}%`);
  }

  // Category filter
  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  // Level filter
  if (level && level !== "all") {
    query = query.eq("level", level as CourseLevel);
  }

  // Sorting
  if (sort === "price-asc") {
    query = query.order("price", { ascending: true });
  } else if (sort === "price-desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error || !data) {
    return { courses: [], total: 0, totalPages: 1 };
  }

  const rawCourses = data as unknown as RawCourseRecord[];

  const courses: CourseWithInstructor[] = rawCourses.map((item) => {
    let lessonCount = 0;
    let totalDurationSeconds = 0;

    if (item.course_sections) {
      item.course_sections.forEach((sec) => {
        if (sec.lessons) {
          lessonCount += sec.lessons.length;
          sec.lessons.forEach((les) => {
            totalDurationSeconds += les.duration_seconds || 0;
          });
        }
      });
    }

    return {
      id: item.id,
      title: item.title,
      slug: item.slug,
      short_description: item.short_description,
      description: item.description,
      category: item.category,
      thumbnail_path: item.thumbnail_path,
      preview_video_path: item.preview_video_path,
      price: item.price,
      level: item.level,
      status: item.status,
      rejection_reason: null,
      created_at: item.created_at,
      updated_at: item.updated_at,
      instructor: {
        id: item.profiles?.id || "",
        full_name: item.profiles?.full_name || "مدرب معتمد",
        avatar_url: item.profiles?.avatar_url || null,
      },
      stats: {
        sectionCount: item.course_sections ? item.course_sections.length : 0,
        lessonCount,
        totalDurationSeconds,
      },
    };
  });

  const total = count || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  return { courses, total, totalPages };
}

/**
 * Retrieves full course detail by slug for published public view
 */
export async function getPublishedCourseBySlug(
  slug: string
): Promise<CourseDetailModel | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .select(
      `
      id,
      title,
      slug,
      short_description,
      description,
      category,
      thumbnail_path,
      preview_video_path,
      price,
      level,
      status,
      created_at,
      updated_at,
      profiles:formateur_id (
        id,
        full_name,
        avatar_url,
        formateur_profiles (
          headline,
          bio
        )
      ),
      course_sections (
        id,
        title,
        order_index,
        lessons (
          id,
          title,
          content_type,
          duration_seconds,
          is_free_preview,
          order_index
        )
      )
    `
    )
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .maybeSingle();

  if (error || !data) {
    const mock = MOCK_COURSES.find((c) => c.slug === slug);
    if (mock) {
      return {
        id: mock.id,
        title: mock.title,
        slug: mock.slug,
        short_description: mock.shortDescription,
        description:
          mock.shortDescription +
          "\n\nتتضمن هذه الدورة تدريباً عملياً مكثفاً ومشاريع تطبيقية حقيقية خطوة بخطوة مع شهادة إنجاز معتمدة.",
        category: mock.category || "تطوير البرمجيات",
        thumbnail_path: mock.thumbnailUrl,
        preview_video_path: null,
        price: mock.price,
        level: mock.level,
        status: "PUBLISHED",
        rejection_reason: null,
        created_at: mock.updatedAt || new Date().toISOString(),
        updated_at: mock.updatedAt || new Date().toISOString(),
        sections: [
          {
            id: "sec-1",
            title: "المقدمة والتهيئة الأساسية",
            order_index: 1,
            lessons: [
              {
                id: "les-1",
                title: "مقدمة المسار والأهداف التعليمية",
                content_type: "VIDEO",
                video_path: null,
                article_content: null,
                duration_seconds: 480,
                is_free_preview: true,
                order_index: 1,
              },
              {
                id: "les-2",
                title: "تجهيز بيئة العمل والأدوات اللازمة",
                content_type: "VIDEO",
                video_path: null,
                article_content: null,
                duration_seconds: 900,
                is_free_preview: false,
                order_index: 2,
              },
            ],
          },
          {
            id: "sec-2",
            title: "المفاهيم والتطبيقات العملية المتقدمة",
            order_index: 2,
            lessons: [
              {
                id: "les-3",
                title: "بناء الهيكل والأنماط المعمارية للإنتاج",
                content_type: "VIDEO",
                video_path: null,
                article_content: null,
                duration_seconds: 1200,
                is_free_preview: false,
                order_index: 1,
              },
              {
                id: "les-4",
                title: "تطبيق عملي شامل واختبار الأداء",
                content_type: "ARTICLE",
                video_path: null,
                article_content: "دليل تطبيقي شامل لإتقان المهارات وبناء المشروع النهائي.",
                duration_seconds: 600,
                is_free_preview: false,
                order_index: 2,
              },
            ],
          },
        ],
        instructor: {
          id: mock.formateur?.id || "mock-formateur",
          full_name: mock.formateur?.fullName || "مدرب معتمد",
          avatar_url: mock.formateur?.avatarUrl || null,
          headline: mock.formateur?.headline || "مدرب معتمد في MAWJA",
          bio: mock.formateur?.bio || "خبير وممارس ذو خبرة تطبيقية في كبرى المشاريع.",
        },
        stats: {
          sectionCount: 2,
          lessonCount: mock.lessonsCount || 4,
          totalDurationSeconds: (mock.durationMinutes || 60) * 60,
        },
      };
    }
    return null;
  }

  const rawCourse = data as unknown as RawCourseRecord;
  const rawSections: CourseSectionItem[] = (
    rawCourse.course_sections || []
  ).map((sec) => ({
    id: sec.id,
    title: sec.title,
    order_index: sec.order_index,
    lessons: (sec.lessons || []).map((les) => ({
      id: les.id,
      title: les.title || "درس بدون عنوان",
      content_type: les.content_type || "VIDEO",
      video_path: null,
      article_content: null,
      duration_seconds: les.duration_seconds || 0,
      is_free_preview: Boolean(les.is_free_preview),
      order_index: les.order_index || 0,
    })),
  }));

  rawSections.sort((a, b) => a.order_index - b.order_index);
  rawSections.forEach((sec) => {
    sec.lessons.sort((a, b) => a.order_index - b.order_index);
  });

  let totalDuration = 0;
  let totalLessons = 0;
  rawSections.forEach((sec) => {
    totalLessons += sec.lessons.length;
    sec.lessons.forEach((les) => {
      totalDuration += les.duration_seconds;
    });
  });

  const instructorProfile = rawCourse.profiles;
  const instructorDetails = instructorProfile?.formateur_profiles?.[0];

  return {
    id: rawCourse.id,
    title: rawCourse.title,
    slug: rawCourse.slug,
    short_description: rawCourse.short_description,
    description: rawCourse.description,
    category: rawCourse.category,
    thumbnail_path: rawCourse.thumbnail_path,
    preview_video_path: rawCourse.preview_video_path,
    price: rawCourse.price,
    level: rawCourse.level,
    status: rawCourse.status,
    rejection_reason: null,
    created_at: rawCourse.created_at,
    updated_at: rawCourse.updated_at,
    sections: rawSections,
    instructor: {
      id: instructorProfile?.id || "",
      full_name: instructorProfile?.full_name || "مدرب معتمد",
      avatar_url: instructorProfile?.avatar_url || null,
      headline: instructorDetails?.headline || null,
      bio: instructorDetails?.bio || null,
    },
    stats: {
      sectionCount: rawSections.length,
      lessonCount: totalLessons,
      totalDurationSeconds: totalDuration,
    },
  };
}

/**
 * Retrieves all courses created by a specific Formateur
 */
export async function getFormateurCourses(formateurId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .select(
      `
      id,
      formateur_id,
      title,
      slug,
      short_description,
      description,
      category,
      thumbnail_path,
      preview_video_path,
      price,
      level,
      status,
      rejection_reason,
      created_at,
      updated_at,
      course_sections (
        id,
        lessons (
          id,
          duration_seconds
        )
      )
    `
    )
    .eq("formateur_id", formateurId)
    .order("updated_at", { ascending: false });

  if (error || !data) {
    return {
      courses: [],
      stats: { total: 0, published: 0, draft: 0, pendingReview: 0, archived: 0 },
    };
  }

  let published = 0;
  let draft = 0;
  let pendingReview = 0;
  let archived = 0;

  const rawCourses = data as unknown as RawCourseRecord[];

  const courses = rawCourses.map((item) => {
    if (item.status === "PUBLISHED") published++;
    else if (item.status === "DRAFT") draft++;
    else if (item.status === "PENDING_REVIEW") pendingReview++;
    else if (item.status === "ARCHIVED") archived++;

    let lessonCount = 0;
    let totalDurationSeconds = 0;
    if (item.course_sections) {
      item.course_sections.forEach((sec) => {
        if (sec.lessons) {
          lessonCount += sec.lessons.length;
          sec.lessons.forEach((les) => {
            totalDurationSeconds += les.duration_seconds || 0;
          });
        }
      });
    }

    return {
      ...item,
      stats: {
        sectionCount: item.course_sections ? item.course_sections.length : 0,
        lessonCount,
        totalDurationSeconds,
      },
    };
  });

  return {
    courses,
    stats: {
      total: data.length,
      published,
      draft,
      pendingReview,
      archived,
    },
  };
}

/**
 * Retrieves a course with full sections and lessons for curriculum editing
 */
export async function getCourseForEditing(
  courseId: string,
  formateurId: string,
  isAdmin: boolean = false
) {
  const supabase = await createClient();

  let query = supabase
    .from("courses")
    .select(
      `
      id,
      formateur_id,
      title,
      slug,
      short_description,
      description,
      category,
      thumbnail_path,
      preview_video_path,
      price,
      level,
      status,
      rejection_reason,
      created_at,
      updated_at,
      course_sections (
        id,
        course_id,
        title,
        order_index,
        lessons (
          id,
          section_id,
          title,
          content_type,
          video_path,
          article_content,
          duration_seconds,
          is_free_preview,
          order_index,
          created_at
        )
      )
    `
    )
    .eq("id", courseId);

  if (!isAdmin) {
    query = query.eq("formateur_id", formateurId);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) {
    return null;
  }

  const rawCourse = data as unknown as RawCourseRecord;
  const rawSections: CourseSectionItem[] = (
    rawCourse.course_sections || []
  ).map((sec) => ({
    id: sec.id,
    course_id: sec.course_id,
    title: sec.title,
    order_index: sec.order_index,
    lessons: (sec.lessons || []).map((les) => ({
      id: les.id,
      section_id: les.section_id,
      title: les.title || "درس بدون عنوان",
      content_type: les.content_type || "VIDEO",
      video_path: les.video_path || null,
      article_content: les.article_content || null,
      duration_seconds: les.duration_seconds || 0,
      is_free_preview: Boolean(les.is_free_preview),
      order_index: les.order_index || 0,
      created_at: les.created_at,
    })),
  }));

  rawSections.sort((a, b) => a.order_index - b.order_index);
  rawSections.forEach((sec) => {
    sec.lessons.sort((a, b) => a.order_index - b.order_index);
  });

  return {
    ...rawCourse,
    sections: rawSections,
  };
}

/**
 * Retrieves courses for Admin review queue
 */
export async function getAdminCourses(statusFilter?: CourseStatus) {
  const supabase = await createClient();

  let query = supabase
    .from("courses")
    .select(
      `
      id,
      formateur_id,
      title,
      slug,
      short_description,
      description,
      category,
      thumbnail_path,
      preview_video_path,
      price,
      level,
      status,
      rejection_reason,
      created_at,
      updated_at,
      profiles:formateur_id (
        id,
        full_name,
        email,
        avatar_url
      ),
      course_sections (
        id,
        title,
        order_index,
        lessons (
          id,
          title,
          content_type,
          duration_seconds,
          is_free_preview,
          order_index
        )
      )
    `
    )
    .order("updated_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  const rawCourses = data as unknown as RawCourseRecord[];

  return rawCourses.map((item) => {
    let lessonCount = 0;
    let totalDurationSeconds = 0;
    if (item.course_sections) {
      item.course_sections.forEach((sec) => {
        if (sec.lessons) {
          lessonCount += sec.lessons.length;
          sec.lessons.forEach((les) => {
            totalDurationSeconds += les.duration_seconds || 0;
          });
        }
      });
    }

    return {
      ...item,
      instructor: item.profiles,
      stats: {
        sectionCount: item.course_sections ? item.course_sections.length : 0,
        lessonCount,
        totalDurationSeconds,
      },
    };
  });
}
