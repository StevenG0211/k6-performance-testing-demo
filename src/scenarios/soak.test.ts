import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { soakTestOptions } from '../config/test-options';
import { get, post } from '../utils/http-client';
import { logTestInfo } from '../utils/helpers';
import { generateHtmlReport } from '../utils/reporting';

// Custom metrics
const errorRate = new Rate('errors');
const httpReqDuration = new Trend('http_req_duration_custom');

/**
 * Soak test - sustained load over extended period
 * Uses soakTestOptions configuration from test-options.ts
 */
export const options = soakTestOptions;

export default function (): void {
    // Test 1: GET request
    logTestInfo('Making GET request to /get');
    const getResponse = get('/get');

    const getChecks = check(getResponse, {
        'GET status is 200': (r) => r.status === 200,
        'GET response time < 1000ms': (r) => r.timings.duration < 1000,
        'GET response has headers': (r) => Object.keys(r.headers).length > 0,
    });

    if (!getChecks) {
        errorRate.add(1);
    }

    httpReqDuration.add(getResponse.timings.duration);

    sleep(1);

    // Test 2: POST request
    logTestInfo('Making POST request to /post');
    const postData = {
        test: 'k6 soak test',
        timestamp: Date.now(),
    };

    const postResponse = post('/post', postData, {
        headers: { 'Content-Type': 'application/json' },
    });

    const postChecks = check(postResponse, {
        'POST status is 200': (r) => r.status === 200,
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
        baseUrl: __ENV.BASE_URL || 'http://0.0.0.0:80',
        testType: 'soak',
    };
}

/**
 * Teardown function - runs once after all VUs
 */
export function teardown(data: Record<string, unknown>): void {
    logTestInfo('Soak test teardown', data);
}

/**
 * Generate HTML report after test execution
 */
export function handleSummary(data: unknown): Record<string, string> {
    const reportName = __ENV.REPORT_NAME || 'soak';
    return generateHtmlReport(data, { reportName });
}

