import { browser } from 'k6/browser';
import { check } from 'k6';
import { Options } from 'k6/options';
import { generateHtmlReport } from '../../utils/reporting';

/**
 * Basic browser performance test
 * Demonstrates k6 browser API usage
 * Note: Browser tests require k6 with browser extension
 */

export const options: Options = {
  scenarios: {
    ui: {
      executor: 'shared-iterations',
      options: {
        browser: {
          type: 'chromium',
        },
      },
      vus: 1,
      iterations: 1,
    },
  },
  thresholds: {
    checks: ['rate==1.0'],
  },
};

export default async function (): Promise<void> {
  const page = await browser.newPage();

  try {
    // Navigate to a test page
    await page.goto('http://0.0.0.0:80', { waitUntil: 'networkidle' });

    // Wait for content to load
    await page.waitForSelector('h2');

    // Get page title
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Check for h2 element before performing checks
    const h2Element = await page.$('h2');
    const hasH2 = h2Element !== null;

    // Perform checks (k6 check doesn't support async functions)
    const checks = check(page, {
      'page title is not empty': () => title.length > 0,
      'page has h2 element': () => hasH2,
    });

    if (!checks) {
      throw new Error('Browser checks failed');
    }

    // Take a screenshot (optional)
    // await page.screenshot({ path: 'screenshot.png' });
  } finally {
    await page.close();
  }
}

/**
 * Generate HTML report after test execution
 */
export function handleSummary(data: unknown): Record<string, string> {
  const reportName = __ENV.REPORT_NAME || 'basic-browser';
  return generateHtmlReport(data, { reportName });
}

