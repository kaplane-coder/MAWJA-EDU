"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, UserCheck, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

export interface AuthSwitchProps {
  className?: string;
  initialMode?: "login" | "register";
  onModeChange?: (mode: "login" | "register") => void;
}

export const AuthSwitch = ({
  className,
  initialMode = "login",
  onModeChange,
}: AuthSwitchProps) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  const handleModeChange = (newMode: "login" | "register") => {
    setMode(newMode);
    onModeChange?.(newMode);
  };

  return (
    <div
      dir="rtl"
      className={cn(
        "relative w-full max-w-md mx-auto",
        "rounded-3xl border border-primary/20",
        "bg-surface/90 backdrop-blur-2xl",
        "shadow-glow",
        "p-6 sm:p-8",
        className
      )}
    >
      {/* Decorative ambient atmospheric glow */}
      <div className="pointer-events-none absolute -top-10 start-1/2 -translate-x-1/2">
        <div className="w-36 h-36 rounded-full bg-primary/20 blur-3xl" />
      </div>

      <div className="relative space-y-6 text-right">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkle className="h-3.5 w-3.5" />
              <span>منصة موجة التعليمية</span>
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-foreground">
            {mode === "login" ? "مرحباً بعودتك" : "أنشئ حسابك في موجة"}
          </h2>

          <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
            {mode === "login"
              ? "سجّل الدخول للوصول الفوري إلى مساحتك التعليمية ودوراتك التدريبية."
              : "ابدأ رحلتك التعليمية واكتسب مهارات متقدمة تؤهلك لسوق العمل."}
          </p>
        </div>

        {/* Tab switch control */}
        <div className="grid grid-cols-2 gap-1 rounded-2xl border border-border bg-muted/50 p-1">
          <button
            type="button"
            onClick={() => handleModeChange("login")}
            className={cn(
              "relative rounded-xl py-2.5 text-xs sm:text-sm font-bold",
              "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              mode === "login"
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {mode === "login" && (
              <motion.div
                layoutId="auth-active-tab"
                className="absolute inset-0 rounded-xl bg-primary shadow-xs"
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              />
            )}

            <span className="relative z-10 flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>تسجيل الدخول</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("register")}
            className={cn(
              "relative rounded-xl py-2.5 text-xs sm:text-sm font-bold",
              "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              mode === "register"
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {mode === "register" && (
              <motion.div
                layoutId="auth-active-tab"
                className="absolute inset-0 rounded-xl bg-primary shadow-xs"
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              />
            )}

            <span className="relative z-10 flex items-center justify-center gap-2">
              <UserCheck className="h-4 w-4" />
              <span>إنشاء حساب</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthSwitch;
