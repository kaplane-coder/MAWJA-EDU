"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { rejectCourseSchema } from "@/lib/validations/course";
import type { ActionResult } from "@/actions/auth";

/**
 * Admin action to approve a course for publication
 */
export async function adminApproveCourseAction(
  courseId: string
): Promise<ActionResult> {
  const profile = await requireAdmin();

  try {
    const supabase = await createClient();

    // 1. Verify course status
    const { data: course, error: fetchError } = await supabase
      .from("courses")
      .select("id, title, status, slug")
      .eq("id", courseId)
      .single();

    if (fetchError || !course) {
      return { success: false, error: "الدورة المطلوبة غير موجودة" };
    }

    if (course.status !== "PENDING_REVIEW") {
      return {
        success: false,
        error: `لا يمكن اعتماد دورة ليست في حالة انتظار المراجعة (الحالة الحالية: ${course.status})`,
      };
    }

    // 2. Update to PUBLISHED
    const { error: updateError } = await supabase
      .from("courses")
      .update({
        status: "PUBLISHED",
        rejection_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", courseId);

    if (updateError) {
      return { success: false, error: "فشل اعتماد الدورة وتحديث حالتها" };
    }

    // 3. Write Admin Audit Log
    await supabase.from("admin_audit_logs").insert({
      actor_id: profile.id,
      action: "COURSE_APPROVED",
      target_entity: "courses",
      target_id: courseId,
      details: {
        title: course.title,
        slug: course.slug,
      },
    });

    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    revalidatePath(`/courses/${course.slug}`);
    revalidatePath("/formateur/courses");

    return {
      success: true,
      message: `تم اعتماد دورة "${course.title}" ونشرها في الكتالوج العام بنجاح!`,
    };
  } catch {
    return {
      success: false,
      error: "حدث خطأ غير متوقع أثناء اعتماد الدورة",
    };
  }
}

/**
 * Admin action to reject a course and return it to DRAFT with feedback
 */
export async function adminRejectCourseAction(
  courseId: string,
  values: unknown
): Promise<ActionResult> {
  const profile = await requireAdmin();

  const parsed = rejectCourseSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: "يرجى كتابة سبب الرفض بوضوح لتوجيه المدرب",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { rejection_reason } = parsed.data;

  try {
    const supabase = await createClient();

    // 1. Verify course status
    const { data: course, error: fetchError } = await supabase
      .from("courses")
      .select("id, title, status, formateur_id")
      .eq("id", courseId)
      .single();

    if (fetchError || !course) {
      return { success: false, error: "الدورة المطلوبة غير موجودة" };
    }

    if (course.status !== "PENDING_REVIEW") {
      return {
        success: false,
        error: `لا يمكن رفض دورة ليست في حالة انتظار المراجعة (الحالة الحالية: ${course.status})`,
      };
    }

    // 2. Update to DRAFT with rejection reason
    const { error: updateError } = await supabase
      .from("courses")
      .update({
        status: "DRAFT",
        rejection_reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", courseId);

    if (updateError) {
      return { success: false, error: "فشل تحديث حالة الدورة" };
    }

    // 3. Write Admin Audit Log
    await supabase.from("admin_audit_logs").insert({
      actor_id: profile.id,
      action: "COURSE_REJECTED",
      target_entity: "courses",
      target_id: courseId,
      details: {
        title: course.title,
        rejection_reason,
      },
    });

    revalidatePath("/admin/courses");
    revalidatePath("/formateur/courses");
    revalidatePath(`/formateur/courses/${courseId}/curriculum`);

    return {
      success: true,
      message: "تم رفض مسودة الدورة وإعادتها للمدرب مع إرفاق الملاحظات للتعديل.",
    };
  } catch {
    return {
      success: false,
      error: "حدث خطأ أثناء معالجة رفض الدورة",
    };
  }
}

/**
 * Admin action to archive a published course
 */
export async function adminArchiveCourseAction(
  courseId: string
): Promise<ActionResult> {
  const profile = await requireAdmin();

  try {
    const supabase = await createClient();

    const { data: course, error: fetchError } = await supabase
      .from("courses")
      .select("id, title, status, slug")
      .eq("id", courseId)
      .single();

    if (fetchError || !course) {
      return { success: false, error: "الدورة غير موجودة" };
    }

    if (course.status !== "PUBLISHED") {
      return {
        success: false,
        error: `لا يمكن أرشفة دورة غير منشورة (الحالة الحالية: ${course.status})`,
      };
    }

    const { error: updateError } = await supabase
      .from("courses")
      .update({
        status: "ARCHIVED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", courseId);

    if (updateError) {
      return { success: false, error: "فشل أرشفة الدورة" };
    }

    // Write Admin Audit Log
    await supabase.from("admin_audit_logs").insert({
      actor_id: profile.id,
      action: "COURSE_ARCHIVED",
      target_entity: "courses",
      target_id: courseId,
      details: {
        title: course.title,
        slug: course.slug,
      },
    });

    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    revalidatePath(`/courses/${course.slug}`);
    revalidatePath("/formateur/courses");

    return {
      success: true,
      message: `تم أرشفة دورة "${course.title}" بنجاح وإخفاؤها من الكتالوج العام.`,
    };
  } catch {
    return {
      success: false,
      error: "حدث خطأ أثناء أرشفة الدورة",
    };
  }
}
