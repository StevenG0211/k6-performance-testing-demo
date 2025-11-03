/**
 * HTML Report Generation Utilities
 * Generates formatted HTML reports from k6 test results
 */

/**
 * Generate HTML content for the report
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateHtmlContent(summary: any): string {
    const metrics = summary.metrics || {};
    const rootGroup = summary.root_group || {};
    const state = summary.state || {};

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>k6 Test Report - ${new Date().toLocaleString()}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #f5f5f5;
            padding: 20px;
            color: #333;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .header .meta { opacity: 0.9; font-size: 14px; }
        .section {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section h2 {
            color: #667eea;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #f0f0f0;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .metric-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #667eea;
            display: flex;
            flex-direction: column;
            min-width: 0;
            overflow: hidden;
        }
        .metric-card h3 {
            font-size: 12px;
            text-transform: uppercase;
            color: #666;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
            word-break: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
            line-height: 1.4;
            flex-shrink: 0;
        }
        .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            display: flex;
            flex-wrap: wrap;
            align-items: baseline;
            gap: 5px;
            line-height: 1.3;
            min-width: 0;
        }
        .metric-unit {
            font-size: 14px;
            color: #666;
            font-weight: normal;
            flex-shrink: 0;
        }
        .metric-max {
            margin-top: 5px;
            font-size: 12px;
            color: #666;
            flex-shrink: 0;
        }
        .threshold-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            gap: 10px;
            flex-wrap: wrap;
        }
        .threshold-label {
            flex: 1;
            min-width: 0;
            word-break: break-word;
            overflow-wrap: break-word;
        }
        .threshold {
            display: inline-flex;
            align-items: center;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            flex-shrink: 0;
            white-space: nowrap;
        }
        .threshold.pass { background: #d4edda; color: #155724; }
        .threshold.fail { background: #f8d7da; color: #721c24; }
        .checks {
            margin-top: 15px;
        }
        .check-item {
            padding: 10px;
            margin: 5px 0;
            background: #f8f9fa;
            border-radius: 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            min-width: 0;
        }
        .check-name {
            font-weight: 500;
            flex: 1;
            min-width: 0;
            word-break: break-word;
            overflow-wrap: break-word;
        }
        .check-result {
            font-size: 14px;
            font-weight: 600;
            flex-shrink: 0;
            white-space: nowrap;
        }
        .check-pass { color: #28a745; }
        .check-fail { color: #dc3545; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
        }
        th {
            background: #f8f9fa;
            font-weight: 600;
            color: #666;
            text-transform: uppercase;
            font-size: 12px;
        }
        tr:hover { background: #f8f9fa; }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 14px;
        }
        @media (max-width: 768px) {
            .metrics-grid {
                grid-template-columns: 1fr;
            }
            body {
                padding: 10px;
            }
            .container {
                padding: 0;
            }
            .section {
                padding: 15px;
            }
            .metric-value {
                font-size: 20px;
            }
            .header {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>k6 Performance Test Report</h1>
            <div class="meta">
                Generated: ${new Date().toLocaleString()}<br>
                Test State: ${state.testRunDurationMs ? 'Completed' : 'Running'}
            </div>
        </div>`;

    // Metrics section
    html += `
        <div class="section">
            <h2>Metrics Overview</h2>
            <div class="metrics-grid">`;

    for (const [name, metric] of Object.entries(metrics)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const m = metric as any;
        const values = m.values || {};
        
        // Handle different metric types
        // Counter metrics: use count
        // Gauge metrics: use value or max
        // Trend metrics: use avg
        // Rate metrics: use rate or passes/fails
        let primaryValue: string | number | null = null;
        let p95: string | null = null;
        let max: string | null = null;
        
        // Counter metrics (iterations, http_reqs, data_sent, data_received)
        if (values.count !== undefined) {
            primaryValue = formatMetric(values.count, name);
            max = values.max !== undefined ? formatMetric(values.max, name) : null;
        }
        // Gauge metrics (vus, vus_max)
        else if (values.value !== undefined) {
            primaryValue = formatMetric(values.value, name);
            max = values.max !== undefined ? formatMetric(values.max, name) : null;
        }
        // Trend metrics (durations, times)
        else if (values.avg !== undefined) {
            primaryValue = formatMetric(values.avg, name);
            p95 = values['p(95)'] !== undefined ? formatMetric(values['p(95)'], name) : null;
            max = values.max !== undefined ? formatMetric(values.max, name) : null;
        }
        // Rate metrics (http_req_failed, checks)
        else if (values.rate !== undefined) {
            primaryValue = formatMetric(values.rate, name);
            if (values.passes !== undefined && values.fails !== undefined) {
                const total = values.passes + values.fails;
                max = `${values.passes}/${total}`;
            }
        }
        // Fallback: try to find any numeric value
        else if (values.max !== undefined) {
            primaryValue = formatMetric(values.max, name);
            max = null;
        }
        
        // If still no value found, show N/A
        const displayValue = primaryValue !== null ? primaryValue : 'N/A';

        html += `
                <div class="metric-card">
                    <h3>${escapeHtml(name)}</h3>
                    <div class="metric-value">
                        <span>${displayValue}</span>
                        ${p95 ? `<span class="metric-unit">(p95: ${p95})</span>` : ''}
                    </div>
                    ${max && max !== displayValue ? `<div class="metric-max">Max: ${max}</div>` : ''}
                </div>`;
    }

    html += `
            </div>
        </div>`;

    // Thresholds section
    if (metrics.http_req_duration || metrics.http_req_failed) {
        html += `
        <div class="section">
            <h2>Thresholds</h2>`;

        if (metrics.http_req_duration) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const m = metrics.http_req_duration as any;
            const thresholds = m.thresholds || {};
            for (const [threshold, result] of Object.entries(thresholds)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const r = result as any;
                const passed = r.ok === true;
                html += `
            <div class="threshold-item">
                <span class="threshold-label">${escapeHtml(threshold)}</span>
                <span class="threshold ${passed ? 'pass' : 'fail'}">${passed ? '✓ PASS' : '✗ FAIL'}</span>
            </div>`;
            }
        }

        html += `
        </div>`;
    }

    // Checks section
    if (rootGroup.checks && rootGroup.checks.length > 0) {
        html += `
        <div class="section">
            <h2>Checks</h2>
            <div class="checks">`;

        for (const check of rootGroup.checks) {
            const total = (check.passes || 0) + (check.fails || 0);
            if (total > 0) {
                const passRate = (check.passes || 0) / total;
                const passed = (check.fails || 0) === 0;
                html += `
                    <div class="check-item">
                        <span class="check-name">${escapeHtml(check.name || 'Unknown check')}</span>
                        <span class="check-result ${passed ? 'check-pass' : 'check-fail'}">
                            ${check.passes || 0}/${total} (${(passRate * 100).toFixed(1)}%)
                        </span>
                    </div>`;
            }
        }

        html += `
            </div>
        </div>`;
    }

    html += `
        <div class="footer">
            Generated by k6 Performance Testing Framework
        </div>
    </div>
</body>
</html>`;

    return html;
}

/**
 * Escape HTML to prevent XSS and ensure proper rendering
 */
function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Format metric value with appropriate unit
 */
function formatMetric(value: number, metricName: string): string {
    // Handle large numbers with commas for readability
    const formatNumber = (num: number): string => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(2)}M`;
        }
        if (num >= 1000) {
            return `${(num / 1000).toFixed(2)}K`;
        }
        return num.toFixed(2);
    };
    
    // Duration/time metrics
    if (metricName.includes('duration') || metricName.includes('time') || metricName.includes('waiting') || metricName.includes('connecting') || metricName.includes('sending') || metricName.includes('receiving') || metricName.includes('blocked') || metricName.includes('tls')) {
        if (value < 1000) {
            return `${value.toFixed(2)}ms`;
        }
        return `${(value / 1000).toFixed(2)}s`;
    }
    
    // Rate/percentage metrics
    if (metricName.includes('rate') || metricName.includes('percent') || metricName.includes('failed')) {
        return `${(value * 100).toFixed(2)}%`;
    }
    
    // Data metrics (bytes)
    if (metricName.includes('data_sent') || metricName.includes('data_received')) {
        if (value >= 1073741824) {
            return `${(value / 1073741824).toFixed(2)}GB`;
        }
        if (value >= 1048576) {
            return `${(value / 1048576).toFixed(2)}MB`;
        }
        if (value >= 1024) {
            return `${(value / 1024).toFixed(2)}KB`;
        }
        return `${value.toFixed(0)}B`;
    }
    
    // Counter metrics (iterations, http_reqs, checks) - use comma formatting for large numbers
    if (metricName.includes('iterations') || metricName.includes('http_reqs') || metricName.includes('checks') || metricName.includes('vus')) {
        if (value >= 1) {
            const rounded = Math.round(value);
            return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        return formatNumber(value);
    }
    
    // Default: format as number
    if (typeof value === 'number') {
        return formatNumber(value);
    }
    
    return String(value);
}

