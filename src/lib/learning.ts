import { createClient } from "@/lib/supabase/server";
import type { LessonContentType } from "@/types/database.types";

export interface ClassroomLessonItem {
  id: string;
  section_id: string;
  title: string;
  content_type: LessonContentType;
  video_path: string | null;
  video_signed_url: string | null;
  article_content: string | null;
  duration_seconds: number;
  is_free_preview: boolean;
  order_index: number;
  progress_seconds: number;
  completed: boolean;
  completed_at: string | null;
  last_watched_at: string | null;
}

export interface ClassroomSectionItem {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  lessons: ClassroomLessonItem[];
}

export interface ClassroomData {
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail_path: string | null;
    instructor: {
      id: string;
      full_name: string;
      avatar_url: string | null;
    };
  };
  sections: ClassroomSectionItem[];
  currentLesson: ClassroomLessonItem;
  previousLesson: { id: string; title: string } | null;
  nextLesson: { id: string; title: string } | null;
  stats: {
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
    totalDurationSeconds: number;
    completedDurationSeconds: number;
    isCourseCompleted: boolean;
  };
}

interface CourseQueryRow {
  id: string;
  title: string;
  slug: string;
  thumbnail_path: string | null;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
}

interface CourseSectionRow {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  lessons: Array<{
    id: string;
    section_id: string;
    title: string;
    content_type: LessonContentType;
    video_path: string | null;
    article_content: string | null;
    duration_seconds: number;
    is_free_preview: boolean;
    order_index: number;
  }> | null;
}

interface ProgressRow {
  lesson_id: string;
  progress_seconds: number;
  completed: boolean;
  completed_at: string | null;
  last_watched_at: string;
}

interface EnrolledCourseProgressRow {
  id: string;
  course_id: string;
  enrolled_at: string;
  courses: {
    id: string;
    title: string;
    slug: string;
    thumbnail_path: string | null;
    profiles: {
      full_name: string;
    } | null;
    course_sections: Array<{
      id: string;
      lessons: Array<{
        id: string;
        duration_seconds: number | null;
      }> | null;
    }> | null;
  } | null;
}

/**
 * Retrieves the complete course classroom data for an enrolled student
 */
export async function getCourseClassroomData(
  courseId: string,
  studentId: string,
  targetLessonId?: string
): Promise<ClassroomData | null> {
  const supabase = await createClient();

  // 1. Fetch Course details
  const { data: courseData, error: courseError } = await supabase
    .from("courses")
    .select(
      `
      id,
      title,
      slug,
      thumbnail_path,
      profiles:formateur_id (
        id,
        full_name,
        avatar_url
      )
    `
    )
    .eq("id", courseId)
    .maybeSingle();

  if (courseError || !courseData) {
    return null;
  }

  const courseRaw = courseData as unknown as CourseQueryRow;

  // 2. Fetch Sections & Lessons Metadata (Safe metadata only: NO article_content or raw video_path)
  const { data: sectionsData, error: sectionsError } = await supabase
    .from("course_sections")
    .select(
      `
      id,
      course_id,
      title,
      order_index,
      lessons (
        id,
        section_id,
        title,
        content_type,
        duration_seconds,
        is_free_preview,
        order_index
      )
    `
    )
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });

  if (sectionsError || !sectionsData) {
    return null;
  }

  // 3. Fetch Student's Progress for this course
  const { data: progressData } = await supabase
    .from("student_lesson_progress")
    .select("lesson_id, progress_seconds, completed, completed_at, last_watched_at")
    .eq("student_id", studentId)
    .eq("course_id", courseId);

  const progressMap = new Map<string, ProgressRow>();
  if (progressData) {
    (progressData as ProgressRow[]).forEach((p) => {
      progressMap.set(p.lesson_id, p);
    });
  }

  // 4. Flatten and merge lessons metadata (All protected content stripped)
  const flatLessons: ClassroomLessonItem[] = [];
  const sections: ClassroomSectionItem[] = (sectionsData as unknown as CourseSectionRow[]).map(
    (sec) => {
      const sortedLessons = (sec.lessons || []).sort(
        (a, b) => a.order_index - b.order_index
      );

      const enrichedLessons: ClassroomLessonItem[] = sortedLessons.map((l) => {
        const prog = progressMap.get(l.id);
        const item: ClassroomLessonItem = {
          id: l.id,
          section_id: l.section_id,
          title: l.title,
          content_type: l.content_type,
          video_path: null, // Protected: never leaked to sidebar
          video_signed_url: null, // Protected: never leaked to sidebar
          article_content: null, // Protected: never leaked to sidebar
          duration_seconds: l.duration_seconds || 0,
          is_free_preview: l.is_free_preview,
          order_index: l.order_index,
          progress_seconds: prog?.progress_seconds || 0,
          completed: Boolean(prog?.completed),
          completed_at: prog?.completed_at || null,
          last_watched_at: prog?.last_watched_at || null,
        };
        flatLessons.push(item);
        return item;
      });

      return {
        id: sec.id,
        course_id: sec.course_id,
        title: sec.title,
        order_index: sec.order_index,
        lessons: enrichedLessons,
      };
    }
  );

  if (flatLessons.length === 0) {
    return null;
  }

  // 5. Determine Current Active Lesson
  let currentIdx = -1;

  if (targetLessonId) {
    currentIdx = flatLessons.findIndex((l) => l.id === targetLessonId);
  }

  if (currentIdx === -1) {
    // Look up most recently watched
    let mostRecentLesson: ClassroomLessonItem | null = null;
    let mostRecentTime = 0;

    flatLessons.forEach((l) => {
      if (l.last_watched_at) {
        const t = new Date(l.last_watched_at).getTime();
        if (t > mostRecentTime) {
          mostRecentTime = t;
          mostRecentLesson = l;
        }
      }
    });

    if (mostRecentLesson) {
      currentIdx = flatLessons.findIndex((l) => l.id === (mostRecentLesson as ClassroomLessonItem).id);
    }
  }

  if (currentIdx === -1) {
    // Find first incomplete lesson
    currentIdx = flatLessons.findIndex((l) => !l.completed);
  }

  if (currentIdx === -1) {
    currentIdx = 0;
  }

  const baseCurrentLesson = flatLessons[currentIdx];
  const previousLesson = currentIdx > 0 ? { id: flatLessons[currentIdx - 1].id, title: flatLessons[currentIdx - 1].title } : null;
  const nextLesson = currentIdx < flatLessons.length - 1 ? { id: flatLessons[currentIdx + 1].id, title: flatLessons[currentIdx + 1].title } : null;

  // 6. Securely fetch protected content ONLY for the single active lesson
  const { data: secureLessonData } = await supabase
    .from("lessons")
    .select("video_path, article_content")
    .eq("id", baseCurrentLesson.id)
    .maybeSingle();

  const currentLesson: ClassroomLessonItem = {
    ...baseCurrentLesson,
    article_content: secureLessonData?.article_content || null,
    video_path: null, // Never expose raw storage path
    video_signed_url: null,
  };

  if (secureLessonData?.video_path) {
    if (
      secureLessonData.video_path.startsWith("http://") ||
      secureLessonData.video_path.startsWith("https://")
    ) {
      currentLesson.video_signed_url = secureLessonData.video_path;
    } else {
      // Supabase Storage path in course-materials -> short-lived signed URL
      const { data: signedData } = await supabase.storage
        .from("course-materials")
        .createSignedUrl(secureLessonData.video_path, 3600); // 1 hour

      currentLesson.video_signed_url = signedData?.signedUrl || null;
    }
  }

  // 7. Calculate aggregate stats
  const totalLessons = flatLessons.length;
  const completedLessons = flatLessons.filter((l) => l.completed).length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const totalDurationSeconds = flatLessons.reduce((acc, l) => acc + l.duration_seconds, 0);
  const completedDurationSeconds = flatLessons.filter((l) => l.completed).reduce((acc, l) => acc + l.duration_seconds, 0);

  return {
    course: {
      id: courseRaw.id,
      title: courseRaw.title,
      slug: courseRaw.slug,
      thumbnail_path: courseRaw.thumbnail_path,
      instructor: {
        id: courseRaw.profiles?.id || "",
        full_name: courseRaw.profiles?.full_name || "مدرب معتمد",
        avatar_url: courseRaw.profiles?.avatar_url || null,
      },
    },
    sections,
    currentLesson,
    previousLesson,
    nextLesson,
    stats: {
      totalLessons,
      completedLessons,
      progressPercentage,
      totalDurationSeconds,
      completedDurationSeconds,
      isCourseCompleted: completedLessons === totalLessons && totalLessons > 0,
    },
  };
}

/**
 * Retrieves student learning summary for the student main dashboard (/student)
 */
export async function getStudentLearningDashboardData(studentId: string) {
  const supabase = await createClient();

  // 1. Fetch Active Enrollments
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(
      `
      id,
      course_id,
      enrolled_at,
      courses (
        id,
        title,
        slug,
        thumbnail_path,
        profiles:formateur_id (
          full_name
        ),
        course_sections (
          id,
          lessons (
            id,
            duration_seconds
          )
        )
      )
    `
    )
    .eq("student_id", studentId)
    .eq("status", "ACTIVE");

  // 2. Fetch all progress records
  const { data: allProgress } = await supabase
    .from("student_lesson_progress")
    .select("course_id, lesson_id, progress_seconds, completed, last_watched_at")
    .eq("student_id", studentId)
    .order("last_watched_at", { ascending: false });

  const enrolledCount = enrollments?.length || 0;
  let totalWatchSeconds = 0;
  let completedCoursesCount = 0;

  if (allProgress) {
    allProgress.forEach((p) => {
      totalWatchSeconds += p.progress_seconds || 0;
    });
  }

  let courseStatsList: {
    id: string;
    title: string;
    slug: string;
    thumbnail_path: string | null;
    instructorName: string;
    progressPercentage: number;
    completedLessons: number;
    totalLessons: number;
  }[] = [];

  let continueLearningCourse: {
    id: string;
    title: string;
    slug: string;
    thumbnail_path: string | null;
    instructorName: string;
    progressPercentage: number;
    completedLessons: number;
    totalLessons: number;
  } | null = null;

  if (enrollments && enrollments.length > 0) {
    const rows = enrollments as unknown as EnrolledCourseProgressRow[];

    // Map each course stats
    courseStatsList = rows.map((enr) => {
      const course = enr.courses;
      let totalLessons = 0;
      if (course?.course_sections) {
        course.course_sections.forEach((s) => {
          totalLessons += s.lessons?.length || 0;
        });
      }

      const courseProgress = (allProgress || []).filter((p) => p.course_id === course?.id);
      const completedCount = courseProgress.filter((p) => p.completed).length;
      const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      if (progressPercentage === 100 && totalLessons > 0) {
        completedCoursesCount++;
      }

      return {
        id: course?.id || "",
        title: course?.title || "",
        slug: course?.slug || "",
        thumbnail_path: course?.thumbnail_path || null,
        instructorName: course?.profiles?.full_name || "مدرب معتمد",
        progressPercentage,
        completedLessons: completedCount,
        totalLessons,
      };
    });

    // Check if there is a recently watched course
    if (allProgress && allProgress.length > 0) {
      const mostRecentCourseId = allProgress[0].course_id;
      const found = courseStatsList.find((c) => c.id === mostRecentCourseId);
      if (found) {
        continueLearningCourse = found;
      }
    }

    if (!continueLearningCourse && courseStatsList.length > 0) {
      continueLearningCourse = courseStatsList[0];
    }
  }

  const watchHours = Math.round((totalWatchSeconds / 3600) * 10) / 10;

  return {
    enrolledCount,
    watchHours,
    completedCoursesCount,
    continueLearningCourse,
    courses: courseStatsList,
  };
}
