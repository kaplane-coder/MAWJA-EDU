import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

/**
 * Browser-Safe Supabase Client
 *
 * This client is safe to use inside React Client Components ("use client").
 * It uses the public anon key and connects to Supabase through the browser context,
 * relying strictly on PostgreSQL Row Level Security (RLS) to enforce authorization.
 */
let cachedClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const rawUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://pmgppudtgvxtfauwzvuw.supabase.co";
  const rawAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtZ3BwdWR0Z3Z4dGZhdXd6dnV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5ODk5NjMsImV4cCI6MjEwMjU2NTk2M30.KzI0UAuXJ9WkadYA4xE2iRFEdLHYUAzFqnY9dJDEPHQ";

  // Sanitize any wrapping quotes, spaces, or formatting artifacts from deployment platforms
  const supabaseUrl = rawUrl.replace(/^["']|["']$/g, "").trim();
  const supabaseAnonKey = rawAnonKey.replace(/^["']|["']$/g, "").trim();

  cachedClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  return cachedClient;
}
