/**
 * General helper functions for k6 tests
 */

/**
 * Generate a random string of specified length from given charset
 */
function randomString(length: number, charset: string): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomIntBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random email address for testing
 */
export function generateRandomEmail(): string {
  const domains = ['example.com', 'test.com', 'demo.org'];
  const domain = domains[randomIntBetween(0, domains.length - 1)];
  const username = randomString(8, 'abcdefghijklmnopqrstuvwxyz0123456789');
  return `${username}@${domain}`;
}

/**
 * Generate a random user ID
 */
export function generateUserId(): string {
  return randomString(12, 'abcdefghijklmnopqrstuvwxyz0123456789');
}

/**
 * Get a random sleep duration in seconds between min and max
 * Note: Import and use sleep from 'k6' in your test file
 * Example: import { sleep } from 'k6'; sleep(randomSleepDuration(1, 3));
 */
export function randomSleepDuration(min: number, max: number): number {
  return randomIntBetween(min, max);
}

/**
 * Log formatted test information
 * Note: __VU and __ITER are only available during VU execution, not in setup/teardown
 */
export function logTestInfo(message: string, data?: Record<string, unknown>): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const vu = typeof __VU !== 'undefined' ? __VU : 'setup/teardown';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const iter = typeof __ITER !== 'undefined' ? __ITER : '-';
    console.log(`[VU ${vu}, Iteration ${iter}] ${message}`, data || '');
  } catch (e) {
    // Fallback if globals are not available
    console.log(`[Setup/Teardown] ${message}`, data || '');
  }
}

