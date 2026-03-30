"use client";

import { useRef, useState, type ReactNode } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

interface SteppedSlideProps {
  id?: string;
  steps: number;
  /** Extra snap spacers at the end that keep showing the last step (default 1) */
  buffer?: number;
  render: (step: number) => ReactNode;
}

export default function SteppedSlide({ id, steps, buffer = 1, render }: SteppedSlideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const totalSnaps = steps + buffer;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const raw = progress * totalSnaps;
    // Clamp to actual content steps — buffer snaps stay on last step
    const newStep = Math.min(steps - 1, Math.max(0, Math.floor(raw)));
    if (newStep !== step) setStep(newStep);
  });

  return (
    <div ref={containerRef} id={id} style={{ scrollSnapAlign: "start" }}>
      {/* Sticky viewport */}
      <div className="sticky top-0 h-dvh flex items-center overflow-hidden z-[2]">
        <div className="max-w-7xl mx-auto px-6 w-full">
          {render(step)}
        </div>
      </div>

      {/* Snap spacers: (steps - 1) for content + buffer for lingering on last step */}
      {Array.from({ length: totalSnaps - 1 }).map((_, i) => (
        <div
          key={i}
          className="h-dvh"
          style={{ scrollSnapAlign: "start", scrollSnapStop: "always" }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
