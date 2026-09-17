"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireFormateur } from "@/lib/auth";
import { courseSchema } from "@/lib/validations/course";
import { slugify } from "@/lib/slug";
import type { ActionResult } from "@/actions/auth";

/**
 * Creates a new course under DRAFT status owned by the authenticated Formateur
 */
export async function createCourseAction(
  values: unknown
): Promise<ActionResult<{ courseId: string; slug: string }>> {
  const profile = await requireFormateur();

  const parsed = courseSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: "يرجى التحقق من صحة البيانات المدخلة في نموذج الدورة",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const {
    title,
    slug: rawSlug,
    short_description,
    description,
    category,
    level,
    price,
    thumbnail_path,
    preview_video_path,
  } = parsed.data;

  try {
    const supabase = await createClient();

    // Check slug collision
    let finalSlug = slugify(rawSlug || title);
    const { data: existing } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", finalSlug)
      .maybeSingle();

    if (existing) {
      finalSlug = `${finalSlug}-${Date.now().toString(36).slice(-4)}`;
    }

    const { data: newCourse, error } = await supabase
      .from("courses")
      .insert({
        formateur_id: profile.id,
        title,
        slug: finalSlug,
        short_description,
        description,
        category,
        level,
        price,
        thumbnail_path: thumbnail_path || null,
        preview_video_path: preview_video_path || null,
        status: "DRAFT",
      })
      .select("id, slug")
      .single();

    if (error || !newCourse) {
      return {
        success: false,
        error: "فشل حفظ الدورة في قاعدة البيانات، يرجى المحاولة لاحقاً",
      };
    }

    revalidatePath("/formateur/courses");
    return {
      success: true,
      message: "تم إنشاء مسودة الدورة بنجاح!",
      data: {
        courseId: newCourse.id,
        slug: newCourse.slug,
      },
    };
  } catch {
    return {
      success: false,
      error: "حدث خطأ غير متوقع أثناء إنشاء الدورة",
    };
  }
}

/**
 * Updates an existing course owned by the Formateur
 */
export async function updateCourseAction(
  courseId: string,
  values: unknown
): Promise<ActionResult> {
  const profile = await requireFormateur();

  const parsed = courseSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: "يرجى التحقق من صحة البيانات المدخلة",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const {
    title,
    slug: rawSlug,
    short_description,
    description,
    category,
    level,
    price,
    thumbnail_path,
    preview_video_path,
  } = parsed.data;

  try {
    const supabase = await createClient();

    // Verify ownership
    const { data: course, error: fetchError } = await supabase
      .from("courses")
      .select("id, formateur_id, slug")
      .eq("id", courseId)
      .single();

    if (fetchError || !course) {
      return { success: false, error: "الدورة المطلوبة غير موجودة" };
    }

    if (course.formateur_id !== profile.id && profile.role !== "ADMIN") {
      return {
        success: false,
        error: "غير مصرح لك بتعديل دورة خاصة بمدرب آخر",
      };
    }

    // Check slug collision if slug changed
    let finalSlug = slugify(rawSlug || title);
    if (finalSlug !== course.slug) {
      const { data: existing } = await supabase
        .from("courses")
        .select("id")
        .eq("slug", finalSlug)
        .neq("id", courseId)
        .maybeSingle();

      if (existing) {
        finalSlug = `${finalSlug}-${Date.now().toString(36).slice(-4)}`;
      }
    }

    const { error: updateError } = await supabase
      .from("courses")
      .update({
        title,
        slug: finalSlug,
        short_description,
        description,
        category,
        level,
        price,
        thumbnail_path: thumbnail_path || null,
        preview_video_path: preview_video_path || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", courseId);

    if (updateError) {
      return { success: false, error: "فشل تحديث بيانات الدورة" };
    }

    revalidatePath("/formateur/courses");
    revalidatePath(`/formateur/courses/${courseId}/edit`);
    revalidatePath(`/courses/${finalSlug}`);

    return {
      success: true,
      message: "تم حفظ تعديلات الدورة بنجاح!",
    };
  } catch {
    return {
      success: false,
      error: "حدث خطأ غير متوقع أثناء تحديث الدورة",
    };
  }
}

/**
 * Deletes a draft or archived course
 */
export async function deleteCourseAction(
  courseId: string
): Promise<ActionResult> {
  const profile = await requireFormateur();

  try {
    const supabase = await createClient();

    const { data: course, error: fetchError } = await supabase
      .from("courses")
      .select("id, formateur_id, status")
      .eq("id", courseId)
      .single();

    if (fetchError || !course) {
      return { success: false, error: "الدورة غير موجودة" };
    }

    if (course.formateur_id !== profile.id && profile.role !== "ADMIN") {
      return { success: false, error: "غير مصرح لك بحذف هذه الدورة" };
    }

    if (course.status !== "DRAFT" && course.status !== "ARCHIVED") {
      return {
        success: false,
        error: "لا يمكن حذف الدورات المنشورة أو قيد المراجعة مباشرة. يرجى أرشفتها أولاً.",
      };
    }

    const { error: deleteError } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseId);

    if (deleteError) {
      return { success: false, error: "فشل حذف الدورة" };
    }

    revalidatePath("/formateur/courses");
    return { success: true, message: "تم حذف الدورة بنجاح" };
  } catch {
    return { success: false, error: "حدث خطأ أثناء محاولة حذف الدورة" };
  }
}

/**
 * Submits a draft course for Admin review
 */
export async function submitCourseForReviewAction(
  courseId: string
): Promise<ActionResult> {
  const profile = await requireFormateur();

  try {
    const supabase = await createClient();

    // 1. Verify ownership and status
    const { data: course, error: fetchError } = await supabase
      .from("courses")
      .select("id, formateur_id, status, title, description, price")
      .eq("id", courseId)
      .single();

    if (fetchError || !course) {
      return { success: false, error: "الدورة غير موجودة" };
    }

    if (course.formateur_id !== profile.id && profile.role !== "ADMIN") {
      return { success: false, error: "غير مصرح لك بإرسال هذه الدورة للمراجعة" };
    }

    if (course.status !== "DRAFT") {
      return {
        success: false,
        error: `الدورة ليست في حالة مسودة (الحالة الحالية: ${course.status})`,
      };
    }

    // 2. Validate Curriculum Structure (Must have at least 1 section and 1 lesson)
    const { data: sections, error: sectionsError } = await supabase
      .from("course_sections")
      .select("id, lessons(id)")
      .eq("course_id", courseId);

    if (sectionsError || !sections || sections.length === 0) {
      return {
        success: false,
        error: "لا يمكن إرسال الدورة للمراجعة قبل إضافة فصل تدريبي واحد على الأقل في المنهج.",
      };
    }

    const totalLessons = sections.reduce(
      (acc, sec) => acc + (sec.lessons ? sec.lessons.length : 0),
      0
    );

    if (totalLessons === 0) {
      return {
        success: false,
        error: "يرجى إضافة درس واحد على الأقل في فصول الدورة قبل إرسالها للمراجعة.",
      };
    }

    // 3. Update Status to PENDING_REVIEW and clear old rejection reason
    const { error: updateError } = await supabase
      .from("courses")
      .update({
        status: "PENDING_REVIEW",
        rejection_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", courseId);

    if (updateError) {
      return { success: false, error: "فشل إرسال الدورة للمراجعة" };
    }

    revalidatePath("/formateur/courses");
    revalidatePath(`/formateur/courses/${courseId}/curriculum`);
    revalidatePath("/admin/courses");

    return {
      success: true,
      message: "تم إرسال الدورة للمراجعة والاعتماد من قِبل إدارة المنصة بنجاح!",
    };
  } catch {
    return {
      success: false,
      error: "حدث خطأ غير متوقع أثناء إرسال الدورة للمراجعة",
    };
  }
}
