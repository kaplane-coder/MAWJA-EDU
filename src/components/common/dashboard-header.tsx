"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, MagnifyingGlass, Bell } from "@phosphor-icons/react/dist/ssr";
import { UserMenu, type UserMenuProfile } from "./user-menu";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

interface DashboardHeaderProps {
  profile: UserMenuProfile;
  onToggleSidebar?: () => void;
}

export function DashboardHeader({
  profile,
  onToggleSidebar,
}: DashboardHeaderProps) {
  const pathname = usePathname() || "";

  // Helper to generate dynamic breadcrumb labels
  const getBreadcrumbTitle = () => {
    if (pathname === "/student") return "لوحة تحكم الطالب";
    if (pathname === "/student/my-courses") return "دوراتي المفعلة";
    if (pathname === "/student/orders") return "طلباتي وسجل الدفع";
    if (pathname === "/student/profile") return "الملف الشخصي";
    if (pathname === "/student/settings") return "إعدادات الحساب";

    if (pathname === "/formateur") return "لوحة تحكم المدرب";
    if (pathname === "/formateur/courses") return "إدارة الدورات";
    if (pathname === "/formateur/courses/new") return "إنشاء دورة جديدة";
    if (pathname.includes("/formateur/courses/") && pathname.includes("/curriculum"))
      return "منهج وفصول الدورة";
    if (pathname.includes("/formateur/courses/") && pathname.includes("/edit"))
      return "تعديل الدورة";
    if (pathname === "/formateur/students") return "الطلاب المسجلين";
    if (pathname === "/formateur/profile") return "الملف المهني للمدرب";
    if (pathname === "/formateur/settings") return "إعدادات المدرب";

    if (pathname === "/admin") return "لوحة الإدارة المركزية";
    if (pathname === "/admin/users") return "إدارة المستخدمين والصلاحيات";
    if (pathname === "/admin/formateurs") return "إدارة المدربين المعتمدين";
    if (pathname === "/admin/courses") return "مراجعة واعتماد الدورات";
    if (pathname === "/admin/payments") return "تدقيق وصولات الدفع";
    if (pathname === "/admin/settings") return "سجل العمليات وإعدادات النظام";

    return "لوحة التحكم";
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border/80 bg-surface/85 px-4 sm:px-6 backdrop-blur-md transition-all text-right">
      {/* Right Side (in RTL): Mobile List Trigger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleSidebar}
            className="lg:hidden text-muted-foreground"
            aria-label="القائمة الجانبية"
          >
            <List className="h-5 w-5" />
          </Button>
        )}

        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="text-muted-foreground/60 text-xs">/</span>
          <span className="text-xs font-bold text-foreground truncate max-w-[200px] sm:max-w-none">
            {getBreadcrumbTitle()}
          </span>
        </div>
      </div>

      {/* Left Side (in RTL): MagnifyingGlass, Notifications, User List */}
      <div className="flex items-center gap-2.5">
        <Link
          href="/courses"
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-surface"
        >
          <MagnifyingGlass className="h-3.5 w-3.5" />
          <span>تصفح الكتالوج</span>
        </Link>

        {/* Notifications Indicator */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground relative"
            aria-label="الإشعارات"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-surface animate-pulse" />
          </Button>
        </div>

        {/* User Dropdown List */}
        <UserMenu profile={profile} />
      </div>
    </header>
  );
}
