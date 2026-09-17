"use client";

import * as React from "react";
import {
  Certificate,
  ShieldCheck,
  XCircle,
  BookOpen,
  Users,
  CalendarBlank,
  Envelope,
  Phone,
} from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Alert } from "@/components/ui/alert";
import { adminToggleFormateurVerifiedAction } from "@/actions/admin-users";
import type { AdminFormateurItem } from "@/lib/admin";

interface FormateursClientProps {
  initialFormateurs: AdminFormateurItem[];
}

export function AdminFormateursClient({
  initialFormateurs,
}: FormateursClientProps) {
  const [formateurs, setFormateurs] =
    React.useState<AdminFormateurItem[]>(initialFormateurs);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [verifiedFilter, setVerifiedFilter] = React.useState("ALL");
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const filteredFormateurs = React.useMemo(() => {
    return formateurs.filter((f) => {
      // Verification Filter
      if (verifiedFilter === "VERIFIED" && !f.is_verified) return false;
      if (verifiedFilter === "UNVERIFIED" && f.is_verified) return false;

      // Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = f.full_name.toLowerCase().includes(q);
        const matchesEmail = f.email.toLowerCase().includes(q);
        const matchesSpecialty = f.specialization
          ? f.specialization.toLowerCase().includes(q)
          : false;
        const matchesHeadline = f.headline
          ? f.headline.toLowerCase().includes(q)
          : false;
        return (
          matchesName || matchesEmail || matchesSpecialty || matchesHeadline
        );
      }

      return true;
    });
  }, [formateurs, verifiedFilter, searchQuery]);

  const handleToggleVerification = async (
    targetUserId: string,
    currentVerified: boolean
  ) => {
    setLoadingId(targetUserId);
    setMessage(null);

    const newVerifiedState = !currentVerified;
    const res = await adminToggleFormateurVerifiedAction(
      targetUserId,
      newVerifiedState
    );

    if (!res.success) {
      setMessage({
        type: "error",
        text: res.error || "فشل تحديث حالة توثيق المدرب",
      });
    } else {
      setFormateurs((prev) =>
        prev.map((f) =>
          f.id === targetUserId ? { ...f, is_verified: newVerifiedState } : f
        )
      );
      setMessage({
        type: "success",
        text: res.message || "تم تحديث حالة التوثيق بنجاح",
      });
    }
    setLoadingId(null);
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

      {/* Filter Card */}
      <Card variant="default" className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              placeholder="ابحث باسم المدرب، البريد، التخصص، أو المسمى المهني..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <Select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              className="text-xs"
            >
              <option value="ALL">جميع حالات التوثيق</option>
              <option value="VERIFIED">المدربين الموثقين فقط</option>
              <option value="UNVERIFIED">المدربين غير الموثقين</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Count Header */}
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground font-semibold">
        <span>عدد المدربين المطابقين: {filteredFormateurs.length}</span>
      </div>

      {/* Formateurs List */}
      {filteredFormateurs.length === 0 ? (
        <Card variant="default" className="text-center py-16 px-4 border-dashed border-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Certificate className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            لم يتم العثور على مدربين
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            لا يوجد مدربون يطابقون معايير البحث أو التصفية الحالية.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredFormateurs.map((f) => {
            const isBusy = loadingId === f.id;
            const formattedDate = new Date(f.created_at).toLocaleDateString(
              "ar-DZ",
              {
                year: "numeric",
                month: "short",
                day: "numeric",
              }
            );

            return (
              <Card
                key={f.id}
                variant="default"
                className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 hover:border-primary/40 transition-colors"
              >
                {/* Formateur Details */}
                <div className="flex items-start sm:items-center gap-4 flex-1">
                  <Avatar
                    src={f.avatar_url || undefined}
                    alt={f.full_name}
                    fallback={f.full_name}
                    size="lg"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground">
                        {f.full_name}
                      </h3>
                      {f.is_verified ? (
                        <Badge variant="success" size="sm" className="gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          <span>موثق معتمد</span>
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          غير موثق
                        </Badge>
                      )}
                      {f.specialization && (
                        <Badge variant="outline" size="sm">
                          {f.specialization}
                        </Badge>
                      )}
                    </div>

                    {f.headline && (
                      <p className="text-xs font-semibold text-primary">
                        {f.headline}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-0.5">
                      <span className="flex items-center gap-1">
                        <Envelope className="h-3.5 w-3.5 text-muted-foreground/80" />
                        <span>{f.email}</span>
                      </span>
                      {f.phone && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1" dir="ltr">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground/80" />
                            <span>{f.phone}</span>
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <CalendarBlank className="h-3.5 w-3.5 text-muted-foreground/80" />
                        <span>انضم {formattedDate}</span>
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5 text-primary" />
                        <span>
                          {f.totalCourses} دورات ({f.publishedCourses} منشورة)
                        </span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <span>{f.totalStudents} طالب مسجل</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5 w-full lg:w-auto border-t lg:border-t-0 border-border/50 pt-3 lg:pt-0">
                  <Button
                    variant={f.is_verified ? "outline" : "primary"}
                    size="sm"
                    disabled={isBusy}
                    isLoading={isBusy}
                    onClick={() =>
                      handleToggleVerification(f.id, f.is_verified)
                    }
                    className="text-xs font-bold gap-1"
                  >
                    {f.is_verified ? (
                      <>
                        <XCircle className="h-3.5 w-3.5 text-error" />
                        <span>إلغاء التوثيق</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>منح شارة التوثيق</span>
                      </>
                    )}
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
