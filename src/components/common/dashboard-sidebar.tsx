"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFour,
  BookOpen,
  Compass,
  FileText,
  User,
  Gear,
  Users,
  Certificate,
  ShieldCheck,
  CreditCard,
  PlusCircle,
  SignOut,
  X,
} from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/ui/logo";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { logoutAction } from "@/actions/auth";
import type { UserRole } from "@/types/database.types";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  profile: {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string | null;
    role: UserRole;
  };
  isOpen?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({
  profile,
  isOpen = false,
  onClose,
}: DashboardSidebarProps) {
  const pathname = usePathname() || "";

  const studentLinks = [
    {
      title: "الرئيسية",
      href: "/student",
      icon: <SquaresFour className="h-4 w-4" />,
      exact: true,
    },
    {
      title: "دوراتي المفعلة",
      href: "/student/my-courses",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      title: "استكشاف الكتالوج",
      href: "/courses",
      icon: <Compass className="h-4 w-4" />,
    },
    {
      title: "طلباتي وسجل الدفع",
      href: "/student/orders",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      title: "الملف الشخصي",
      href: "/student/profile",
      icon: <User className="h-4 w-4" />,
    },
    {
      title: "الإعدادات",
      href: "/student/settings",
      icon: <Gear className="h-4 w-4" />,
    },
  ];

  const formateurLinks = [
    {
      title: "لوحة المدرب",
      href: "/formateur",
      icon: <SquaresFour className="h-4 w-4" />,
      exact: true,
    },
    {
      title: "إدارة دوراتي",
      href: "/formateur/courses",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      title: "إنشاء دورة جديدة",
      href: "/formateur/courses/new",
      icon: <PlusCircle className="h-4 w-4" />,
    },
    {
      title: "طلابي المسجلين",
      href: "/formateur/students",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "الملف المهني",
      href: "/formateur/profile",
      icon: <Certificate className="h-4 w-4" />,
    },
    {
      title: "الإعدادات",
      href: "/formateur/settings",
      icon: <Gear className="h-4 w-4" />,
    },
  ];

  const adminLinks = [
    {
      title: "لوحة الإدارة المركزية",
      href: "/admin",
      icon: <SquaresFour className="h-4 w-4" />,
      exact: true,
    },
    {
      title: "إدارة المستخدمين",
      href: "/admin/users",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "إدارة المدربين",
      href: "/admin/formateurs",
      icon: <Certificate className="h-4 w-4" />,
    },
    {
      title: "مراجعة الدورات",
      href: "/admin/courses",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      title: "تدقيق المدفوعات",
      href: "/admin/payments",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      title: "سجل العمليات والإعدادات",
      href: "/admin/settings",
      icon: <ShieldCheck className="h-4 w-4" />,
    },
  ];

  const links =
    profile.role === "ADMIN"
      ? adminLinks
      : profile.role === "FORMATEUR"
      ? formateurLinks
      : studentLinks;

  const roleLabel =
    profile.role === "ADMIN"
      ? "إدارة المنصة"
      : profile.role === "FORMATEUR"
      ? "مساحة المدرب"
      : "مساحة الطالب";

  const roleBadge =
    profile.role === "ADMIN" ? (
      <Badge variant="error" size="sm">
        ADMIN
      </Badge>
    ) : profile.role === "FORMATEUR" ? (
      <Badge variant="exclusive" size="sm">
        مدرب
      </Badge>
    ) : (
      <Badge variant="secondary" size="sm">
        طالب
      </Badge>
    );

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4 text-right bg-surface border-l border-border/80">
      {/* Brand & Role Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2 pt-2">
          <div className="flex items-center gap-2">
            <Logo size="md" />
            <Badge variant="outline" size="sm" className="text-[10px] py-0 px-2 font-bold">
              {roleLabel}
            </Badge>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* User Card */}
        <div className="rounded-2xl border border-border/60 bg-muted/20 p-3.5 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar
              src={profile.avatar_url || undefined}
              alt={profile.full_name}
              fallback={profile.full_name}
              size="md"
            />
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold text-foreground truncate">
                {profile.full_name}
              </p>
              <p className="text-[11px] text-muted-foreground truncate" title={profile.email}>
                {profile.email}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[11px]">
            <span className="text-muted-foreground">نوع الحساب:</span>
            {roleBadge}
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            القائمة الرئيسية
          </p>
          <nav className="space-y-1">
            {links.map((link) => {
              const isActive = link.exact
                ? pathname === link.href
                : pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <span className={cn("transition-colors", isActive ? "text-primary-foreground" : "text-primary")}>
                    {link.icon}
                  </span>
                  <span>{link.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Quick Actions */}
      <div className="space-y-3 pt-6 border-t border-border/60">
        <Link
          href="/courses"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full rounded-xl border border-border/80 bg-surface px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted/40 transition-colors"
        >
          <Compass className="h-3.5 w-3.5 text-primary" />
          <span>تصفح الدورات التدريبية</span>
        </Link>

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-error hover:bg-error/10 transition-colors"
          >
            <SignOut className="h-3.5 w-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 fixed inset-y-0 right-0 z-30 shadow-xs">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative mr-auto flex h-full w-72 flex-col z-50 animate-in slide-in-from-right duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
