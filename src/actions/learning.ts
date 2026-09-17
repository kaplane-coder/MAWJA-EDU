"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStudent } from "@/lib/auth";
import {
  saveProgressSchema,
  markCompleteSchema,
  type SaveProgressInput,
  type MarkCompleteInput,
} from "@/lib/validations/learning";
import type { ActionResult } from "@/actions/auth";

export interface ProgressResultData {
  lessonId: string;
  courseId: string;
  progressSeconds: number;
  completed: boolean;
  completedAt: string | null;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
}

interface SaveProgressRpcResponse {
  lesson_id: string;
  course_id: string;
  progress_seconds: number;
  completed: boolean;
  completed_at: string | null;
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
}

/**
 * Persists lesson video playback progress and updates completion state atomically
 */
export async function saveLessonProgressAction(
  rawInput: SaveProgressInput
): Promise<ActionResult<ProgressResultData>> {
  try {
    const profile = await requireStudent();

    // Security Guard: Only actual students track progress (Formateurs/Admins preview only)
    if (profile.role !== "STUDENT") {
      return {
        success: false,
        error: "تسجيل وحفظ تقدم الدروس متاح فقط لحسابات الطلاب.",
      };
    }

    const parsed = saveProgressSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "بيانات التقدم غير صالحة",
      };
    }

    const { lesson_id, progress_seconds, completed } = parsed.data;
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("save_lesson_progress", {
      p_lesson_id: lesson_id,
      p_progress_seconds: progress_seconds,
      p_completed: completed ?? false,
    });

    if (error) {
      return {
        success: false,
        error: error.message || "فشل حفظ تقدم الدرس",
      };
    }

    const res = data as unknown as SaveProgressRpcResponse;

    return {
      success: true,
      data: {
        lessonId: res.lesson_id,
        courseId: res.course_id,
        progressSeconds: res.progress_seconds,
        completed: res.completed,
        completedAt: res.completed_at,
        totalLessons: res.total_lessons,
        completedLessons: res.completed_lessons,
        progressPercentage: res.progress_percentage,
      },
    };
  } catch {
    return {
      success: false,
      error: "غير مصرح لك بتسجيل التقدم لهذا الدرس.",
    };
  }
}

/**
 * Explicitly marks a lesson as completed
 */
export async function markLessonCompleteAction(
  rawInput: MarkCompleteInput
): Promise<ActionResult<ProgressResultData>> {
  try {
    const profile = await requireStudent();

    // Security Guard: Only actual students track progress
    if (profile.role !== "STUDENT") {
      return {
        success: false,
        error: "تحديد إتمام الدروس متاح فقط لحسابات الطلاب.",
      };
    }

    const parsed = markCompleteSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "معرف الدرس غير صالح",
      };
    }

    const { lesson_id } = parsed.data;
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("save_lesson_progress", {
      p_lesson_id: lesson_id,
      p_progress_seconds: 0,
      p_completed: true,
    });

    if (error) {
      return {
        success: false,
        error: error.message || "فشل تسجيل إتمام الدرس",
      };
    }

    const res = data as unknown as SaveProgressRpcResponse;

    revalidatePath("/student");
    revalidatePath("/student/my-courses");
    revalidatePath(`/student/my-courses/${res.course_id}/learn`);

    return {
      success: true,
      message: "تم تحديد الدرس كمكتمل بنجاح!",
      data: {
        lessonId: res.lesson_id,
        courseId: res.course_id,
        progressSeconds: res.progress_seconds,
        completed: res.completed,
        completedAt: res.completed_at,
        totalLessons: res.total_lessons,
        completedLessons: res.completed_lessons,
        progressPercentage: res.progress_percentage,
      },
    };
  } catch {
    return {
      success: false,
      error: "غير مصرح لك بتسجيل إتمام هذا الدرس.",
    };
  }
}
