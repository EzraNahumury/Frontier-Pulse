"use client";

import ScrollReveal from "./ScrollReveal";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <ScrollReveal direction="up">
          <div className="grid sm:grid-cols-3 gap-8 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <img src="/logo/logo.png" alt="Frontier Pulse" className="h-5" />
              </div>
              <p className="text-sm text-text-muted leading-relaxed max-w-xs">
                The vital signs of a living universe. Real-time civilization health
                monitoring for EVE Frontier, powered by Sui.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-text-muted mb-4">
                Navigate
              </p>
              <div className="flex flex-col gap-2">
                {[
                  ["Problem", "#problem"],
                  ["Solution", "#solution"],
                  ["Architecture", "#architecture"],
                  ["Features", "#features"],
                  ["Tech Stack", "#tech-stack"],
                  ["Roadmap", "#roadmap"],
                ].map(([label, href]) => (
                  <a
                    key={href}
                    href={href}
                    className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div>
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-text-muted mb-4">
                Resources
              </p>
              <div className="flex flex-col gap-2">
                {[
                  ["Launch App", "https://frontier-pulse-nine.vercel.app/"],
                  ["EVE Frontier", "https://evefrontier.com"],
                  ["Sui Blockchain", "https://sui.io"],
                  ["World API Docs", "https://docs.evefrontier.com/SwaggerWorldApi"],
                ].map(([label, href]) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-text-secondary hover:text-text-primary transition-colors inline-flex items-center gap-1"
                  >
                    {label}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            Frontier Pulse &mdash; EVE Frontier x Sui Hackathon 2026
          </p>
          <p className="text-xs text-text-muted">
            Built on Sui &middot; Powered by Trust
          </p>
        </div>
      </div>
    </footer>
  );
}
