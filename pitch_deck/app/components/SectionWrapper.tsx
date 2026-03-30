"use client";

/**
 * Every section is a full-viewport "slide".
 * scroll-snap-align: start  → mandatory snap locks here
 * h-dvh (100dvh)            → fills dynamic viewport height
 * Content is vertically centered.
 */

interface SectionWrapperProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
}

export default function SectionWrapper({
  id,
  children,
  className = "",
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={`relative h-dvh flex items-center overflow-hidden ${className}`}
      style={{ scrollSnapAlign: "start", scrollSnapStop: "always" }}
    >
      <div className="relative max-w-7xl mx-auto px-6 w-full">{children}</div>
    </section>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-xs font-semibold tracking-[0.2em] uppercase text-text-muted mb-3">
      {children}
    </span>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-3 tracking-tight">
      {children}
    </h2>
  );
}

export function SectionDescription({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="text-base sm:text-lg text-text-secondary max-w-2xl leading-relaxed">
      {children}
    </p>
  );
}
