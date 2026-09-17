"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Archive } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import {
  adminApproveCourseAction,
  adminRejectCourseAction,
  adminArchiveCourseAction,
} from "@/actions/admin-courses";

interface AdminCourseActionProps {
  course: {
    id: string;
    title: string;
    status: string;
    slug?: string;
  };
}

export function AdminCourseActions({ course }: AdminCourseActionProps) {
  const router = useRouter();
  const [isApproving, setIsApproving] = React.useState(false);
  const [isArchiving, setIsArchiving] = React.useState(false);
  const [isRejecting, setIsRejecting] = React.useState(false);
  const [showRejectForm, setShowRejectForm] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleApprove = async () => {
    if (!confirm(`هل أنت متأكد من اعتماد ونشر دورة "${course.title}" للعامة؟`))
      return;

    setIsApproving(true);
    setFeedback(null);

    const result = await adminApproveCourseAction(course.id);
    setIsApproving(false);

    if (result.success) {
      setFeedback({
        type: "success",
        text: result.message || "تم اعتماد الدورة ونشرها بنجاح!",
      });
      router.refresh();
    } else {
      setFeedback({
        type: "error",
        text: result.error || "فشل اعتماد الدورة",
      });
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;

    setIsRejecting(true);
    setFeedback(null);

    const result = await adminRejectCourseAction(course.id, {
      rejection_reason: rejectionReason,
    });
    setIsRejecting(false);

    if (result.success) {
      setShowRejectForm(false);
      setRejectionReason("");
      setFeedback({
        type: "success",
        text: result.message || "تم رفض الدورة وإرجاعها للمدرب",
      });
      router.refresh();
    } else {
      setFeedback({
        type: "error",
        text: result.error || "فشل رفض الدورة",
      });
    }
  };

  const handleArchive = async () => {
    if (
      !confirm(
        `هل أنت متأكد من أرشفة دورة "${course.title}"؟ سيتم إخفاؤها من الكتالوج العام.`
      )
    )
      return;

    setIsArchiving(true);
    setFeedback(null);

    const result = await adminArchiveCourseAction(course.id);
    setIsArchiving(false);

    if (result.success) {
      setFeedback({
        type: "success",
        text: result.message || "تم أرشفة الدورة بنجاح",
      });
      router.refresh();
    } else {
      setFeedback({
        type: "error",
        text: result.error || "فشل أرشفة الدورة",
      });
    }
  };

  return (
    <div className="space-y-4">
      {feedback && (
        <Alert
          variant={feedback.type === "success" ? "success" : "error"}
          title={feedback.type === "success" ? "تم الإجراء" : "تنبيه"}
        >
          {feedback.text}
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {course.status === "PENDING_REVIEW" && (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApprove}
              isLoading={isApproving}
              className="gap-1.5 font-bold bg-success hover:bg-success/90 text-white"
            >
              <CheckCircle className="h-4 w-4" />
              <span>اعتماد ونشر الدورة</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRejectForm(!showRejectForm)}
              className="gap-1.5 font-bold text-error border-error/40 hover:bg-error/10"
            >
              <XCircle className="h-4 w-4" />
              <span>رفض مع الملاحظات</span>
            </Button>
          </>
        )}

        {course.status === "PUBLISHED" && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleArchive}
            isLoading={isArchiving}
            className="gap-1.5 text-xs text-muted-foreground hover:text-error hover:border-error/40"
          >
            <Archive className="h-3.5 w-3.5" />
            <span>أرشفة الدورة</span>
          </Button>
        )}
      </div>

      {/* Rejection Form Drawer */}
      {showRejectForm && (
        <Card variant="elevated" className="border-error/30 bg-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-error">
              توضيح سبب الرفض والملاحظات للمدرب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReject} className="space-y-3">
              <Textarea
                placeholder="اكتب الأسباب بالتفصيل (مثل: جودة الصوت في الدرس 2 غير واضحة، المنهج ينقصه أمثلة عملية...)"
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
                  تأكيد الرفض وإعادة المسودة
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
