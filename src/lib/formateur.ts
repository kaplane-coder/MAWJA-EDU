import { createClient } from "@/lib/supabase/server";

export interface FormateurDashboardStats {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  pendingCourses: number;
  totalStudents: number;
  totalEnrollments: number;
  recentCourses: FormateurRecentCourseItem[];
}

export interface FormateurRecentCourseItem {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "ARCHIVED";
  price: number;
  thumbnail_path: string | null;
  studentCount: number;
  sectionCount: number;
  lessonCount: number;
  updated_at: string;
}

export interface FormateurStudentItem {
  enrollment_id: string;
  enrolled_at: string;
  student: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    phone: string | null;
  };
  course: {
    id: string;
    title: string;
    slug: string;
  };
  progress: {
    completedLessons: number;
    totalLessons: number;
    progressPercentage: number;
  };
}

interface FormateurCourseQueryRow {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "ARCHIVED";
  price: number;
  thumbnail_path: string | null;
  updated_at: string;
  course_sections: {
    id: string;
    lessons: { id: string }[];
  }[];
  enrollments: {
    id: string;
    student_id: string;
    status: string;
  }[];
}

interface FormateurEnrollmentQueryRow {
  id: string;
  enrolled_at: string;
  student_id: string;
  course_id: string;
  profiles: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    phone: string | null;
  };
  courses: {
    id: string;
    title: string;
    slug: string;
    formateur_id: string;
    course_sections: {
      id: string;
      lessons: { id: string }[];
    }[];
  };
}

/**
 * Retrieves comprehensive live metrics and courses for a formateur
 */
export async function getFormateurDashboardStats(
  formateurId: string
): Promise<FormateurDashboardStats> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .select(
      `
      id,
      title,
      slug,
      status,
      price,
      thumbnail_path,
      updated_at,
      course_sections (
        id,
        lessons (
          id
        )
      ),
      enrollments (
        id,
        student_id,
        status
      )
    `
    )
    .eq("formateur_id", formateurId)
    .order("updated_at", { ascending: false });

  if (error || !data) {
    return {
      totalCourses: 0,
      publishedCourses: 0,
      draftCourses: 0,
      pendingCourses: 0,
      totalStudents: 0,
      totalEnrollments: 0,
      recentCourses: [],
    };
  }

  const courses = data as unknown as FormateurCourseQueryRow[];

  let publishedCourses = 0;
  let draftCourses = 0;
  let pendingCourses = 0;
  let totalEnrollments = 0;
  const uniqueStudentsSet = new Set<string>();

  const recentCourses: FormateurRecentCourseItem[] = courses.map((c) => {
    if (c.status === "PUBLISHED") publishedCourses++;
    else if (c.status === "DRAFT") draftCourses++;
    else if (c.status === "PENDING_REVIEW") pendingCourses++;

    const activeEnrollments = (c.enrollments || []).filter(
      (e) => e.status === "ACTIVE"
    );
    const studentCount = activeEnrollments.length;
    totalEnrollments += studentCount;

    activeEnrollments.forEach((e) => {
      if (e.student_id) uniqueStudentsSet.add(e.student_id);
    });

    let lessonCount = 0;
    const sections = c.course_sections || [];
    sections.forEach((s) => {
      lessonCount += s.lessons?.length || 0;
    });

    return {
      id: c.id,
      title: c.title,
      slug: c.slug,
      status: c.status,
      price: Number(c.price || 0),
      thumbnail_path: c.thumbnail_path || null,
      studentCount,
      sectionCount: sections.length,
      lessonCount,
      updated_at: c.updated_at,
    };
  });

  return {
    totalCourses: courses.length,
    publishedCourses,
    draftCourses,
    pendingCourses,
    totalStudents: uniqueStudentsSet.size,
    totalEnrollments,
    recentCourses,
  };
}

/**
 * Retrieves students enrolled in courses owned by the authenticated formateur
 * Strictly enforces that formateurs can only see students in their own courses.
 */
export async function getFormateurStudentsList(
  formateurId: string,
  options?: { courseId?: string; search?: string }
): Promise<{
  students: FormateurStudentItem[];
  coursesFilterList: { id: string; title: string }[];
}> {
  const supabase = await createClient();

  // 1. Fetch formateur's own courses for filter list & authorization verification
  const { data: ownCourses } = await supabase
    .from("courses")
    .select("id, title")
    .eq("formateur_id", formateurId);

  const coursesFilterList = ownCourses || [];
  const ownCourseIds = coursesFilterList.map((c) => c.id);

  if (ownCourseIds.length === 0) {
    return { students: [], coursesFilterList: [] };
  }

  // Security guard: If courseId is passed in options, ensure it belongs to this formateur
  const targetCourseIds =
    options?.courseId && ownCourseIds.includes(options.courseId)
      ? [options.courseId]
      : ownCourseIds;

  // 2. Fetch active enrollments in these courses
  const query = supabase
    .from("enrollments")
    .select(
      `
      id,
      enrolled_at,
      student_id,
      course_id,
      profiles:student_id (
        id,
        full_name,
        email,
        avatar_url,
        phone
      ),
      courses (
        id,
        title,
        slug,
        formateur_id,
        course_sections (
          id,
          lessons (
            id
          )
        )
      )
    `
    )
    .in("course_id", targetCourseIds)
    .eq("status", "ACTIVE")
    .order("enrolled_at", { ascending: false });

  const { data: enrollmentsData, error } = await query;

  if (error || !enrollmentsData) {
    return { students: [], coursesFilterList };
  }

  // Fetch all completed lessons for these courses & students
  const { data: progressRows } = await supabase
    .from("student_lesson_progress")
    .select("student_id, course_id, completed")
    .in("course_id", targetCourseIds)
    .eq("completed", true);

  const completedMap = new Map<string, number>();
  if (progressRows) {
    progressRows.forEach((p) => {
      const key = `${p.student_id}_${p.course_id}`;
      const count = completedMap.get(key) || 0;
      completedMap.set(key, count + 1);
    });
  }

  const rawRows = enrollmentsData as unknown as FormateurEnrollmentQueryRow[];

  let students: FormateurStudentItem[] = rawRows.map((row) => {
    let totalLessons = 0;
    if (row.courses?.course_sections) {
      row.courses.course_sections.forEach((s) => {
        totalLessons += s.lessons?.length || 0;
      });
    }

    const completedKey = `${row.student_id}_${row.course_id}`;
    const completedLessons = completedMap.get(completedKey) || 0;
    const progressPercentage =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      enrollment_id: row.id,
      enrolled_at: row.enrolled_at,
      student: {
        id: row.profiles?.id || row.student_id,
        full_name: row.profiles?.full_name || "طالب",
        email: row.profiles?.email || "",
        avatar_url: row.profiles?.avatar_url || null,
        phone: row.profiles?.phone || null,
      },
      course: {
        id: row.courses?.id || row.course_id,
        title: row.courses?.title || "دورة تدريبية",
        slug: row.courses?.slug || "",
      },
      progress: {
        completedLessons,
        totalLessons,
        progressPercentage,
      },
    };
  });

  // Client search filter (by student name or email)
  if (options?.search && options.search.trim() !== "") {
    const searchLower = options.search.trim().toLowerCase();
    students = students.filter(
      (s) =>
        s.student.full_name.toLowerCase().includes(searchLower) ||
        s.student.email.toLowerCase().includes(searchLower)
    );
  }

  return { students, coursesFilterList };
}

/**
 * Retrieves full formateur profile including verification and stats
 */
export async function getFormateurProfileData(formateurId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", formateurId)
    .single();

  const { data: formateurProfile } = await supabase
    .from("formateur_profiles")
    .select("*")
    .eq("id", formateurId)
    .maybeSingle();

  const { totalCourses, publishedCourses, totalStudents } =
    await getFormateurDashboardStats(formateurId);

  return {
    profile,
    formateurProfile,
    stats: {
      totalCourses,
      publishedCourses,
      totalStudents,
      isVerified: formateurProfile?.is_verified || false,
    },
  };
}
