"use client";

import { useState, useEffect } from "react";

const sections = [
  { id: "hero", label: "Home" },
  { id: "problem", label: "Problem" },
  { id: "solution", label: "Solution" },
  { id: "architecture", label: "How It Works" },
  { id: "features", label: "Features" },
  { id: "demo", label: "Use Cases" },
  { id: "tech-stack", label: "Tech Stack" },
  { id: "hackathon-edge", label: "Edge" },
  { id: "roadmap", label: "Roadmap" },
  { id: "cta", label: "Launch" },
];

export default function SideNav() {
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const ids = sections.map((s) => s.id);

    const onScroll = () => {
      const scrollY = window.scrollY + window.innerHeight * 0.35;

      // Walk backwards — first section whose top is above our scroll point wins
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && el.offsetTop <= scrollY) {
          setActive(ids[i]);
          return;
        }
      }
      setActive(ids[0]);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // set initial state
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="fixed right-5 top-1/2 -translate-y-1/2 z-50 hidden sm:flex flex-col items-end gap-4">
      {sections.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          className="group flex items-center gap-3"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(id)?.scrollIntoView();
          }}
        >
          <span
            className={`text-[10px] tracking-[0.1em] uppercase transition-all duration-200 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 ${
              active === id ? "text-text-primary" : "text-text-muted"
            }`}
          >
            {label}
          </span>
          <span
            className={`block rounded-full transition-all duration-300 ${
              active === id
                ? "w-2.5 h-2.5 bg-white"
                : "w-1.5 h-1.5 bg-white/20 group-hover:bg-white/50"
            }`}
          />
        </a>
      ))}
    </nav>
  );
}
