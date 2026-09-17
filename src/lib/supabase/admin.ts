import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * ============================================================================
 * CRITICAL SECURITY BOUNDARY — SERVICE ROLE ADMIN CLIENT
 * ============================================================================
 *
 * WARNING:
 * This client bypasses PostgreSQL Row Level Security (RLS) and possesses
 * absolute administrative authority over the entire Supabase project.
 *
 * HARDENED BOUNDARIES:
 * 1. `import "server-only";` enforces build-time compiler failure if imported in client code.
 * 2. NEVER import this file into Client Components ("use client").
 * 3. NEVER expose the returned client instance to the browser or in client bundles.
 * 4. ONLY use this client for trusted background jobs, system webhooks, or elevated
 *    server-side operations that cannot run under a user session.
 * 5. All standard administrative mutations (such as payment approvals or role changes)
 *    should execute via secure PostgreSQL SECURITY DEFINER functions with
 *    proper audit logs rather than raw service-role table edits.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "CRITICAL SECURITY VIOLATION: createAdminClient() must NEVER be called in a browser environment."
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set."
    );
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
