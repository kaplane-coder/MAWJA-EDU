import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

/**
 * Server-Side Supabase Client (App Router Context)
 *
 * This client is designed for Server Components, Server Actions, and Route Handlers.
 * It automatically reads and writes authentication tokens via HTTP cookies,
 * ensuring seamless session preservation and SSR-safe database interaction.
 *
 * SECURITY: All queries executed through this client are subject to PostgreSQL RLS policies
 * using the authenticated user's session context.
 */
export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://pmgppudtgvxtfauwzvuw.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtZ3BwdWR0Z3Z4dGZhdXd6dnV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5ODk5NjMsImV4cCI6MjEwMjU2NTk2M30.KzI0UAuXJ9WkadYA4xE2iRFEdLHYUAzFqnY9dJDEPHQ";

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}
