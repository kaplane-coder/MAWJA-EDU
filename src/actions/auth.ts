"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  studentRegisterSchema,
  formateurRegisterSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";

export interface ActionResult<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: T;
}

/**
 * Handles student and instructor email/password login
 */
export async function loginAction(
  values: unknown
): Promise<ActionResult<{ role: string; redirectUrl: string }>> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: "يرجى التحقق من صحة البيانات المدخلة",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parsed.data;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      let message = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
      if (error.message.includes("Email not confirmed")) {
        message = "يرجى تأكيد بريدك الإلكتروني أولاً قبل تسجيل الدخول";
      } else if (error.message.includes("Invalid login credentials")) {
        message = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
      }
      return { success: false, error: message };
    }

    if (!data.user) {
      return { success: false, error: "فشل إنشاء الجلسة، يرجى المحاولة لاحقاً" };
    }

    // Retrieve database profile and role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        error: "تعذر العثور على الملف الشخصي المرتبط بهذا الحساب",
      };
    }

    if (!profile.is_active) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: "هذا الحساب معطل حالياً. يرجى التواصل مع إدارة المنصة للمساعدة.",
      };
    }

    let targetPath = "/student";
    if (profile.role === "ADMIN") {
      targetPath = "/admin";
    } else if (profile.role === "FORMATEUR") {
      targetPath = "/formateur";
    }

    return {
      success: true,
      data: {
        role: profile.role,
        redirectUrl: targetPath,
      },
    };
  } catch {
    return {
      success: false,
      error: "حدث خطأ غير متوقع في الخادم، يرجى المحاولة مرة أخرى",
    };
  }
}

/**
 * Handles new student registration
 */
export async function registerStudentAction(
  values: unknown
): Promise<ActionResult<{ requiresConfirmation: boolean }>> {
  const parsed = studentRegisterSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: "يرجى تصحيح الأخطاء في النموذج",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { fullName, email, password, phone } = parsed.data;

  try {
    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get("origin") || "";

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=/student`,
        data: {
          full_name: fullName,
          phone: phone || null,
        },
      },
    });

    if (error) {
      let message = "فشل إنشاء الحساب، يرجى إعادة المحاولة";
      if (error.message.includes("User already registered")) {
        message = "هذا البريد الإلكتروني مسجل مسبقاً، يمكنك تسجيل الدخول مباشرة";
      } else if (error.message.includes("Password should be")) {
        message = "كلمة المرور غير مطابقة لشروط الأمان المطلوبة";
      } else if (error.message.includes("Email signups are disabled") || error.code === "email_provider_disabled") {
        message = "التسجيل بالبريد معطل حالياً في إعدادات Supabase. يرجى تفعيل Email Provider.";
      } else if (error.message.includes("rate limit")) {
        message = "تم تجاوز الحد المسموح لإرسال رسائل التأكيد، يرجى الانتظار قليلاً أو تعطيل تأكيد الإيميل في Supabase.";
      }
      return { success: false, error: message };
    }

    const requiresConfirmation = !data.session;

    return {
      success: true,
      message: requiresConfirmation
        ? "تم إنشاء الحساب بنجاح! تم إرسال رابط تأكيد إلى بريدك الإلكتروني."
        : "تم إنشاء الحساب وتسجيل الدخول بنجاح.",
      data: { requiresConfirmation },
    };
  } catch {
    return {
      success: false,
      error: "حدث خطأ أثناء معالجة الطلب، يرجى المحاولة لاحقاً",
    };
  }
}

/**
 * Handles Formateur application and registration
 */
export async function registerFormateurAction(
  values: unknown
): Promise<ActionResult<{ requiresConfirmation: boolean }>> {
  const parsed = formateurRegisterSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: "يرجى تصحيح الأخطاء في نموذج الانضمام كمدرب",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { fullName, email, password, phone, headline, bio, specialty } =
    parsed.data;

  try {
    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get("origin") || "";

    // Register with Supabase Auth (DB trigger creates STUDENT profile with metadata)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=/formateur`,
        data: {
          full_name: fullName,
          phone: phone,
          headline: headline,
          bio: bio,
          specialty: specialty,
          formateur_intent: true,
        },
      },
    });

    if (error) {
      let message = "فشل إرسال طلب الانضمام";
      if (error.message.includes("User already registered")) {
        message = "البريد الإلكتروني مسجل مسبقاً، يمكنك تسجيل الدخول مباشرة";
      } else if (error.message.includes("Password should be")) {
        message = "كلمة المرور غير مطابقة لشروط الأمان المطلوبة";
      } else if (error.message.includes("Email signups are disabled") || error.code === "email_provider_disabled") {
        message = "التسجيل بالبريد معطل حالياً في إعدادات Supabase. يرجى تفعيل Email Provider.";
      } else if (error.message.includes("rate limit")) {
        message = "تم تجاوز الحد المسموح لإرسال رسائل التأكيد، يرجى الانتظار قليلاً أو تعطيل تأكيد الإيميل في Supabase.";
      }
      return { success: false, error: message };
    }

    const requiresConfirmation = !data.session;

    return {
      success: true,
      message:
        "تم تقديم طلب الانضمام كمدرب بنجاح! سيتم مراجعة طلبك وتفعيل صلاحيات المدرب فور الاعتماد.",
      data: { requiresConfirmation },
    };
  } catch {
    return {
      success: false,
      error: "حدث خطأ غير متوقع أثناء معالجة الطلب",
    };
  }
}

/**
 * Handles password reset request (Forgot Password)
 */
export async function forgotPasswordAction(
  values: unknown
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: "يرجى إدخال بريد إلكتروني صالح",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email } = parsed.data;

  try {
    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get("origin") || "";

    // Always respond neutrally to prevent account enumeration
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });

    return {
      success: true,
      message:
        "إذا كان البريد الإلكتروني مسجلاً لدينا، فستتلقى رسالة تتضمن رابط إعادة تعيين كلمة المرور.",
    };
  } catch {
    return {
      success: false,
      error: "حدث خطأ أثناء معالجة الطلب، يرجى المحاولة لاحقاً",
    };
  }
}

/**
 * Handles setting new password during recovery flow
 */
export async function resetPasswordAction(
  values: unknown
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: "يرجى التحقق من شروط كلمة المرور وتطابقها",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { password } = parsed.data;

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      return {
        success: false,
        error: "انتهت صلاحية جلسة الاستعادة أو حدث خطأ. يرجى طلب رابط جديد.",
      };
    }

    return {
      success: true,
      message: "تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.",
    };
  } catch {
    return {
      success: false,
      error: "حدث خطأ أثناء تحديث كلمة المرور",
    };
  }
}

/**
 * Handles user sign out
 */
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
