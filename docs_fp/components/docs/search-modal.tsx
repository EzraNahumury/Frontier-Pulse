"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FileText, Hash, CornerDownLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { searchIndex, type SearchEntry } from "@/lib/search-index";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: "page" | "heading";
  title: string;
  href: string;
  section: string;
  parent?: string;
}

function search(query: string): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  const results: SearchResult[] = [];
  const seen = new Set<string>();

  for (const entry of searchIndex) {
    const matchesTitle = entry.title.toLowerCase().includes(q);
    const matchesKeywords = entry.keywords.toLowerCase().includes(q);
    const matchesSection = entry.section.toLowerCase().includes(q);

    // Page-level match
    if (matchesTitle || matchesKeywords || matchesSection) {
      const key = entry.href;
      if (!seen.has(key)) {
        seen.add(key);
        results.push({ type: "page", title: entry.title, href: entry.href, section: entry.section });
      }
    }

    // Heading-level match
    for (const h of entry.headings) {
      if (h.text.toLowerCase().includes(q)) {
        const key = `${entry.href}#${h.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          results.push({ type: "heading", title: h.text, href: `${entry.href}#${h.id}`, section: entry.section, parent: entry.title });
        }
      }
    }
  }

  return results.slice(0, 12);
}

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = search(query);

  // Ctrl+K shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      } else if (e.key === "Enter" && results[selected]) {
        e.preventDefault();
        navigate(results[selected].href);
      }
    },
    [results, selected]
  );

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[rgba(0,229,255,0.1)] bg-space-900/60 text-sm text-[#5c6b7a] hover:border-[rgba(0,229,255,0.2)] hover:bg-space-800/60 transition-colors cursor-pointer"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="text-xs">Search docs...</span>
        <kbd className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-space-800 border border-[rgba(0,229,255,0.1)] text-[#5c6b7a]">
          Ctrl K
        </kbd>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ duration: 0.15 }}
              className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[101] w-full max-w-lg"
            >
              <div className="bg-space-900 rounded-xl border border-[rgba(0,229,255,0.12)] shadow-2xl shadow-[rgba(0,229,255,0.05)] overflow-hidden">
                {/* Input */}
                <div className="flex items-center gap-3 px-4 border-b border-[rgba(0,229,255,0.08)]">
                  <Search className="w-4 h-4 text-[#5c6b7a] shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search documentation..."
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
                    onKeyDown={handleKeyDown}
                    className="flex-1 py-3.5 text-sm text-[#e2eaf2] bg-transparent outline-none placeholder:text-[#5c6b7a]"
                  />
                  <button onClick={() => setOpen(false)} className="text-[#5c6b7a] hover:text-[#b8c7d6]">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Results */}
                <div className="max-h-[360px] overflow-y-auto">
                  {query && results.length === 0 && (
                    <div className="px-4 py-8 text-center text-sm text-[#5c6b7a]">
                      No results for &ldquo;{query}&rdquo;
                    </div>
                  )}

                  {results.length > 0 && (
                    <div className="py-2">
                      {results.map((r, i) => (
                        <button
                          key={r.href}
                          onClick={() => navigate(r.href)}
                          onMouseEnter={() => setSelected(i)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                            selected === i ? "bg-[rgba(0,229,255,0.08)]" : "hover:bg-[rgba(0,229,255,0.04)]"
                          )}
                        >
                          {r.type === "page" ? (
                            <FileText className={cn("w-4 h-4 shrink-0", selected === i ? "text-accent" : "text-[#5c6b7a]")} />
                          ) : (
                            <Hash className={cn("w-4 h-4 shrink-0", selected === i ? "text-accent" : "text-[#5c6b7a]")} />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm truncate", selected === i ? "text-accent font-medium" : "text-[#b8c7d6]")}>
                              {r.title}
                            </p>
                            <p className="text-[11px] text-[#5c6b7a] truncate">
                              {r.parent ? `${r.parent} — ${r.section}` : r.section}
                            </p>
                          </div>
                          {selected === i && <CornerDownLeft className="w-3.5 h-3.5 text-accent shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}

                  {!query && (
                    <div className="px-4 py-6 text-center text-sm text-[#5c6b7a]">
                      Type to search pages and sections
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-4 px-4 py-2 border-t border-[rgba(0,229,255,0.08)] text-[10px] text-[#5c6b7a]">
                  <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded border border-[rgba(0,229,255,0.1)] font-mono">↑↓</kbd> Navigate</span>
                  <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded border border-[rgba(0,229,255,0.1)] font-mono">↵</kbd> Open</span>
                  <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded border border-[rgba(0,229,255,0.1)] font-mono">Esc</kbd> Close</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
