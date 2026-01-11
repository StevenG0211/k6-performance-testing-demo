import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { soakTestOptions } from '../config/test-options.ts';
import { get, post } from '../utils/http-client.ts';
import { logTestInfo } from '../utils/helpers.ts';

// Custom metrics
const errorRate = new Rate('errors');
const httpReqDuration = new Trend('http_req_duration_custom');

/**
 * Soak test - sustained load over extended period
 * Uses soakTestOptions configuration from test-options.ts
 */
export const options = soakTestOptions;

export default function (): void {
    // Test 1: GET pizza recommendations
    logTestInfo('Making GET request to /api/pizza');
    const getResponse = get('/api/pizza');

    const getChecks = check(getResponse, {
        'GET /api/pizza status is 200': (r) => r.status === 200,
        'GET response time < 1000ms': (r) => r.timings.duration < 1000,
        'GET response has headers': (r) => Object.keys(r.headers).length > 0,
    });

    if (!getChecks) {
        errorRate.add(1);
    }

    httpReqDuration.add(getResponse.timings.duration);

    sleep(1);

    // Test 2: POST pizza rating
    logTestInfo('Making POST request to /api/pizza');
    const postData = {
        pizza: {
            name: 'k6 Soak Test Pizza',
            ingredients: ['tomato', 'mozzarella', 'basil'],
        },
    };

    const postResponse = post('/api/pizza', postData, {
        headers: { 'Content-Type': 'application/json' },
    });

    const postChecks = check(postResponse, {
        'POST /api/pizza status is 200': (r) => r.status === 200,
        'POST response time < 1000ms': (r) => r.timings.duration < 1000,
    });

    if (!postChecks) {
        errorRate.add(1);
    }

    httpReqDuration.add(postResponse.timings.duration);

    sleep(1);
}

/**
 * Setup function - runs once before all VUs
 */
export function setup(): Record<string, unknown> {
    logTestInfo('Soak test setup - initializing test data');
    return {
        testStartTime: new Date().toISOString(),
        baseUrl: __ENV.BASE_URL || 'https://quickpizza.grafana.com',
        testType: 'soak',
    };
}

/**
 * Teardown function - runs once after all VUs
 */
export function teardown(data: Record<string, unknown>): void {
    logTestInfo('Soak test teardown', data);
}

