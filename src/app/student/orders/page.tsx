import * as React from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle,
  WarningCircle,
  CreditCard,
  ArrowLeft,
  CaretLeft,
} from "@phosphor-icons/react/dist/ssr";
import { requireStudent } from "@/lib/auth";
import { getStudentOrders, type StudentOrderItem } from "@/lib/payments";
import { formatDZD } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cancelOrderAction } from "@/actions/orders";
import type { OrderStatus } from "@/types/database.types";

export const dynamic = "force-dynamic";

const statusBadges: Record<
  OrderStatus,
  { label: string; variant: "warning" | "info" | "success" | "error" | "outline" }
> = {
  PENDING_PAYMENT: { label: "في انتظار الدفع", variant: "warning" },
  PROOF_SUBMITTED: { label: "قيد المراجعة والتدقيق", variant: "info" },
  APPROVED: { label: "تم الدفع وتفعيل الدورة", variant: "success" },
  REJECTED: { label: "إثبات الدفع مرفوض", variant: "error" },
  CANCELLED: { label: "ملغى", variant: "outline" },
};

const methodLabels: Record<string, string> = {
  BARIDIMOB: "بريدي موب (BaridiMob)",
  CCP: "الحساب البريدي الجاري (CCP)",
  BANK_TRANSFER: "تحويل بنكي",
  CASH: "نقداً في المقر",
};

export default async function StudentOrdersPage() {
  const profile = await requireStudent("/student/orders");
  const orders: StudentOrderItem[] = await getStudentOrders(profile.id);

  const pendingCount = orders.filter(
    (o) => o.status === "PENDING_PAYMENT"
  ).length;
  const underReviewCount = orders.filter(
    (o) => o.status === "PROOF_SUBMITTED"
  ).length;
  const approvedCount = orders.filter((o) => o.status === "APPROVED").length;

  return (
    <div className="space-y-8 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="exclusive" className="gap-1">
              <FileText className="h-3.5 w-3.5" />
              <span>سجل الطلبات والمدفوعات</span>
            </Badge>
          </div>
          <h1 className="text-h1 font-bold text-foreground">
            طلباتي ومدفوعاتي
          </h1>
          <p className="text-sm text-muted-foreground">
            تابع حالات التحويلات اليدوية، أرسل إثباتات الدفع، واطلع على تفاصيل
            كل طلب.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/courses">
            <Button variant="outline" size="sm">
              تصفح المزيد من الدورات
            </Button>
          </Link>
          <Link href="/student/my-courses">
            <Button variant="primary" size="sm" className="font-bold">
              دوراتي المفعلة
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card variant="default">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">إجمالي الطلبات</CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">
              {orders.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card variant="default">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">في انتظار الدفع</CardDescription>
            <CardTitle className="text-2xl font-bold text-warning">
              {pendingCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card variant="default">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">قيد تدقيق الإدارة</CardDescription>
            <CardTitle className="text-2xl font-bold text-info">
              {underReviewCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card variant="default">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">الطلبات المعتمدة</CardDescription>
            <CardTitle className="text-2xl font-bold text-success">
              {approvedCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <h2 className="text-h3 font-bold text-foreground">قائمة الطلبات</h2>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-12 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileText className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              لا توجد لديك طلبات سابقة
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              تصفح كتالوج الدورات المتاحة واختر المسار الذي يناسبك لتبدأ عملية
              التسجيل.
            </p>
            <div className="pt-2">
              <Link href="/courses">
                <Button variant="primary" size="sm" className="font-bold">
                  استكشاف الكتالوج
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo =
                statusBadges[order.status] || {
                  label: order.status,
                  variant: "outline",
                };

              const method = order.payment_request?.payment_method
                ? methodLabels[order.payment_request.payment_method] ||
                  order.payment_request.payment_method
                : "تحويل يدوي";

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4 hover:border-border/80 transition-all"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                        <span className="font-mono text-xs font-semibold text-muted-foreground">
                          {order.order_number}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {new Date(order.created_at).toLocaleDateString(
                            "ar-DZ",
                            { year: "numeric", month: "long", day: "numeric" }
                          )}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-foreground">
                        {order.course.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-3.5 w-3.5 text-primary" />
                          <span>طريقة الدفع: {method}</span>
                        </div>
                        <span>•</span>
                        <span className="font-bold text-primary">
                          المبلغ: {formatDZD(order.total_amount)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-border/60">
                      {order.status === "PENDING_PAYMENT" && (
                        <>
                          <Link href={`/student/orders/${order.id}/payment`}>
                            <Button
                              variant="primary"
                              size="sm"
                              className="font-bold gap-1 text-xs"
                            >
                              <span>تعليمات الدفع ورفع الإثبات</span>
                              <ArrowLeft className="h-3.5 w-3.5" />
                            </Button>
                          </Link>

                          <form
                            action={async () => {
                              "use server";
                              await cancelOrderAction(order.id);
                            }}
                          >
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-error text-xs"
                            >
                              إلغاء الطلب
                            </Button>
                          </form>
                        </>
                      )}

                      {order.status === "PROOF_SUBMITTED" && (
                        <Link href={`/student/orders/${order.id}/payment`}>
                          <Button variant="outline" size="sm" className="gap-1 text-xs font-semibold">
                            <span>متابعة حالة التدقيق</span>
                            <CaretLeft className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      )}

                      {order.status === "APPROVED" && (
                        <Link href="/student/my-courses">
                          <Button
                            variant="primary"
                            size="sm"
                            className="bg-success hover:bg-success/90 font-bold gap-1 text-xs"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>فتح الدورة في مساحة التعلّم</span>
                          </Button>
                        </Link>
                      )}

                      {order.status === "REJECTED" && (
                        <Link href={`/student/orders/${order.id}/payment`}>
                          <Button
                            variant="primary"
                            size="sm"
                            className="bg-error hover:bg-error/90 font-bold gap-1 text-xs"
                          >
                            <WarningCircle className="h-3.5 w-3.5" />
                            <span>مراجعة الملاحظات وإعادة الرفع</span>
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Rejection alert if rejected */}
                  {order.status === "REJECTED" && order.latest_proof?.rejection_reason && (
                    <div className="rounded-xl border border-error/30 bg-error/10 p-3.5 text-xs text-error leading-relaxed">
                      <strong>سبب رفض الإثبات:</strong>{" "}
                      {order.latest_proof.rejection_reason}
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
