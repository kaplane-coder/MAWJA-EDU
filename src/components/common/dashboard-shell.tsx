"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardHeader } from "./dashboard-header";
import type { UserRole } from "@/types/database.types";

interface DashboardShellProps {
  profile: {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string | null;
    role: UserRole;
  };
  children: React.ReactNode;
}

export function DashboardShell({ profile, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const pathname = usePathname() || "";

  // Classroom has its own focused immersive fullscreen interface
  const isClassroom = pathname.includes("/learn");

  if (isClassroom) {
    return <div className="min-h-screen w-full bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Sidebar Component (Fixed on right for RTL desktop, drawer for mobile) */}
      <DashboardSidebar
        profile={profile}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area (Offset by 64 (16rem/256px) on right on lg+ screens) */}
      <div className="flex-1 flex flex-col lg:mr-64 transition-all">
        <DashboardHeader
          profile={profile}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
