import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[70vh] px-6 py-20">
      {/* Pulsing dot */}
      <span className="relative flex h-3 w-3 mb-10">
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#00e5ff] opacity-60 animate-ping" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-[#00e5ff]" />
      </span>

      {/* 404 number with cyan glow */}
      <h1
        className="text-[8rem] sm:text-[10rem] font-extrabold leading-none tracking-tighter select-none"
        style={{
          color: "#0d1525",
          WebkitTextStroke: "2px rgba(0,229,255,0.5)",
          textShadow:
            "0 0 40px rgba(0,229,255,0.35), 0 0 80px rgba(0,229,255,0.15), 0 0 120px rgba(0,229,255,0.08)",
        }}
      >
        404
      </h1>

      {/* Message */}
      <h2 className="text-xl sm:text-2xl font-bold text-[#e2eaf2] mt-4 mb-3 font-[family-name:var(--font-playfair)]">
        Lost in the void
      </h2>

      {/* Subtitle */}
      <p className="text-sm text-[#5c6b7a] max-w-sm leading-relaxed mb-10">
        The system you&apos;re looking for doesn&apos;t exist in this universe.
        It may have been destroyed, relocated, or never colonized.
      </p>

      {/* Return button */}
      <Link
        href="/introduction"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#00e5ff] text-[#05080f] text-sm font-semibold hover:shadow-lg hover:shadow-[rgba(0,229,255,0.25)] transition-all duration-200"
      >
        Return to Introduction
      </Link>
    </div>
  );
}
