"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStudent } from "@/lib/auth";
import { createOrderSchema, type CreateOrderInput } from "@/lib/validations/payment";
import type { ActionResult } from "@/actions/auth";

export interface CreateOrderResultData {
  orderId: string;
  orderNumber: string;
  amount: number;
  isExisting: boolean;
}

interface CreateOrderRpcResponse {
  order_id: string;
  order_number: string;
  amount: number;
  is_existing: boolean;
  status: string;
}

/**
 * Creates a manual off-platform order with authoritative database price snapshot
 */
export async function createOrderAction(
  rawInput: CreateOrderInput
): Promise<ActionResult<CreateOrderResultData>> {
  try {
    await requireStudent();

    const parsed = createOrderSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "بيانات الطلب غير صالحة",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { course_id, payment_method } = parsed.data;
    const supabase = await createClient();

    // Call secure Postgres function (authoritative price snapshot & duplicate protection)
    const { data, error } = await supabase.rpc("student_create_manual_order", {
      p_course_id: course_id,
      p_payment_method: payment_method,
    });

    if (error) {
      if (error.code === "23505") {
        return {
          success: false,
          error: "أنت مسجل بالفعل في هذه الدورة ولديك وصول كامل لمحتواها.",
        };
      }
      return {
        success: false,
        error: error.message || "فشل إنشاء طلب الدورة",
      };
    }

    const res = data as unknown as CreateOrderRpcResponse;
    revalidatePath("/student/orders");
    revalidatePath(`/student/orders/${res.order_id}/payment`);

    return {
      success: true,
      message: res.is_existing
        ? "لديك طلب دفع مسبق قيد الانتظار لهذه الدورة."
        : "تم إنشاء الطلب بنجاح. يرجى إتمام التحويل ورفع الإثبات.",
      data: {
        orderId: res.order_id,
        orderNumber: res.order_number,
        amount: Number(res.amount),
        isExisting: Boolean(res.is_existing),
      },
    };
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest?: string }).digest === "string" &&
      (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }
    return {
      success: false,
      error: "يجب تسجيل الدخول كطالب للتمكن من التسجيل في الدورات.",
    };
  }
}

/**
 * Cancels a pending order
 */
export async function cancelOrderAction(
  orderId: string
): Promise<ActionResult<null>> {
  try {
    await requireStudent();

    if (!orderId) {
      return { success: false, error: "معرف الطلب غير صالح" };
    }

    const supabase = await createClient();

    const { error } = await supabase.rpc("student_cancel_order", {
      p_order_id: orderId,
    });

    if (error) {
      return {
        success: false,
        error: error.message || "فشل إلغاء الطلب",
      };
    }

    revalidatePath("/student/orders");
    revalidatePath(`/student/orders/${orderId}/payment`);

    return {
      success: true,
      message: "تم إلغاء الطلب بنجاح.",
    };
  } catch {
    return {
      success: false,
      error: "غير مصرح لك بإلغاء هذا الطلب.",
    };
  }
}
