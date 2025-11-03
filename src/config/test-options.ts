import { Options } from 'k6/options';

/**
 * Centralized test options and thresholds configuration
 * Single source of truth for all k6 test configurations
 * Following k6 best practices for threshold definitions
 */

/**
 * Default options - used for basic API tests
 */
export const defaultOptions: Options = {
  thresholds: {
    // HTTP request duration thresholds
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% of requests under 500ms, 99% under 1s
    http_req_failed: ['rate<0.01'], // Less than 1% of requests should fail
    http_reqs: ['rate>10'], // More than 10 requests per second
  },
  stages: [
    { duration: '10s', target: 10 }, // Ramp up to 10 VUs
    { duration: '30s', target: 10 }, // Stay at 10 VUs
    { duration: '10s', target: 0 }, // Ramp down to 0 VUs
  ],
};

/**
 * Smoke test - minimal load to verify system functionality
 */
export const smokeTestOptions: Options = {
  vus: 1,
  duration: '15s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

/**
 * Load test - normal expected load
 * Uses ramping stages to gradually increase load
 */
export const loadTestOptions: Options = {
  stages: [
    { duration: '10s', target: 50 }, // Ramp up to 50 VUs
    { duration: '1m', target: 50 }, // Stay at 50 VUs
    { duration: '10s', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};

/**
 * Stress test - beyond normal capacity
 * Tests system behavior under high load
 */
export const stressTestOptions: Options = {
  stages: [
    { duration: '5s', target: 100 },
    { duration: '15s', target: 100 },
    { duration: '5s', target: 200 },
    { duration: '15s', target: 200 },
    { duration: '5s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.05'],
  },
};

/**
 * Spike test - sudden increase in load
 * Tests system's ability to handle traffic spikes
 */
export const spikeTestOptions: Options = {
  stages: [
    { duration: '5s', target: 100 }, // Sudden spike
    { duration: '15s', target: 100 },
    { duration: '5s', target: 0 }, // Sudden drop
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.1'],
  },
};

/**
 * Soak test - sustained load over extended period
 * Tests for memory leaks and system stability over time
 */
export const soakTestOptions: Options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '4m', target: 50 }, // Extended duration
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};

