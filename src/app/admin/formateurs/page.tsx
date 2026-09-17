import * as React from "react";
import { requireAdmin } from "@/lib/auth";
import { getAdminFormateursList } from "@/lib/admin";
import { AdminFormateursClient } from "./formateurs-client";
import { Badge } from "@/components/ui/badge";
import { Certificate } from "@phosphor-icons/react/dist/ssr";

export const dynamic = "force-dynamic";

export default async function AdminFormateursPage() {
  await requireAdmin("/admin/formateurs");
  const formateurs = await getAdminFormateursList();

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="exclusive" className="gap-1 text-xs">
              <Certificate className="h-3.5 w-3.5" />
              <span>إدارة المدربين</span>
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            إدارة المدربين المعتمدين
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            مراجعة طلبات الانضمام، منح شارة التوثيق، ومتابعة إحصائيات الدورات والطلاب لكل مدرب
          </p>
        </div>
      </div>

      <AdminFormateursClient initialFormateurs={formateurs} />
    </div>
  );
}
