"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Problem", href: "#problem" },
  { label: "Solution", href: "#solution" },
  { label: "How It Works", href: "#architecture" },
  { label: "Features", href: "#features" },
  { label: "Tech Stack", href: "#tech-stack" },
  { label: "Roadmap", href: "#roadmap" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 50);

      if (currentY > lastScrollY && currentY > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      lastScrollY = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      } ${
        scrolled
          ? "bg-bg-primary/80 backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group shrink-0">
          <img
            src="/logo/logo.png"
            alt="Frontier Pulse"
            className="h-6 sm:h-7 transition-transform group-hover:scale-105"
          />
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://docs.evefrontier.com/SwaggerWorldApi"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            Docs
          </a>
          <a
            href="https://frontierpulse.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium rounded-lg bg-white text-bg-primary hover:bg-white/90 transition-all"
          >
            Launch App
            <span className="text-xs">&rarr;</span>
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden text-text-muted p-2"
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-bg-primary/95 backdrop-blur-xl border-b border-white/[0.06]"
          >
            <div className="px-6 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-text-muted hover:text-text-primary py-2"
                >
                  {link.label}
                </a>
              ))}
              <div className="h-px bg-white/[0.06] my-2" />
              <a
                href="https://docs.evefrontier.com/SwaggerWorldApi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-text-muted hover:text-text-primary py-2"
              >
                Documentation
              </a>
              <a
                href="https://frontierpulse.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 px-4 py-2.5 text-sm font-medium rounded-lg bg-white text-bg-primary text-center"
              >
                Launch App
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
