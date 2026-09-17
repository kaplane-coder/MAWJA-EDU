"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
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
import { resetPasswordAction } from "@/actions/auth";

export default function ResetPasswordPage() {
  const [password, setPassword] = React.useState("");
  const [passwordConfirmation, setPasswordConfirmation] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, string[]>
  >({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setFieldErrors({});

    try {
      const result = await resetPasswordAction({
        password,
        passwordConfirmation,
      });

      if (!result.success) {
        setErrorMessage(result.error || "فشل تعيين كلمة المرور الجديدة");
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setIsLoading(false);
    } catch {
      setErrorMessage("حدث خطأ غير متوقع أثناء تحديث كلمة المرور");
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
              تعيين كلمة مرور جديدة
            </CardTitle>
            <CardDescription>
              أدخل كلمة المرور الجديدة لتأمين حسابك في موجة
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isSuccess ? (
              <div className="space-y-4 text-center py-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  تم تحديث كلمة المرور بنجاح!
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  يمكنك الآن المتابعة وتسجيل الدخول ببياناتك الجديدة.
                </p>
                <div className="pt-2">
                  <Link href="/login">
                    <Button variant="primary" className="w-full font-bold">
                      الانتقال لتسجيل الدخول
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
                    type="password"
                    label="كلمة المرور الجديدة"
                    placeholder="8 أحرف وأرقام على الأقل"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={fieldErrors.password?.[0]}
                    autoComplete="new-password"
                    required
                  />

                  <Input
                    type="password"
                    label="تأكيد كلمة المرور الجديدة"
                    placeholder="أعد إدخال كلمة المرور"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    error={fieldErrors.passwordConfirmation?.[0]}
                    autoComplete="new-password"
                    required
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full font-bold mt-2"
                    isLoading={isLoading}
                  >
                    حفظ كلمة المرور الجديدة
                  </Button>
                </form>
              </>
            )}
          </CardContent>

          <CardFooter className="justify-center text-xs text-muted-foreground border-t border-border/60 pt-4">
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
              العودة لتسجيل الدخول
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
