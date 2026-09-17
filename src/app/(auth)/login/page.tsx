"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { AuthSwitch } from "@/components/ui/auth-switch";
import { loginAction } from "@/actions/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const queryError = searchParams.get("error");

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(
    queryError || null
  );

  const handleModeChange = (mode: "login" | "register") => {
    if (mode === "register") {
      router.push("/register");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await loginAction({ email, password });
      if (!result.success) {
        setErrorMessage(result.error || "فشل تسجيل الدخول");
        setIsLoading(false);
        return;
      }

      // Successful authentication
      const destination = redirectParam || result.data?.redirectUrl || "/student";
      router.push(destination);
      router.refresh();
    } catch {
      setErrorMessage("حدث خطأ غير متوقع أثناء تسجيل الدخول");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Visual Auth Switch */}
        <AuthSwitch initialMode="login" onModeChange={handleModeChange} />

        <Card variant="elevated" className="border-border/80">
          <CardContent className="pt-6">
            {errorMessage && (
              <Alert variant="error" className="mb-5" title="خطأ في تسجيل الدخول">
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

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-semibold">
                    كلمة المرور
                  </span>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full font-bold gap-2 mt-2"
                isLoading={isLoading}
              >
                <span>تسجيل الدخول</span>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-2.5 justify-center text-xs text-muted-foreground border-t border-border/60 pt-4">
            <div className="flex items-center gap-1.5">
              <span>هل ترغب بتقديم دورات تدريبية؟</span>
              <Link
                href="/register/formateur"
                className="font-bold text-foreground hover:text-primary hover:underline"
              >
                الانضمام كمدرب في موجة
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12">
          <div className="w-full max-w-md h-[460px] rounded-3xl bg-muted/20 animate-pulse border border-border/60" />
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
