import * as React from "react";
import Link from "next/link";
import { ShieldWarning, ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12 text-right">
      <div className="w-full max-w-md space-y-6">
        <Card variant="elevated" className="border-error/20">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-error/10 text-error shadow-xs">
              <ShieldWarning className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              غير مصرح بالوصول (403 Forbidden)
            </CardTitle>
            <CardDescription className="leading-relaxed">
              ليس لديك الصلاحيات الكافية للوصول إلى هذه المساحة أو الصفحة المطلوبة.
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center text-xs text-muted-foreground leading-relaxed">
            إذا كنت تعتقد أن هذا خطأ أو تحتاج للترقية إلى حساب مدرب أو مسؤول، يرجى
            التواصل مع إدارة المنصة.
          </CardContent>

          <CardFooter className="flex-col gap-2.5 justify-center border-t border-border/60 pt-4">
            <Link href="/student" className="w-full">
              <Button variant="primary" className="w-full font-bold gap-2">
                <span>العودة إلى مساحتك التعليمية</span>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full text-xs">
                الرئيسية
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
