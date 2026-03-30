"use client";
import type { Alert } from "@/lib/types";
import { getSeverityColor } from "@/lib/colors";

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AlertFeed({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
      {alerts.map((alert) => {
        const color = getSeverityColor(alert.severity);
        return (
          <div
            key={alert.id}
            className="flex gap-2.5 py-2 px-2.5 rounded-md bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
          >
            <div
              className="w-1 min-h-full rounded-full shrink-0 mt-0.5"
              style={{ backgroundColor: color }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="text-[10px] font-medium uppercase tracking-wider"
                  style={{ color }}
                >
                  {alert.alertType}
                </span>
                <span className="text-[9px] text-[#5c6b7a] ml-auto shrink-0">
                  {timeAgo(alert.timestampMs)}
                </span>
              </div>
              <p className="text-[11px] text-[#8a96a5] leading-relaxed truncate">
                {alert.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
