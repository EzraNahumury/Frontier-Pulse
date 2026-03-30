"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { navigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 flex items-center justify-center w-10 h-10 rounded-lg border border-[rgba(0,229,255,0.1)] bg-space-900 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-[#b8c7d6]" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-72 border-r border-[rgba(0,229,255,0.08)] bg-space-900 flex flex-col lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-[rgba(0,229,255,0.06)] shrink-0">
          <Image
            src="/logo/logo.png"
            alt="Frontier Pulse"
            width={120}
            height={32}
            className="h-7 w-auto"
            priority
          />
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-[#5c6b7a]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {navigation.map((section) => (
            <div key={section.title}>
              <h4 className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#3d4f60]">
                {section.title}
              </h4>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "group flex items-center gap-2.5 rounded-lg px-3 py-[7px] text-[13px]",
                          active
                            ? "bg-[rgba(0,229,255,0.08)] text-accent font-medium"
                            : "text-[#8899a8] hover:bg-[rgba(0,229,255,0.04)] hover:text-[#b8c7d6]"
                        )}
                      >
                        {Icon && (
                          <Icon
                            className={cn(
                              "w-4 h-4 shrink-0",
                              active ? "text-accent" : "text-[#3d4f60] group-hover:text-[#5c6b7a]"
                            )}
                          />
                        )}
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[rgba(0,229,255,0.06)] text-[11px] text-[#3d4f60]">
          EVE Frontier x Sui Hackathon 2026
        </div>
      </aside>
    </>
  );
}
