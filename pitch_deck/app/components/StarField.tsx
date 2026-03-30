"use client";

import { useEffect, useRef } from "react";

/*
  Neural Network Background
  -------------------------
  A living neural network that responds to user interaction:
  - Neurons arranged in organic clusters across the page
  - Synaptic connections draw between nearby neurons
  - Cursor proximity triggers activation cascades (rippling glow)
  - Scrolling sends waves of neural activity through the network
  - Signal pulses travel along connections like neurotransmitters
  - Ambient "breathing" keeps the network alive even when idle
*/

interface Neuron {
  // Base position (world space)
  bx: number;
  by: number;
  // Rendered position
  x: number;
  y: number;
  radius: number;
  // Activation level 0-1 (cursor/scroll driven)
  activation: number;
  // Base ambient pulse phase
  phase: number;
  // Depth layer for parallax
  layer: number;
  // Color palette index
  color: number;
  // Drift offset (organic floating)
  driftX: number;
  driftY: number;
  driftSpeed: number;
  // Ring pulse timer (when activated)
  ringTimer: number;
}

interface Synapse {
  from: number;
  to: number;
  strength: number; // base opacity
  signal: number; // 0-1, animated signal traveling along
  signalActive: boolean;
  signalSpeed: number;
  signalColor: number;
  drawn: number; // 0-1, how much of the line is drawn
}

// Color palette — cyan, emerald, violet
const PALETTE = [
  [0, 212, 255],   // cyan
  [16, 185, 129],  // emerald
  [139, 92, 246],  // violet
];

// Secondary glow colors (warmer for activation)
const ACTIVATION_COLORS = [
  [80, 230, 255],  // bright cyan
  [52, 211, 153],  // bright emerald
  [167, 139, 250], // bright violet
];

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    // Mouse state (smooth interpolated)
    let mouseX = -9999;
    let mouseY = -9999;
    let smoothMouseX = -9999;
    let smoothMouseY = -9999;
    let mouseActive = false;

    // Scroll state
    let scrollY = 0;
    let prevScrollY = 0;
    let scrollVelocity = 0;
    let scrollWaveOrigin = 0; // Y position where last scroll wave started
    let scrollWaveTime = 0;

    const neurons: Neuron[] = [];
    const synapses: Synapse[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const init = () => {
      resize();
      neurons.length = 0;
      synapses.length = 0;

      const W = canvas.width;
      const H = canvas.height;
      const pageH = Math.max(document.body.scrollHeight, H * 5);
      const virtualH = pageH * 0.85;

      // Create neurons in organic clusters
      const clusterCount = Math.floor((W * virtualH) / (300 * 300));
      const neuronCount = Math.min(clusterCount * 6, 450);

      // Generate cluster centers
      const clusters: { x: number; y: number }[] = [];
      for (let i = 0; i < clusterCount; i++) {
        clusters.push({
          x: Math.random() * W,
          y: Math.random() * virtualH,
        });
      }

      // Place neurons around clusters with some randomness
      for (let i = 0; i < neuronCount; i++) {
        const cluster = clusters[i % clusters.length];
        const spread = 100 + Math.random() * 120;
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * spread;

        neurons.push({
          bx: cluster.x + Math.cos(angle) * dist,
          by: cluster.y + Math.sin(angle) * dist,
          x: 0,
          y: 0,
          radius: 1.5 + Math.random() * 2.5,
          activation: 0,
          phase: Math.random() * Math.PI * 2,
          layer: Math.random(),
          color: Math.floor(Math.random() * 3),
          driftX: Math.random() * Math.PI * 2,
          driftY: Math.random() * Math.PI * 2,
          driftSpeed: 0.3 + Math.random() * 0.7,
          ringTimer: 0,
        });
      }

      // Create synapses between nearby neurons
      const maxDist = 180;
      for (let i = 0; i < neurons.length; i++) {
        let connections = 0;
        for (let j = i + 1; j < neurons.length; j++) {
          if (connections >= 4) break;
          const dx = neurons[i].bx - neurons[j].bx;
          const dy = neurons[i].by - neurons[j].by;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxDist && Math.random() < 0.4) {
            synapses.push({
              from: i,
              to: j,
              strength: 0.06 + Math.random() * 0.14,
              signal: 0,
              signalActive: false,
              signalSpeed: 0.008 + Math.random() * 0.015,
              signalColor: Math.floor(Math.random() * 3),
              drawn: 0,
            });
            connections++;
          }
        }
      }
    };

    // --- Event handlers ---
    const onMouse = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseActive = true;
    };

    const onMouseLeave = () => {
      mouseActive = false;
    };

    const onScroll = () => {
      scrollY = window.scrollY;
    };

    // --- Main render loop ---
    const draw = (t: number) => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Smooth mouse interpolation
      if (mouseActive) {
        smoothMouseX += (mouseX - smoothMouseX) * 0.08;
        smoothMouseY += (mouseY - smoothMouseY) * 0.08;
      } else {
        smoothMouseX += (-9999 - smoothMouseX) * 0.02;
        smoothMouseY += (-9999 - smoothMouseY) * 0.02;
      }

      // Scroll velocity tracking
      const rawVelocity = Math.abs(scrollY - prevScrollY);
      scrollVelocity = scrollVelocity * 0.88 + rawVelocity * 0.12;
      if (rawVelocity > 3) {
        scrollWaveOrigin = scrollY + H / 2;
        scrollWaveTime = t;
      }
      prevScrollY = scrollY;

      const scrollOffset = scrollY * 0.35;
      const viewCenterY = scrollOffset + H / 2;

      // Scroll wave age (ms since last scroll impulse)
      const waveAge = t - scrollWaveTime;
      const waveRadius = waveAge * 0.6; // expands over time
      const waveFade = Math.max(0, 1 - waveAge / 2500);

      // ============================================================
      //  UPDATE NEURONS
      // ============================================================
      for (const n of neurons) {
        // Organic drift
        const driftAmt = 8;
        const driftOffsetX = Math.sin(t * 0.0004 * n.driftSpeed + n.driftX) * driftAmt;
        const driftOffsetY = Math.cos(t * 0.0003 * n.driftSpeed + n.driftY) * driftAmt;

        // World to screen
        let nx = n.bx + driftOffsetX;
        let ny = n.by - scrollOffset + driftOffsetY;

        // Mouse parallax
        if (mouseActive) {
          const pf = 0.1 + n.layer * 0.3;
          const mxNorm = (smoothMouseX / W - 0.5) * 2;
          const myNorm = (smoothMouseY / H - 0.5) * 2;
          nx += mxNorm * 18 * pf;
          ny += myNorm * 18 * pf;
        }

        n.x = nx;
        n.y = ny;

        // --- Activation from cursor proximity ---
        let cursorActivation = 0;
        if (mouseActive) {
          const dx = n.x - smoothMouseX;
          const dy = n.y - smoothMouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const activationRadius = 200;
          if (dist < activationRadius) {
            cursorActivation = Math.pow(1 - dist / activationRadius, 1.5);
          }
        }

        // --- Activation from scroll wave ---
        let scrollActivation = 0;
        if (waveFade > 0.01) {
          const worldY = n.by;
          const distFromWave = Math.abs(worldY - scrollWaveOrigin + scrollOffset);
          const waveBand = 100;
          if (Math.abs(distFromWave - waveRadius) < waveBand) {
            scrollActivation = waveFade * (1 - Math.abs(distFromWave - waveRadius) / waveBand);
          }
        }

        // --- Activation from scroll velocity (global boost) ---
        const velocityBoost = Math.min(scrollVelocity * 0.03, 0.4);

        // Combine activations
        const targetActivation = Math.min(1, cursorActivation + scrollActivation * 0.7 + velocityBoost * 0.3);
        n.activation += (targetActivation - n.activation) * 0.08;

        // Ring timer
        if (n.activation > 0.4 && n.ringTimer <= 0) {
          n.ringTimer = 1;
        }
        if (n.ringTimer > 0) {
          n.ringTimer -= 0.015;
        }

        // Viewport brightness (dim neurons far from view center)
        const distFromCenter = Math.abs(n.by - viewCenterY);
        const viewRadius = H * 0.9;
        const viewFactor = Math.max(0, 1 - distFromCenter / viewRadius);
        n.activation *= viewFactor > 0 ? 1 : 0;
      }

      // ============================================================
      //  DRAW SYNAPSES
      // ============================================================
      for (const s of synapses) {
        const a = neurons[s.from];
        const b = neurons[s.to];

        const margin = 100;
        const aVis = a.x > -margin && a.x < W + margin && a.y > -margin && a.y < H + margin;
        const bVis = b.x > -margin && b.x < W + margin && b.y > -margin && b.y < H + margin;

        if (!aVis && !bVis) {
          s.drawn = Math.max(0, s.drawn - 0.02);
          continue;
        }

        // Draw-in animation
        s.drawn = Math.min(1, s.drawn + 0.025);

        const avgActivation = (a.activation + b.activation) / 2;
        const baseAlpha = s.strength * s.drawn;
        const activatedAlpha = baseAlpha + avgActivation * 0.3;

        if (activatedAlpha < 0.003) continue;

        const tint = PALETTE[s.signalColor];

        // End point based on drawn amount
        const endX = a.x + (b.x - a.x) * s.drawn;
        const endY = a.y + (b.y - a.y) * s.drawn;

        // Base connection line
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `rgba(${tint[0]},${tint[1]},${tint[2]},${activatedAlpha * 0.5})`;
        ctx.lineWidth = 0.5 + avgActivation * 1.0;
        ctx.stroke();

        // Activated glow line (thicker, brighter when neurons are active)
        if (avgActivation > 0.15) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = `rgba(${tint[0]},${tint[1]},${tint[2]},${avgActivation * 0.2})`;
          ctx.lineWidth = 2 + avgActivation * 3;
          ctx.stroke();
        }

        // --- Signal pulse along synapse ---
        // Trigger signals when activation is high or scrolling
        if (!s.signalActive && s.drawn > 0.5) {
          const triggerChance = 0.003 + avgActivation * 0.04 + scrollVelocity * 0.005;
          if (Math.random() < triggerChance) {
            s.signalActive = true;
            s.signal = 0;
          }
        }

        if (s.signalActive) {
          s.signal += s.signalSpeed + avgActivation * 0.01 + scrollVelocity * 0.002;
          if (s.signal >= 1) {
            s.signalActive = false;
            s.signal = 0;
          } else {
            const px = a.x + (b.x - a.x) * s.signal;
            const py = a.y + (b.y - a.y) * s.signal;
            const fadeIn = s.signal < 0.1 ? s.signal * 10 : 1;
            const fadeOut = s.signal > 0.85 ? (1 - s.signal) * 6.67 : 1;
            const fade = fadeIn * fadeOut;

            const at = ACTIVATION_COLORS[s.signalColor];

            // Signal outer glow
            ctx.beginPath();
            ctx.arc(px, py, 8 + avgActivation * 6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${at[0]},${at[1]},${at[2]},${fade * 0.08})`;
            ctx.fill();

            // Signal core
            ctx.beginPath();
            ctx.arc(px, py, 2 + avgActivation * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${at[0]},${at[1]},${at[2]},${fade * 0.8})`;
            ctx.fill();

            // Signal white hot center
            ctx.beginPath();
            ctx.arc(px, py, 1, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${fade * 0.6})`;
            ctx.fill();
          }
        }
      }

      // ============================================================
      //  DRAW NEURONS
      // ============================================================
      for (const n of neurons) {
        if (n.x < -50 || n.x > W + 50 || n.y < -50 || n.y > H + 50) continue;

        const distFromCenter = Math.abs(n.by - viewCenterY);
        const viewRadius = H * 0.9;
        const viewFactor = Math.max(0, 1 - distFromCenter / viewRadius);
        if (viewFactor < 0.01) continue;

        const pulse = Math.sin(t * 0.0012 + n.phase) * 0.15 + 0.85;
        const tint = PALETTE[n.color];
        const at = ACTIVATION_COLORS[n.color];
        const alpha = (0.25 + n.activation * 0.75) * pulse * viewFactor;

        // --- Activation ring (expanding ring when neuron fires) ---
        if (n.ringTimer > 0) {
          const ringProgress = 1 - n.ringTimer;
          const ringRadius = n.radius * (3 + ringProgress * 20);
          const ringAlpha = n.ringTimer * 0.25 * viewFactor;

          ctx.beginPath();
          ctx.arc(n.x, n.y, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${at[0]},${at[1]},${at[2]},${ringAlpha})`;
          ctx.lineWidth = 1.5 * n.ringTimer;
          ctx.stroke();
        }

        // --- Outer glow (activation-dependent) ---
        if (n.activation > 0.1) {
          const glowR = n.radius * (6 + n.activation * 12);
          const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
          grad.addColorStop(0, `rgba(${at[0]},${at[1]},${at[2]},${n.activation * 0.12 * viewFactor})`);
          grad.addColorStop(0.5, `rgba(${at[0]},${at[1]},${at[2]},${n.activation * 0.04 * viewFactor})`);
          grad.addColorStop(1, `rgba(${at[0]},${at[1]},${at[2]},0)`);
          ctx.beginPath();
          ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // --- Ambient soft glow ---
        if (alpha > 0.08) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius * 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${tint[0]},${tint[1]},${tint[2]},${alpha * 0.04})`;
          ctx.fill();
        }

        // --- Neuron body ---
        const bodyRadius = n.radius * (0.7 + n.activation * 0.5);
        ctx.beginPath();
        ctx.arc(n.x, n.y, bodyRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${tint[0]},${tint[1]},${tint[2]},${alpha * 0.75})`;
        ctx.fill();

        // --- Bright center (soma) ---
        if (alpha > 0.15) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, bodyRadius * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${alpha * 0.5 + n.activation * 0.3})`;
          ctx.fill();
        }
      }

      // ============================================================
      //  CURSOR AURA (soft radial glow that follows the mouse)
      // ============================================================
      if (mouseActive && smoothMouseX > -999) {
        const auraRadius = 160 + scrollVelocity * 2;
        const grad = ctx.createRadialGradient(
          smoothMouseX, smoothMouseY, 0,
          smoothMouseX, smoothMouseY, auraRadius
        );
        grad.addColorStop(0, `rgba(0, 212, 255, 0.04)`);
        grad.addColorStop(0.3, `rgba(139, 92, 246, 0.02)`);
        grad.addColorStop(1, `rgba(0, 0, 0, 0)`);
        ctx.beginPath();
        ctx.arc(smoothMouseX, smoothMouseY, auraRadius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    init();
    animId = requestAnimationFrame(draw);
    window.addEventListener("resize", init);
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", init);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
