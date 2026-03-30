"use client";

export default function Panel({
  children,
  className = "",
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <div className={`panel ${className}`}>
      {title && (
        <div className="px-4 py-2.5 border-b border-white/[0.04]">
          <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/30">
            {title}
          </span>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
