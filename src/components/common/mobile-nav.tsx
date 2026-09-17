"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Stack, ShieldCheck, GraduationCap } from "@phosphor-icons/react/dist/ssr";
import { NAV_LINKS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname() || "";
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  React.useEffect(() => {
    if (isOpen) {
      onCloseRef.current();
    }
  }, [pathname, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xs flex-col bg-surface p-6 shadow-xl animate-slide-up text-right border-l border-border">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <Logo size="sm" />
          <button
            onClick={onClose}
            type="button"
            aria-label="إغلاق القائمة"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 space-y-2">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <span>{link.label}</span>
              </Link>
            );
          })}

          <Separator className="my-4" />

          {/* Role Demos Quick Navigation */}
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            المساحات التعليمية
          </p>
          <Link
            href="/student"
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <GraduationCap className="h-4 w-4 text-primary" />
            <span>لوحة الطالب</span>
          </Link>
          <Link
            href="/formateur"
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Stack className="h-4 w-4 text-primary" />
            <span>لوحة المدرب</span>
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>لوحة الإدارة</span>
          </Link>
        </div>

        {/* Drawer Footer Auth Buttons */}
        <div className="pt-4 border-t border-border space-y-2">
          <Link href="/login" className="block w-full">
            <Button variant="outline" className="w-full">
              تسجيل الدخول
            </Button>
          </Link>
          <Link href="/register" className="block w-full">
            <Button variant="primary" className="w-full">
              إنشاء حساب جديد
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
