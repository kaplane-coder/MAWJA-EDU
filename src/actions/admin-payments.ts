"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import {
  adminRejectPaymentSchema,
  type AdminRejectPaymentInput,
} from "@/lib/validations/payment";
import type { ActionResult } from "@/actions/auth";

/**
 * Atomically approves a payment proof, marks order and request APPROVED, grants enrollment, and logs audit
 */
export async function adminApprovePaymentAction(
  paymentProofId: string
): Promise<ActionResult<null>> {
  try {
    await requireAdmin();

    if (!paymentProofId) {
      return { success: false, error: "معرف إثبات الدفع غير صالح" };
    }

    const supabase = await createClient();

    // Call atomic PostgreSQL procedure
    const { error } = await supabase.rpc("admin_approve_payment", {
      p_payment_proof_id: paymentProofId,
    });

    if (error) {
      return {
        success: false,
        error: error.message || "فشل اعتماد الدفع وتفعيل الدورة",
      };
    }

    revalidatePath("/admin/payments");
    revalidatePath(`/admin/payments/${paymentProofId}`);
    revalidatePath("/student/orders");
    revalidatePath("/student/my-courses");

    return {
      success: true,
      message: "تم اعتماد الدفع بنجاح وتفعيل تسجيل الطالب في الدورة!",
    };
  } catch {
    return {
      success: false,
      error: "غير مصرح لك بتنفيذ إجراءات اعتماد المدفوعات.",
    };
  }
}

/**
 * Rejects a payment proof with mandatory reason, marks order and request REJECTED, and logs audit
 */
export async function adminRejectPaymentAction(
  paymentProofId: string,
  rawInput: AdminRejectPaymentInput
): Promise<ActionResult<null>> {
  try {
    await requireAdmin();

    if (!paymentProofId) {
      return { success: false, error: "معرف إثبات الدفع غير صالح" };
    }

    const parsed = adminRejectPaymentSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "يرجى كتابة سبب الرفض بالتفصيل",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const supabase = await createClient();

    // Call atomic PostgreSQL rejection procedure
    const { error } = await supabase.rpc("admin_reject_payment", {
      p_payment_proof_id: paymentProofId,
      p_rejection_reason: parsed.data.rejection_reason,
    });

    if (error) {
      return {
        success: false,
        error: error.message || "فشل تسجيل رفض الدفع",
      };
    }

    revalidatePath("/admin/payments");
    revalidatePath(`/admin/payments/${paymentProofId}`);
    revalidatePath("/student/orders");

    return {
      success: true,
      message: "تم رفض إثبات الدفع وإشعار الطالب بالملاحظات.",
    };
  } catch {
    return {
      success: false,
      error: "غير مصرح لك بتنفيذ إجراءات رفض المدفوعات.",
    };
  }
}
