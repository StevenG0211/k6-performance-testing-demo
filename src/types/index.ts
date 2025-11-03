/**
 * Custom TypeScript type definitions for k6 tests
 */

export interface TestOptions {
  vus?: number;
  duration?: string;
  iterations?: number;
  stages?: Array<{ duration: string; target: number }>;
  thresholds?: Record<string, string[]>;
}

export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string | object;
  tags?: Record<string, string>;
}

export interface ApiResponse {
  status: number;
  body: string;
  headers: Record<string, string>;
  timings: {
    duration: number;
  };
}

