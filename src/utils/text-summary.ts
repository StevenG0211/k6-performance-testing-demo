/**
 * Text Summary Generation Utilities
 * Generates formatted text summaries for console output
 */

/**
 * Generate text summary for console output
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateTextSummary(summary: any): string {
    const metrics = summary.metrics || {};
    let output = '\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    output += '  Test Execution Summary\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    if (Object.keys(metrics).length > 0) {
        output += 'Metrics:\n';
        for (const [name, metric] of Object.entries(metrics)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const m = metric as any;
            const values = m.values || {};
            if (values.avg !== undefined) {
                output += `  ${name}: avg=${formatMetric(values.avg, name)}`;
                if (values['p(95)'] !== undefined) {
                    output += `, p(95)=${formatMetric(values['p(95)'], name)}`;
                }
                output += '\n';
            }
        }
        output += '\n';
    }

    return output;
}

/**
 * Format metric value with appropriate unit
 */
function formatMetric(value: number, metricName: string): string {
    if (metricName.includes('duration') || metricName.includes('time')) {
        if (value < 1000) {
            return `${value.toFixed(2)}ms`;
        }
        return `${(value / 1000).toFixed(2)}s`;
    }
    if (metricName.includes('rate') || metricName.includes('percent')) {
        return `${(value * 100).toFixed(2)}%`;
    }
    if (typeof value === 'number') {
        return value.toFixed(2);
    }
    return String(value);
}

