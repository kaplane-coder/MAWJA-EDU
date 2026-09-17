import { z } from "zod";

export const paymentMethodsEnum = z.enum([
  "BARIDIMOB",
  "CCP",
  "BANK_TRANSFER",
  "CASH",
]);

export const createOrderSchema = z.object({
  course_id: z.string().uuid({ message: "معرف الدورة غير صالح" }),
  payment_method: paymentMethodsEnum,
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const paymentProofSchema = z.object({
  sender_name: z
    .string()
    .min(3, { message: "يجب أن يتكون اسم المرسل من 3 أحرف على الأقل" })
    .max(100, { message: "اسم المرسل طويل جداً" }),
  sender_account_reference: z
    .string()
    .max(50, { message: "رقم حساب المرسل طويل جداً" })
    .optional()
    .or(z.literal("")),
  transaction_reference: z
    .string()
    .max(100, { message: "رقم العملية طويل جداً" })
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(500, { message: "الملاحظات يجب ألا تتجاوز 500 حرف" })
    .optional()
    .or(z.literal("")),
});

export type PaymentProofInput = z.infer<typeof paymentProofSchema>;

export const adminRejectPaymentSchema = z.object({
  rejection_reason: z
    .string()
    .min(5, { message: "يجب كتابة سبب الرفض بالتفصيل (5 أحرف على الأقل)" })
    .max(1000, { message: "سبب الرفض طويل جداً" }),
});

export type AdminRejectPaymentInput = z.infer<typeof adminRejectPaymentSchema>;
