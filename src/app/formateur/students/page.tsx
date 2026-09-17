import * as React from "react";
import { requireFormateur } from "@/lib/auth";
import { getFormateurStudentsList } from "@/lib/formateur";
import { FormateurStudentsClient } from "./students-client";
import { Badge } from "@/components/ui/badge";
import { Users } from "@phosphor-icons/react/dist/ssr";

export const dynamic = "force-dynamic";

export default async function FormateurStudentsPage() {
  const currentProfile = await requireFormateur("/formateur/students");
  const { students, coursesFilterList } = await getFormateurStudentsList(
    currentProfile.id
  );

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="exclusive" className="gap-1 text-xs">
              <Users className="h-3.5 w-3.5" />
              <span>الطلاب المسجلين</span>
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            الطلاب المسجلين في دوراتك
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            متابعة مستويات إنجاز المتعلمين، الدروس المكتملة، وتواريخ التسجيل
          </p>
        </div>
      </div>

      <FormateurStudentsClient
        initialStudents={students}
        coursesFilterList={coursesFilterList}
      />
    </div>
  );
}
