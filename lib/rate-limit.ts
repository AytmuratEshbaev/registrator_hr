import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS } from "@/lib/constants";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

// ---------------------------------------------------------------------------
// Upstash Redis (production) — barcha serverless nusxalar uchun YAGONA hisoblagich.
// Sozlanmagan bo'lsa (lokal dev), in-memory zaxiraga tushadi.
// ---------------------------------------------------------------------------
const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasUpstash ? Redis.fromEnv() : null;

// Har xil (max, window) konfiguratsiyasi uchun limiter'larni keshlaymiz.
const limiterCache = new Map<string, Ratelimit>();

function getLimiter(max: number, windowMs: number): Ratelimit | null {
  if (!redis) return null;
  const cacheKey = `${max}:${windowMs}`;
  let limiter = limiterCache.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(max, `${windowMs} ms`),
      prefix: "zeyin-rl",
      analytics: false,
    });
    limiterCache.set(cacheKey, limiter);
  }
  return limiter;
}

// ---------------------------------------------------------------------------
// In-memory zaxira (faqat lokal dev / Upstash yo'q holatda).
// ---------------------------------------------------------------------------
interface Bucket {
  count: number;
  resetAt: number;
}
const buckets = new Map<string, Bucket>();

function rateLimitInMemory(key: string, max: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: max - 1, resetAt };
  }
  if (existing.count >= max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }
  existing.count += 1;
  return { allowed: true, remaining: max - existing.count, resetAt: existing.resetAt };
}

export async function rateLimit(
  key: string,
  opts: { max?: number; windowMs?: number } = {}
): Promise<RateLimitResult> {
  const max = opts.max ?? RATE_LIMIT_MAX_REQUESTS;
  const windowMs = opts.windowMs ?? RATE_LIMIT_WINDOW_MS;

  const limiter = getLimiter(max, windowMs);
  if (limiter) {
    try {
      const res = await limiter.limit(key);
      return {
        allowed: res.success,
        remaining: res.remaining,
        resetAt: res.reset,
      };
    } catch (err) {
      // Upstash mavjud emas/xato bo'lsa — so'rovni bloklamaymiz, zaxiraga tushamiz.
      console.error("[rate-limit] upstash error, falling back to memory:", err);
    }
  }

  return rateLimitInMemory(key, max, windowMs);
}

export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
