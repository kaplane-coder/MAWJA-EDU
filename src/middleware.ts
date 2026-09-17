import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedPath =
    pathname.startsWith("/student") ||
    pathname.startsWith("/formateur") ||
    pathname.startsWith("/admin");

  const isAuthPath =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/register/formateur" ||
    pathname === "/forgot-password";

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Early return for public routes (e.g., /, /courses, /api/health)
  // Avoids unnecessary external network round-trips on Edge/Serverless functions
  if (!isProtectedPath && !isAuthPath) {
    return response;
  }

  const rawUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://pmgppudtgvxtfauwzvuw.supabase.co";
  const rawAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtZ3BwdWR0Z3Z4dGZhdXd6dnV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5ODk5NjMsImV4cCI6MjEwMjU2NTk2M30.KzI0UAuXJ9WkadYA4xE2iRFEdLHYUAzFqnY9dJDEPHQ";

  const supabaseUrl = rawUrl.replace(/^["']|["']$/g, "").trim();
  const supabaseAnonKey = rawAnonKey.replace(/^["']|["']$/g, "").trim();

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Check auth session for protected or auth pages
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Unauthenticated users attempting to access protected dashboards
  if (!user && isProtectedPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated users attempting to access login/register forms
  if (user && isAuthPath) {
    // Look up user role to redirect to appropriate dashboard
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (profile && profile.is_active) {
      if (profile.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      if (profile.role === "FORMATEUR") {
        return NextResponse.redirect(new URL("/formateur", request.url));
      }
      return NextResponse.redirect(new URL("/student", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, svg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
