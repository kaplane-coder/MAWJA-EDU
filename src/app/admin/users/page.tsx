import * as React from "react";
import { requireAdmin } from "@/lib/auth";
import { getAdminUsersList } from "@/lib/admin";
import { AdminUsersClient } from "./users-client";
import { Badge } from "@/components/ui/badge";
import { Users } from "@phosphor-icons/react/dist/ssr";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const currentAdmin = await requireAdmin("/admin/users");
  const users = await getAdminUsersList();

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="error" className="gap-1 text-xs">
              <Users className="h-3.5 w-3.5" />
              <span>إدارة المستخدمين</span>
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            إدارة المستخدمين والصلاحيات
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            تعديل الرتب وتفعيل أو تعطيل الحسابات مع التوثيق الكامل في سجل العمليات
          </p>
        </div>
      </div>

      <AdminUsersClient
        initialUsers={users}
        currentAdminId={currentAdmin.id}
      />
    </div>
  );
}
