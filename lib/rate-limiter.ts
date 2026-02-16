/**
 * Rate Limiter Implementation
 * Protects API endpoints from abuse and brute force attacks
 */

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per interval
}

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// In production, consider using Redis or a distributed cache
const limitStore = new Map<string, RateLimitStore>();

/**
 * Rate limiter for API endpoints
 */
export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if a request should be allowed
   * Returns true if allowed, false if rate limit exceeded
   */
  async check(identifier: string): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }> {
    const now = Date.now();
    const key = `${identifier}`;
    
    let store = limitStore.get(key);

    // Reset if time window has passed
    if (!store || now > store.resetTime) {
      store = {
        count: 0,
        resetTime: now + this.config.interval,
      };
      limitStore.set(key, store);
    }

    store.count++;

    const success = store.count <= this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - store.count);

    return {
      success,
      limit: this.config.maxRequests,
      remaining,
      reset: store.resetTime,
    };
  }

  /**
   * Cleanup old entries (should be called periodically)
   */
  static cleanup(): void {
    const now = Date.now();
    for (const [key, store] of limitStore.entries()) {
      if (now > store.resetTime) {
        limitStore.delete(key);
      }
    }
  }
}

// Cleanup every 10 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    RateLimiter.cleanup();
  }, 10 * 60 * 1000);
}

/**
 * Pre-configured rate limiters for different use cases
 */
export const rateLimiters = {
  // Strict rate limit for authentication endpoints
  auth: new RateLimiter({
    interval: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  }),

  // Moderate rate limit for API endpoints
  api: new RateLimiter({
    interval: 60 * 1000, // 1 minute
    maxRequests: 60,
  }),

  // Lenient rate limit for general requests
  general: new RateLimiter({
    interval: 60 * 1000, // 1 minute
    maxRequests: 100,
  }),

  // AI endpoints rate limit
  ai: new RateLimiter({
    interval: 60 * 1000, // 1 minute
    maxRequests: 20,
  }),
};

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  return (
    cfConnectingIp ||
    realIp ||
    forwarded?.split(',')[0] ||
    'unknown'
  );
}

/**
 * Create rate limit response
 */
export function createRateLimitResponse(reset: number): Response {
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      resetAt: new Date(reset).toISOString(),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
      },
    }
  );
}
