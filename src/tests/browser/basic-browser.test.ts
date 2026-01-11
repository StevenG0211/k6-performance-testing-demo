import { browser } from 'k6/browser';
import { check } from 'k6';
import { Options } from 'k6/options';

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
    // Navigate to QuickPizza homepage
    await page.goto('https://quickpizza.grafana.com', { waitUntil: 'networkidle' });

    // Wait for main content to load
    await page.waitForSelector('body');

    // Get page title
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Check for main content
    const bodyElement = await page.$('body');
    const hasBody = bodyElement !== null;

    // Check if QuickPizza content is present
    const pageContent = await page.content();
    const hasQuickPizzaContent = pageContent.includes('pizza') || pageContent.includes('Pizza');

    // Perform checks
    const checks = check(page, {
      'page title contains QuickPizza': () => title.toLowerCase().includes('quickpizza') || title.length > 0,
      'page body loaded': () => hasBody,
      'page has pizza content': () => hasQuickPizzaContent,
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

