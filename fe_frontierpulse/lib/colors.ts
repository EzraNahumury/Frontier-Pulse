export function getTrustColor(trust: number): string {
  if (trust >= 70) return "rgba(0, 255, 136, 1)";
  if (trust >= 40) return "rgba(255, 152, 0, 1)";
  return "rgba(255, 61, 61, 1)";
}

export function getTrustColorHex(trust: number): string {
  if (trust >= 70) return "#00ff88";
  if (trust >= 40) return "#ff9800";
  return "#ff3d3d";
}

export function getChiColor(score: number): string {
  if (score >= 70) return "#00ff88";
  if (score >= 50) return "#00e5ff";
  if (score >= 30) return "#ff9800";
  return "#ff3d3d";
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "critical": return "#ff3d3d";
    case "high": return "#ff6b35";
    case "medium": return "#ff9800";
    case "warning": return "#ffca28";
    case "info": return "#00e5ff";
    default: return "#5c6b7a";
  }
}

export function getSeverityIcon(severity: string): string {
  switch (severity) {
    case "critical": return "!!";
    case "high": return "!";
    case "medium": return "~";
    case "warning": return "?";
    case "info": return "i";
    default: return "-";
  }
}
