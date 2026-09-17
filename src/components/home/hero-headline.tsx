"use client";

import * as React from "react";
import { motion } from "framer-motion";

export function HeroHeadline() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const content = (
    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.35] text-right">
      <span className="block text-foreground/95 pb-1">
        تعلّم مهارات اليوم..
      </span>
      <span className="block mt-1.5 pb-2 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text text-transparent">
        وابنِ مستقبلك المهني بثقة.
      </span>
    </h1>
  );

  if (!mounted) {
    return <div className="space-y-3">{content}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 70 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-3"
    >
      {content}
    </motion.div>
  );
}
