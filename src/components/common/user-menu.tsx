"use client";

import * as React from "react";
import Link from "next/link";
import {
  User,
  Gear,
  SignOut,
  SquaresFour,
  BookOpen,
  FileText,
  Users,
  ShieldCheck,
  Certificate,
  CaretDown,
} from "@phosphor-icons/react/dist/ssr";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { logoutAction } from "@/actions/auth";
import type { UserRole } from "@/types/database.types";
import { cn } from "@/lib/utils";

export interface UserMenuProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  role: UserRole;
}

interface UserMenuProps {
  profile: UserMenuProfile;
  className?: string;
}

export function UserMenu({ profile, className }: UserMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return (
          <Badge variant="error" size="sm">
            إدارة
          </Badge>
        );
      case "FORMATEUR":
        return (
          <Badge variant="exclusive" size="sm">
            مدرب
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" size="sm">
            طالب
          </Badge>
        );
    }
  };

  const getDashboardHref = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "/admin";
      case "FORMATEUR":
        return "/formateur";
      default:
        return "/student";
    }
  };

  const getProfileHref = (role: UserRole) => {
    switch (role) {
      case "FORMATEUR":
        return "/formateur/profile";
      default:
        return "/student/profile";
    }
  };

  const getSettingsHref = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "/admin/settings";
      case "FORMATEUR":
        return "/formateur/settings";
      default:
        return "/student/settings";
    }
  };

  return (
    <div ref={menuRef} className={cn("relative inline-block text-right", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-full border border-border/80 bg-surface/80 p-1.5 pl-3 hover:bg-muted/50 hover:border-primary/40 transition-all focus:outline-hidden focus:ring-2 focus:ring-primary/20"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Avatar
          src={profile.avatar_url || undefined}
          alt={profile.full_name}
          fallback={profile.full_name}
          size="sm"
        />
        <div className="hidden sm:flex flex-col items-start text-right">
          <span className="text-xs font-bold text-foreground leading-tight max-w-[120px] truncate">
            {profile.full_name}
          </span>
          <span className="text-[10px] text-muted-foreground leading-tight">
            {profile.role === "ADMIN"
              ? "مدير المنصة"
              : profile.role === "FORMATEUR"
              ? "مدرب معتمد"
              : "طالب"}
          </span>
        </div>
        <CaretDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 rounded-2xl border border-border bg-surface p-2 shadow-xl backdrop-blur-md z-50 animate-in fade-in-0 zoom-in-95 duration-100">
          {/* User Header */}
          <div className="border-b border-border/60 p-3 pb-3.5 mb-1">
            <div className="flex items-center gap-3">
              <Avatar
                src={profile.avatar_url || undefined}
                alt={profile.full_name}
                fallback={profile.full_name}
                size="md"
              />
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-bold text-foreground truncate">
                  {profile.full_name}
                </p>
                <p className="text-xs text-muted-foreground truncate" title={profile.email}>
                  {profile.email}
                </p>
                <div className="mt-1.5">{getRoleBadge(profile.role)}</div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-0.5 py-1 text-xs">
            <Link
              href={getDashboardHref(profile.role)}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-foreground font-semibold hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <SquaresFour className="h-4 w-4 text-primary" />
              <span>لوحة التحكم الرئيسية</span>
            </Link>

            {profile.role === "STUDENT" && (
              <>
                <Link
                  href="/student/my-courses"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-foreground font-medium hover:bg-muted/60 transition-colors"
                >
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>دوراتي المفعلة</span>
                </Link>
                <Link
                  href="/student/orders"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-foreground font-medium hover:bg-muted/60 transition-colors"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>طلباتي وسجل الدفع</span>
                </Link>
              </>
            )}

            {profile.role === "FORMATEUR" && (
              <>
                <Link
                  href="/formateur/courses"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-foreground font-medium hover:bg-muted/60 transition-colors"
                >
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>إدارة دوراتي</span>
                </Link>
                <Link
                  href="/formateur/students"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-foreground font-medium hover:bg-muted/60 transition-colors"
                >
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>طلابي المسجلين</span>
                </Link>
              </>
            )}

            {profile.role === "ADMIN" && (
              <>
                <Link
                  href="/admin/users"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-foreground font-medium hover:bg-muted/60 transition-colors"
                >
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>إدارة المستخدمين</span>
                </Link>
                <Link
                  href="/admin/formateurs"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-foreground font-medium hover:bg-muted/60 transition-colors"
                >
                  <Certificate className="h-4 w-4 text-muted-foreground" />
                  <span>إدارة المدربين</span>
                </Link>
                <Link
                  href="/admin/payments"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-foreground font-medium hover:bg-muted/60 transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <span>تدقيق المدفوعات</span>
                </Link>
              </>
            )}

            {profile.role !== "ADMIN" && (
              <Link
                href={getProfileHref(profile.role)}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-foreground font-medium hover:bg-muted/60 transition-colors"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                <span>الملف الشخصي</span>
              </Link>
            )}

            <Link
              href={getSettingsHref(profile.role)}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-foreground font-medium hover:bg-muted/60 transition-colors"
            >
              <Gear className="h-4 w-4 text-muted-foreground" />
              <span>إعدادات الحساب</span>
            </Link>
          </div>

          {/* Logout Action */}
          <div className="border-t border-border/60 pt-1 mt-1">
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-error hover:bg-error/10 hover:text-error transition-colors"
              >
                <SignOut className="h-4 w-4" />
                <span>تسجيل الخروج</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
