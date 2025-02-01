import { Elysia } from 'elysia';

export const rateLimitMiddleware = new Elysia()
  .state('requestCounts', new Map<string, { count: number; timestamp: number }>())
  .derive(({ request, store: { requestCounts }, set }) => {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 100; // 100 requests per window

    const requestData = requestCounts.get(ip) || { count: 0, timestamp: now };

    // Reset if window has passed
    if (now - requestData.timestamp > windowMs) {
      requestData.count = 0;
      requestData.timestamp = now;
    }

    requestData.count++;
    requestCounts.set(ip, requestData);

    if (requestData.count > maxRequests) {
      set.status = 429;
      throw new Error('Too many requests, please try again later.');
    }

    return {};
  }); 