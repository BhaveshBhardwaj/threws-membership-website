/**
 * In-memory sliding-window rate limiter for serverless environments.
 *
 * Limitations:
 * - State resets on cold starts / new serverless instances.
 * - Not shared across multiple instances — for production at scale,
 *   use a Redis-backed limiter.
 *
 * This is a reasonable default for low-to-medium traffic sites.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean stale entries every 60 s to prevent memory leaks
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup(windowMs: number): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

/* ─────────────── Preset configurations ─────────────── */

export const RATE_LIMITS = {
  login: { maxRequests: 5, windowMs: 60_000 }, // 5 per minute
  form: { maxRequests: 3, windowMs: 60_000 }, // 3 per minute
  general: { maxRequests: 30, windowMs: 60_000 }, // 30 per minute
  upload: { maxRequests: 10, windowMs: 60_000 }, // 10 per minute
} as const;

type RateLimitPreset = keyof typeof RATE_LIMITS;

interface RateLimitResult {
  success: boolean;
  remaining: number;
  limit: number;
  resetMs: number;
}

/**
 * Check whether an identifier is within its rate limit.
 *
 * @param identifier - Unique string (IP, email, user id, etc.)
 * @param preset     - One of the predefined limit presets.
 * @returns Object with `success`, `remaining`, `limit`, and `resetMs`.
 */
export function rateLimit(
  identifier: string,
  preset: RateLimitPreset = "general"
): RateLimitResult {
  const { maxRequests, windowMs } = RATE_LIMITS[preset];
  const now = Date.now();

  cleanup(windowMs);

  const key = `${preset}:${identifier}`;
  let entry = store.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    const oldest = entry.timestamps[0];
    return {
      success: false,
      remaining: 0,
      limit: maxRequests,
      resetMs: oldest + windowMs - now,
    };
  }

  entry.timestamps.push(now);

  return {
    success: true,
    remaining: maxRequests - entry.timestamps.length,
    limit: maxRequests,
    resetMs: windowMs,
  };
}

/**
 * Extract a client identifier from request headers.
 * Falls back to "unknown" if no IP is available.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
