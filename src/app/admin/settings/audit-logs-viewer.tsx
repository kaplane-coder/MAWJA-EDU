"use client";

import * as React from "react";
import {
  CalendarBlank,
  User,
  ChartLineUp,
  FileCode,
  CaretDown,
  CaretUp,
} from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminAuditLogItem } from "@/lib/admin";

interface AuditLogsViewerProps {
  initialLogs: AdminAuditLogItem[];
}

const actionLabels: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "success" | "warning" | "error" | "exclusive" | "info" }
> = {
  COURSE_APPROVED: { label: "اعتماد دورة", variant: "success" },
  COURSE_REJECTED: { label: "رفض مسودة دورة", variant: "error" },
  COURSE_ARCHIVED: { label: "أرشفة دورة", variant: "outline" },
  PAYMENT_APPROVED: { label: "اعتماد دفع وتفعيل", variant: "success" },
  PAYMENT_REJECTED: { label: "رفض وصل دفع", variant: "error" },
  USER_ROLE_CHANGED: { label: "تعديل رتبة مستخدم", variant: "exclusive" },
  USER_ACTIVATED: { label: "تفعيل حساب مستخدم", variant: "success" },
  USER_DEACTIVATED: { label: "تعطيل حساب مستخدم", variant: "error" },
  FORMATEUR_VERIFIED: { label: "توثيق مدرب", variant: "exclusive" },
  FORMATEUR_UNVERIFIED: { label: "إلغاء توثيق مدرب", variant: "warning" },
};

export function AuditLogsViewer({ initialLogs }: AuditLogsViewerProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [actionFilter, setActionFilter] = React.useState("ALL");
  const [expandedLogId, setExpandedLogId] = React.useState<string | null>(null);

  const filteredLogs = React.useMemo(() => {
    return initialLogs.filter((log) => {
      // Action Filter
      if (actionFilter !== "ALL" && log.action !== actionFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchesActor =
          log.actor_name.toLowerCase().includes(q) ||
          log.actor_email.toLowerCase().includes(q);
        const matchesAction = log.action.toLowerCase().includes(q);
        const matchesEntity = log.target_entity.toLowerCase().includes(q);
        return matchesActor || matchesAction || matchesEntity;
      }

      return true;
    });
  }, [initialLogs, actionFilter, searchQuery]);

  return (
    <div className="space-y-6 text-right">
      {/* Filter and Search */}
      <Card variant="default" className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              placeholder="ابحث باسم المنفذ، البريد، الإجراء، أو الكيان المستهدف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <Select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="text-xs"
            >
              <option value="ALL">جميع أنواع الإجراءات</option>
              <option value="COURSE_APPROVED">اعتماد الدورات</option>
              <option value="COURSE_REJECTED">رفض الدورات</option>
              <option value="PAYMENT_APPROVED">اعتماد المدفوعات</option>
              <option value="PAYMENT_REJECTED">رفض المدفوعات</option>
              <option value="USER_ROLE_CHANGED">تعديل الرتب</option>
              <option value="USER_ACTIVATED">تفعيل الحسابات</option>
              <option value="USER_DEACTIVATED">تعطيل الحسابات</option>
              <option value="FORMATEUR_VERIFIED">توثيق المدربين</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Log Count */}
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground font-semibold">
        <span>سجلات التدقيق المطابقة: {filteredLogs.length}</span>
      </div>

      {/* Logs Feed */}
      {filteredLogs.length === 0 ? (
        <Card variant="default" className="text-center py-16 px-4 border-dashed border-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <ChartLineUp className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            لا توجد سجلات تدقيق
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            لم يتم تسجيل أي عمليات تطابق معايير البحث الحالية.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const badgeInfo = actionLabels[log.action] || {
              label: log.action,
              variant: "outline",
            };

            const formattedDate = new Date(log.created_at).toLocaleString("ar-DZ", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });

            return (
              <Card
                key={log.id}
                variant="default"
                className="p-4 hover:border-primary/40 transition-colors"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={badgeInfo.variant} size="sm">
                        {badgeInfo.label}
                      </Badge>
                      <span className="text-xs font-bold text-foreground">
                        {log.target_entity}
                      </span>
                      {log.target_id && (
                        <span className="text-[11px] font-mono text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">
                          ID: {log.target_id.slice(0, 8)}...
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-0.5">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <User className="h-3.5 w-3.5 text-primary" />
                        <span>{log.actor_name} ({log.actor_email})</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <CalendarBlank className="h-3.5 w-3.5 text-muted-foreground/80" />
                        <span dir="ltr">{formattedDate}</span>
                      </span>
                    </div>
                  </div>

                  {log.details && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedLogId(isExpanded ? null : log.id)
                      }
                      className="text-xs gap-1 text-primary"
                    >
                      <FileCode className="h-3.5 w-3.5" />
                      <span>{isExpanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}</span>
                      {isExpanded ? (
                        <CaretUp className="h-3 w-3" />
                      ) : (
                        <CaretDown className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>

                {/* Expanded Details Payload */}
                {isExpanded && log.details && (
                  <div className="mt-3 border-t border-border/50 pt-3">
                    <pre
                      dir="ltr"
                      className="rounded-xl bg-background/80 p-3 text-[11px] font-mono text-foreground/90 overflow-x-auto border border-border/60"
                    >
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
