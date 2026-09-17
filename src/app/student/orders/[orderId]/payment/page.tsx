import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CreditCard,
  CheckCircle,
  Clock,
  Building,
  Info,
} from "@phosphor-icons/react/dist/ssr";
import { requireStudent } from "@/lib/auth";
import { getStudentOrderForPayment } from "@/lib/payments";
import { getPaymentMethodConfig } from "@/lib/payment-methods";
import { formatDZD } from "@/lib/utils";
import { PaymentProofForm } from "./payment-proof-form";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { cancelOrderAction } from "@/actions/orders";

export const dynamic = "force-dynamic";

interface PaymentPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function StudentOrderPaymentPage({
  params,
}: PaymentPageProps) {
  const { orderId } = await params;
  const profile = await requireStudent(`/student/orders/${orderId}/payment`);

  const order = await getStudentOrderForPayment(orderId, profile.id);

  if (!order) {
    notFound();
  }

  const paymentMethod = order.payment_request?.payment_method || "BARIDIMOB";
  const config = getPaymentMethodConfig(paymentMethod);

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-right">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">
          الرئيسية
        </Link>
        <span>/</span>
        <Link href="/student/orders" className="hover:text-primary transition-colors">
          طلباتي
        </Link>
        <span>/</span>
        <span className="text-foreground font-mono">{order.order_number}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="exclusive" className="gap-1">
              <CreditCard className="h-3.5 w-3.5" />
              <span>تحويل يدوي خارج المنصة</span>
            </Badge>
            <Badge
              variant={
                order.status === "APPROVED"
                  ? "success"
                  : order.status === "PROOF_SUBMITTED"
                  ? "info"
                  : order.status === "REJECTED"
                  ? "error"
                  : "warning"
              }
            >
              {order.status === "APPROVED"
                ? "تم الدفع وتفعيل الدورة"
                : order.status === "PROOF_SUBMITTED"
                ? "قيد المراجعة والتدقيق"
                : order.status === "REJECTED"
                ? "إثبات الدفع مرفوض"
                : "في انتظار التحويل والدفع"}
            </Badge>
          </div>
          <h1 className="text-h1 font-bold text-foreground">
            تعليمات وإثبات الدفع
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground pt-1">
            رقم الطلب: <span className="font-mono font-bold text-foreground">{order.order_number}</span> • تاريخ الإنشاء: {new Date(order.created_at).toLocaleDateString("ar-DZ")}
          </p>
        </div>

        {order.status === "PENDING_PAYMENT" && (
          <form
            action={async () => {
              "use server";
              await cancelOrderAction(order.id);
            }}
          >
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="text-xs text-error hover:bg-error/10 hover:border-error/40"
            >
              إلغاء هذا الطلب
            </Button>
          </form>
        )}
      </div>

      {/* Order Summary & Amount Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="default" className="md:col-span-2 p-5 space-y-2">
          <span className="text-xs text-muted-foreground font-medium">الدورة التدريبية:</span>
          <h3 className="text-base font-bold text-foreground truncate">
            {order.course.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            طريقة التحويل المختارة: <strong className="text-foreground">{config.name}</strong>
          </p>
        </Card>

        <Card variant="elevated" className="p-5 space-y-1 border-primary/40 bg-primary/5 text-center flex flex-col justify-center">
          <span className="text-xs text-muted-foreground font-medium">
            المبلغ الدقيق المطلوب للتحويل:
          </span>
          <span className="text-2xl font-black text-primary">
            {order.total_amount === 0 ? "مجاناً" : formatDZD(order.total_amount)}
          </span>
        </Card>
      </div>

      {/* Payment State: APPROVED */}
      {order.status === "APPROVED" && (
        <Alert
          variant="success"
          title="تم اعتماد الدفع وتفعيل الدورة بنجاح!"
          className="p-6 space-y-3"
        >
          <p className="text-sm leading-relaxed">
            تمت مراجعة وصل التحويل بنجاح وتفعيل وصولك الكامل إلى محتوى الدورة
            التدريبية. يمكنك البدء في مشاهدة الدروس الآن عبر مساحة التعلّم.
          </p>
          <div className="pt-2">
            <Link href="/student/my-courses">
              <Button variant="primary" size="md" className="font-bold gap-2 bg-success hover:bg-success/90">
                <CheckCircle className="h-4 w-4" />
                <span>الانتقال لمساحة التعلّم ودوراتي</span>
              </Button>
            </Link>
          </div>
        </Alert>
      )}

      {/* Payment State: PROOF_SUBMITTED (Under Review) */}
      {order.status === "PROOF_SUBMITTED" && (
        <div className="rounded-2xl border border-info/40 bg-info/5 p-6 space-y-4 text-right shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 text-info">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                إثبات الدفع قيد التدقيق والمطابقة
              </h3>
              <p className="text-xs text-muted-foreground">
                تم استلام بيانات الإثبات بنجاح في:{" "}
                {order.latest_proof?.submitted_at
                  ? new Date(order.latest_proof.submitted_at).toLocaleString("ar-DZ")
                  : "الآن"}
              </p>
            </div>
          </div>
          <p className="text-xs text-foreground/90 leading-relaxed">
            يقوم المشرف المختص بالتحقق من مطابقة وصل التحويل مع كشف الحساب البنكي/البريدي.
            سيتم تفعيل الدورة التدريبية تلقائياً فور الاعتماد وإشعارك في هذه الصفحة.
          </p>
        </div>
      )}

      {/* Payment State: REJECTED */}
      {order.status === "REJECTED" && (
        <Alert
          variant="error"
          title="تم رفض إثبات الدفع من طرف الإدارة"
          className="p-5 space-y-2"
        >
          <p className="text-xs font-semibold">
            سبب الرفض:{" "}
            <span className="text-foreground font-normal">
              {order.latest_proof?.rejection_reason || "الوصل المرفق غير واضح أو المبلغ غير مطابق."}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            يرجى مراجعة السبب المذكور، التحقق من الوصل، وإعادة إرسال الإثبات أدناه.
          </p>
        </Alert>
      )}

      {/* Payment Instructions Card */}
      {(order.status === "PENDING_PAYMENT" || order.status === "REJECTED") && (
        <div className="space-y-6">
          <Card variant="elevated" className="border-border p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-border/60 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  معلومات حساب الاستقبال: {config.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  قم بإجراء التحويل الخارجي إلى هذا الحساب
                </p>
              </div>
            </div>

            {/* Account Details Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground font-medium">اسم المستفيد / الحساب:</span>
                <p className="font-bold text-foreground text-sm">{config.accountHolder}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground font-medium">رقم الحساب / المعرف:</span>
                <p className="font-mono font-extrabold text-primary text-sm select-all">
                  {config.accountIdentifier}
                </p>
              </div>
              {config.extraDetails &&
                Object.entries(config.extraDetails).map(([key, val]) => (
                  <div key={key} className="space-y-1">
                    <span className="text-muted-foreground font-medium">{key}:</span>
                    <p className="font-semibold text-foreground">{val}</p>
                  </div>
                ))}
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Info className="h-4 w-4 text-primary" />
                <span>خطوات إتمام الدفع:</span>
              </h4>
              <ol className="space-y-2 text-xs text-muted-foreground leading-relaxed list-decimal list-inside pr-1">
                {config.instructions.map((step, idx) => (
                  <li key={idx}>
                    <span className="text-foreground/90">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Card>

          {/* Proof Submission Upload Form */}
          <PaymentProofForm
            orderId={order.id}
            isReSubmission={order.status === "REJECTED"}
          />
        </div>
      )}
    </div>
  );
}
