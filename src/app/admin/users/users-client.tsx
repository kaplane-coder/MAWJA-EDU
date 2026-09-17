"use client";

import * as React from "react";
import {
  Users,
  CalendarBlank,
  Envelope,
  Phone,
  Power,
} from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Alert } from "@/components/ui/alert";
import {
  adminSetUserRoleAction,
  adminToggleUserActiveAction,
} from "@/actions/admin-users";
import type { AdminUserItem } from "@/lib/admin";
import type { UserRole } from "@/types/database.types";

interface UsersClientProps {
  initialUsers: AdminUserItem[];
  currentAdminId: string;
}

export function AdminUsersClient({
  initialUsers,
  currentAdminId,
}: UsersClientProps) {
  const [users, setUsers] = React.useState<AdminUserItem[]>(initialUsers);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("ALL");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [loadingUserId, setLoadingUserId] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const filteredUsers = React.useMemo(() => {
    return users.filter((u) => {
      // Role Filter
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;

      // Status Filter
      if (statusFilter === "ACTIVE" && !u.is_active) return false;
      if (statusFilter === "INACTIVE" && u.is_active) return false;

      // Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = u.full_name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesUsername = u.username
          ? u.username.toLowerCase().includes(q)
          : false;
        return matchesName || matchesEmail || matchesUsername;
      }

      return true;
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  const handleRoleChange = async (targetUserId: string, newRole: UserRole) => {
    setLoadingUserId(targetUserId);
    setMessage(null);

    const res = await adminSetUserRoleAction(targetUserId, newRole);
    if (!res.success) {
      setMessage({ type: "error", text: res.error || "فشل تغيير رتبة المستخدم" });
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u))
      );
      setMessage({ type: "success", text: res.message || "تم تغيير الرتبة بنجاح" });
    }
    setLoadingUserId(null);
  };

  const handleToggleActive = async (targetUserId: string, currentActive: boolean) => {
    setLoadingUserId(targetUserId);
    setMessage(null);

    const newActiveState = !currentActive;
    const res = await adminToggleUserActiveAction(targetUserId, newActiveState);
    if (!res.success) {
      setMessage({ type: "error", text: res.error || "فشل تحديث حالة الحساب" });
    } else {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUserId ? { ...u, is_active: newActiveState } : u
        )
      );
      setMessage({ type: "success", text: res.message || "تم تحديث حالة الحساب" });
    }
    setLoadingUserId(null);
  };

  return (
    <div className="space-y-6 text-right">
      {message && (
        <Alert
          variant={message.type === "success" ? "default" : "error"}
          title={message.type === "success" ? "تم بنجاح" : "تنبيه"}
        >
          {message.text}
        </Alert>
      )}

      {/* Filters Card */}
      <Card variant="default" className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <Input
              placeholder="ابحث بالاسم، البريد، أو اسم المستخدم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs"
            >
              <option value="ALL">جميع الرتب</option>
              <option value="STUDENT">الطلاب (STUDENT)</option>
              <option value="FORMATEUR">المدربين (FORMATEUR)</option>
              <option value="ADMIN">المسؤولين (ADMIN)</option>
            </Select>
          </div>

          <div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs"
            >
              <option value="ALL">جميع حالات الحساب</option>
              <option value="ACTIVE">الحسابات النشطة فقط</option>
              <option value="INACTIVE">الحسابات المعطلة فقط</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground font-semibold">
        <span>عدد الحسابات المطابقة: {filteredUsers.length}</span>
      </div>

      {/* Users Table / List */}
      {filteredUsers.length === 0 ? (
        <Card variant="default" className="text-center py-16 px-4 border-dashed border-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Users className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            لم يتم العثور على مستخدمين
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            لا توجد حسابات تطابق معايير البحث أو التصفية الحالية.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.map((u) => {
            const isSelf = u.id === currentAdminId;
            const isBusy = loadingUserId === u.id;
            const formattedDate = new Date(u.created_at).toLocaleDateString("ar-DZ", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });

            return (
              <Card
                key={u.id}
                variant="default"
                className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 hover:border-primary/40 transition-colors"
              >
                {/* User Details */}
                <div className="flex items-start sm:items-center gap-4 flex-1">
                  <Avatar
                    src={u.avatar_url || undefined}
                    alt={u.full_name}
                    fallback={u.full_name}
                    size="lg"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground">
                        {u.full_name}
                      </h3>
                      {u.username && (
                        <span className="text-xs font-mono text-primary">
                          @{u.username}
                        </span>
                      )}
                      <Badge
                        variant={
                          u.role === "ADMIN"
                            ? "error"
                            : u.role === "FORMATEUR"
                            ? "exclusive"
                            : "secondary"
                        }
                        size="sm"
                      >
                        {u.role === "ADMIN"
                          ? "مسؤول نظام"
                          : u.role === "FORMATEUR"
                          ? "مدرب"
                          : "طالب"}
                      </Badge>
                      <Badge
                        variant={u.is_active ? "success" : "error"}
                        size="sm"
                      >
                        {u.is_active ? "نشط" : "معطل"}
                      </Badge>
                      {isSelf && (
                        <Badge variant="outline" size="sm">
                          حسابك الحالي
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-0.5">
                      <span className="flex items-center gap-1">
                        <Envelope className="h-3.5 w-3.5 text-muted-foreground/80" />
                        <span>{u.email}</span>
                      </span>
                      {u.phone && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1" dir="ltr">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground/80" />
                            <span>{u.phone}</span>
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <CalendarBlank className="h-3.5 w-3.5 text-muted-foreground/80" />
                        <span>انضم {formattedDate}</span>
                      </span>
                    </div>

                    {/* Counts */}
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                      {u.role === "STUDENT" && (
                        <span>الدورات المسجلة: {u.enrollmentsCount || 0}</span>
                      )}
                      {u.role === "FORMATEUR" && (
                        <span>الدورات المنشأة: {u.coursesCount || 0}</span>
                      )}
                      {u.wilaya && <span>الولاية: {u.wilaya}</span>}
                    </div>
                  </div>
                </div>

                {/* Actions & Role Change */}
                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto border-t lg:border-t-0 border-border/50 pt-3 lg:pt-0">
                  {/* Role Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground font-semibold">
                      الرتبة:
                    </span>
                    <Select
                      value={u.role}
                      disabled={isBusy || isSelf}
                      onChange={(e) =>
                        handleRoleChange(u.id, e.target.value as UserRole)
                      }
                      className="text-xs h-8 w-32"
                    >
                      <option value="STUDENT">طالب</option>
                      <option value="FORMATEUR">مدرب</option>
                      <option value="ADMIN">مسؤول (ADMIN)</option>
                    </Select>
                  </div>

                  {/* Active Toggle Button */}
                  <Button
                    variant={u.is_active ? "outline" : "primary"}
                    size="sm"
                    disabled={isBusy || isSelf}
                    isLoading={isBusy}
                    onClick={() => handleToggleActive(u.id, u.is_active)}
                    className="text-xs font-semibold gap-1"
                  >
                    <Power className="h-3.5 w-3.5" />
                    <span>{u.is_active ? "تعطيل الحساب" : "تفعيل الحساب"}</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
