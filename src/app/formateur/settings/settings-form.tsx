"use client";

import * as React from "react";
import {
  Key,
  ShieldCheck,
  SignOut,
  Envelope,
  User,
  CalendarBlank,
  CreditCard,
  Building,
} from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { changePasswordAction } from "@/actions/profile";
import { logoutAction } from "@/actions/auth";
import type { Database } from "@/types/database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

interface FormateurSettingsFormProps {
  profile: ProfileRow;
}

export function FormateurSettingsForm({ profile }: FormateurSettingsFormProps) {
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [passwordMessage, setPasswordMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, string[]>
  >({});

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setPasswordMessage(null);
    setFieldErrors({});

    const res = await changePasswordAction({
      newPassword,
      confirmPassword,
    });

    if (!res.success) {
      setPasswordMessage({
        type: "error",
        text: res.error || "فشل تغيير كلمة المرور",
      });
      if (res.fieldErrors) {
        setFieldErrors(res.fieldErrors);
      }
    } else {
      setPasswordMessage({
        type: "success",
        text: res.message || "تم تغيير كلمة المرور بنجاح!",
      });
      setNewPassword("");
      setConfirmPassword("");
    }
    setIsChangingPassword(false);
  };

  const formattedDate = new Date(profile.created_at).toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8 text-right">
      {/* Account Overview */}
      <Card variant="default">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span>معلومات حساب المدرب</span>
          </CardTitle>
          <CardDescription className="text-xs">
            البيانات المعتمدة لحسابك التدريبي على منصة موجة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Envelope className="h-3.5 w-3.5" />
                <span>البريد الإلكتروني</span>
              </span>
              <p className="font-semibold text-foreground truncate">{profile.email}</p>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <CalendarBlank className="h-3.5 w-3.5" />
                <span>تاريخ الانضمام</span>
              </span>
              <p className="font-semibold text-foreground">{formattedDate}</p>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>حالة الحساب</span>
              </span>
              <div className="pt-0.5">
                <Badge variant={profile.is_active ? "success" : "error"} size="sm">
                  {profile.is_active ? "نشط ومعتمد" : "معطل"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payout & Financial Information */}
      <Card variant="default">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <span>إعدادات الدفع وعوائد الدورات</span>
          </CardTitle>
          <CardDescription className="text-xs">
            معلومات تحويل العوائد المالية لاشتراكات دوراتك
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="info" className="text-xs leading-relaxed" title="سياسة التحويلات المالية في موجة">
            تتم تسوية أرباح المدربين شهرياً عبر الحساب البريدي الجاري (CCP) أو التحويل البنكي المباشر.
            في حال رغبتك بتحديث بيانات حسابك البنكي أو البريدي، يرجى التواصل مع الدعم الإداري.
          </Alert>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-border/70 bg-muted/10 p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Building className="h-4 w-4 text-primary" />
                <span>طرق التحويل المدعومة</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                الحساب البريدي الجاري (CCP / RIP) والتحويل البنكي لكافة البنوك الجزائرية المعتمدة.
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/10 p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <ShieldCheck className="h-4 w-4 text-success" />
                <span>أمان المستحقات</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                يتم احتساب العوائد بناءً على الاشتراكات المفعلة والمحققة في كل دورة بوضوح وشفافية.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card variant="default">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            <span>تغيير كلمة المرور</span>
          </CardTitle>
          <CardDescription className="text-xs">
            قم بتعيين كلمة مرور قوية لحماية حسابك التدريبي
          </CardDescription>
        </CardHeader>
        <CardContent>
          {passwordMessage && (
            <Alert
              variant={passwordMessage.type === "success" ? "default" : "error"}
              className="mb-4 text-xs"
              title={passwordMessage.type === "success" ? "تم بنجاح" : "خطأ"}
            >
              {passwordMessage.text}
            </Alert>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <Input
              type="password"
              label="كلمة المرور الجديدة"
              placeholder="8 أحرف وأرقام على الأقل"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={fieldErrors.newPassword?.[0]}
              autoComplete="new-password"
              required
            />

            <Input
              type="password"
              label="تأكيد كلمة المرور الجديدة"
              placeholder="أعد إدخال كلمة المرور"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={fieldErrors.confirmPassword?.[0]}
              autoComplete="new-password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isChangingPassword}
              className="font-bold text-xs"
            >
              تحديث كلمة المرور
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Logout Card */}
      <Card variant="default" className="border-error/20 bg-error/5">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-error">تسجيل الخروج من الحساب</h3>
            <p className="text-xs text-muted-foreground">
              إنهاء جلستك الحالية على هذا المتصفح
            </p>
          </div>
          <form action={logoutAction}>
            <Button variant="destructive" size="sm" className="gap-2 font-bold text-xs">
              <SignOut className="h-4 w-4" />
              <span>تسجيل الخروج</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
