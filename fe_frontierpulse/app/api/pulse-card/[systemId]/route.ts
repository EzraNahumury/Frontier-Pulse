import { NextResponse } from "next/server";
import { fetchAllSystems } from "@/lib/worldApi";
import { getSystemVitals } from "@/lib/vitals";

/**
 * Pulse Card Generator — returns a polished SVG snapshot card.
 * Optimized for Discord/Twitter embeds (600x315).
 *
 * GET /api/pulse-card/30000001
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ systemId: string }> },
) {
  const { systemId } = await params;
  const id = parseInt(systemId, 10);

  const systems = await fetchAllSystems();
  const system = systems.find((s) => s.id === id);
  if (!system) {
    return NextResponse.json({ error: "System not found" }, { status: 404 });
  }

  const v = getSystemVitals(id);
  const trustColor = v.trustLevel >= 70 ? "#00ff88" : v.trustLevel >= 40 ? "#ff9800" : "#ff3d3d";
  const trustLabel = v.trustLevel >= 70 ? "HEALTHY" : v.trustLevel >= 40 ? "STRESSED" : "HOSTILE";
  const chiColor = v.localChi >= 65 ? "#00e5ff" : v.localChi >= 40 ? "#ff9800" : "#ff3d3d";

  // Generate small star dots for background
  const stars = Array.from({ length: 40 }, (_, i) => {
    const x = ((i * 137 + 29) % 580) + 10;
    const y = ((i * 97 + 43) % 295) + 10;
    const o = 0.05 + (i % 5) * 0.03;
    return `<circle cx="${x}" cy="${y}" r="0.6" fill="white" opacity="${o}"/>`;
  }).join("\n  ");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="315" viewBox="0 0 600 315">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="#0a0f1a"/>
      <stop offset="50%" stop-color="#060b14"/>
      <stop offset="100%" stop-color="#04070d"/>
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="20%" r="60%">
      <stop offset="0%" stop-color="${trustColor}" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <linearGradient id="bar-activity" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${v.activityLevel >= 70 ? "#00e5ff" : v.activityLevel >= 40 ? "#ff9800" : "#ff3d3d"}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${v.activityLevel >= 70 ? "#00e5ff" : v.activityLevel >= 40 ? "#ff9800" : "#ff3d3d"}" stop-opacity="0.8"/>
    </linearGradient>
    <linearGradient id="bar-trust" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${trustColor}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${trustColor}" stop-opacity="0.8"/>
    </linearGradient>
    <linearGradient id="bar-tx" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#00e5ff" stop-opacity="0.8"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="600" height="315" fill="url(#bg)" rx="16"/>
  <rect width="600" height="315" fill="url(#glow)" rx="16"/>

  <!-- Stars -->
  ${stars}

  <!-- Outer border -->
  <rect x="0.5" y="0.5" width="599" height="314" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1" rx="16"/>

  <!-- Top section -->
  <text x="28" y="32" font-family="system-ui,-apple-system,sans-serif" font-size="9" font-weight="500" fill="rgba(255,255,255,0.25)" letter-spacing="1.5">FRONTIER PULSE</text>

  <!-- System name + region -->
  <text x="28" y="68" font-family="system-ui,-apple-system,sans-serif" font-size="24" font-weight="700" fill="rgba(255,255,255,0.9)">${escapeXml(system.name)}</text>
  <text x="28" y="86" font-family="system-ui,-apple-system,sans-serif" font-size="10" fill="rgba(255,255,255,0.2)">Region ${system.regionId} · Constellation ${system.constellationId}</text>

  <!-- Trust badge -->
  <rect x="28" y="98" width="${trustLabel.length * 7 + 20}" height="20" rx="10" fill="${trustColor}" fill-opacity="0.1" stroke="${trustColor}" stroke-opacity="0.2" stroke-width="0.5"/>
  <circle cx="40" cy="108" r="2.5" fill="${trustColor}" opacity="0.8"/>
  <text x="48" y="112" font-family="system-ui,-apple-system,sans-serif" font-size="8" font-weight="600" fill="${trustColor}" letter-spacing="1" opacity="0.9">${trustLabel}</text>

  <!-- CHI Score -->
  <text x="540" y="58" font-family="ui-monospace,monospace" font-size="42" font-weight="700" fill="${chiColor}" text-anchor="end" opacity="0.9">${v.localChi}</text>
  <text x="548" y="58" font-family="system-ui,-apple-system,sans-serif" font-size="11" fill="rgba(255,255,255,0.15)">/100</text>
  <text x="540" y="72" font-family="system-ui,-apple-system,sans-serif" font-size="8" fill="rgba(255,255,255,0.15)" text-anchor="end" letter-spacing="1">LOCAL CHI</text>

  <!-- Divider -->
  <line x1="28" y1="132" x2="572" y2="132" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/>

  <!-- Metric bars (thinner, cleaner) -->
  ${bar("ACTIVITY", v.activityLevel, 152, "bar-activity", v.activityLevel >= 70 ? "#00e5ff" : v.activityLevel >= 40 ? "#ff9800" : "#ff3d3d")}
  ${bar("TRUST", v.trustLevel, 180, "bar-trust", trustColor)}
  ${bar("TX FREQ", v.txFrequency, 208, "bar-tx", "#00e5ff")}

  <!-- Stats divider -->
  <line x1="28" y1="236" x2="572" y2="236" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/>

  <!-- Stats row -->
  ${stat("PLAYERS", String(v.playerCount), 28, 258)}
  ${stat("INFRA", String(v.infrastructureCount), 152, 258)}
  ${stat("COMBAT", String(v.combatIncidents), 276, 258, v.combatIncidents > 3 ? "#ff3d3d" : "rgba(255,255,255,0.7)")}
  ${stat("FREQUENCY", String(v.txFrequency), 400, 258)}

  <!-- System ID -->
  <text x="572" y="258" font-family="ui-monospace,monospace" font-size="8" fill="rgba(255,255,255,0.1)" text-anchor="end">ID ${system.id}</text>
  <text x="572" y="272" font-family="system-ui,-apple-system,sans-serif" font-size="7" fill="rgba(255,255,255,0.08)" text-anchor="end">sui-testnet</text>

  <!-- Footer -->
  <line x1="28" y1="290" x2="572" y2="290" stroke="rgba(255,255,255,0.03)" stroke-width="0.5"/>
  <text x="300" y="305" font-family="system-ui,-apple-system,sans-serif" font-size="7" fill="rgba(255,255,255,0.12)" text-anchor="middle" letter-spacing="0.5">Frontier Pulse · EVE Frontier Civilization Health Monitor · frontierpulse.xyz</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=300",
    },
  });
}

function bar(label: string, value: number, y: number, gradientId: string, color: string): string {
  const maxW = 420;
  const fillW = (value / 100) * maxW;
  return `
  <text x="28" y="${y + 4}" font-family="system-ui,-apple-system,sans-serif" font-size="8" fill="rgba(255,255,255,0.2)" letter-spacing="0.8">${label}</text>
  <rect x="105" y="${y - 5}" width="${maxW}" height="8" rx="4" fill="rgba(255,255,255,0.03)"/>
  <rect x="105" y="${y - 5}" width="${fillW}" height="8" rx="4" fill="url(#${gradientId})"/>
  <text x="540" y="${y + 4}" font-family="ui-monospace,monospace" font-size="11" font-weight="600" fill="${color}" text-anchor="end" opacity="0.8">${value}</text>
  `;
}

function stat(label: string, value: string, x: number, y: number, color = "rgba(255,255,255,0.7)"): string {
  return `
  <text x="${x}" y="${y}" font-family="system-ui,-apple-system,sans-serif" font-size="7" fill="rgba(255,255,255,0.15)" letter-spacing="0.8">${label}</text>
  <text x="${x}" y="${y + 16}" font-family="ui-monospace,monospace" font-size="16" font-weight="700" fill="${color}">${value}</text>
  `;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
