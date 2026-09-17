"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, EnvelopeOpen } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/ui/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { forgotPasswordAction } from "@/actions/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSent, setIsSent] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await forgotPasswordAction({ email });
      if (!result.success) {
        setErrorMessage(result.error || "فشل إرسال رابط الاستعادة");
        setIsLoading(false);
        return;
      }

      setIsSent(true);
      setIsLoading(false);
    } catch {
      setErrorMessage("حدث خطأ غير متوقع أثناء معالجة طلبك");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <Card variant="elevated" className="border-border/80">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto flex justify-center pb-1">
              <Logo size="lg" />
            </div>
            <CardTitle className="text-2xl font-bold">
              استعادة كلمة المرور
            </CardTitle>
            <CardDescription>
              أدخل بريدك الإلكتروني وسنرسل لك رابطاً آمناً لإعادة تعيين كلمة المرور
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isSent ? (
              <div className="space-y-4 text-center py-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
                  <EnvelopeOpen className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  تم إرسال رابط الاستعادة
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  إذا كان البريد الإلكتروني مسجلاً لدينا، ستتلقى رسالة تتضمن رابطاً
                  لإعادة تعيين كلمة المرور خلال دقائق.
                </p>
                <div className="pt-2">
                  <Link href="/login">
                    <Button variant="outline" className="w-full font-bold text-xs">
                      العودة لتسجيل الدخول
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {errorMessage && (
                  <Alert variant="error" className="mb-4" title="خطأ">
                    {errorMessage}
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-right">
                  <Input
                    type="email"
                    label="البريد الإلكتروني"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full font-bold"
                    isLoading={isLoading}
                  >
                    إرسال رابط الاستعادة
                  </Button>
                </form>
              </>
            )}
          </CardContent>

          <CardFooter className="justify-center text-xs text-muted-foreground border-t border-border/60 pt-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>العودة لتسجيل الدخول</span>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
