import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database, UserRole } from "@/types/database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Retrieves the currently authenticated Supabase Auth user.
 * Returns null if unauthenticated or session expired.
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

/**
 * Retrieves the active database profile for the current authenticated user.
 * Security: Verifies `is_active === true` and never trusts client state.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .eq("is_active", true)
      .single();

    if (error || !profile) {
      return null;
    }

    return profile;
  } catch {
    return null;
  }
}

/**
 * Enforces that a valid authenticated and active user exists.
 * Redirects to /login if unauthenticated.
 */
export async function requireUser(redirectPath?: string) {
  const profile = await getCurrentProfile();
  if (!profile) {
    const destination = redirectPath
      ? `/login?redirect=${encodeURIComponent(redirectPath)}`
      : "/login";
    redirect(destination);
  }
  return profile;
}

/**
 * Enforces that the authenticated user possesses one of the allowed roles.
 */
export async function requireRole(
  allowedRoles: UserRole[],
  redirectPath?: string
) {
  const profile = await requireUser(redirectPath);

  if (!allowedRoles.includes(profile.role)) {
    // If user does not have permission, redirect to their role home
    if (profile.role === "STUDENT") {
      redirect("/student?error=unauthorized");
    } else if (profile.role === "FORMATEUR") {
      redirect("/formateur?error=unauthorized");
    } else {
      redirect("/?error=unauthorized");
    }
  }

  return profile;
}

/**
 * Enforces ADMIN role on the server.
 */
export async function requireAdmin(redirectPath?: string) {
  return requireRole(["ADMIN"], redirectPath);
}

/**
 * Enforces FORMATEUR (or ADMIN) role on the server.
 */
export async function requireFormateur(redirectPath?: string) {
  return requireRole(["FORMATEUR", "ADMIN"], redirectPath);
}

/**
 * Enforces active STUDENT (or higher) role on the server.
 */
export async function requireStudent(redirectPath?: string) {
  return requireRole(["STUDENT", "FORMATEUR", "ADMIN"], redirectPath);
}
