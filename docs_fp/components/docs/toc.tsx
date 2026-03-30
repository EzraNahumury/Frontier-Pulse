"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const pathname = usePathname();
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState("");

  // Re-scan headings when route changes
  const scanHeadings = useCallback(() => {
    // Small delay to let the new page render its headings
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll("article h2[id], article h3[id]");
      const items: TocItem[] = Array.from(elements).map((el) => ({
        id: el.id,
        text: el.textContent ?? "",
        level: el.tagName === "H2" ? 2 : 3,
      }));
      setHeadings(items);
      setActiveId("");
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return scanHeadings();
  }, [pathname, scanHeadings]);

  // Intersection observer for active heading
  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="hidden xl:block w-52 shrink-0">
      <div className="sticky top-20">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5c6b7a] mb-3 block">
          On this page
        </span>
        <nav>
          <ul className="space-y-0.5 border-l border-[rgba(0,229,255,0.08)]">
            {headings.map((h) => (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  className={cn(
                    "block text-[12.5px] leading-relaxed py-1 transition-colors duration-150 border-l-2 -ml-px",
                    h.level === 3 ? "pl-5" : "pl-3",
                    activeId === h.id
                      ? "border-accent text-accent font-medium"
                      : "border-transparent text-[#5c6b7a] hover:text-[#8899a8] hover:border-[rgba(0,229,255,0.2)]"
                  )}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
