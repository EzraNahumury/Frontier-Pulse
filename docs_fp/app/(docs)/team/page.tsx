"use client";

import { PageWrapper } from "@/components/docs/page-wrapper";
import { motion } from "framer-motion";
import Image from "next/image";
import { Mail, Github, Globe, Video, ExternalLink, Monitor, FileCode2, Server } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const team = [
  {
    name: "Sanjaya Cahyadi Fuad",
    email: "sanjaya.cahyadi@ti.ukdw.ac.id",
    role: "Front End Developer",
    icon: Monitor,
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-[rgba(0,229,255,0.1)]",
    text: "text-[#00e5ff]",
  },
  {
    name: "Secondio Prawiro",
    email: "kristinarrang08@gmail.com",
    role: "Smart Contract Developer",
    icon: FileCode2,
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-[rgba(124,58,237,0.1)]",
    text: "text-[#a78bfa]",
  },
  {
    name: "Ezra Kristanto Nahumury",
    email: "ezra.kristanto@ti.ukdw.ac.id",
    role: "Backend Developer",
    icon: Server,
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-[rgba(0,255,136,0.1)]",
    text: "text-[#00ff88]",
  },
];

const links = [
  { title: "Live DApp", desc: "Try Frontier Pulse in your browser", href: "https://frontier-pulse-nine.vercel.app/", icon: Globe, disabled: false },
  { title: "Demo Video", desc: "Watch the full product walkthrough", href: "#", icon: Video, disabled: true },
  { title: "GitHub Repository", desc: "View the source code", href: "https://github.com/EzraNahumury/Frontier-Pulse", icon: Github, disabled: false },
  { title: "Hackathon Page", desc: "EVE Frontier x Sui Hackathon 2026", href: "https://deepsurge.xyz/evefrontier2026", icon: ExternalLink, disabled: false },
];

export default function TeamPage() {
  return (
    <PageWrapper>
      <h1 className="text-3xl font-bold tracking-tight text-[#e2eaf2] mb-1 font-[family-name:var(--font-playfair)]">
        Team &amp; Links
      </h1>
      <p className="page-desc text-[#5c6b7a] text-sm mb-10">Meet the team behind Frontier Pulse and find project links.</p>

      {/* ── Team ── */}
      <section className="mb-14">
        <h2 id="team" className="text-lg font-semibold text-[#e2eaf2] mb-5 scroll-mt-20">
          Our Team
        </h2>

        <div className="space-y-3">
          {team.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.35 }}
                className="flex items-center gap-4 rounded-xl border border-[rgba(0,229,255,0.08)] bg-space-900 px-5 py-4 hover:border-[rgba(0,229,255,0.15)] hover:shadow-sm transition-all duration-200"
              >
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full bg-space-800 flex items-center justify-center shrink-0 overflow-hidden">
                  <Image src="/logo/logo.png" alt="FP" width={44} height={44} className="w-7 h-auto" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#e2eaf2] truncate">{m.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Icon className={`w-3 h-3 ${m.text}`} />
                    <span className={`text-xs font-medium ${m.text}`}>{m.role}</span>
                  </div>
                </div>

                {/* Email */}
                <a
                  href={`mailto:${m.email}`}
                  className="hidden sm:flex items-center gap-1.5 text-xs text-[#5c6b7a] hover:text-[#8899a8] transition-colors shrink-0"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[200px]">{m.email}</span>
                </a>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Links ── */}
      <section>
        <h2 id="links" className="text-lg font-semibold text-[#e2eaf2] mb-5 scroll-mt-20">
          Project Links
        </h2>

        <div className="space-y-2">
          {links.map((l, i) => {
            const Icon = l.icon;
            const inner = (
              <motion.div
                key={l.title}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.3 }}
                className={`flex items-center gap-4 rounded-xl border px-5 py-4 transition-all duration-200 ${
                  l.disabled
                    ? "border-dashed border-[rgba(0,229,255,0.08)] bg-space-900"
                    : "border-[rgba(0,229,255,0.08)] bg-space-900 hover:border-[rgba(0,229,255,0.2)] hover:shadow-sm cursor-pointer"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  l.disabled ? "bg-space-800" : "bg-[rgba(0,229,255,0.08)]"
                }`}>
                  <Icon className={`w-4 h-4 ${l.disabled ? "text-[#3d4f60]" : "text-[#00e5ff]"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${l.disabled ? "text-[#5c6b7a]" : "text-[#e2eaf2]"}`}>{l.title}</p>
                  <p className={`text-xs mt-0.5 ${l.disabled ? "text-[#3d4f60]" : "text-[#5c6b7a]"}`}>{l.desc}</p>
                </div>
                {l.disabled ? (
                  <span className="text-[10px] text-[#5c6b7a] border border-[rgba(0,229,255,0.08)] rounded-full px-2.5 py-0.5 shrink-0">Soon</span>
                ) : (
                  <ExternalLink className="w-4 h-4 text-[#3d4f60] group-hover:text-[#00e5ff] shrink-0" />
                )}
              </motion.div>
            );

            return l.disabled ? (
              <div key={l.title}>{inner}</div>
            ) : (
              <a key={l.title} href={l.href} target="_blank" rel="noopener noreferrer" className="block group">
                {inner}
              </a>
            );
          })}
        </div>
      </section>
    </PageWrapper>
  );
}
