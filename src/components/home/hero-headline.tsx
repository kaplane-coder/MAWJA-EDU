import * as React from "react";

export function HeroHeadline() {
  return (
    <div className="space-y-3 animate-fade-in">
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.35] text-right">
        <span className="block text-foreground/95 pb-1">
          تعلّم مهارات اليوم..
        </span>
        <span className="block mt-1.5 pb-2 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          وابنِ مستقبلك المهني بثقة.
        </span>
      </h1>
    </div>
  );
}

