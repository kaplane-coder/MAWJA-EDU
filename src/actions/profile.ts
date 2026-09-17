"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser, requireStudent, requireFormateur } from "@/lib/auth";
import {
  studentProfileSchema,
  formateurProfileSchema,
  passwordChangeSchema,
  type StudentProfileInput,
  type FormateurProfileInput,
  type PasswordChangeInput,
} from "@/lib/validations/profile";
import type { ActionResult } from "@/actions/auth";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 MB

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Updates student profile with strict field authorization
 */
export async function updateStudentProfileAction(
  rawInput: StudentProfileInput
): Promise<ActionResult<null>> {
  try {
    const profile = await requireStudent();

    const parsed = studentProfileSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "البيانات المدخلة غير صالحة",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const {
      full_name,
      username,
      phone,
      bio,
      wilaya,
      city,
      interests,
      preferred_language,
    } = parsed.data;

    const supabase = await createClient();

    // If username is specified, check uniqueness
    if (username) {
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .neq("id", profile.id)
        .maybeSingle();

      if (existingUser) {
        return {
          success: false,
          error: "اسم المستخدم هذا محجوز مسبقاً، يرجى اختيار اسم آخر",
          fieldErrors: { username: ["اسم المستخدم محجوز مسبقاً"] },
        };
      }
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name,
        username: username || null,
        phone: phone || null,
        bio: bio || null,
        wilaya: wilaya || null,
        city: city || null,
        interests: interests || [],
        preferred_language: preferred_language || "ar",
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (updateError) {
      return {
        success: false,
        error: "فشل حفظ تعديلات الملف الشخصي",
      };
    }

    revalidatePath("/student/profile");
    revalidatePath("/student");
    revalidatePath("/student/settings");

    return {
      success: true,
      message: "تم تحديث بيانات الملف الشخصي بنجاح!",
    };
  } catch {
    return {
      success: false,
      error: "غير مصرح لك بتعديل هذا الملف الشخصي",
    };
  }
}

/**
 * Updates formateur professional profile
 */
export async function updateFormateurProfileAction(
  rawInput: FormateurProfileInput
): Promise<ActionResult<null>> {
  try {
    const profile = await requireFormateur();

    const parsed = formateurProfileSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "البيانات المهنية غير صالحة",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const {
      full_name,
      phone,
      headline,
      bio,
      specialization,
      experience_years,
      wilaya,
      city,
      social_links,
    } = parsed.data;

    const supabase = await createClient();

    // 1. Update profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name,
        phone: phone || null,
        headline: headline || null,
        bio: bio || null,
        specialization: specialization || null,
        experience_years: experience_years || 0,
        wilaya: wilaya || null,
        city: city || null,
        social_links: social_links || {},
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (profileError) {
      return {
        success: false,
        error: "فشل تحديث بيانات المدرب",
      };
    }

    // 2. Sync formateur_profiles table
    await supabase
      .from("formateur_profiles")
      .upsert({
        id: profile.id,
        headline: headline || null,
        bio: bio || null,
        social_links: social_links || {},
        updated_at: new Date().toISOString(),
      });

    revalidatePath("/formateur/profile");
    revalidatePath("/formateur");
    revalidatePath("/formateur/settings");

    return {
      success: true,
      message: "تم حفظ الملف المهني للمدرب بنجاح!",
    };
  } catch {
    return {
      success: false,
      error: "غير مصرح لك بتعديل هذا الملف المهني",
    };
  }
}

/**
 * Uploads an avatar image to public-assets and updates user profile
 */
export async function uploadAvatarAction(
  formData: FormData
): Promise<ActionResult<{ avatarUrl: string }>> {
  try {
    const profile = await requireUser();

    const file = formData.get("avatar_file") as File | null;
    if (!file || file.size === 0) {
      return {
        success: false,
        error: "يرجى اختيار صورة صالحة للرفع",
      };
    }

    if (file.size > MAX_AVATAR_SIZE) {
      return {
        success: false,
        error: "حجم الصورة كبير جداً (الحد الأقصى 5 ميغابايت)",
      };
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "نوع الصورة غير مدعوم. يرجى اختيار صورة بصيغة JPG أو PNG أو WEBP.",
      };
    }

    const ext = MIME_EXT[file.type] || "jpg";
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const storagePath = `avatars/${profile.id}/${fileName}`;

    const supabase = await createClient();

    const fileBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("public-assets")
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return {
        success: false,
        error: "فشل رفع الصورة إلى الخادم. يرجى المحاولة مرة أخرى.",
      };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("public-assets").getPublicUrl(storagePath);

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (updateError) {
      return {
        success: false,
        error: "فشل ربط الصورة بحسابك",
      };
    }

    revalidatePath("/student/profile");
    revalidatePath("/formateur/profile");
    revalidatePath("/student");
    revalidatePath("/formateur");
    revalidatePath("/admin");

    return {
      success: true,
      message: "تم تحديث الصورة الشخصية بنجاح!",
      data: { avatarUrl: publicUrl },
    };
  } catch {
    return {
      success: false,
      error: "حدث خطأ غير متوقع أثناء معالجة الصورة",
    };
  }
}

/**
 * Removes user avatar
 */
export async function removeAvatarAction(): Promise<ActionResult<null>> {
  try {
    const profile = await requireUser();
    const supabase = await createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (error) {
      return { success: false, error: "فشل حذف الصورة الشخصية" };
    }

    revalidatePath("/student/profile");
    revalidatePath("/formateur/profile");
    revalidatePath("/student");
    revalidatePath("/formateur");
    revalidatePath("/admin");

    return {
      success: true,
      message: "تمت إزالة الصورة الشخصية بنجاح.",
    };
  } catch {
    return {
      success: false,
      error: "غير مصرح لك بتنفيذ هذه العملية",
    };
  }
}

/**
 * Updates authenticated user's password via Supabase Auth
 */
export async function changePasswordAction(
  rawInput: PasswordChangeInput
): Promise<ActionResult<null>> {
  try {
    await requireUser();

    const parsed = passwordChangeSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "يرجى التحقق من تطابق وقوة كلمة المرور",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { newPassword } = parsed.data;
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return {
        success: false,
        error: error.message || "فشل تحديث كلمة المرور",
      };
    }

    return {
      success: true,
      message: "تم تغيير كلمة المرور بنجاح! يرجى استخدامها في المرات القادمة.",
    };
  } catch {
    return {
      success: false,
      error: "حدث خطأ أثناء تغيير كلمة المرور",
    };
  }
}
