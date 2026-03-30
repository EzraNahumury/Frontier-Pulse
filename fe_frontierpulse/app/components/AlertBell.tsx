"use client";
import { useState, useRef, useEffect } from "react";
import type { Alert } from "@/lib/types";
import { getSeverityColor } from "@/lib/colors";

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function AlertBell({ alerts }: { alerts: Alert[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const critCount = alerts.filter((a) => a.severity === "critical" || a.severity === "high").length;

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className={`relative flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
          open ? "bg-white/10" : "bg-white/[0.03] hover:bg-white/[0.06]"
        } border border-white/[0.06]`}
        title="Anomaly Alerts"
      >
        {/* Bell SVG */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7a8ba0]">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {/* Badge */}
        {critCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff3d3d] text-[9px] font-bold text-white flex items-center justify-center"
            style={{ boxShadow: "0 0 6px rgba(255,61,61,0.5)" }}
          >
            {critCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full right-0 mt-2 w-[340px] panel-glass rounded-lg overflow-hidden z-50 animate-fade-in shadow-2xl">
          <div className="px-4 py-2.5 border-b border-[rgba(0,229,255,0.08)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00e5ff]" />
              <span className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#7a8ba0]">
                Anomaly Alerts
              </span>
            </div>
            <span className="text-[10px] text-[#5c6b7a]">{alerts.length} events</span>
          </div>

          <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
            {alerts.map((alert) => {
              const color = getSeverityColor(alert.severity);
              return (
                <div
                  key={alert.id}
                  className="flex gap-2.5 py-2 px-2.5 rounded-md hover:bg-white/[0.03] transition-colors"
                >
                  <div className="w-1 min-h-full rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color }}>
                        {alert.severity}
                      </span>
                      <span className="text-[10px] text-[#7a8ba0] truncate">{alert.alertType}</span>
                      <span className="text-[9px] text-[#3d4a5c] ml-auto shrink-0">
                        {timeAgo(alert.timestampMs)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8a96a5] leading-relaxed">{alert.description}</p>
                    <span className="text-[9px] text-[#3d4a5c]">{alert.systemName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
