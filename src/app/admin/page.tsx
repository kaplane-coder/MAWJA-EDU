import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  Certificate,
  BookOpen,
  CreditCard,
  ArrowLeft,
  CheckCircle,
  Clock,
} from "@phosphor-icons/react/dist/ssr";
import { requireAdmin } from "@/lib/auth";
import { getAdminDashboardMetrics } from "@/lib/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const profile = await requireAdmin("/admin");
  const metrics = await getAdminDashboardMetrics();

  return (
    <div className="space-y-8 text-right">
      {/* ==========================================
          1. HEADER & WELCOME
          ========================================== */}
      <div className="rounded-3xl border border-border/80 bg-gradient-to-r from-error/10 via-surface to-surface p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar
              src={profile.avatar_url || undefined}
              alt={profile.full_name}
              fallback={profile.full_name}
              size="lg"
              className="ring-4 ring-error/20 shadow-md"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="error" className="gap-1 text-xs">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>لوحة الإدارة المركزية</span>
                </Badge>
                <Badge variant="outline" size="sm">
                  مدير النظام
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                مرحباً بك، {profile.full_name} 🛡️
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                المراقبة الشاملة لمستخدمي المنصة، المدربين، الدورات، والتحويلات المالية
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {metrics.pendingPaymentsCount > 0 && (
              <Link href="/admin/payments">
                <Button variant="outline" size="sm" className="gap-1.5 font-bold text-xs border-warning text-warning hover:bg-warning/10">
                  <Clock className="h-4 w-4" />
                  <span>{metrics.pendingPaymentsCount} دفعات معلقة</span>
                </Button>
              </Link>
            )}

            {metrics.pendingCourses > 0 && (
              <Link href="/admin/courses">
                <Button variant="outline" size="sm" className="gap-1.5 font-bold text-xs border-info text-info hover:bg-info/10">
                  <BookOpen className="h-4 w-4" />
                  <span>{metrics.pendingCourses} دورات قيد المراجعة</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ==========================================
          2. LIVE PLATFORM METRICS
          ========================================== */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Card variant="default" className="p-4 text-right space-y-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary mb-1">
            <Users className="h-4 w-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-foreground">
            {metrics.totalUsers}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">
            إجمالي الحسابات
          </p>
        </Card>

        <Card variant="default" className="p-4 text-right space-y-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 text-foreground mb-1">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-foreground">
            {metrics.studentsCount}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">
            الطلاب
          </p>
        </Card>

        <Card variant="default" className="p-4 text-right space-y-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-exclusive/10 text-primary mb-1">
            <Certificate className="h-4 w-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-foreground">
            {metrics.formateursCount}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">
            المدربين
          </p>
        </Card>

        <Card variant="default" className="p-4 text-right space-y-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success mb-1">
            <CheckCircle className="h-4 w-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-foreground">
            {metrics.publishedCourses}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">
            دورات منشورة
          </p>
        </Card>

        <Card variant="default" className="p-4 text-right space-y-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10 text-info mb-1">
            <CreditCard className="h-4 w-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-foreground">
            {metrics.totalOrders}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">
            إجمالي الطلبات
          </p>
        </Card>

        <Card variant="default" className="p-4 text-right space-y-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning mb-1">
            <Clock className="h-4 w-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-foreground">
            {metrics.pendingPaymentsCount}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">
            وصولات بانتظار التدقيق
          </p>
        </Card>
      </div>

      {/* ==========================================
          3. MANAGEMENT MODULES GRID
          ========================================== */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground border-b border-border pb-3">
          وحدات الإدارة والتحكم
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* User Management */}
          <Link href="/admin/users" className="group">
            <Card variant="default" className="p-6 space-y-4 hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <Badge variant="secondary" size="sm">
                  {metrics.totalUsers} مستخدم
                </Badge>
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  إدارة المستخدمين
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  تعديل الرتب (طالب، مدرب، مسؤول)، تفعيل وتعطيل الحسابات، واستعراض سجلات المتعلمين.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-primary pt-2 border-t border-border/50">
                <span>فتح وحدة المستخدمين</span>
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              </div>
            </Card>
          </Link>

          {/* Formateur Management */}
          <Link href="/admin/formateurs" className="group">
            <Card variant="default" className="p-6 space-y-4 hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-exclusive/10 text-primary">
                  <Certificate className="h-6 w-6" />
                </div>
                <Badge variant="exclusive" size="sm">
                  {metrics.formateursCount} مدرب
                </Badge>
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  إدارة المدربين
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  توثيق واعتماد المدربين، متابعة التخصصات وسنوات الخبرة، ومراجعة إحصائيات التدريس.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-primary pt-2 border-t border-border/50">
                <span>فتح وحدة المدربين</span>
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              </div>
            </Card>
          </Link>

          {/* Course Review */}
          <Link href="/admin/courses" className="group">
            <Card variant="default" className="p-6 space-y-4 hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
                  <BookOpen className="h-6 w-6" />
                </div>
                {metrics.pendingCourses > 0 ? (
                  <Badge variant="warning" size="sm">
                    {metrics.pendingCourses} بانتظار المراجعة
                  </Badge>
                ) : (
                  <Badge variant="success" size="sm">
                    {metrics.publishedCourses} منشورة
                  </Badge>
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  مراجعة واعتماد الدورات
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  تدقيق مسودات المناهج وفيديوهات الدورات، اعتماد النشر، أو إرجاع الملاحظات للمدرب.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-primary pt-2 border-t border-border/50">
                <span>فتح مراجعة الدورات</span>
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              </div>
            </Card>
          </Link>

          {/* Payment Verification */}
          <Link href="/admin/payments" className="group">
            <Card variant="default" className="p-6 space-y-4 hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-info/10 text-info">
                  <CreditCard className="h-6 w-6" />
                </div>
                {metrics.pendingPaymentsCount > 0 ? (
                  <Badge variant="error" size="sm">
                    {metrics.pendingPaymentsCount} وصل معلق
                  </Badge>
                ) : (
                  <Badge variant="success" size="sm">
                    لا توجد وصولات معلقة
                  </Badge>
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  تدقيق وصولات الدفع
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  فحص إيصالات CCP و BaridiMob وتفعيل تسجيلات الطلاب آلياً بمجرد الاعتماد.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-primary pt-2 border-t border-border/50">
                <span>فتح تدقيق المدفوعات</span>
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              </div>
            </Card>
          </Link>

          {/* Audit Logs & Settings */}
          <Link href="/admin/settings" className="group">
            <Card variant="default" className="p-6 space-y-4 hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <Badge variant="outline" size="sm">
                  Audit Logs
                </Badge>
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  سجل العمليات والإعدادات
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  استعراض سجل التدقيق الأمني (Audit Logs) لكافة العمليات الحساسة وإعدادات النظام.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-primary pt-2 border-t border-border/50">
                <span>فتح سجل العمليات</span>
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
