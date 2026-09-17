"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import type { UserRole } from "@/types/database.types";
import type { ActionResult } from "@/actions/auth";

/**
 * Changes a user's role using the secure PostgreSQL procedure admin_set_user_role
 */
export async function adminSetUserRoleAction(
  targetUserId: string,
  newRole: UserRole
): Promise<ActionResult<null>> {
  try {
    const admin = await requireAdmin();

    if (!targetUserId) {
      return { success: false, error: "معرف المستخدم غير صالح" };
    }

    if (targetUserId === admin.id && newRole !== "ADMIN") {
      return {
        success: false,
        error: "لا يمكنك تخفيض رتبتك كمسؤول عن المنصة بنفسك حفاظاً على أمان النظام.",
      };
    }

    const supabase = await createClient();

    // Call atomic PostgreSQL security definer procedure
    const { error } = await supabase.rpc("admin_set_user_role", {
      target_user_id: targetUserId,
      new_role: newRole,
    });

    if (error) {
      return {
        success: false,
        error: error.message || "فشل تعديل رتبة المستخدم",
      };
    }

    revalidatePath("/admin/users");
    revalidatePath("/admin/formateurs");
    revalidatePath("/admin");

    const roleArabic =
      newRole === "ADMIN" ? "مدير نظام" : newRole === "FORMATEUR" ? "مدرب" : "طالب";

    return {
      success: true,
      message: `تم تغيير رتبة المستخدم إلى (${roleArabic}) بنجاح!`,
    };
  } catch {
    return {
      success: false,
      error: "غير مصرح لك بتعديل رتب المستخدمين.",
    };
  }
}

/**
 * Toggles a user's active status using the secure PostgreSQL procedure admin_toggle_user_active
 */
export async function adminToggleUserActiveAction(
  targetUserId: string,
  newIsActive: boolean
): Promise<ActionResult<null>> {
  try {
    const admin = await requireAdmin();

    if (!targetUserId) {
      return { success: false, error: "معرف المستخدم غير صالح" };
    }

    if (targetUserId === admin.id && !newIsActive) {
      return {
        success: false,
        error: "لا يمكنك تعطيل حسابك الشخصي كمسؤول عن المنصة.",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase.rpc("admin_toggle_user_active", {
      target_user_id: targetUserId,
      new_is_active: newIsActive,
    });

    if (error) {
      return {
        success: false,
        error: error.message || "فشل تحديث حالة نشاط الحساب",
      };
    }

    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return {
      success: true,
      message: newIsActive
        ? "تم تفعيل حساب المستخدم بنجاح."
        : "تم تعطيل حساب المستخدم بنجاح.",
    };
  } catch {
    return {
      success: false,
      error: "غير مصرح لك بتعديل حالة نشاط المستخدمين.",
    };
  }
}

/**
 * Toggles a formateur's verification status using admin_toggle_formateur_verified
 */
export async function adminToggleFormateurVerifiedAction(
  targetUserId: string,
  newIsVerified: boolean
): Promise<ActionResult<null>> {
  try {
    await requireAdmin();

    if (!targetUserId) {
      return { success: false, error: "معرف المدرب غير صالح" };
    }

    const supabase = await createClient();

    const { error } = await supabase.rpc("admin_toggle_formateur_verified", {
      target_user_id: targetUserId,
      new_is_verified: newIsVerified,
    });

    if (error) {
      return {
        success: false,
        error: error.message || "فشل تحديث حالة توثيق المدرب",
      };
    }

    revalidatePath("/admin/formateurs");
    revalidatePath("/admin");

    return {
      success: true,
      message: newIsVerified
        ? "تم توثيق المدرب ومنحه الشارة المعتمدة بنجاح!"
        : "تم إلغاء شارة التوثيق عن المدرب.",
    };
  } catch {
    return {
      success: false,
      error: "غير مصرح لك بتوثيق المدربين.",
    };
  }
}
