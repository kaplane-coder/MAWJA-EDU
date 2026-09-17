"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  CheckCircle,
  ArrowLeft,
  X,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { formatDZD } from "@/lib/utils";
import { createOrderAction } from "@/actions/orders";
import { getAvailablePaymentMethods } from "@/lib/payment-methods";
import type { PaymentMethod } from "@/types/database.types";

interface EnrollButtonProps {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  price: number;
  isEnrolled: boolean;
  isAuthenticated: boolean;
}

export function EnrollButton({
  courseId,
  courseSlug,
  courseTitle,
  price,
  isEnrolled,
  isAuthenticated,
}: EnrollButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("BARIDIMOB");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const availableMethods = getAvailablePaymentMethods();

  if (isEnrolled) {
    return (
      <div className="space-y-2">
        <Link href="/student/my-courses" className="block w-full">
          <Button variant="primary" size="lg" className="w-full font-bold gap-2 bg-success hover:bg-success/90">
            <CheckCircle className="h-5 w-5" />
            <span>أنت مسجل بالفعل — انتقال للمحتوى</span>
          </Button>
        </Link>
        <p className="text-center text-[11px] text-muted-foreground">
          تم تفعيل وصولك الكامل لهذه الدورة.
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-2">
        <Link
          href={`/login?redirect=/courses/${courseSlug}`}
          className="block w-full"
        >
          <Button variant="primary" size="lg" className="w-full font-bold">
            سجل الآن في الدورة
          </Button>
        </Link>
        <p className="text-center text-[11px] text-muted-foreground">
          يتطلب التسجيل حساب طالب في منصة موجة
        </p>
      </div>
    );
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const result = await createOrderAction({
      course_id: courseId,
      payment_method: paymentMethod,
    });

    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || "فشل إنشاء الطلب");
      return;
    }

    if (result.data?.orderId) {
      router.push(`/student/orders/${result.data.orderId}/payment`);
    }
  };

  return (
    <>
      <Button
        variant="primary"
        size="lg"
        className="w-full font-bold text-sm shadow-md"
        onClick={() => setIsOpen(true)}
      >
        سجل الآن في الدورة
      </Button>

      {/* Checkout Selection Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-6 text-right">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border/60 pb-4">
              <div>
                <Badge variant="default" size="sm" className="mb-1">
                  الدفع والتحويل الخارجي
                </Badge>
                <h3 className="text-lg font-bold text-foreground">
                  طلب التسجيل في الدورة
                </h3>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                title="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMessage && (
              <Alert variant="error" title="تعذر إنشاء الطلب">
                {errorMessage}
              </Alert>
            )}

            {/* Course Summary */}
            <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center text-foreground font-semibold">
                <span>الدورة:</span>
                <span className="truncate max-w-[240px] text-primary">
                  {courseTitle}
                </span>
              </div>
              <div className="flex justify-between items-center text-foreground font-semibold border-t border-border/60 pt-2">
                <span>المبلغ المطلوب للدفع:</span>
                <span className="text-sm font-black text-foreground">
                  {price === 0 ? "مجاناً" : formatDZD(price)}
                </span>
              </div>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-foreground">
                  اختر وسيلة التحويل والدفع المفضلة لديك:
                </label>
                <div className="space-y-2">
                  {availableMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? "border-primary bg-primary/5 shadow-xs"
                          : "border-border hover:border-border/80"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment_method"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id)}
                          className="text-primary focus:ring-primary h-4 w-4"
                        />
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            {method.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {method.badge}
                          </p>
                        </div>
                      </div>
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-muted/30 p-3 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>
                  <strong>ملاحظة هامة:</strong> يتم التحويل عبر الوسيلة المختارة خارج
                  المنصة، ثم تقوم برفع وصل التحويل في الصفحة التالية ليتم
                  تأكيده وتفعيل الدورة يدوياً من طرف فريق MAWJA.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="font-bold gap-2"
                  isLoading={isLoading}
                >
                  <span>متابعة لتعليمات الدفع</span>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
