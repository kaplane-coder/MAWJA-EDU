import * as React from "react";
import { requireStudent } from "@/lib/auth";
import { DashboardShell } from "@/components/common/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireStudent("/student");

  return (
    <DashboardShell
      profile={{
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        role: profile.role,
      }}
    >
      {children}
    </DashboardShell>
  );
}
