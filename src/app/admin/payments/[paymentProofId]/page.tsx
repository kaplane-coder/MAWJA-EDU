import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  CheckCircle,
  ArrowRight,
  ArrowSquareOut,
  FileText,
  Warning,
} from "@phosphor-icons/react/dist/ssr";
import { requireAdmin } from "@/lib/auth";
import { getAdminPaymentDetail, getProofSignedUrl } from "@/lib/payments";
import { formatDZD } from "@/lib/utils";
import { AdminPaymentActions } from "./admin-payment-actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Alert } from "@/components/ui/alert";
import type { PaymentProofStatus } from "@/types/database.types";

export const dynamic = "force-dynamic";

interface AdminPaymentDetailPageProps {
  params: Promise<{
    paymentProofId: string;
  }>;
}

const statusBadges: Record<
  PaymentProofStatus,
  { label: string; variant: "warning" | "success" | "error" }
> = {
  PENDING: { label: "بانتظار المراجعة والتدقيق", variant: "warning" },
  APPROVED: { label: "معتمد ومفعّل", variant: "success" },
  REJECTED: { label: "مرفوض", variant: "error" },
};

const methodLabels: Record<string, string> = {
  BARIDIMOB: "بريدي موب (BaridiMob)",
  CCP: "بريد الجزائر (CCP)",
  BANK_TRANSFER: "تحويل بنكي",
  CASH: "نقداً في المقر",
};

export default async function AdminPaymentDetailPage({
  params,
}: AdminPaymentDetailPageProps) {
  const { paymentProofId } = await params;
  await requireAdmin(`/admin/payments/${paymentProofId}`);

  const payment = await getAdminPaymentDetail(paymentProofId);

  if (!payment) {
    notFound();
  }

  // Generate secure short-lived signed URL for private receipt image
  const signedProofUrl = await getProofSignedUrl(payment.proof_storage_path);
  const isPdf = payment.proof_storage_path.toLowerCase().endsWith(".pdf");

  const statusInfo =
    statusBadges[payment.status] || {
      label: payment.status,
      variant: "warning",
    };

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-right">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin/payments"
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              <span>العودة لقائمة المدفوعات</span>
            </Link>
            <span>/</span>
            <Badge variant={statusInfo.variant}>
              {statusInfo.label}
            </Badge>
          </div>
          <h1 className="text-h1 font-bold text-foreground">
            تدقيق إثبات الدفع: {payment.order_number}
          </h1>
          <p className="text-xs text-muted-foreground pt-1">
            تاريخ الإرسال: {new Date(payment.submitted_at).toLocaleString("ar-DZ")}
          </p>
        </div>

        <Link href={`/courses/${payment.course.slug}`}>
          <Button variant="outline" size="sm" className="text-xs">
            معاينة الدورة في الكتالوج
          </Button>
        </Link>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Student Profile Card */}
        <Card variant="default" className="p-5 space-y-3">
          <span className="text-xs text-muted-foreground font-semibold">
            بيانات الطالب المسجل:
          </span>
          <div className="flex items-center gap-3 pt-1">
            <Avatar
              src={payment.student.avatar_url || undefined}
              alt={payment.student.full_name}
              fallback={payment.student.full_name}
              size="md"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-foreground">
                {payment.student.full_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {payment.student.email}
              </p>
              {payment.student.phone && (
                <p className="text-xs text-muted-foreground font-mono">
                  {payment.student.phone}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Course & Amount Card */}
        <Card variant="default" className="p-5 space-y-2">
          <span className="text-xs text-muted-foreground font-semibold">
            الدورة المطلوبة:
          </span>
          <h3 className="text-sm font-bold text-foreground line-clamp-2">
            {payment.course.title}
          </h3>
          <div className="border-t border-border/60 pt-2 flex justify-between items-center text-xs">
            <span className="text-muted-foreground">المبلغ المستحق:</span>
            <span className="text-base font-black text-primary">
              {formatDZD(payment.amount)}
            </span>
          </div>
        </Card>

        {/* Payment Method Card */}
        <Card variant="default" className="p-5 space-y-2">
          <span className="text-xs text-muted-foreground font-semibold">
            وسيلة التحويل:
          </span>
          <p className="text-sm font-bold text-foreground">
            {methodLabels[payment.payment_method] || payment.payment_method}
          </p>
          <div className="border-t border-border/60 pt-2 text-xs text-muted-foreground space-y-1">
            <p>
              اسم المرسل: <strong className="text-foreground">{payment.sender_name}</strong>
            </p>
            {payment.transaction_reference && (
              <p>
                رقم العملية: <strong className="font-mono text-foreground">{payment.transaction_reference}</strong>
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Extra Notes if present */}
      {payment.notes && (
        <div className="rounded-xl border border-border bg-surface p-4 text-xs space-y-1">
          <span className="font-bold text-foreground">ملاحظات الطالب:</span>
          <p className="text-muted-foreground leading-relaxed">{payment.notes}</p>
        </div>
      )}

      {/* Rejection notice if already rejected */}
      {payment.status === "REJECTED" && payment.rejection_reason && (
        <Alert variant="error" title="تم رفض هذا الإثبات مسبقاً">
          <p className="text-xs">سبب الرفض: {payment.rejection_reason}</p>
          {payment.reviewed_at && (
            <p className="text-[11px] text-muted-foreground pt-1">
              تاريخ المراجعة: {new Date(payment.reviewed_at).toLocaleString("ar-DZ")}
            </p>
          )}
        </Alert>
      )}

      {/* Receipt Preview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span>معاينة وصل التحويل المرفق</span>
          </h3>

          {signedProofUrl && (
            <a
              href={signedProofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
            >
              <span>فتح الملف في نافذة جديدة</span>
              <ArrowSquareOut className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 flex flex-col items-center justify-center min-h-[360px] shadow-xs">
          {signedProofUrl ? (
            isPdf ? (
              <div className="p-8 text-center space-y-4">
                <FileText className="h-16 w-16 text-primary mx-auto opacity-80" />
                <p className="text-sm font-semibold text-foreground">
                  تم رفع الإثبات بصيغة مستند PDF
                </p>
                <a
                  href={signedProofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="primary" size="sm" className="font-bold gap-2">
                    <span>تحميل ومعاينة مستند الـ PDF</span>
                    <ArrowSquareOut className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            ) : (
              <div className="relative max-w-2xl w-full aspect-4/3 rounded-xl overflow-hidden bg-black/5 border border-border">
                <Image
                  src={signedProofUrl}
                  alt={`وصل تحويل ${payment.order_number}`}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            )
          ) : (
            <div className="p-8 text-center space-y-2 text-muted-foreground">
              <Warning className="h-10 w-10 text-warning mx-auto" />
              <p className="text-xs">
                تعذر توليد رابط المعاينة المؤقت للملف أو أن الملف غير موجود في
                الخادم.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Decision Actions */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-foreground">
          القرار الإداري على الطلب
        </h3>
        <AdminPaymentActions
          paymentProofId={payment.id}
          status={payment.status}
          amount={payment.amount}
        />
        {payment.status === "APPROVED" && (
          <div className="flex items-center gap-2 text-xs text-success font-bold">
            <CheckCircle className="h-4 w-4" />
            <span>تم اعتماد هذا الدفع وتفعيل الدورة بنجاح.</span>
          </div>
        )}
      </div>
    </div>
  );
}
