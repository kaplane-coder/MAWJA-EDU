import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Eye } from "@phosphor-icons/react/dist/ssr";
import { requireAdmin } from "@/lib/auth";
import { getAdminPaymentsList } from "@/lib/payments";
import { formatDZD } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PaymentProofStatus } from "@/types/database.types";

export const dynamic = "force-dynamic";

interface AdminPaymentsPageProps {
  searchParams: Promise<{
    status?: string;
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

export default async function AdminPaymentsPage({
  searchParams,
}: AdminPaymentsPageProps) {
  await requireAdmin("/admin/payments");
  const { status } = await searchParams;

  const allPayments = await getAdminPaymentsList();

  const pendingCount = allPayments.filter((p) => p.status === "PENDING").length;
  const approvedCount = allPayments.filter((p) => p.status === "APPROVED").length;
  const rejectedCount = allPayments.filter((p) => p.status === "REJECTED").length;

  const filteredPayments = status
    ? allPayments.filter((p) => p.status === status)
    : allPayments;

  return (
    <div className="space-y-8 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="exclusive" className="gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>مساحة الإدارة المركزية</span>
            </Badge>
          </div>
          <h1 className="text-h1 font-bold text-foreground">
            مراجعة وتدقيق إثباتات الدفع اليدوي
          </h1>
          <p className="text-sm text-muted-foreground">
            مطابقة وصولات التحويل البنكية والبريدية، اعتماد الدفع، وتفعيل
            التسجيلات الفورية للطلاب.
          </p>
        </div>

        <Link href="/admin">
          <Button variant="outline" size="sm">
            العودة للوحة الإدارة
          </Button>
        </Link>
      </div>

      {/* Stats Cards & Filter Tabs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Link href="/admin/payments?status=PENDING">
          <Card
            variant={status === "PENDING" ? "elevated" : "default"}
            className="cursor-pointer hover:border-warning/60 transition-colors"
          >
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">بانتظار التدقيق والمطابقة</CardDescription>
              <CardTitle className="text-2xl font-bold text-warning">
                {pendingCount}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/payments?status=APPROVED">
          <Card
            variant={status === "APPROVED" ? "elevated" : "default"}
            className="cursor-pointer hover:border-success/60 transition-colors"
          >
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">المدفوعات المعتمدة</CardDescription>
              <CardTitle className="text-2xl font-bold text-success">
                {approvedCount}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/payments?status=REJECTED">
          <Card
            variant={status === "REJECTED" ? "elevated" : "default"}
            className="cursor-pointer hover:border-error/60 transition-colors"
          >
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">الإثباتات المرفوضة</CardDescription>
              <CardTitle className="text-2xl font-bold text-error">
                {rejectedCount}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/payments">
          <Card
            variant={!status ? "elevated" : "default"}
            className="cursor-pointer hover:border-primary/60 transition-colors"
          >
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">إجمالي الطلبات المستلمة</CardDescription>
              <CardTitle className="text-2xl font-bold text-primary">
                {allPayments.length}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Payments Review List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-h3 font-bold text-foreground">
            {status === "PENDING"
              ? "إثباتات الدفع بانتظار المراجعة والتدقيق"
              : status === "APPROVED"
              ? "المدفوعات المعتمدة والمسجلة"
              : status === "REJECTED"
              ? "المدفوعات المرفوضة"
              : "جميع إثباتات الدفع في النظام"}
          </h2>
          {status && (
            <Link
              href="/admin/payments"
              className="text-xs font-semibold text-primary hover:underline"
            >
              عرض الكل
            </Link>
          )}
        </div>

        {filteredPayments.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-12 text-center text-sm text-muted-foreground">
            لا توجد إثباتات دفع في هذا القسم حالياً.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => {
              const statusInfo =
                statusBadges[payment.status] || {
                  label: payment.status,
                  variant: "warning",
                };

              return (
                <div
                  key={payment.id}
                  className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4 hover:border-border/80 transition-all"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                        <span className="font-mono text-xs font-bold text-foreground">
                          {payment.order_number}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(payment.submitted_at).toLocaleString("ar-DZ")}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-foreground">
                        {payment.course.title}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-muted-foreground pt-1">
                        <div>
                          <span className="font-semibold text-foreground">الطالب: </span>
                          <span>{payment.student.full_name} ({payment.student.email})</span>
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">المرسل في الوصل: </span>
                          <span className="text-primary font-medium">{payment.sender_name}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">المبلغ: </span>
                          <span className="font-black text-foreground">{formatDZD(payment.amount)}</span>
                        </div>
                      </div>

                      {payment.transaction_reference && (
                        <p className="text-xs text-muted-foreground">
                          رقم العملية المصرح به:{" "}
                          <span className="font-mono font-bold text-foreground">
                            {payment.transaction_reference}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-border/60">
                      <Link href={`/admin/payments/${payment.id}`}>
                        <Button
                          variant={payment.status === "PENDING" ? "primary" : "outline"}
                          size="sm"
                          className="gap-1.5 text-xs font-bold"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>{payment.status === "PENDING" ? "تدقيق واعتماد الدفع" : "معاينة التفاصيل"}</span>
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Rejection Note if exists */}
                  {payment.rejection_reason && (
                    <div className="rounded-xl border border-error/30 bg-error/10 p-3 text-xs text-error">
                      <strong>سبب الرفض المسجل:</strong> {payment.rejection_reason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
