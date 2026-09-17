import { z } from "zod";

export const courseLevels = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "ALL_LEVELS",
] as const;

export const courseCategories = [
  "web-development",
  "mobile-apps",
  "ui-ux-design",
  "ai-data-science",
  "devops-cloud",
  "cybersecurity",
  "business-tech",
] as const;

export const lessonContentTypes = [
  "VIDEO",
  "ARTICLE",
  "QUIZ",
  "ATTACHMENT",
] as const;

/**
 * Validates course metadata and basic settings
 */
export const courseSchema = z.object({
  title: z
    .string()
    .min(1, "عنوان الدورة مطلوب")
    .min(5, "عنوان الدورة يجب أن يحتوي على 5 أحرف على الأقل")
    .max(120, "عنوان الدورة يجب أن لا يتجاوز 120 حرفاً"),
  slug: z
    .string()
    .min(1, "الاسم اللطيف (Slug) مطلوب")
    .min(3, "الاسم اللطيف يجب أن لا يقل عن 3 أحرف")
    .max(100, "الاسم اللطيف طويل جداً")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "الاسم اللطيف يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط"),
  short_description: z
    .string()
    .min(1, "الوصف المختصر مطلوب")
    .min(15, "الوصف المختصر يجب أن يحتوي على 15 حرفاً على الأقل")
    .max(250, "الوصف المختصر يجب ألا يتجاوز 250 حرفاً"),
  description: z
    .string()
    .min(1, "الوصف التفصيلي مطلوب")
    .min(30, "الوصف التفصيلي يجب أن يحتوي على 30 حرفاً على الأقل"),
  category: z
    .string()
    .min(1, "يرجى اختيار تصنيف الدورة"),
  level: z.enum(courseLevels, {
    errorMap: () => ({ message: "يرجى تحديد المستوى التعليمي للدورة" }),
  }),
  price: z.coerce
    .number({ invalid_type_error: "السعر يجب أن يكون رقماً" })
    .min(0, "السعر لا يمكن أن يكون سالباً")
    .max(500000, "السعر يتجاوز الحد الأقصى المسموح به"),
  thumbnail_path: z.string().optional().nullable(),
  preview_video_path: z.string().optional().nullable(),
});

export type CourseInput = z.infer<typeof courseSchema>;

/**
 * Validates course section
 */
export const sectionSchema = z.object({
  title: z
    .string()
    .min(1, "عنوان الفصل مطلوب")
    .min(3, "عنوان الفصل يجب أن يحتوي على 3 أحرف على الأقل")
    .max(100, "عنوان الفصل يجب ألا يتجاوز 100 حرف"),
  order_index: z.coerce.number().min(0, "ترتيب الفصل يجب أن يكون 0 أو أكبر"),
});

export type SectionInput = z.infer<typeof sectionSchema>;

/**
 * Validates course lesson
 */
export const lessonSchema = z.object({
  title: z
    .string()
    .min(1, "عنوان الدرس مطلوب")
    .min(3, "عنوان الدرس يجب أن يحتوي على 3 أحرف على الأقل")
    .max(120, "عنوان الدرس يجب ألا يتجاوز 120 حرفاً"),
  content_type: z.enum(lessonContentTypes, {
    errorMap: () => ({ message: "يرجى اختيار نوع محتوى الدرس" }),
  }),
  video_path: z.string().optional().nullable(),
  article_content: z.string().optional().nullable(),
  duration_seconds: z.coerce
    .number()
    .min(0, "مدة الدرس بالثواني لا يمكن أن تكون سالبة")
    .default(0),
  is_free_preview: z.boolean().default(false),
  order_index: z.coerce.number().min(0, "ترتيب الدرس يجب أن يكون 0 أو أكبر"),
});

export type LessonInput = z.infer<typeof lessonSchema>;

/**
 * Validates course rejection by Admin
 */
export const rejectCourseSchema = z.object({
  rejection_reason: z
    .string()
    .min(1, "سبب الرفض إلزامي لتوجيه المدرب")
    .min(10, "سبب الرفض يجب أن يحتوي على 10 أحرف على الأقل لتوضيح المطلوب تعديله")
    .max(1000, "سبب الرفض طويل جداً"),
});

export type RejectCourseInput = z.infer<typeof rejectCourseSchema>;
