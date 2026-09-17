"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { APP_CONFIG, MOCK_CATEGORIES } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const pathname = usePathname() || "";

  // Hide footer in dashboard routes and classroom for optimal app layout
  const isDashboardOrClassroom =
    pathname.startsWith("/student") ||
    pathname.startsWith("/formateur") ||
    pathname.startsWith("/admin");

  if (isDashboardOrClassroom) {
    return null;
  }

  return (
    <footer className="border-t border-border bg-surface text-foreground pt-14 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5 text-right">
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center">
              <Logo size="lg" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              {APP_CONFIG.description}
            </p>
            <p className="text-xs text-muted-foreground pt-1">
              منصة تعليمية متخصصة في تمكين المطورين والمصممين ورواد الأعمال من بناء منتجات رقمية متقدمة.
            </p>
          </div>

          {/* Col 3: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground">المنصة</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/courses" className="hover:text-primary transition-colors">
                  جميع الدورات
                </Link>
              </li>
              <li>
                <Link href="/courses#categories" className="hover:text-primary transition-colors">
                  التصنيفات
                </Link>
              </li>
              <li>
                <Link href="/register/formateur" className="hover:text-primary transition-colors">
                  كن مدرباً معنا
                </Link>
              </li>
              <li>
                <Link href="/design-system" className="hover:text-primary transition-colors">
                  دليل التصميم (Design System)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground">المجالات الرائجة</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {MOCK_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/courses?category=${cat.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Security & Platform */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground">المساحات</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/student" className="hover:text-primary transition-colors">
                  مساحة الطالب
                </Link>
              </li>
              <li>
                <Link href="/formateur" className="hover:text-primary transition-colors">
                  مساحة المدرب
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-primary transition-colors">
                  لوحة الإدارة المركزية
                </Link>
              </li>
              <li>
                <Link href="/api/health" className="hover:text-primary transition-colors font-mono text-xs">
                  Health Check (/api/health)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Copyright Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p suppressHydrationWarning>© {new Date().getFullYear()} MAWJA Education. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-2">
            <span>صُنع في الجزائر</span>
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            <span>بأعلى معايير الإنتاج</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
