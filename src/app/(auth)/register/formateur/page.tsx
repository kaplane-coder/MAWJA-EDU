"use client";

import * as React from "react";
import Link from "next/link";
import { Certificate, CheckCircle, ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { registerFormateurAction } from "@/actions/auth";

export default function FormateurRegisterPage() {
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [headline, setHeadline] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [specialty, setSpecialty] = React.useState("web-dev");
  const [password, setPassword] = React.useState("");
  const [passwordConfirmation, setPasswordConfirmation] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, string[]>
  >({});
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setFieldErrors({});

    try {
      const result = await registerFormateurAction({
        fullName,
        email,
        phone,
        headline,
        bio,
        specialty,
        password,
        passwordConfirmation,
      });

      if (!result.success) {
        setErrorMessage(result.error || "فشل إرسال طلب التدريب");
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setSuccessMessage(result.message || "تم إرسال طلبك بنجاح!");
      setIsLoading(false);
    } catch {
      setErrorMessage("حدث خطأ غير متوقع أثناء معالجة طلب التدريب");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-6">
        <Card variant="elevated" className="border-border/80">
          <CardHeader className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Badge variant="exclusive" className="gap-1 mb-1">
                <Certificate className="h-3.5 w-3.5" />
                <span>برنامج تدريب النخبة</span>
              </Badge>
            </div>
            <CardTitle className="text-2xl font-bold">
              الانضمام كمدرب في منصة موجة
            </CardTitle>
            <CardDescription>
              شارك خبرتك العملية مع آلاف المطورين والمصممين في الجزائر
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isSuccess ? (
              <div className="space-y-4 text-center py-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
                  <CheckCircle className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  تم تقديم طلب الانضمام بنجاح!
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                  {successMessage}
                </p>
                <div className="pt-4">
                  <Link href="/login">
                    <Button variant="primary" className="w-full font-bold">
                      الانتقال لتسجيل الدخول
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <Alert
                  variant="info"
                  className="mb-6 text-xs leading-relaxed"
                  title="سياسة اعتماد المدربين في MAWJA"
                >
                  يتم تسجيل الحساب بصورة آمنة وتُحال البيانات والخبرات لإدارة المنصة
                  للتدقيق والتأكد من مطابقتها لمعايير الجودة قبل تفعيل صلاحيات إنشاء
                  الدورات.
                </Alert>

                {errorMessage && (
                  <Alert
                    variant="error"
                    className="mb-5"
                    title="تعذر تقديم الطلب"
                  >
                    {errorMessage}
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-right">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="الاسم الكامل"
                      placeholder="مثال: د. أمين قندوز"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      error={fieldErrors.fullName?.[0]}
                      required
                    />

                    <Input
                      type="email"
                      label="البريد الإلكتروني المهني"
                      placeholder="expert@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      error={fieldErrors.email?.[0]}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      type="tel"
                      label="رقم الهاتف"
                      placeholder="05 / 06 / 07 XX XX XX XX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      error={fieldErrors.phone?.[0]}
                      required
                    />

                    <Select
                      label="المجال التدريبي الأساسي"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                    >
                      <option value="web-dev">تطوير الويب وهندسة البرمجيات</option>
                      <option value="mobile-dev">تطبيقات الهواتف الذكية</option>
                      <option value="ui-ux">تصميم واجهات وتجربة المستخدم</option>
                      <option value="ai-data">الذكاء الاصطناعي وعلوم البيانات</option>
                      <option value="cloud-devops">الحوسبة السحابية و DevOps</option>
                    </Select>
                  </div>

                  <Input
                    label="المسمى المهني / التخصص"
                    placeholder="مثال: Senior Full-Stack Engineer @ TechCorp"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    error={fieldErrors.headline?.[0]}
                    required
                  />

                  <Textarea
                    label="نبذة عن خبراتك وسجلك المهني"
                    placeholder="اذكر أبرز المشاريع والتقنيات التي تتقنها، وسنوات خبرتك العملية..."
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    error={fieldErrors.bio?.[0]}
                    required
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
                    className="w-full font-bold gap-2 mt-2"
                    isLoading={isLoading}
                  >
                    <span>تقديم طلب الانضمام كمدرب</span>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </form>
              </>
            )}
          </CardContent>

          <CardFooter className="justify-center text-xs text-muted-foreground border-t border-border/60 pt-4">
            <span>تريد التعلم كطالب؟</span>
            <Link
              href="/register"
              className="mr-1.5 font-bold text-primary hover:underline"
            >
              تسجيل حساب طالب
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
