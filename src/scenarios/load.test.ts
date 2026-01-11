import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';
import { loadTestOptions } from '../config/test-options.ts';
import { get } from '../utils/http-client.ts';
import { logTestInfo } from '../utils/helpers.ts';

// Custom metrics
const httpReqDuration = new Trend('http_req_duration_custom');

/**
 * Load test - normal expected load
 * Uses loadTestOptions configuration from test-options.ts
 */
export const options = loadTestOptions;

export default function (): void {
    logTestInfo('Making GET request to base URL');
    const response = get('/');

    check(response, {
        'status is 200': (r) => r.status === 200,
        'response time < 1000ms': (r) => r.timings.duration < 1000,
    });

    httpReqDuration.add(response.timings.duration);

    sleep(1);
}

/**
 * Setup function - runs once before all VUs
 */
export function setup(): Record<string, unknown> {
    logTestInfo('Load test setup - initializing test data');
    return {
        testStartTime: new Date().toISOString(),
        baseUrl: __ENV.BASE_URL || 'https://quickpizza.grafana.com',
        testType: 'load',
    };
}

/**
 * Teardown function - runs once after all VUs
 */
export function teardown(data: Record<string, unknown>): void {
    logTestInfo('Load test teardown', data);
}

