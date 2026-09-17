import { z } from "zod";

export const studentProfileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(3, "الاسم الكامل يجب أن يتكون من 3 أحرف على الأقل")
    .max(100, "الاسم طويل جداً"),
  username: z
    .string()
    .trim()
    .max(30, "اسم المستخدم يجب ألا يتجاوز 30 حرفاً")
    .regex(/^[a-zA-Z0-9_-]*$/, "اسم المستخدم يجب أن يحتوي فقط على أحرف إنجليزية وأرقام و _ أو -")
    .optional()
    .nullable(),
  phone: z
    .string()
    .trim()
    .max(25, "رقم الهاتف غير صالح")
    .optional()
    .nullable(),
  bio: z
    .string()
    .trim()
    .max(500, "النبذة التعريفية يجب ألا تتجاوز 500 حرف")
    .optional()
    .nullable(),
  wilaya: z.string().trim().optional().nullable(),
  city: z.string().trim().max(100, "اسم المدينة غير صالح").optional().nullable(),
  interests: z.array(z.string()).default([]),
  preferred_language: z.enum(["ar", "fr", "en"]).default("ar"),
});

export type StudentProfileInput = z.infer<typeof studentProfileSchema>;

export const formateurProfileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(3, "الاسم الكامل يجب أن يتكون من 3 أحرف على الأقل")
    .max(100, "الاسم طويل جداً"),
  phone: z
    .string()
    .trim()
    .min(9, "يرجى إدخال رقم هاتف صحيح للتواصل")
    .max(25, "رقم الهاتف طويل جداً"),
  headline: z
    .string()
    .trim()
    .min(3, "المسمى المهني يجب أن يتكون من 3 أحرف على الأقل")
    .max(150, "المسمى المهني يجب ألا يتجاوز 150 حرفاً"),
  bio: z
    .string()
    .trim()
    .min(10, "يرجى كتابة نبذة تفصيلية كافية عن خبراتك (10 أحرف على الأقل)")
    .max(2000, "النبذة المهنية طويلة جداً"),
  specialization: z
    .string()
    .trim()
    .min(2, "يرجى تحديد مجال التخصص"),
  experience_years: z.coerce
    .number()
    .int()
    .min(0, "عدد سنوات الخبرة يجب أن يكون 0 أو أكثر")
    .max(60, "عدد سنوات الخبرة غير منطقي"),
  wilaya: z.string().trim().optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  social_links: z
    .object({
      twitter: z.string().url("رابط تويتر غير صالح").or(z.literal("")).optional(),
      linkedin: z.string().url("رابط لينكدإن غير صالح").or(z.literal("")).optional(),
      github: z.string().url("رابط غيتهاب غير صالح").or(z.literal("")).optional(),
      youtube: z.string().url("رابط يوتيوب غير صالح").or(z.literal("")).optional(),
      website: z.string().url("رابط الموقع الإلكتروني غير صالح").or(z.literal("")).optional(),
    })
    .default({}),
});

export type FormateurProfileInput = z.infer<typeof formateurProfileSchema>;

export const passwordChangeSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "كلمة المرور الجديدة يجب أن تحتوي على 8 أحرف على الأقل"),
    confirmPassword: z
      .string()
      .min(8, "يرجى تأكيد كلمة المرور الجديدة"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"],
  });

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
