"use client";

import * as React from "react";
import Link from "next/link";
import { Warning, ArrowCounterClockwise } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("MAWJA App Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-error-subtle text-error mb-4">
        <Warning className="h-7 w-7" />
      </div>
      <h2 className="text-2xl font-extrabold text-foreground">
        حدث خطأ غير متوقع
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
        نعتذر عن هذا الخطأ. فريق الهندسة يعمل على حل المشكلات التقنية باستمرار.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()} variant="primary" className="gap-2">
          <ArrowCounterClockwise className="h-4 w-4" />
          <span>إعادة المحاولة</span>
        </Button>
        <Link href="/">
          <Button variant="outline">العودة للرئيسية</Button>
        </Link>
      </div>
    </div>
  );
}
