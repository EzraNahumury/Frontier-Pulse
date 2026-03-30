"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function CursorGlow() {
  const [visible, setVisible] = useState(false);

  const x = useSpring(0, { stiffness: 200, damping: 30 });
  const y = useSpring(0, { stiffness: 200, damping: 30 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, [x, y, visible]);

  return (
    <>
      {/* Outer glow */}
      <motion.div
        className="fixed pointer-events-none z-[999] rounded-full"
        style={{
          x,
          y,
          translateX: "-50%",
          translateY: "-50%",
          width: 300,
          height: 300,
          background: "radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)",
          opacity: visible ? 1 : 0,
        }}
      />
      {/* Inner dot */}
      <motion.div
        className="fixed pointer-events-none z-[999] rounded-full"
        style={{
          x,
          y,
          translateX: "-50%",
          translateY: "-50%",
          width: 6,
          height: 6,
          background: "rgba(255,255,255,0.3)",
          opacity: visible ? 1 : 0,
        }}
      />
    </>
  );
}
