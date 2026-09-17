"use client";

import * as React from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("MAWJA Global Root Error:", error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-[#0d0f15] text-[#f1f3f9] flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#161922] p-8 text-center space-y-6 shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-extrabold tracking-tight">
              تعذّر تحميل الصفحة
            </h1>
            <p className="text-xs text-white/60 leading-relaxed">
              حدث خطأ غير متوقع أثناء معالجة الطلب في المتصفح. يمكنك محاولة تحديث الصفحة أو إعادة المحاولة.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => reset()}
              type="button"
              className="w-full rounded-xl bg-[#6366f1] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-95"
            >
              إعادة المحاولة
            </button>
            <Link
              href="/"
              className="w-full rounded-xl border border-white/10 py-3 text-xs font-semibold text-white/80 transition-colors hover:bg-white/5"
            >
              العودة إلى الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
