import { z } from "zod";

export const saveProgressSchema = z.object({
  lesson_id: z.string().uuid({ message: "معرف الدرس غير صالح" }),
  progress_seconds: z
    .number()
    .int({ message: "التقدم يجب أن يكون عدداً صحيحاً" })
    .min(0, { message: "التقدم يجب ألا يكون سالباً" })
    .max(86400, { message: "التقدم لا يمكن أن يتجاوز 86400 ثانية" }),
  completed: z.boolean().optional(),
});

export type SaveProgressInput = z.infer<typeof saveProgressSchema>;

export const markCompleteSchema = z.object({
  lesson_id: z.string().uuid({ message: "معرف الدرس غير صالح" }),
});

export type MarkCompleteInput = z.infer<typeof markCompleteSchema>;
