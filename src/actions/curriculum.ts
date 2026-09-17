"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireFormateur } from "@/lib/auth";
import {
  sectionSchema,
  lessonSchema,
} from "@/lib/validations/course";
import type { ActionResult } from "@/actions/auth";

/**
 * Creates a new section under a course
 */
export async function createSectionAction(
  courseId: string,
  values: unknown
): Promise<ActionResult<{ sectionId: string }>> {
  const profile = await requireFormateur();

  const parsed = sectionSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: "يرجى التحقق من صحة عنوان الفصل",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { title, order_index } = parsed.data;

  try {
    const supabase = await createClient();

    // Verify course ownership
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, formateur_id")
      .eq("id", courseId)
      .single();

    if (courseError || !course) {
      return { success: false, error: "الدورة التدريبية غير موجودة" };
    }

    if (course.formateur_id !== profile.id && profile.role !== "ADMIN") {
      return { success: false, error: "غير مصرح لك بتعديل منهج هذه الدورة" };
    }

    const { data: section, error: insertError } = await supabase
      .from("course_sections")
      .insert({
        course_id: courseId,
        title,
        order_index,
      })
      .select("id")
      .single();

    if (insertError || !section) {
      return { success: false, error: "فشل إنشاء الفصل التدريبي" };
    }

    revalidatePath(`/formateur/courses/${courseId}/curriculum`);
    return {
      success: true,
      message: "تمت إضافة الفصل التدريبي بنجاح",
      data: { sectionId: section.id },
    };
  } catch {
    return { success: false, error: "حدث خطأ أثناء إنشاء الفصل" };
  }
}

/**
 * Updates a section title or order
 */
export async function updateSectionAction(
  sectionId: string,
  values: unknown
): Promise<ActionResult> {
  const profile = await requireFormateur();

  const parsed = sectionSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: "بيانات الفصل غير صالحة",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { title, order_index } = parsed.data;

  try {
    const supabase = await createClient();

    // Verify ownership via course join
    const { data: section, error: secError } = await supabase
      .from("course_sections")
      .select("id, course_id, courses(formateur_id)")
      .eq("id", sectionId)
      .single();

    if (secError || !section) {
      return { success: false, error: "الفصل المطلوب غير موجود" };
    }

    const courseFormateurId = (section.courses as unknown as { formateur_id: string })?.formateur_id;
    if (courseFormateurId !== profile.id && profile.role !== "ADMIN") {
      return { success: false, error: "غير مصرح لك بتعديل هذا الفصل" };
    }

    const { error: updateError } = await supabase
      .from("course_sections")
      .update({
        title,
        order_index,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sectionId);

    if (updateError) {
      return { success: false, error: "فشل تحديث بيانات الفصل" };
    }

    revalidatePath(`/formateur/courses/${section.course_id}/curriculum`);
    return { success: true, message: "تم تحديث الفصل بنجاح" };
  } catch {
    return { success: false, error: "حدث خطأ غير متوقع" };
  }
}

/**
 * Deletes a section (cascades lessons)
 */
export async function deleteSectionAction(
  sectionId: string
): Promise<ActionResult> {
  const profile = await requireFormateur();

  try {
    const supabase = await createClient();

    const { data: section, error: secError } = await supabase
      .from("course_sections")
      .select("id, course_id, courses(formateur_id)")
      .eq("id", sectionId)
      .single();

    if (secError || !section) {
      return { success: false, error: "الفصل غير موجود" };
    }

    const courseFormateurId = (section.courses as unknown as { formateur_id: string })?.formateur_id;
    if (courseFormateurId !== profile.id && profile.role !== "ADMIN") {
      return { success: false, error: "غير مصرح لك بحذف هذا الفصل" };
    }

    const { error: deleteError } = await supabase
      .from("course_sections")
      .delete()
      .eq("id", sectionId);

    if (deleteError) {
      return { success: false, error: "فشل حذف الفصل" };
    }

    revalidatePath(`/formateur/courses/${section.course_id}/curriculum`);
    return { success: true, message: "تم حذف الفصل وجميع دروسه بنجاح" };
  } catch {
    return { success: false, error: "حدث خطأ أثناء حذف الفصل" };
  }
}

/**
 * Creates a new lesson under a section
 */
export async function createLessonAction(
  sectionId: string,
  values: unknown
): Promise<ActionResult<{ lessonId: string }>> {
  const profile = await requireFormateur();

  const parsed = lessonSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: "يرجى التحقق من صحة بيانات الدرس",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const {
    title,
    content_type,
    video_path,
    article_content,
    duration_seconds,
    is_free_preview,
    order_index,
  } = parsed.data;

  try {
    const supabase = await createClient();

    // Verify section & course ownership
    const { data: section, error: secError } = await supabase
      .from("course_sections")
      .select("id, course_id, courses(formateur_id)")
      .eq("id", sectionId)
      .single();

    if (secError || !section) {
      return { success: false, error: "الفصل التدريبي غير موجود" };
    }

    const courseFormateurId = (section.courses as unknown as { formateur_id: string })?.formateur_id;
    if (courseFormateurId !== profile.id && profile.role !== "ADMIN") {
      return { success: false, error: "غير مصرح لك بإضافة درس في هذا المنهج" };
    }

    const { data: lesson, error: insertError } = await supabase
      .from("lessons")
      .insert({
        section_id: sectionId,
        title,
        content_type,
        video_path: video_path || null,
        article_content: article_content || null,
        duration_seconds: duration_seconds || 0,
        is_free_preview: is_free_preview || false,
        order_index,
      })
      .select("id")
      .single();

    if (insertError || !lesson) {
      return { success: false, error: "فشل حفظ الدرس في قاعدة البيانات" };
    }

    revalidatePath(`/formateur/courses/${section.course_id}/curriculum`);
    return {
      success: true,
      message: "تمت إضافة الدرس بنجاح",
      data: { lessonId: lesson.id },
    };
  } catch {
    return { success: false, error: "حدث خطأ غير متوقع أثناء إضافة الدرس" };
  }
}

/**
 * Updates an existing lesson
 */
export async function updateLessonAction(
  lessonId: string,
  values: unknown
): Promise<ActionResult> {
  const profile = await requireFormateur();

  const parsed = lessonSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: "بيانات الدرس غير صالحة",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const {
    title,
    content_type,
    video_path,
    article_content,
    duration_seconds,
    is_free_preview,
    order_index,
  } = parsed.data;

  try {
    const supabase = await createClient();

    // Verify ownership
    const { data: lesson, error: lesError } = await supabase
      .from("lessons")
      .select("id, section_id, course_sections(course_id, courses(formateur_id))")
      .eq("id", lessonId)
      .single();

    if (lesError || !lesson) {
      return { success: false, error: "الدرس غير موجود" };
    }

    const sec = lesson.course_sections as unknown as {
      course_id: string;
      courses: { formateur_id: string };
    };

    if (sec?.courses?.formateur_id !== profile.id && profile.role !== "ADMIN") {
      return { success: false, error: "غير مصرح لك بتعديل هذا الدرس" };
    }

    const { error: updateError } = await supabase
      .from("lessons")
      .update({
        title,
        content_type,
        video_path: video_path || null,
        article_content: article_content || null,
        duration_seconds: duration_seconds || 0,
        is_free_preview: is_free_preview || false,
        order_index,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lessonId);

    if (updateError) {
      return { success: false, error: "فشل تحديث بيانات الدرس" };
    }

    revalidatePath(`/formateur/courses/${sec.course_id}/curriculum`);
    return { success: true, message: "تم حفظ تعديلات الدرس بنجاح" };
  } catch {
    return { success: false, error: "حدث خطأ أثناء تحديث الدرس" };
  }
}

/**
 * Deletes a lesson
 */
export async function deleteLessonAction(
  lessonId: string
): Promise<ActionResult> {
  const profile = await requireFormateur();

  try {
    const supabase = await createClient();

    const { data: lesson, error: lesError } = await supabase
      .from("lessons")
      .select("id, section_id, course_sections(course_id, courses(formateur_id))")
      .eq("id", lessonId)
      .single();

    if (lesError || !lesson) {
      return { success: false, error: "الدرس غير موجود" };
    }

    const sec = lesson.course_sections as unknown as {
      course_id: string;
      courses: { formateur_id: string };
    };

    if (sec?.courses?.formateur_id !== profile.id && profile.role !== "ADMIN") {
      return { success: false, error: "غير مصرح لك بحذف هذا الدرس" };
    }

    const { error: deleteError } = await supabase
      .from("lessons")
      .delete()
      .eq("id", lessonId);

    if (deleteError) {
      return { success: false, error: "فشل حذف الدرس" };
    }

    revalidatePath(`/formateur/courses/${sec.course_id}/curriculum`);
    return { success: true, message: "تم حذف الدرس بنجاح" };
  } catch {
    return { success: false, error: "حدث خطأ أثناء حذف الدرس" };
  }
}
