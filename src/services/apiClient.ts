const SIMULATED_LATENCY_MS = 140;

export async function withMockLatency<T>(producer: () => T, ms = SIMULATED_LATENCY_MS): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, ms));
  return producer();
}

const OFFLINE_CACHE_PREFIX = 'wingo-offline-cache:';

export function writeOfflineCache<T>(key: string, data: T): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(`${OFFLINE_CACHE_PREFIX}${key}`, JSON.stringify(data));
    }
  } catch {
    // Ignore storage quota errors cleanly
  }
}

export function readOfflineCache<T>(key: string): T | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(`${OFFLINE_CACHE_PREFIX}${key}`);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
