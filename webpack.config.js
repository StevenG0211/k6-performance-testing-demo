const path = require('path');
const webpack = require('webpack');

// k6 modules are provided by the k6 runtime, not npm packages
const k6Externals = {
  'k6': 'commonjs k6',
  'k6/http': 'commonjs k6/http',
  'k6/browser': 'commonjs k6/browser',
  'k6/metrics': 'commonjs k6/metrics',
  'k6/options': 'commonjs k6/options',
};

// Custom externals function to handle URL imports (k6 supports URL imports at runtime)
function externalsFunction({ request }, callback) {
  // Handle k6 built-in modules
  if (k6Externals[request]) {
    return callback(null, k6Externals[request]);
  }

  // Handle URL imports - mark as external so webpack doesn't try to bundle them
  // k6 will handle these imports at runtime
  if (request.startsWith('http://') || request.startsWith('https://')) {
    // Return undefined to tell webpack to ignore this import
    // The import statement will remain in the bundle and k6 will fetch it at runtime
    return callback();
  }

  // Default: don't externalize
  callback();
}

// Common webpack configuration for all bundles
const commonConfig = {
  target: 'web',
  externals: [externalsFunction],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      fs: false,
      path: false,
      crypto: false,
    },
  },
  mode: 'production',
};

module.exports = [
  // API tests bundle
  {
    ...commonConfig,
    entry: './src/tests/api/basic-api.test.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'api.bundle.js',
      libraryTarget: 'commonjs',
    },
  },
  // Browser tests bundle
  {
    ...commonConfig,
    entry: './src/tests/browser/basic-browser.test.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'browser.bundle.js',
      libraryTarget: 'commonjs',
    },
  },
  // Load test scenario bundle
  {
    ...commonConfig,
    entry: './src/scenarios/load.test.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'load.bundle.js',
      libraryTarget: 'commonjs',
    },
  },
  // Stress test scenario bundle
  {
    ...commonConfig,
    entry: './src/scenarios/stress.test.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'stress.bundle.js',
      libraryTarget: 'commonjs',
    },
  },
  // Spike test scenario bundle
  {
    ...commonConfig,
    entry: './src/scenarios/spike.test.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'spike.bundle.js',
      libraryTarget: 'commonjs',
    },
  },
  // Soak test scenario bundle
  {
    ...commonConfig,
    entry: './src/scenarios/soak.test.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'soak.bundle.js',
      libraryTarget: 'commonjs',
    },
  },
];

