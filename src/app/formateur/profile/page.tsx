import * as React from "react";
import { requireFormateur } from "@/lib/auth";
import { getFormateurProfileData } from "@/lib/formateur";
import { FormateurProfileForm } from "./formateur-profile-form";
import { Badge } from "@/components/ui/badge";
import { Certificate } from "@phosphor-icons/react/dist/ssr";

export const dynamic = "force-dynamic";

export default async function FormateurProfilePage() {
  const currentProfile = await requireFormateur("/formateur/profile");
  const data = await getFormateurProfileData(currentProfile.id);

  const activeProfile = data.profile || currentProfile;

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-right">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="exclusive" className="gap-1 text-xs">
              <Certificate className="h-3.5 w-3.5" />
              <span>الملف المهني</span>
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            الملف المهني للمدرب
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            إدارة المسمى الوظيفي، السيرة الذاتية، التخصص، والروابط المهنية التي تظهر للمتعلمين
          </p>
        </div>
      </div>

      <FormateurProfileForm
        profile={activeProfile}
        formateurProfile={data.formateurProfile}
        stats={data.stats}
      />
    </div>
  );
}
