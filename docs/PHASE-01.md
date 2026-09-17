# PHASE 01: Project Initialization & Design System

## Overview
This document details the architectural milestones achieved during **PHASE 01** of the **MAWJA Education Platform** (منصة موجة للتعليم الرقمي).

MAWJA is built as a production-grade Algerian EdTech platform engineered for high performance, accessibility, native Arabic RTL support, and seamless deployment on Vercel with Supabase as the future backend.

---

## 1. Project Initialization & Tooling
- **Framework:** Next.js `15.5.23` (App Router) with React `19.2.8`
- **Language:** TypeScript `5.9.3` in Strict Mode with `@/*` path aliases
- **Styling Engine:** Tailwind CSS `3.4.19` with centralized CSS Custom Properties
- **Icons:** Lucide React
- **Validation & Class Merging:** Zod, clsx, tailwind-merge, class-variance-authority

---

## 2. Next.js Version & Compatibility Decision
- **Installed Version:** Next.js `15.5.23`
- **React Runtime:** React `19.2.8`
- **Rationale:** This version represents the current stable release of the Next.js 15 App Router lineage. It provides native support for React 19 Server Actions, Turbopack optimizations, zero-hydration layout overhead, and pristine Vercel serverless deployment targets. All 14 static and dynamic routes compile in ~14 seconds with zero errors or warnings.

---

## 3. Directory Architecture
```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── courses/
│   │   ├── [slug]/
│   │   └── page.tsx
│   ├── student/
│   ├── formateur/
│   ├── admin/
│   ├── design-system/
│   ├── api/
│   │   └── health/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── select.tsx
│   │   ├── checkbox.tsx
│   │   ├── radio.tsx
│   │   ├── switch.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── avatar.tsx
│   │   ├── separator.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown.tsx
│   │   ├── tabs.tsx
│   │   ├── tooltip.tsx
│   │   ├── toast.tsx
│   │   ├── skeleton.tsx
│   │   ├── spinner.tsx
│   │   ├── alert.tsx
│   │   └── empty-state.tsx
│   ├── course/
│   │   ├── course-card.tsx
│   │   └── course-grid.tsx
│   └── common/
│       ├── navbar.tsx
│       ├── mobile-nav.tsx
│       └── footer.tsx
├── lib/
│   ├── utils.ts
│   └── constants.ts
├── types/
│   └── index.ts
├── hooks/
│   └── use-toast.ts
└── actions/
    └── index.ts
```

---

## 4. RTL & Arabic-First Architecture
- Root `html` tag configured with `lang="ar"` and `dir="rtl"`.
- Primary font: `IBM Plex Sans Arabic` loaded through `next/font/google` with font display swap and optimal Arabic subsetting.
- Form inputs, breadcrumbs, badges, card layouts, and dialogs are engineered RTL-natively.

---

## 5. Route Architecture & Placeholders
- `/`: Production-grade homepage with hero, statistics banner, category browser, featured courses, value propositions, top instructors, and CTA.
- `/courses`: Interactive course catalog with realtime search, category pills, level filters, and result counters.
- `/courses/[slug]`: Rich course detail showcase with syllabus structure, instructor bio, guarantee highlights, and pricing display in DZD.
- `/login`, `/register`, `/forgot-password`, `/reset-password`: Auth view placeholders styled with design system cards.
- `/student`: Student classroom & progress dashboard static placeholder.
- `/formateur`: Instructor course creation & analytics dashboard static placeholder.
- `/admin`: Platform owner static visual placeholder (pure static UI demonstrating future management modules with zero simulated review queue or payment logic).
- `/design-system`: Visual showcase of all tokens, typography, components, and interactive states.
- `/api/health`: JSON health check endpoint returning `{"status": "ok", "service": "mawja"}`.

---

## 6. Payment UI Isolation & Mock Data Policy
- **No Active Integration Claims:** All wording, badges, or visual elements claiming active payment gateway integration or verified Algerian banking provider partnerships have been completely removed.
- **Pure Static/Mock Data:** All prices and course data are strictly mock display items for UI verification.
- **Backend Isolation:** No database connection, Supabase query, or live payment/storage backend is present in Phase 01.

---

## 7. Next Steps
- **PHASE 02:** Supabase Database, Schema Migrations, RLS Security Policies, and Storage Buckets setup.
