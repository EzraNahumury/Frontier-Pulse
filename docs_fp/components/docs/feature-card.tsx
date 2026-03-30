"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color?: "cyan" | "violet" | "emerald" | "amber";
}

const colorMap = {
  cyan: { bg: "bg-[rgba(0,229,255,0.1)]", text: "text-[#00e5ff]" },
  violet: { bg: "bg-[rgba(124,58,237,0.15)]", text: "text-[#a78bfa]" },
  emerald: { bg: "bg-[rgba(0,255,136,0.1)]", text: "text-[#00ff88]" },
  amber: { bg: "bg-[rgba(255,152,0,0.12)]", text: "text-[#ff9800]" },
};

export function FeatureCard({ icon: Icon, title, description, color = "cyan" }: FeatureCardProps) {
  const c = colorMap[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-lg border border-[rgba(0,229,255,0.08)] bg-space-900/50 p-4 hover:border-[rgba(0,229,255,0.18)] hover:shadow-[0_0_20px_rgba(0,229,255,0.04)] transition-all duration-200"
    >
      <div className={cn("inline-flex items-center justify-center w-8 h-8 rounded-md mb-3", c.bg)}>
        <Icon className={cn("w-4 h-4", c.text)} />
      </div>
      <h3 className="text-sm font-semibold text-[#e2eaf2] mb-1">{title}</h3>
      <p className="text-xs leading-relaxed text-[#5c6b7a]">{description}</p>
    </motion.div>
  );
}
