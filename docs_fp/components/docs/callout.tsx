import { Info, AlertTriangle, Lightbulb, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "info" | "warning" | "tip" | "important";

const styles: Record<Variant, { icon: typeof Info; border: string; bg: string; iconColor: string }> = {
  info: { icon: Info, border: "border-[rgba(0,229,255,0.3)]", bg: "bg-[rgba(0,229,255,0.05)]", iconColor: "text-[#00e5ff]" },
  warning: { icon: AlertTriangle, border: "border-[rgba(255,152,0,0.3)]", bg: "bg-[rgba(255,152,0,0.05)]", iconColor: "text-[#ff9800]" },
  tip: { icon: Lightbulb, border: "border-[rgba(0,255,136,0.3)]", bg: "bg-[rgba(0,255,136,0.05)]", iconColor: "text-[#00ff88]" },
  important: { icon: Zap, border: "border-[rgba(124,58,237,0.3)]", bg: "bg-[rgba(124,58,237,0.06)]", iconColor: "text-[#a78bfa]" },
};

interface CalloutProps {
  variant?: Variant;
  title?: string;
  children: React.ReactNode;
}

export function Callout({ variant = "info", title, children }: CalloutProps) {
  const s = styles[variant];
  const Icon = s.icon;

  return (
    <div className={cn("flex gap-3 rounded-lg border-l-[3px] px-4 py-3.5 my-5", s.border, s.bg)}>
      <Icon className={cn("w-[18px] h-[18px] shrink-0 mt-0.5", s.iconColor)} />
      <div className="text-sm leading-relaxed">
        {title && <p className="font-semibold text-[#e2eaf2] mb-0.5">{title}</p>}
        <div className="text-[#8899a8]">{children}</div>
      </div>
    </div>
  );
}
