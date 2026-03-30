"use client";

import { motion } from "framer-motion";

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="max-w-none"
    >
      {children}
    </motion.article>
  );
}
