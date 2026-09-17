"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MagnifyingGlass, List, SquaresFour } from "@phosphor-icons/react/dist/ssr";
import { NAV_LINKS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { MobileNav } from "./mobile-nav";
import { UserMenu, type UserMenuProfile } from "./user-menu";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [profile, setProfile] = React.useState<UserMenuProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = React.useState(true);
  const pathname = usePathname() || "";

  // Hide public navbar inside dashboard routes (each dashboard has its own dedicated DashboardHeader & Sidebar)
  const isDashboardRoute =
    pathname.startsWith("/student") ||
    pathname.startsWith("/formateur") ||
    pathname.startsWith("/admin");

  React.useEffect(() => {
    async function loadAuth() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("id, email, full_name, avatar_url, role")
            .eq("id", user.id)
            .single();

          if (data) {
            setProfile(data as UserMenuProfile);
          }
        } else {
          setProfile(null);
        }
      } catch {
        setProfile(null);
      } finally {
        setIsLoadingAuth(false);
      }
    }

    loadAuth();
  }, [pathname]);

  if (isDashboardRoute) {
    return null;
  }

  const getDashboardLink = () => {
    if (!profile) return "/student";
    if (profile.role === "ADMIN") return "/admin";
    if (profile.role === "FORMATEUR") return "/formateur";
    return "/student";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-surface/85 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 text-right">
        {/* Left/Start: Brand Logo */}
        <div className="flex items-center gap-8">
          <Logo size="md" />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3.5 py-2 text-sm font-medium transition-colors hover:text-primary hover:bg-muted/60",
                    isActive
                      ? "text-primary font-bold bg-primary/5"
                      : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right/End: MagnifyingGlass & Auth Actions */}
        <div className="flex items-center gap-3">
          {/* Quick MagnifyingGlass Link to Catalog */}
          <Link
            href="/courses"
            className="hidden lg:flex items-center gap-2 rounded-lg border border-input bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-surface"
          >
            <MagnifyingGlass className="h-3.5 w-3.5 text-muted-foreground" />
            <span>ابحث عن دورة، تقنية، أو مهارة...</span>
            <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              /
            </kbd>
          </Link>

          {/* Become Instructor Link */}
          {!profile && (
            <Link
              href="/register/formateur"
              className="hidden sm:inline-flex text-xs font-semibold text-muted-foreground hover:text-primary transition-colors px-2 py-1"
            >
              كن مدرباً
            </Link>
          )}

          {/* Auth Action Buttons or User Dropdown */}
          {!isLoadingAuth && (
            <div className="flex items-center gap-2">
              {profile ? (
                <div className="flex items-center gap-2.5">
                  <Link href={getDashboardLink()}>
                    <Button variant="outline" size="sm" className="hidden sm:flex gap-1.5 text-xs font-bold">
                      <SquaresFour className="h-3.5 w-3.5 text-primary" />
                      <span>لوحة التحكم</span>
                    </Button>
                  </Link>
                  <UserMenu profile={profile} />
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      تسجيل الدخول
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm" className="font-bold">
                      حساب جديد
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Mobile List Toggle Button */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setIsMobileOpen(true)}
            aria-label="القائمة الرئيسية"
          >
            <List className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
      />
    </header>
  );
}
