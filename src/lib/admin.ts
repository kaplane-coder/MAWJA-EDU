import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database.types";

export interface AdminDashboardMetrics {
  totalUsers: number;
  studentsCount: number;
  formateursCount: number;
  totalCourses: number;
  publishedCourses: number;
  pendingCourses: number;
  totalOrders: number;
  pendingPaymentsCount: number;
  activeEnrollmentsCount: number;
}

export interface AdminUserItem {
  id: string;
  email: string;
  full_name: string;
  username: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  wilaya: string | null;
  created_at: string;
  enrollmentsCount?: number;
  coursesCount?: number;
}

export interface AdminFormateurItem {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  headline: string | null;
  specialization: string | null;
  is_verified: boolean;
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  created_at: string;
}

export interface AdminAuditLogItem {
  id: string;
  actor_id: string;
  actor_name: string;
  actor_email: string;
  action: string;
  target_entity: string;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

/**
 * Queries real-time platform metrics for the Admin Dashboard
 */
export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const supabase = await createClient();

  // Parallel database count queries
  const [
    usersRes,
    studentsRes,
    formateursRes,
    coursesRes,
    publishedCoursesRes,
    pendingCoursesRes,
    ordersRes,
    pendingPaymentsRes,
    enrollmentsRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "STUDENT"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "FORMATEUR"),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }).eq("status", "PUBLISHED"),
    supabase.from("courses").select("*", { count: "exact", head: true }).eq("status", "PENDING_REVIEW"),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("payment_proofs").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
    supabase.from("enrollments").select("*", { count: "exact", head: true }).eq("status", "ACTIVE"),
  ]);

  return {
    totalUsers: usersRes.count || 0,
    studentsCount: studentsRes.count || 0,
    formateursCount: formateursRes.count || 0,
    totalCourses: coursesRes.count || 0,
    publishedCourses: publishedCoursesRes.count || 0,
    pendingCourses: pendingCoursesRes.count || 0,
    totalOrders: ordersRes.count || 0,
    pendingPaymentsCount: pendingPaymentsRes.count || 0,
    activeEnrollmentsCount: enrollmentsRes.count || 0,
  };
}

/**
 * Queries users with optional filtering by role, status, and search
 */
export async function getAdminUsersList(): Promise<AdminUserItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      email,
      full_name,
      username,
      phone,
      avatar_url,
      role,
      is_active,
      wilaya,
      created_at,
      enrollments (
        id,
        status
      ),
      courses (
        id
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  interface UserQueryRow {
    id: string;
    email: string;
    full_name: string;
    username: string | null;
    phone: string | null;
    avatar_url: string | null;
    role: UserRole;
    is_active: boolean;
    wilaya: string | null;
    created_at: string;
    enrollments: { id: string; status: string }[];
    courses: { id: string }[];
  }

  const rows = data as unknown as UserQueryRow[];

  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    full_name: r.full_name,
    username: r.username,
    phone: r.phone,
    avatar_url: r.avatar_url,
    role: r.role,
    is_active: r.is_active,
    wilaya: r.wilaya,
    created_at: r.created_at,
    enrollmentsCount: (r.enrollments || []).filter((e) => e.status === "ACTIVE").length,
    coursesCount: (r.courses || []).length,
  }));
}

/**
 * Queries formateurs with verification and teaching statistics
 */
export async function getAdminFormateursList(): Promise<AdminFormateurItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      email,
      full_name,
      avatar_url,
      phone,
      headline,
      specialization,
      created_at,
      formateur_profiles (
        is_verified,
        headline,
        bio
      ),
      courses (
        id,
        status,
        enrollments (
          id,
          status
        )
      )
    `
    )
    .eq("role", "FORMATEUR")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  interface FormateurQueryRow {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
    phone: string | null;
    headline: string | null;
    specialization: string | null;
    created_at: string;
    formateur_profiles: {
      is_verified: boolean;
      headline: string | null;
      bio: string | null;
    } | null;
    courses: {
      id: string;
      status: string;
      enrollments: { id: string; status: string }[];
    }[];
  }

  const rows = data as unknown as FormateurQueryRow[];

  return rows.map((r) => {
    const courses = r.courses || [];
    const publishedCourses = courses.filter((c) => c.status === "PUBLISHED").length;

    let totalStudents = 0;
    courses.forEach((c) => {
      totalStudents += (c.enrollments || []).filter((e) => e.status === "ACTIVE").length;
    });

    const isVerified = r.formateur_profiles?.is_verified ?? false;

    return {
      id: r.id,
      email: r.email,
      full_name: r.full_name,
      avatar_url: r.avatar_url,
      phone: r.phone,
      headline: r.headline || r.formateur_profiles?.headline || null,
      specialization: r.specialization || null,
      is_verified: isVerified,
      totalCourses: courses.length,
      publishedCourses,
      totalStudents,
      created_at: r.created_at,
    };
  });
}

/**
 * Retrieves recent Admin Audit Logs
 */
export async function getAdminAuditLogs(limit = 100): Promise<AdminAuditLogItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admin_audit_logs")
    .select(
      `
      id,
      actor_id,
      action,
      target_entity,
      target_id,
      details,
      created_at,
      profiles:actor_id (
        full_name,
        email
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  interface AuditQueryRow {
    id: string;
    actor_id: string;
    action: string;
    target_entity: string;
    target_id: string | null;
    details: Record<string, unknown> | null;
    created_at: string;
    profiles: {
      full_name: string;
      email: string;
    } | null;
  }

  const rows = data as unknown as AuditQueryRow[];

  return rows.map((r) => ({
    id: r.id,
    actor_id: r.actor_id,
    actor_name: r.profiles?.full_name || "مدير النظام",
    actor_email: r.profiles?.email || "",
    action: r.action,
    target_entity: r.target_entity,
    target_id: r.target_id,
    details: r.details,
    created_at: r.created_at,
  }));
}
