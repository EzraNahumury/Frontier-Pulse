"use client";
import { useRef, useEffect } from "react";

export default function DualHeartbeat() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const bufferRef = useRef({
    activity: new Array(300).fill(0).map((_, i) => 50 + Math.sin(i * 0.05) * 10),
    trust: new Array(300).fill(0).map((_, i) => 50 + Math.cos(i * 0.04) * 8),
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let lastSample = 0;

    const draw = (time: number) => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (time - lastSample > 33) {
        lastSample = time;
        const { activity, trust } = bufferRef.current;
        activity.shift();
        trust.shift();

        const t = time * 0.001;
        const actBase = 50 + Math.sin(t * 1.1) * 12 + Math.sin(t * 2.7) * 6;
        const trustBase = 50 + Math.sin(t * 0.7 + 0.5) * 10 + Math.cos(t * 1.9) * 5;
        const beatPhase = (t * 1.3) % (Math.PI * 2);
        const actSpike = beatPhase < 0.3 ? Math.sin(beatPhase / 0.3 * Math.PI) * 25 : 0;
        const trustBeatPhase = (t * 0.9 + 1) % (Math.PI * 2);
        const trustSpike = trustBeatPhase < 0.25 ? Math.sin(trustBeatPhase / 0.25 * Math.PI) * 18 : 0;

        activity.push(Math.max(5, Math.min(95, actBase + actSpike + (Math.random() - 0.5) * 3)));
        trust.push(Math.max(5, Math.min(95, trustBase + trustSpike + (Math.random() - 0.5) * 2)));
      }

      // Background with gradient
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#05080f");
      bg.addColorStop(1, "#070b14");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Subtle grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 0.5;
      for (let y = h * 0.25; y < h; y += h * 0.25) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      for (let x = 0; x < w; x += 80) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }

      const { activity, trust } = bufferRef.current;

      // Trust line (green, drawn first = behind)
      drawLine(ctx, trust, w, h, "rgba(0, 255, 136, 0.5)", 1.2);
      drawLine(ctx, trust, w, h, "rgba(0, 255, 136, 0.08)", 5);

      // Activity line (white, drawn on top)
      drawLine(ctx, activity, w, h, "rgba(255, 255, 255, 0.6)", 1.2);
      drawLine(ctx, activity, w, h, "rgba(255, 255, 255, 0.08)", 5);

      // Edge fade
      const fadeL = ctx.createLinearGradient(0, 0, 60, 0);
      fadeL.addColorStop(0, "#05080f");
      fadeL.addColorStop(1, "transparent");
      ctx.fillStyle = fadeL;
      ctx.fillRect(0, 0, 60, h);

      const fadeR = ctx.createLinearGradient(w - 40, 0, w, 0);
      fadeR.addColorStop(0, "transparent");
      fadeR.addColorStop(1, "#05080f");
      ctx.fillStyle = fadeR;
      ctx.fillRect(w - 40, 0, 40, h);

      frameRef.current = requestAnimationFrame(draw);
    };
    frameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" />
      {/* Labels */}
      <div className="absolute bottom-2 left-3 flex items-center gap-4 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-[1.5px] bg-white/40 rounded-full" />
          <span className="text-[8px] tracking-[0.1em] uppercase text-white/25">Activity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-[1.5px] bg-[#00ff88]/40 rounded-full" />
          <span className="text-[8px] tracking-[0.1em] uppercase text-white/25">Trust</span>
        </div>
      </div>
    </div>
  );
}

function drawLine(
  ctx: CanvasRenderingContext2D,
  data: number[],
  w: number,
  h: number,
  color: string,
  lineWidth: number
) {
  if (data.length < 2) return;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const step = w / (data.length - 1);
  const margin = h * 0.12;
  const usableH = h - margin * 2;

  for (let i = 0; i < data.length; i++) {
    const x = i * step;
    const y = margin + usableH - (data[i] / 100) * usableH;
    if (i === 0) ctx.moveTo(x, y);
    else {
      const prev = { x: (i - 1) * step, y: margin + usableH - (data[i - 1] / 100) * usableH };
      const cpx = (prev.x + x) / 2;
      ctx.quadraticCurveTo(prev.x + (x - prev.x) * 0.5, prev.y, cpx, (prev.y + y) / 2);
    }
  }
  ctx.stroke();
}
