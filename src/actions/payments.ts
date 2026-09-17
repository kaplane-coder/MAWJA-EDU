"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStudent } from "@/lib/auth";
import { paymentProofSchema } from "@/lib/validations/payment";
import type { ActionResult } from "@/actions/auth";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

interface SubmitProofRpcResponse {
  proof_id: string;
  order_id: string;
  status: string;
}

/**
 * Submits offline payment proof with receipt file upload to strictly private bucket
 */
export async function submitPaymentProofAction(
  orderId: string,
  formData: FormData
): Promise<ActionResult<{ proofId: string }>> {
  try {
    const student = await requireStudent();

    if (!orderId) {
      return { success: false, error: "معرف الطلب غير صالح" };
    }

    const senderName = formData.get("sender_name") as string;
    const senderAccountRef = (formData.get("sender_account_reference") as string) || "";
    const transactionRef = (formData.get("transaction_reference") as string) || "";
    const notes = (formData.get("notes") as string) || "";
    const file = formData.get("proof_file") as File | null;

    // 1. Validate Form Fields via Zod
    const parsed = paymentProofSchema.safeParse({
      sender_name: senderName,
      sender_account_reference: senderAccountRef,
      transaction_reference: transactionRef,
      notes: notes,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: "بيانات الإثبات غير صالحة",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    // 2. Validate File
    if (!file || file.size === 0) {
      return {
        success: false,
        error: "يرجى رفع صورة أو ملف إثبات الدفع (وصل التحويل).",
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "حجم الملف كبير جداً. الحد الأقصى المسموح به هو 10 ميغابايت.",
      };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "نوع الملف غير مدعوم. يرجى رفع صورة بصيغة JPG أو PNG أو WEBP أو ملف PDF.",
      };
    }

    const ext = MIME_EXTENSIONS[file.type] || "jpg";
    const randomFileName = `${crypto.randomUUID()}.${ext}`;
    const storagePath = `${student.id}/${orderId}/${randomFileName}`;

    const supabase = await createClient();

    // 3. Upload to private-proofs bucket
    const fileBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("private-proofs")
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return {
        success: false,
        error: "فشل رفع ملف الإثبات إلى الخادم الآمن. يرجى المحاولة مرة أخرى.",
      };
    }

    // 4. Record proof in database via secure transaction function
    const { data: dbResult, error: dbError } = await supabase.rpc(
      "student_submit_payment_proof",
      {
        p_order_id: orderId,
        p_sender_name: parsed.data.sender_name,
        p_sender_account_reference: parsed.data.sender_account_reference || null,
        p_transaction_reference: parsed.data.transaction_reference || null,
        p_proof_storage_path: storagePath,
        p_notes: parsed.data.notes || null,
      }
    );

    if (dbError) {
      // Clean up uploaded file if DB record fails
      await supabase.storage.from("private-proofs").remove([storagePath]);
      return {
        success: false,
        error: dbError.message || "فشل تسجيل إثبات الدفع في النظام.",
      };
    }

    const res = dbResult as unknown as SubmitProofRpcResponse;
    revalidatePath("/student/orders");
    revalidatePath(`/student/orders/${orderId}/payment`);

    return {
      success: true,
      message: "تم إرسال إثبات الدفع بنجاح! سيتم مراجعته وتفعيل الدورة قريباً.",
      data: { proofId: res.proof_id },
    };
  } catch {
    return {
      success: false,
      error: "حدث خطأ غير متوقع أثناء إرسال إثبات الدفع.",
    };
  }
}
