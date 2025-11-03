# k6 Performance Testing Project (Local Execution)

A local-first k6 performance testing project with TypeScript support, following Grafana k6 best practices. The sample tests target an httpbin instance that you run yourself in Docker; no remote services or hosted CI pipelines are required.

## Features

- ✅ **TypeScript** - Full type safety and better code readability
- ✅ **Webpack Bundling** - Compile TypeScript to k6-compatible JavaScript
- ✅ **Code Quality** - ESLint and Prettier configured
- ✅ **Organized Structure** - Separated tests, utilities, scenarios, and configs
- ✅ **Example Tests** - HTTP API and browser testing examples
- ✅ **Reusable Utilities** - HTTP client and helper functions
- ✅ **Pre-configured Scenarios** - Load, stress, spike, and soak test templates
- ✅ **HTML Reports** - Automatic HTML report generation saved under `reports/`
- ✅ **Sample CI Workflow** - Optional GitHub Actions example for sequential runs (disabled by default)

## Prerequisites

- [k6](https://k6.io/docs/getting-started/installation/) installed on your system
- Node.js 16+ and npm installed
- [Docker](https://www.docker.com/get-started) installed and running (required to host the local httpbin target)
- For browser tests: k6 with browser extension (`xk6-browser`)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install k6 (if not already installed):
```bash
# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
winget install k6
```

3. Start the httpbin Docker container (required for running tests locally):
```bash
docker run -d -p 80:80 --name httpbin kennethreitz/httpbin
```

The httpbin service will be available at `http://0.0.0.0:80` (or `http://localhost:80`).

**Docker Container Management:**
```bash
# Stop the container
docker stop httpbin

# Start the container (if it already exists)
docker start httpbin

# Remove the container
docker rm httpbin

# View container logs
docker logs httpbin
```

4. Create a `.env` file in the project root (optional, for custom BASE_URL):
```bash
BASE_URL=http://0.0.0.0:80
```

**Note:** If you don't create a `.env` file, tests will default to `http://0.0.0.0:80`. You can override the BASE_URL by setting it as an environment variable when running tests.

## Project Structure

```
k6-demo/
├── src/
│   ├── tests/
│   │   ├── api/              # HTTP API tests
│   │   └── browser/          # Browser-based tests
│   ├── scenarios/            # Load test scenario configurations
│   ├── utils/                # Reusable utility functions
│   │   ├── http-client.ts    # HTTP request utilities
│   │   ├── helpers.ts        # Helper functions
│   │   └── reporting.ts      # HTML report generation
│   ├── types/                # TypeScript type definitions
│   └── config/               # Test options and thresholds
├── dist/                     # Compiled/bundled output (gitignored)
├── reports/                  # HTML test reports (gitignored)
├── package.json
├── tsconfig.json
├── webpack.config.js
└── README.md
```

## Usage

### Build

Compile TypeScript and bundle for k6:
```bash
npm run build
```

### Run Tests

Each npm test script:
1. Cleans previous build artifacts and reports
2. Creates the `reports/` directory
3. Builds the TypeScript project
4. Runs the selected k6 bundle
5. Generates a timestamped HTML report

**Available Test Commands:**
```bash
npm run test:api      # API performance tests
npm run test:browser  # Browser-based tests
npm run test:load     # Normal expected load
npm run test:stress   # Beyond normal capacity
npm run test:spike    # Sudden increase in load
npm run test:soak     # Sustained load over extended period
```

**Run a specific bundled test directly:**
```bash
# Build first
npm run build

# Then run the bundled test
k6 run dist/api.bundle.js
```

**Run with custom BASE_URL:**
```bash
# Using environment variable
BASE_URL=http://0.0.0.0:80 npm run test:api

# Or create a .env file (see Installation step 4)
npm run test:api
```

**Open Latest Report Manually:**
```bash
# Open the most recent report in your browser
npm run open:report
```

**View HTML Reports:**

After running any test, HTML reports are automatically generated in the `reports/` directory:
```bash
# Open the latest report manually
npm run open:report

# Or list all reports
ls -lh reports/

# Or open a specific report
open reports/report-2025-11-03T18-38-57-941Z.html
```

Each locally executed test generates a timestamped HTML report with:
- Test execution summary
- Metrics visualization (HTTP requests, duration, failures)
- Threshold pass/fail status
- Check results
- Browser metrics (for browser tests)

### Code Quality

**Lint:**
```bash
npm run lint
```

**Fix linting issues:**
```bash
npm run lint:fix
```

**Format code:**
```bash
npm run format
```

**Check formatting:**
```bash
npm run format:check
```

### Clean Build Artifacts

```bash
npm run clean
```

## Writing Tests

### Basic API Test

```typescript
import { check } from 'k6';
import { defaultOptions } from '../config/test-options';
import { get } from '../utils/http-client';

export const options = defaultOptions;

export default function () {
  const response = get('/get');
  check(response, {
    'status is 200': (r) => r.status === 200,
  });
}
```

### Using Scenario Configurations

```typescript
import { loadTestOptions } from '../config/test-options';

export const options = loadTestOptions;

export default function () {
  // Your test code
  // BASE_URL is automatically used from http-client utility
}
```

### Using Utilities

```typescript
import { get, verifyResponse } from '../utils/http-client';
import { logTestInfo } from '../utils/helpers';

export default function () {
  logTestInfo('Starting test');
  const response = get('/api/endpoint');
  verifyResponse(response, 200);
}
```

## Configuration

### Environment Variables

Create a `.env` file in the project root to configure the base URL for your tests:

```bash
BASE_URL=http://0.0.0.0:80
```

The `BASE_URL` environment variable is used by the HTTP client utilities to determine which API endpoint to test against. If not set, it defaults to `http://0.0.0.0:80` (local httpbin instance).

**Note:** The `.env` file is gitignored, so you can safely store local configuration without committing it.

### Test Options

Edit `src/config/test-options.ts` to customize default thresholds and test stages. This is the single source of truth for all test configurations including:
- `defaultOptions` - Basic API tests
- `smokeTestOptions` - Minimal load testing
- `loadTestOptions` - Normal expected load
- `stressTestOptions` - Beyond normal capacity
- `spikeTestOptions` - Sudden traffic spikes
- `soakTestOptions` - Sustained load over extended period

### TypeScript

Edit `tsconfig.json` to adjust TypeScript compiler options.

### Webpack

Edit `webpack.config.js` to modify bundling configuration or add new entry points.

## Reporting

All tests automatically generate HTML reports using [k6-reporter](https://github.com/benc-uk/k6-reporter). Reports are saved to the `reports/` directory with timestamps.

**Report Features:**
- Visual metrics dashboard
- Threshold pass/fail indicators
- HTTP request statistics
- Browser performance metrics (for browser tests)
- Check results summary
- Easy-to-share HTML format

**Accessing Reports:**
```bash
# View the latest report
open reports/report-*.html

# Or open a specific report
open reports/report-2024-11-01T21-30-00-000Z.html
```

Reports are automatically generated after each test run and include both console output and HTML visualization.

## Best Practices

1. **Use Scenarios** - Define different user behaviors using scenarios
2. **Set Thresholds** - Always define performance thresholds for your tests
3. **Use Checks** - Validate responses to ensure correctness
4. **Organize Code** - Keep tests, utilities, and configs separated
5. **Reuse Utilities** - Create reusable functions for common operations
6. **Type Safety** - Leverage TypeScript for better code quality
7. **Review Reports** - Always check HTML reports for detailed performance insights

## GitHub Actions Sample (Optional)

A reference workflow lives in `.github/workflows/k6-tests.yml`. It demonstrates how to run the bundled tests sequentially and upload HTML report artifacts, but it is intentionally scoped to a dummy branch so it will not execute unless you opt in.

## Resources

- [k6 Documentation](https://grafana.com/docs/k6/latest/)
- [k6 JavaScript API](https://grafana.com/docs/k6/latest/javascript-api/)
- [k6 Examples](https://grafana.com/docs/k6/latest/examples/)
- [k6 Scenarios](https://grafana.com/docs/k6/latest/using-k6/scenarios/)

## License

ISC

