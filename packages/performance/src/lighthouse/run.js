#!/usr/bin/env node

/**
 * Lighthouse CI Runner
 *
 * Runs Lighthouse audits against all IMS web applications.
 * In CI mode, uses @lhci/cli for full integration.
 * In local mode, provides a summary of what would be tested.
 *
 * Usage:
 *   node src/lighthouse/run.js              # Local summary mode
 *   node src/lighthouse/run.js --ci         # CI mode (requires @lhci/cli)
 *   node src/lighthouse/run.js --url URL    # Test single URL
 */

const path = require('path');
const { execSync } = require('child_process');

const config = require('./config.js');

const THRESHOLDS = {
  performance: 0.9,
  accessibility: 0.9,
  'best-practices': 0.9,
};

const APP_NAMES = {
  'http://localhost:3000': 'Dashboard',
  'http://localhost:3001': 'Health & Safety',
  'http://localhost:3002': 'Environment',
  'http://localhost:3003': 'Quality',
  'http://localhost:3004': 'Settings',
  'http://localhost:3005': 'Inventory',
  'http://localhost:3006': 'HR',
  'http://localhost:3013': 'Finance',
  'http://localhost:3014': 'CRM',
  'http://localhost:3015': 'InfoSec',
  'http://localhost:3016': 'ESG',
  'http://localhost:3017': 'CMMS',
  'http://localhost:3020': 'Food Safety',
  'http://localhost:3021': 'Energy',
  'http://localhost:3022': 'Analytics',
  'http://localhost:3023': 'Field Service',
};

function checkUrlAvailability(url) {
  try {
    const http = require('http');
    return new Promise((resolve) => {
      const req = http.get(url, { timeout: 3000 }, (res) => {
        resolve({ url, status: res.statusCode, available: res.statusCode < 500 });
      });
      req.on('error', () => resolve({ url, status: 0, available: false }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ url, status: 0, available: false });
      });
    });
  } catch {
    return Promise.resolve({ url, status: 0, available: false });
  }
}

async function runLocalMode(urls) {
  console.log('='.repeat(70));
  console.log('  IMS Lighthouse Performance Audit');
  console.log('='.repeat(70));
  console.log();
  console.log(`Mode: Local Summary`);
  console.log(`URLs to test: ${urls.length}`);
  console.log(`Runs per URL: ${config.ci.collect.numberOfRuns}`);
  console.log(`Preset: ${config.ci.collect.settings.preset}`);
  console.log();

  // Check availability
  console.log('Checking service availability...');
  console.log('-'.repeat(70));

  const checks = await Promise.all(urls.map(checkUrlAvailability));
  const available = [];
  const unavailable = [];

  for (const check of checks) {
    const name = APP_NAMES[check.url] || check.url;
    if (check.available) {
      available.push(check);
      console.log(`  [OK]   ${name.padEnd(20)} ${check.url} (HTTP ${check.status})`);
    } else {
      unavailable.push(check);
      console.log(`  [DOWN] ${name.padEnd(20)} ${check.url}`);
    }
  }

  console.log();
  console.log('-'.repeat(70));
  console.log(`Available: ${available.length}/${urls.length} services`);
  console.log();

  // Summary table
  console.log('Audit Thresholds:');
  console.log('-'.repeat(70));
  console.log(`  ${'Category'.padEnd(25)} ${'Min Score'.padEnd(15)} Status`);
  console.log(`  ${'Performance'.padEnd(25)} ${'>= 90'.padEnd(15)} Threshold set`);
  console.log(`  ${'Accessibility'.padEnd(25)} ${'>= 90'.padEnd(15)} Threshold set`);
  console.log(`  ${'Best Practices'.padEnd(25)} ${'>= 90'.padEnd(15)} Threshold set`);
  console.log();

  if (available.length === 0) {
    console.log('No services are currently running. Start services first:');
    console.log('  ./scripts/start-all-services.sh');
    console.log();
    process.exit(1);
  }

  console.log('To run full Lighthouse audit:');
  console.log('  1. Install: npm install -g @lhci/cli');
  console.log('  2. Run: lhci autorun --config=src/lighthouse/config.js');
  console.log('  3. Reports saved to: ./lighthouse-reports/');
  console.log();

  // Attempt to run lhci if available
  try {
    execSync('which lhci', { stdio: 'ignore' });
    console.log('lhci detected! To run full audit:');
    console.log(`  lhci autorun --config=${path.join(__dirname, 'config.js')}`);
  } catch {
    console.log('Tip: Install @lhci/cli globally for full Lighthouse CI integration.');
  }

  console.log();
  console.log('='.repeat(70));
}

async function runCiMode(urls) {
  console.log('Running Lighthouse CI audit...');

  try {
    const configPath = path.join(__dirname, 'config.js');
    const cmd = `lhci autorun --config=${configPath}`;
    console.log(`Executing: ${cmd}`);
    execSync(cmd, { stdio: 'inherit', cwd: path.join(__dirname, '../..') });
    console.log('Lighthouse CI audit passed all thresholds.');
  } catch (error) {
    console.error('Lighthouse CI audit failed. Check reports for details.');
    process.exit(1);
  }
}

async function runSingleUrl(url) {
  console.log(`Running Lighthouse audit for: ${url}`);

  try {
    const cmd = `lhci autorun --config=${path.join(__dirname, 'config.js')} --collect.url=${url}`;
    execSync(cmd, { stdio: 'inherit', cwd: path.join(__dirname, '../..') });
  } catch (error) {
    console.error(`Lighthouse audit failed for ${url}`);
    process.exit(1);
  }
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const ciMode = args.includes('--ci');
  const urlIndex = args.indexOf('--url');
  const singleUrl = urlIndex >= 0 ? args[urlIndex + 1] : null;

  const urls = config.ci.collect.url;

  if (singleUrl) {
    await runSingleUrl(singleUrl);
  } else if (ciMode) {
    await runCiMode(urls);
  } else {
    await runLocalMode(urls);
  }
}

main().catch((err) => {
  console.error('Lighthouse runner error:', err.message);
  process.exit(1);
});
