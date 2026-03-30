"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxSectionProps {
  children: ReactNode;
  speed?: number; // negative = moves up slower (parallax), positive = moves up faster
  className?: string;
}

export default function ParallaxSection({
  children,
  speed = -0.15,
  className = "",
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 400]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

/* Floating element that moves on scroll */
export function FloatingOnScroll({
  children,
  offsetY = [-30, 30],
  offsetX = [0, 0],
  rotate = [0, 0],
  className = "",
}: {
  children?: ReactNode;
  offsetY?: [number, number];
  offsetX?: [number, number];
  rotate?: [number, number];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], offsetY);
  const x = useTransform(scrollYProgress, [0, 1], offsetX);
  const r = useTransform(scrollYProgress, [0, 1], rotate);

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y, x, rotate: r }}>{children}</motion.div>
    </div>
  );
}
