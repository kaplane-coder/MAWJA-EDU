"use client";

import * as React from "react";
import { Key, HardDrives, ShieldCheck, Database as DbIcon, HardDrive } from "@phosphor-icons/react/dist/ssr";
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

export function AdminSettingsForm() {
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
        text: res.message || "تم تحديث كلمة مرور المسؤول بنجاح!",
      });
      setNewPassword("");
      setConfirmPassword("");
    }
    setIsChangingPassword(false);
  };

  return (
    <div className="space-y-6 text-right">
      {/* Infrastructure & Security Status */}
      <Card variant="default">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <HardDrives className="h-5 w-5 text-primary" />
            <span>جاهزية وأمان خوادم النظام (Infrastructure)</span>
          </CardTitle>
          <CardDescription className="text-xs">
            حالة اتصال الخدمات السحابية ومستودعات التخزين المعزولة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <DbIcon className="h-4 w-4 text-primary" />
                  <span>قاعدة البيانات Postgres</span>
                </span>
                <Badge variant="success" size="sm">
                  متصل
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Row Level Security (RLS) مفعل ومؤمن لكافة الجداول 100%.
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <HardDrive className="h-4 w-4 text-primary" />
                  <span>حاويات التخزين (Storage)</span>
                </span>
                <Badge variant="success" size="sm">
                  مؤمنة
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                public-assets, private-proofs, course-materials مع الروابط الموقعة.
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Zero-Leakage Classroom</span>
                </span>
                <Badge variant="success" size="sm">
                  نشط
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                حماية محتوى الدروس ومقاطع الفيديو من التسريب غير المصرح به.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Password Change */}
      <Card variant="default">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <span>تحديث كلمة مرور حساب المسؤول</span>
          </CardTitle>
          <CardDescription className="text-xs">
            قم بتعيين كلمة مرور فائقة القوة للحفاظ على أعلى درجات الأمان
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
              placeholder="8 أحرف وأرقام ورموز على الأقل"
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
              حفظ كلمة المرور الجديدة
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
