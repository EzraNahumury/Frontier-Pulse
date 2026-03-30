"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
}

export function CodeBlock({ code, language, filename, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("group relative rounded-lg overflow-hidden my-5 border border-[rgba(0,229,255,0.08)]", className)}>
      {(filename || language) && (
        <div className="flex items-center justify-between px-4 py-2 bg-space-900 border-b border-[rgba(0,229,255,0.08)]">
          <span className="text-xs text-[#5c6b7a] font-mono">{filename ?? language}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-[#5c6b7a] hover:text-accent transition-colors"
            aria-label="Copy code"
          >
            {copied ? (
              <><Check className="w-3.5 h-3.5 text-[#00ff88]" /><span className="text-[#00ff88]">Copied</span></>
            ) : (
              <><Copy className="w-3.5 h-3.5" /><span className="opacity-0 group-hover:opacity-100 transition-opacity">Copy</span></>
            )}
          </button>
        </div>
      )}
      <pre className="!rounded-t-none !mt-0 !border-0">
        <code>{code}</code>
      </pre>
    </div>
  );
}
