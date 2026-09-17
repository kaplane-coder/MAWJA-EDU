export * from "./database.types";

// UI / Domain Presentation Models (for Mock Data & UI Components)
export interface Formateur {
  id: string;
  fullName: string;
  headline: string;
  bio?: string;
  avatarUrl: string;
  totalStudents: number;
  totalCourses: number;
  rating: number;
}

export interface CourseCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconName: string;
  courseCount: number;
}

export interface UILesson {
  id: string;
  title: string;
  durationMinutes: number;
  isFreePreview: boolean;
  orderIndex: number;
}

export interface UISection {
  id: string;
  title: string;
  orderIndex: number;
  lessons: UILesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription?: string;
  thumbnailUrl: string;
  price: number;
  originalPrice?: number;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "ARCHIVED";
  category: string;
  categorySlug: string;
  formateur: Formateur;
  rating: number;
  ratingCount: number;
  studentsCount: number;
  durationMinutes: number;
  lessonsCount: number;
  badge?: "EXCLUSIVE" | "BESTSELLER" | "NEW" | "TRENDING";
  updatedAt: string;
  sections?: UISection[];
}
