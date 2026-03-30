"use client";

import { ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { navigation } from "@/lib/navigation";
import { SearchModal } from "./search-modal";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const current = navigation
    .flatMap((s) => s.items)
    .find((item) => item.href === pathname);
  const sectionTitle = navigation.find((s) =>
    s.items.some((i) => i.href === pathname)
  )?.title;

  return (
    <header
      className={`sticky top-0 z-30 flex items-center h-14 px-8 transition-all duration-200 ${
        scrolled
          ? "bg-space-950/80 backdrop-blur-md border-b border-[rgba(0,229,255,0.08)] shadow-[0_1px_12px_rgba(0,229,255,0.04)]"
          : "bg-space-950"
      }`}
    >
      <div className="flex items-center gap-2 text-sm">
        {sectionTitle && (
          <>
            <span className="text-accent text-xs font-medium">{sectionTitle}</span>
            <span className="text-[#2a3444]">/</span>
          </>
        )}
        <span className="text-[#e2eaf2] font-medium text-sm">{current?.title ?? "Docs"}</span>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <SearchModal />
        <a
          href="https://github.com/EzraNahumury/Frontier-Pulse"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-[#5c6b7a] hover:text-accent transition-colors"
        >
          GitHub
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </header>
  );
}
