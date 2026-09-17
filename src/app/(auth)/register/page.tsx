"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { AuthSwitch } from "@/components/ui/auth-switch";
import { registerStudentAction } from "@/actions/auth";

export default function StudentRegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordConfirmation, setPasswordConfirmation] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, string[]>
  >({});
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const handleModeChange = (mode: "login" | "register") => {
    if (mode === "login") {
      router.push("/login");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setFieldErrors({});

    try {
      const result = await registerStudentAction({
        fullName,
        email,
        phone,
        password,
        passwordConfirmation,
      });

      if (!result.success) {
        setErrorMessage(result.error || "فشل إنشاء الحساب");
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setSuccessMessage(result.message || "تم إنشاء الحساب بنجاح!");
      setIsLoading(false);
    } catch {
      setErrorMessage("حدث خطأ غير متوقع أثناء معالجة طلب التسجيل");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Visual Auth Switch */}
        <AuthSwitch initialMode="register" onModeChange={handleModeChange} />

        <Card variant="elevated" className="border-border/80">
          <CardContent className="pt-6">
            {isSuccess ? (
              <div className="space-y-4 text-center py-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  تم تسجيل حسابك بنجاح!
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {successMessage}
                </p>
                <div className="pt-4">
                  <Link href="/login">
                    <Button variant="primary" className="w-full font-bold">
                      الانتقال إلى صفحة تسجيل الدخول
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {errorMessage && (
                  <Alert
                    variant="error"
                    className="mb-5"
                    title="تعذر استكمال التسجيل"
                  >
                    {errorMessage}
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-right">
                  <Input
                    label="الاسم الكامل"
                    placeholder="مثال: يونس بلحاج"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    error={fieldErrors.fullName?.[0]}
                    required
                  />

                  <Input
                    type="email"
                    label="البريد الإلكتروني"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={fieldErrors.email?.[0]}
                    autoComplete="email"
                    required
                  />

                  <Input
                    type="tel"
                    label="رقم الهاتف (اختياري)"
                    placeholder="05 / 06 / 07 XX XX XX XX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    error={fieldErrors.phone?.[0]}
                    helperText="يستخدم للتواصل بخصوص تفعيل الدورات والإشعارات الهامة"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      type="password"
                      label="كلمة المرور"
                      placeholder="8 أحرف وأرقام على الأقل"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      error={fieldErrors.password?.[0]}
                      autoComplete="new-password"
                      required
                    />

                    <Input
                      type="password"
                      label="تأكيد كلمة المرور"
                      placeholder="أعد إدخال كلمة المرور"
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      error={fieldErrors.passwordConfirmation?.[0]}
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full font-bold gap-2 mt-4"
                    isLoading={isLoading}
                  >
                    <span>إنشاء حساب جديد</span>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </form>
              </>
            )}
          </CardContent>

          <CardFooter className="flex-col gap-2.5 justify-center text-xs text-muted-foreground border-t border-border/60 pt-4">
            <div className="flex items-center gap-1.5">
              <span>هل أنت مدرب أو خبير برمجيات؟</span>
              <Link
                href="/register/formateur"
                className="font-bold text-foreground hover:text-primary hover:underline"
              >
                إنشاء حساب مدرب معتمد
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
