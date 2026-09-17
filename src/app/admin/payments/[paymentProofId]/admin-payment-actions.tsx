"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import {
  adminApprovePaymentAction,
  adminRejectPaymentAction,
} from "@/actions/admin-payments";
import type { PaymentProofStatus } from "@/types/database.types";

interface AdminPaymentActionProps {
  paymentProofId: string;
  status: PaymentProofStatus;
  amount: number;
}

export function AdminPaymentActions({
  paymentProofId,
  status,
  amount,
}: AdminPaymentActionProps) {
  const router = useRouter();

  const [isApproving, setIsApproving] = React.useState(false);
  const [isRejecting, setIsRejecting] = React.useState(false);
  const [showRejectForm, setShowRejectForm] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState("");

  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleApprove = async () => {
    if (
      !confirm(
        `هل أنت متأكد من مطابقة الوصل واعتماد الدفع بمبلغ ${amount} دج؟ سيتم تفعيل الدورة للطالب فوراً.`
      )
    ) {
      return;
    }

    setIsApproving(true);
    setFeedback(null);

    const result = await adminApprovePaymentAction(paymentProofId);
    setIsApproving(false);

    if (result.success) {
      setFeedback({
        type: "success",
        text: result.message || "تم اعتماد الدفع وتفعيل الدورة بنجاح!",
      });
      router.refresh();
    } else {
      setFeedback({
        type: "error",
        text: result.error || "فشل اعتماد الدفع",
      });
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;

    setIsRejecting(true);
    setFeedback(null);

    const result = await adminRejectPaymentAction(paymentProofId, {
      rejection_reason: rejectionReason,
    });
    setIsRejecting(false);

    if (result.success) {
      setShowRejectForm(false);
      setRejectionReason("");
      setFeedback({
        type: "success",
        text: result.message || "تم تسجيل رفض الدفع وإشعار الطالب.",
      });
      router.refresh();
    } else {
      setFeedback({
        type: "error",
        text: result.error || "فشل رفض الدفع",
      });
    }
  };

  if (status !== "PENDING") {
    return null;
  }

  return (
    <div className="space-y-4">
      {feedback && (
        <Alert
          variant={feedback.type === "success" ? "success" : "error"}
          title={feedback.type === "success" ? "نجاح" : "تنبيه"}
        >
          {feedback.text}
        </Alert>
      )}

      {/* Primary Decision Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          size="md"
          onClick={handleApprove}
          isLoading={isApproving}
          className="gap-2 font-bold bg-success hover:bg-success/90 text-white shadow-xs"
        >
          <CheckCircle className="h-4 w-4" />
          <span>مطابقة الوصل واعتماد الدفع وتفعيل الدورة</span>
        </Button>

        <Button
          variant="outline"
          size="md"
          onClick={() => setShowRejectForm(!showRejectForm)}
          className="gap-1.5 font-bold text-error border-error/40 hover:bg-error/10"
        >
          <XCircle className="h-4 w-4" />
          <span>رفض الوصل مع توضيح السبب</span>
        </Button>
      </div>

      {/* Rejection Reason Drawer */}
      {showRejectForm && (
        <Card variant="elevated" className="border-error/40 bg-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-error">
              توضيح سبب رفض إثبات الدفع للطالب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReject} className="space-y-3">
              <Textarea
                placeholder="اكتب سبب الرفض بالتفصيل (مثل: الوصل غير واضح، رقم العملية غير مطابق، المبلغ المدفوع غير كامل...)"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />

              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                >
                  إلغاء
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  isLoading={isRejecting}
                  className="bg-error hover:bg-error/90 text-white font-bold"
                >
                  تأكيد الرفض
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
