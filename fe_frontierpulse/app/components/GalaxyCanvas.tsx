"use client";
import { useRef, useEffect, useCallback, useMemo } from "react";
import type { WorldSystem, GateLink } from "@/lib/types";
import { getSystemVitals } from "@/lib/vitals";

export type TrustFilter = "all" | "healthy" | "stressed" | "hostile";

interface Viewport { cx: number; cy: number; scale: number }

interface Props {
  systems: WorldSystem[];
  gateLinks: GateLink[];
  selectedSystemId: number | null;
  onSelectSystem: (id: number | null) => void;
  loading?: boolean;
  activeFilters: Set<TrustFilter>;
  watchedSystemIds?: Set<number>;
  focusRegion?: Viewport | null; // triggers animated zoom
}

interface BgStar { x: number; y: number; b: number; s: number }

interface CachedVitals {
  trustLevel: number; activityLevel: number; infrastructureCount: number;
  r: number; g: number; b: number; category: TrustFilter;
}

// EVE Frontier amber/gold accent for personal systems
const WATCH_R = 240, WATCH_G = 168, WATCH_B = 48; // #f0a830

function computeVitals(systemId: number): CachedVitals {
  const v = getSystemVitals(systemId);
  let r: number, g: number, b: number;
  if (v.trustLevel >= 70) { r = 0; g = 255; b = 136; }
  else if (v.trustLevel >= 40) { r = 255; g = 152; b = 0; }
  else { r = 255; g = 61; b = 61; }
  const category: TrustFilter = v.trustLevel >= 70 ? "healthy" : v.trustLevel >= 40 ? "stressed" : "hostile";
  return { trustLevel: v.trustLevel, activityLevel: v.activityLevel, infrastructureCount: v.infrastructureCount, r, g, b, category };
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

export default function GalaxyCanvas({ systems, gateLinks, selectedSystemId, onSelectSystem, loading, activeFilters, watchedSystemIds, focusRegion }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const cosmeticRef = useRef<BgStar[]>([]);
  const hoveredRef = useRef<number | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const systemMapRef = useRef<Map<number, WorldSystem>>(new Map());

  // ── Viewport (zoom/pan) ──
  const vpRef = useRef<Viewport>({ cx: 0.5, cy: 0.5, scale: 1 });
  const vpTargetRef = useRef<Viewport>({ cx: 0.5, cy: 0.5, scale: 1 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, cx: 0, cy: 0 });

  // ── Offscreen canvas for static system layer ──
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgDirtyRef = useRef(true);
  const bgSizeRef = useRef({ w: 0, h: 0 });
  const bgVpRef = useRef<Viewport>({ cx: 0.5, cy: 0.5, scale: 1 });

  // ── Pre-compute vitals ONCE ──
  const vitalsMap = useMemo(() => {
    const m = new Map<number, CachedVitals>();
    for (const s of systems) m.set(s.id, computeVitals(s.id));
    return m;
  }, [systems]);

  useEffect(() => {
    const m = new Map<number, WorldSystem>();
    systems.forEach((s) => m.set(s.id, s));
    systemMapRef.current = m;
  }, [systems]);

  useEffect(() => {
    cosmeticRef.current = Array.from({ length: 400 }, () => ({
      x: Math.random(), y: Math.random(),
      b: 0.06 + Math.random() * 0.25,
      s: 0.5 + Math.random() * 1,
    }));
  }, []);

  useEffect(() => { bgDirtyRef.current = true; }, [systems, activeFilters]);

  // ── Handle focusRegion changes (from wallet connect) ──
  useEffect(() => {
    if (focusRegion) {
      vpTargetRef.current = { ...focusRegion };
    }
  }, [focusRegion]);

  // ── Viewport-aware coordinate transforms ──
  const toScreen = useCallback((nx: number, ny: number) => {
    const vp = vpRef.current;
    const pad = 40;
    const { w, h } = sizeRef.current;
    const uw = w - pad * 2;
    const uh = h - pad * 2;
    const sx = pad + ((nx - vp.cx) * vp.scale + 0.5) * uw;
    const sy = pad + ((ny - vp.cy) * vp.scale + 0.5) * uh;
    return { sx, sy };
  }, []);

  const fromScreen = useCallback((sx: number, sy: number) => {
    const vp = vpRef.current;
    const pad = 40;
    const { w, h } = sizeRef.current;
    const uw = w - pad * 2;
    const uh = h - pad * 2;
    const nx = ((sx - pad) / uw - 0.5) / vp.scale + vp.cx;
    const ny = ((sy - pad) / uh - 0.5) / vp.scale + vp.cy;
    return { nx, ny };
  }, []);

  // ── Render static layer (re-renders when viewport or data changes) ──
  const renderStaticLayer = useCallback((w: number, h: number) => {
    if (!bgCanvasRef.current) bgCanvasRef.current = document.createElement("canvas");
    const dpr = window.devicePixelRatio || 1;
    const bg = bgCanvasRef.current;
    bg.width = w * dpr; bg.height = h * dpr;
    const bgCtx = bg.getContext("2d")!;
    bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const vp = vpRef.current;
    const isFiltering = !activeFilters.has("all");
    const pad = 40;
    const uw = w - pad * 2;
    const uh = h - pad * 2;

    for (let i = 0; i < systems.length; i++) {
      const sys = systems[i];
      const sx = pad + ((sys.nx - vp.cx) * vp.scale + 0.5) * uw;
      const sy = pad + ((sys.ny - vp.cy) * vp.scale + 0.5) * uh;

      // Frustum cull — skip systems outside visible area
      if (sx < -10 || sx > w + 10 || sy < -10 || sy > h + 10) continue;

      const v = vitalsMap.get(sys.id);
      if (!v) continue;

      const matchesFilter = !isFiltering || activeFilters.has(v.category);
      // Scale dot size with zoom
      const zoomSz = Math.min(vp.scale * 0.5, 3);

      if (matchesFilter && isFiltering) {
        const sz = (1.5 + sys.depth * 1.5) * zoomSz;
        bgCtx.beginPath(); bgCtx.arc(sx, sy, sz, 0, Math.PI * 2);
        bgCtx.fillStyle = `rgba(${v.r},${v.g},${v.b},0.6)`;
        bgCtx.fill();
      } else if (!isFiltering) {
        const sz = (0.7 + sys.depth * 1) * zoomSz;
        const brightness = 0.12 + sys.depth * 0.4;
        const cr = v.r * 0.3 + 160 * 0.7;
        const cg = v.g * 0.3 + 185 * 0.7;
        const cb = v.b * 0.3 + 220 * 0.7;
        bgCtx.beginPath(); bgCtx.arc(sx, sy, sz * 0.5, 0, Math.PI * 2);
        bgCtx.fillStyle = `rgba(${cr},${cg},${cb},${brightness})`;
        bgCtx.fill();
      } else {
        const sz = (0.5 + sys.depth * 0.3) * zoomSz;
        bgCtx.beginPath(); bgCtx.arc(sx, sy, sz * 0.5, 0, Math.PI * 2);
        bgCtx.fillStyle = "rgba(100,115,140,0.03)";
        bgCtx.fill();
      }
    }

    bgSizeRef.current = { w, h };
    bgVpRef.current = { ...vp };
    bgDirtyRef.current = false;
  }, [systems, vitalsMap, activeFilters]);

  // ── Main render loop ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width * dpr; canvas.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w: r.width, h: r.height };
      bgDirtyRef.current = true;
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Wheel zoom ──
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const { nx, ny } = fromScreen(mx, my); // world pos under cursor

      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      const newScale = Math.max(1, Math.min(20, vpTargetRef.current.scale * zoomFactor));

      if (newScale === 1) {
        vpTargetRef.current = { cx: 0.5, cy: 0.5, scale: 1 };
      } else {
        // Zoom toward cursor position
        const t = vpTargetRef.current;
        vpTargetRef.current = {
          cx: nx - (nx - t.cx) * (newScale / t.scale),
          cy: ny - (ny - t.cy) * (newScale / t.scale),
          scale: newScale,
        };
      }
    };
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    // ── Drag pan ──
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && vpRef.current.scale > 1) {
        isDraggingRef.current = true;
        dragStartRef.current = { x: e.clientX, y: e.clientY, cx: vpTargetRef.current.cx, cy: vpTargetRef.current.cy };
        canvas.style.cursor = "grabbing";
      }
    };
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      canvas.style.cursor = "crosshair";
    };
    const handleDragMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const { w, h } = sizeRef.current;
      const vp = vpRef.current;
      const dx = (e.clientX - dragStartRef.current.x) / ((w - 80) * vp.scale);
      const dy = (e.clientY - dragStartRef.current.y) / ((h - 80) * vp.scale);
      vpTargetRef.current = {
        cx: dragStartRef.current.cx - dx,
        cy: dragStartRef.current.cy - dy,
        scale: vp.scale,
      };
    };
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleDragMove);

    const draw = (t: number) => {
      const { w, h } = sizeRef.current;
      const vp = vpRef.current;
      const tgt = vpTargetRef.current;

      // ── Smooth viewport animation ──
      const speed = 0.12;
      const vpChanged = Math.abs(vp.cx - tgt.cx) > 0.0001 || Math.abs(vp.cy - tgt.cy) > 0.0001 || Math.abs(vp.scale - tgt.scale) > 0.001;
      if (vpChanged) {
        vp.cx = lerp(vp.cx, tgt.cx, speed);
        vp.cy = lerp(vp.cy, tgt.cy, speed);
        vp.scale = lerp(vp.scale, tgt.scale, speed);
        bgDirtyRef.current = true;
      }

      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = "#05080f";
      ctx.fillRect(0, 0, w, h);

      // Nebula
      const nb1 = ctx.createRadialGradient(w * 0.4, h * 0.4, 0, w * 0.4, h * 0.4, w * 0.45);
      nb1.addColorStop(0, "rgba(15,30,80,0.08)");
      nb1.addColorStop(0.6, "rgba(40,10,60,0.04)");
      nb1.addColorStop(1, "transparent");
      ctx.fillStyle = nb1; ctx.fillRect(0, 0, w, h);

      const nb2 = ctx.createRadialGradient(w * 0.6, h * 0.55, 0, w * 0.6, h * 0.55, w * 0.35);
      nb2.addColorStop(0, "rgba(10,40,70,0.05)");
      nb2.addColorStop(1, "transparent");
      ctx.fillStyle = nb2; ctx.fillRect(0, 0, w, h);

      // Cosmetic stars
      cosmeticRef.current.forEach((s) => {
        const tw = s.b + Math.sin(t * 0.0007 + s.x * 150) * 0.06;
        ctx.fillStyle = `hsla(${s.x * 60 + 200}, 30%, 75%, ${Math.max(0, tw)})`;
        ctx.fillRect(s.x * w, s.y * h, s.s, s.s);
      });

      if (loading || systems.length === 0) {
        ctx.font = "13px system-ui, sans-serif";
        ctx.fillStyle = "rgba(122,139,160,0.6)";
        ctx.textAlign = "center";
        ctx.fillText(loading ? "Loading active systems..." : "No systems loaded", w / 2, h / 2);
        frameRef.current = requestAnimationFrame(draw);
        return;
      }

      // ── LAYER 1: Static systems ──
      if (bgDirtyRef.current || bgSizeRef.current.w !== w || bgSizeRef.current.h !== h) {
        renderStaticLayer(w, h);
      }
      if (bgCanvasRef.current) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(bgCanvasRef.current, 0, 0);
        const dpr = window.devicePixelRatio || 1;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.restore();
      }

      // ── Gate links ──
      if (selectedSystemId !== null && gateLinks.length > 0) {
        const sel = systemMapRef.current.get(selectedSystemId);
        if (sel) {
          gateLinks.forEach((gl) => {
            const dest = systemMapRef.current.get(gl.destinationId);
            if (!dest) return;
            const a = toScreen(sel.nx, sel.ny);
            const b = toScreen(dest.nx, dest.ny);
            ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy);
            ctx.strokeStyle = "rgba(0,229,255,0.35)"; ctx.lineWidth = 1.2; ctx.stroke();
            const ft = ((t * 0.0004) % 1);
            ctx.beginPath(); ctx.arc(a.sx + (b.sx - a.sx) * ft, a.sy + (b.sy - a.sy) * ft, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0,229,255,0.6)"; ctx.fill();
            ctx.font = "9px system-ui, sans-serif"; ctx.fillStyle = "rgba(0,229,255,0.5)";
            ctx.textAlign = "center"; ctx.fillText(dest.name, b.sx, b.sy - 8);
          });
        }
      }

      // ── LAYER 2: Dynamic foreground ──
      const hovered = hoveredRef.current;
      const hasWatchlist = watchedSystemIds && watchedSystemIds.size > 0;

      for (let i = 0; i < systems.length; i++) {
        const sys = systems[i];
        const isSelected = sys.id === selectedSystemId;
        const isHovered = sys.id === hovered;
        const isWatched = hasWatchlist && watchedSystemIds!.has(sys.id);
        if (!isSelected && !isHovered && !isWatched) continue;

        const { sx, sy } = toScreen(sys.nx, sys.ny);
        if (sx < -50 || sx > w + 50 || sy < -50 || sy > h + 50) continue;
        const v = vitalsMap.get(sys.id);
        if (!v) continue;

        // Watched: amber/gold ring + glow
        if (isWatched && !isSelected && !isHovered) {
          const pulse = Math.sin(t * 0.002 + sys.id * 0.3) * 0.2 + 0.8;
          const sz = 2.5 + sys.depth * 1.5;
          const glowR = sz * 5;
          const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
          glow.addColorStop(0, `rgba(${WATCH_R},${WATCH_G},${WATCH_B},${0.25 * pulse})`);
          glow.addColorStop(0.5, `rgba(${WATCH_R},${WATCH_G},${WATCH_B},${0.08 * pulse})`);
          glow.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.arc(sx, sy, glowR, 0, Math.PI * 2); ctx.fillStyle = glow; ctx.fill();
          ctx.beginPath(); ctx.arc(sx, sy, sz * pulse, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${v.r},${v.g},${v.b},${0.85 * pulse})`; ctx.fill();
          ctx.beginPath(); ctx.arc(sx, sy, sz * 2 + 2, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${WATCH_R},${WATCH_G},${WATCH_B},${0.6 * pulse})`; ctx.lineWidth = 1.2; ctx.stroke();
          ctx.font = "9px system-ui, sans-serif";
          ctx.fillStyle = `rgba(${WATCH_R},${WATCH_G},${WATCH_B},${0.7 * pulse})`;
          ctx.textAlign = "center"; ctx.fillText(sys.name, sx, sy - sz * 2 - 6);
        }

        // Selected or hovered
        if (isSelected || isHovered) {
          const pulse = Math.sin(t * 0.003 + sys.id * 0.7) * 0.2 + 0.8;
          const size = 3 + (v.infrastructureCount / 20) * 4;
          const glowR = (isSelected ? 4 : 3) * size;
          const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
          glow.addColorStop(0, `rgba(${v.r},${v.g},${v.b},${0.3 * pulse})`);
          glow.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.arc(sx, sy, glowR, 0, Math.PI * 2); ctx.fillStyle = glow; ctx.fill();
          ctx.beginPath(); ctx.arc(sx, sy, size * pulse, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${v.r},${v.g},${v.b},${0.9 * pulse})`; ctx.fill();
          ctx.beginPath(); ctx.arc(sx, sy, size * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${0.5 * pulse})`; ctx.fill();
          ctx.font = "11px system-ui, sans-serif"; ctx.fillStyle = "rgba(200,214,229,0.9)";
          ctx.textAlign = "center"; ctx.fillText(sys.name, sx, sy - size * 2 - 5);
          if (isSelected) {
            ctx.beginPath(); ctx.arc(sx, sy, size * 2.5 + 4, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(0,229,255,0.6)"; ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
          }
        }
      }

      // Zoom indicator
      if (vp.scale > 1.05) {
        ctx.font = "10px system-ui, sans-serif";
        ctx.textAlign = "right";
        ctx.fillStyle = "rgba(0,229,255,0.4)";
        ctx.fillText(`${vp.scale.toFixed(1)}x`, w - 12, h - 8);
      }

      frameRef.current = requestAnimationFrame(draw);
    };
    frameRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleDragMove);
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("mousedown", handleMouseDown);
    };
  }, [systems, gateLinks, selectedSystemId, loading, toScreen, fromScreen, activeFilters, watchedSystemIds, vitalsMap, renderStaticLayer]);

  // ── Mouse interaction ──
  const findNearest = useCallback(
    (mx: number, my: number, threshold: number) => {
      let best: number | null = null;
      let bestD = threshold;
      for (const sys of systems) {
        const { sx, sy } = toScreen(sys.nx, sys.ny);
        const d = Math.hypot(sx - mx, sy - my);
        if (d < bestD) { bestD = d; best = sys.id; }
      }
      return best;
    },
    [systems, toScreen]
  );

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isDraggingRef.current) return;
      const r = canvasRef.current?.getBoundingClientRect();
      if (!r) return;
      const nearest = findNearest(e.clientX - r.left, e.clientY - r.top, 15);
      hoveredRef.current = nearest;
      if (canvasRef.current) canvasRef.current.style.cursor = nearest ? "pointer" : vpRef.current.scale > 1 ? "grab" : "crosshair";
    },
    [findNearest]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isDraggingRef.current) return;
      const r = canvasRef.current?.getBoundingClientRect();
      if (!r) return;
      const nearest = findNearest(e.clientX - r.left, e.clientY - r.top, 20);
      onSelectSystem(nearest);
    },
    [findNearest, onSelectSystem]
  );

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      onMouseMove={handleMove}
      onClick={handleClick}
    />
  );
}
