const ORACLE_BACKEND_BASE = (
  process.env.ORACLE_BACKEND_URL ||
  process.env.NEXT_PUBLIC_ORACLE_BACKEND_URL ||
  "https://oracle-fp.up.railway.app"
).trim().replace(/\/+$/, "");

export function hasOracleBackend(): boolean {
  return ORACLE_BACKEND_BASE.length > 0;
}

function buildOracleUrl(path: string): string | null {
  if (!ORACLE_BACKEND_BASE) return null;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${ORACLE_BACKEND_BASE}${normalizedPath}`;
}

export async function fetchOracleBackendJson<T>(
  path: string,
  timeoutMs = 8000,
): Promise<T | null> {
  const url = buildOracleUrl(path);
  if (!url) return null;

  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
