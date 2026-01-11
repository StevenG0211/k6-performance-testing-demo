import http from 'k6/http';
import type { HttpRequestOptions, ApiResponse } from '../types/index.ts';

/**
 * Base URL for API requests (can be overridden via environment variable)
 */
const BASE_URL = __ENV.BASE_URL || 'https://quickpizza.grafana.com';

/**
 * Perform an HTTP GET request
 */
export function get(
  endpoint: string,
  options?: Omit<HttpRequestOptions, 'method'>
): ApiResponse {
  const url = `${BASE_URL}${endpoint}`;
  const params = {
    headers: options?.headers || {},
    tags: options?.tags || {},
  };

  const response = http.get(url, params);

  return {
    status: response.status,
    body: response.body as string,
    headers: response.headers,
    timings: {
      duration: response.timings.duration,
    },
  };
}

/**
 * Perform an HTTP POST request
 */
export function post(
  endpoint: string,
  body?: string | object,
  options?: Omit<HttpRequestOptions, 'method' | 'body'>
): ApiResponse {
  const url = `${BASE_URL}${endpoint}`;
  const params = {
    headers: options?.headers || { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
    tags: options?.tags || {},
  };

  const response = http.post(url, params.body as string, { headers: params.headers, tags: params.tags });

  return {
    status: response.status,
    body: response.body as string,
    headers: response.headers,
    timings: {
      duration: response.timings.duration,
    },
  };
}

/**
 * Verify HTTP response with common checks
 * Returns true if all checks pass, false otherwise
 */
export function verifyResponse(
  response: ApiResponse,
  expectedStatus: number = 200,
  checks?: Record<string, (res: ApiResponse) => boolean>
): boolean {
  const defaultChecks = {
    'status is correct': (res: ApiResponse) => res.status === expectedStatus,
    'response time < 500ms': (res: ApiResponse) => res.timings.duration < 500,
  };

  const allChecks = { ...defaultChecks, ...checks };
  
  // Run all checks and verify they all pass
  for (const [name, checkFn] of Object.entries(allChecks)) {
    if (!checkFn(response)) {
      console.warn(`Check failed: ${name}`);
      return false;
    }
  }

  return true;
}

