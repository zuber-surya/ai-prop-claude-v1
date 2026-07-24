export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number; // Unix timestamp in seconds
}

/**
 * In-memory rate limiter using fixed window algorithm.
 * Note: This is not suitable for production multi-instance deployments.
 * For a single instance (like our local dev or a single server) it's fine.
 */
export class RateLimiter {
  private store: Map<string, { count: number; windowStart: number }>;
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.store = new Map();
    this.limit = limit;
    this.windowMs = windowMs;
  }

  /**
   * Check if the request from the given IP is allowed.
   * @param ip - The IP address of the requester
   * @returns Object indicating if the request is allowed and rate limit info
   */
  consume(ip: string): RateLimitResult {
    const now = Date.now();
    const record = this.store.get(ip);

    if (!record) {
      // First request from this IP
      this.store.set(ip, { count: 1, windowStart: now });
      return {
        success: true,
        limit: this.limit,
        remaining: this.limit - 1,
        resetTime: Math.floor((now + this.windowMs) / 1000),
      };
    }

    const { count, windowStart } = record;
    const windowEnd = windowStart + this.windowMs;

    if (now > windowEnd) {
      // Window has passed, reset
      this.store.set(ip, { count: 1, windowStart: now });
      return {
        success: true,
        limit: this.limit,
        remaining: this.limit - 1,
        resetTime: Math.floor((now + this.windowMs) / 1000),
      };
    }

    // Still within window
    const newCount = count + 1;
    this.store.set(ip, { count: newCount, windowStart });

    if (newCount > this.limit) {
      return {
        success: false,
        limit: this.limit,
        remaining: 0,
        resetTime: Math.floor(windowEnd / 1000),
      };
    }

    return {
      success: true,
      limit: this.limit,
      remaining: this.limit - newCount,
      resetTime: Math.floor(windowEnd / 1000),
    };
  }
}

// Export a singleton instance for the chat API (5 requests per 60 seconds)
export const chatRateLimiter = new RateLimiter(5, 60_000);