/**
 * k6 Reporting Utilities
 * Main entry point for report generation
 * Works with both HTTP API tests and browser tests
 */

import { generateHtmlContent } from './html-report';
import { generateTextSummary } from './text-summary';

interface ReportGenerationOptions {
    reportName?: string;
    outputDir?: string;
}

function sanitizeForFilename(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-+/g, '-');
}

/**
 * Generate HTML report from k6 test results
 * This function should be exported as handleSummary in your test files
 *
 * @param data - k6 test execution summary data
 * @returns Object mapping file paths to report content
 */
export function generateHtmlReport(
    data: unknown,
    options: ReportGenerationOptions = {}
): Record<string, string> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const summary = data as any;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputDir = options.outputDir || 'reports';
        const rawName = options.reportName ? sanitizeForFilename(options.reportName) : '';
        const baseName = rawName.length > 0 ? rawName : 'default';
        const fileName = `report-${baseName}-executed-${timestamp}.html`;
        const reportPath = `${outputDir}/${fileName}`;

        const htmlContent = generateHtmlContent(summary);
        const textContent = generateTextSummary(summary);

        return {
            [reportPath]: htmlContent,
            stdout: textContent,
        };
    } catch (error) {
        // Fallback error handling - ensure we always return something
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error generating HTML report:', errorMessage);
        
        return {
            stdout: `\nError generating report: ${errorMessage}\n`,
        };
    }
}
