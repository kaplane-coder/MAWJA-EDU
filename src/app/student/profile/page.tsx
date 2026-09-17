import * as React from "react";
import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { StudentProfileForm } from "./student-profile-form";
import { Badge } from "@/components/ui/badge";
import { User } from "@phosphor-icons/react/dist/ssr";

export const dynamic = "force-dynamic";

export default async function StudentProfilePage() {
  const currentProfile = await requireStudent("/student/profile");
  const supabase = await createClient();

  // Fetch full student profile data from Supabase
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
            <Badge variant="default" className="gap-1 text-xs">
              <User className="h-3.5 w-3.5" />
              <span>الملف الشخصي</span>
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            الملف الشخصي للطالب
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            تحكم في معلوماتك الشخصية، صورتك الرمزية، وتفضيلات اهتماماتك التعليمية
          </p>
        </div>
      </div>

      <StudentProfileForm initialProfile={activeProfile} />
    </div>
  );
}
