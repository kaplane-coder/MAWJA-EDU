import * as React from "react";
import { requireAdmin } from "@/lib/auth";
import { getAdminAuditLogs } from "@/lib/admin";
import { AdminSettingsForm } from "./admin-settings-form";
import { AuditLogsViewer } from "./audit-logs-viewer";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ChartLineUp } from "@phosphor-icons/react/dist/ssr";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin("/admin/settings");
  const auditLogs = await getAdminAuditLogs(100);

  return (
    <div className="space-y-10 text-right max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="error" className="gap-1 text-xs">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>إعدادات النظام والأمان</span>
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            الإعدادات وسجل العمليات الحساسة
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            متابعة سجل التدقيق الأمني (Audit Logs)، حالة الخوادم، وأمان حساب الإدارة
          </p>
        </div>
      </div>

      {/* Admin Settings Form */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground">
          إعدادات الأمان والخوادم
        </h2>
        <AdminSettingsForm />
      </div>

      {/* Audit Logs Section */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ChartLineUp className="h-4 w-4 text-primary" />
              <span>سجل العمليات الإدارية (Audit Logs)</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              سجل تدقيق آلي وغير قابل للتعديل يوثق كافة إجراءات الاعتماد، التوثيق، وتعديل الرتب
            </p>
          </div>
        </div>

        <AuditLogsViewer initialLogs={auditLogs} />
      </div>
    </div>
  );
}
