import * as React from "react";
import { requireFormateur } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { FormateurSettingsForm } from "./settings-form";
import { Badge } from "@/components/ui/badge";
import { Gear } from "@phosphor-icons/react/dist/ssr";

export const dynamic = "force-dynamic";

export default async function FormateurSettingsPage() {
  const currentProfile = await requireFormateur("/formateur/settings");
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", currentProfile.id)
    .single();

  const activeProfile = profile || currentProfile;

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-right">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="exclusive" className="gap-1 text-xs">
              <Gear className="h-3.5 w-3.5" />
              <span>إعدادات المدرب</span>
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            إعدادات الحساب والأمان
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            إدارة كلمة المرور، معلومات التحويلات المالية، وتفضيلات الحساب
          </p>
        </div>
      </div>

      <FormateurSettingsForm profile={activeProfile} />
    </div>
  );
}
