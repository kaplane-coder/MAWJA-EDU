import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("صيغة البريد الإلكتروني غير صحيحة"),
  password: z
    .string()
    .min(1, "كلمة المرور مطلوبة")
    .min(6, "كلمة المرور يجب أن لا تقل عن 6 أحرف"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const studentRegisterSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "الاسم الكامل مطلوب")
      .min(3, "الاسم الكامل يجب أن يحتوي على 3 أحرف على الأقل")
      .max(100, "الاسم طويل جداً"),
    email: z
      .string()
      .min(1, "البريد الإلكتروني مطلوب")
      .email("صيغة البريد الإلكتروني غير صحيحة"),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^(05|06|07)[0-9]{8}$/.test(val.replace(/\s+/g, "")),
        "رقم الهاتف الجزائري يجب أن يبدأ بـ 05 أو 06 أو 07 ويتكون من 10 أرقام"
      ),
    password: z
      .string()
      .min(1, "كلمة المرور مطلوبة")
      .min(8, "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل")
      .regex(/[A-Za-z]/, "يجب أن تحتوي كلمة المرور على أحرف")
      .regex(/[0-9]/, "يجب أن تحتوي كلمة المرور على أرقام على الأقل"),
    passwordConfirmation: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["passwordConfirmation"],
  });

export type StudentRegisterInput = z.infer<typeof studentRegisterSchema>;

export const formateurRegisterSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "الاسم الكامل مطلوب")
      .min(3, "الاسم الكامل يجب أن يحتوي على 3 أحرف على الأقل"),
    email: z
      .string()
      .min(1, "البريد الإلكتروني مطلوب")
      .email("صيغة البريد الإلكتروني غير صحيحة"),
    phone: z
      .string()
      .min(1, "رقم الهاتف للتواصل مطلوب")
      .refine(
        (val) => /^(05|06|07)[0-9]{8}$/.test(val.replace(/\s+/g, "")),
        "رقم الهاتف الجزائري يجب أن يبدأ بـ 05 أو 06 أو 07 ويتكون من 10 أرقام"
      ),
    headline: z
      .string()
      .min(1, "المسمى المهني مطلوب")
      .min(5, "المسمى المهني يجب أن يكون واضحاً (مثال: مهندس برمجيات أول)"),
    bio: z
      .string()
      .min(1, "النبذة التعريفية مطلوبة")
      .min(30, "يرجى كتابة نبذة تعريفية من 30 حرفاً على الأقل تبرز خبراتك"),
    specialty: z.string().min(1, "مجال التدريب مطلوب"),
    password: z
      .string()
      .min(8, "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل")
      .regex(/[A-Za-z]/, "يجب أن تحتوي كلمة المرور على أحرف")
      .regex(/[0-9]/, "يجب أن تحتوي كلمة المرور على أرقام على الأقل"),
    passwordConfirmation: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["passwordConfirmation"],
  });

export type FormateurRegisterInput = z.infer<typeof formateurRegisterSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("صيغة البريد الإلكتروني غير صحيحة"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل")
      .regex(/[A-Za-z]/, "يجب أن تحتوي على أحرف")
      .regex(/[0-9]/, "يجب أن تحتوي على أرقام"),
    passwordConfirmation: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["passwordConfirmation"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
