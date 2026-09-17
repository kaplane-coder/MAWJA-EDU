import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

function getSanitizedEnv() {
  const rawUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://pmgppudtgvxtfauwzvuw.supabase.co";
  const rawAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtZ3BwdWR0Z3Z4dGZhdXd6dnV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5ODk5NjMsImV4cCI6MjEwMjU2NTk2M30.KzI0UAuXJ9WkadYA4xE2iRFEdLHYUAzFqnY9dJDEPHQ";

  return {
    supabaseUrl: rawUrl.replace(/^["']|["']$/g, "").trim(),
    supabaseAnonKey: rawAnonKey.replace(/^["']|["']$/g, "").trim(),
  };
}

/**
 * Public Server Client (For public read-only data)
 *
 * Does not read or write cookies, enabling Next.js to pre-render
 * static HTML and ISR pages without triggering dynamic serverless streaming.
 */
export function createPublicClient() {
  const { supabaseUrl, supabaseAnonKey } = getSanitizedEnv();
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Server-Side Supabase Client (App Router Context)
 *
 * This client is designed for Server Components, Server Actions, and Route Handlers
 * that interact with authenticated sessions.
 */
export async function createClient() {
  let cookieStore;
  try {
    cookieStore = await cookies();
  } catch {
    // Fallback if called outside request context
    return createPublicClient();
  }

  const { supabaseUrl, supabaseAnonKey } = getSanitizedEnv();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        try {
          return cookieStore.getAll();
        } catch {
          return [];
        }
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Can be ignored if called from a Server Component
        }
      },
    },
  });
}
