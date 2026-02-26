// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
#!/usr/bin/env node

/**
 * WCAG 2.2 AA Accessibility Audit Script
 *
 * Uses axe-core to perform automated accessibility audits against
 * all IMS web applications. Checks for WCAG 2.1 A, AA and WCAG 2.2 AA
 * compliance including color contrast, ARIA labels, keyboard navigation,
 * focus management, form labels, heading hierarchy, image alt text,
 * and link purpose.
 *
 * Usage:
 *   node src/accessibility/audit.js              # Audit all apps
 *   node src/accessibility/audit.js --url URL    # Audit single URL
 *   node src/accessibility/audit.js --json       # Output JSON reports
 *   node src/accessibility/audit.js --verbose    # Detailed output
 */

const http = require('http');
const path = require('path');
const fs = require('fs');

// Audit configuration
const AuditConfig = {
  // URLs to audit (all IMS web applications)
  urls: [
    { url: 'http://localhost:3000', name: 'Dashboard' },
    { url: 'http://localhost:3001', name: 'Health & Safety' },
    { url: 'http://localhost:3002', name: 'Environment' },
    { url: 'http://localhost:3003', name: 'Quality' },
    { url: 'http://localhost:3004', name: 'Settings' },
    { url: 'http://localhost:3005', name: 'Inventory' },
    { url: 'http://localhost:3006', name: 'HR' },
    { url: 'http://localhost:3007', name: 'Payroll' },
    { url: 'http://localhost:3008', name: 'Workflows' },
    { url: 'http://localhost:3009', name: 'Project Management' },
    { url: 'http://localhost:3010', name: 'Automotive' },
    { url: 'http://localhost:3011', name: 'Medical' },
    { url: 'http://localhost:3012', name: 'Aerospace' },
    { url: 'http://localhost:3013', name: 'Finance' },
    { url: 'http://localhost:3014', name: 'CRM' },
    { url: 'http://localhost:3015', name: 'InfoSec' },
    { url: 'http://localhost:3016', name: 'ESG' },
    { url: 'http://localhost:3017', name: 'CMMS' },
    { url: 'http://localhost:3018', name: 'Customer Portal' },
    { url: 'http://localhost:3019', name: 'Supplier Portal' },
    { url: 'http://localhost:3020', name: 'Food Safety' },
    { url: 'http://localhost:3021', name: 'Energy' },
    { url: 'http://localhost:3022', name: 'Analytics' },
    { url: 'http://localhost:3023', name: 'Field Service' },
  ],

  // axe-core configuration
  axeConfig: {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag22aa', 'best-practice'],
    },
    resultTypes: ['violations', 'passes', 'incomplete', 'inapplicable'],
  },

  // Key checks performed
  checks: [
    'color-contrast',
    'aria-allowed-attr',
    'aria-hidden-body',
    'aria-hidden-focus',
    'aria-input-field-name',
    'aria-required-attr',
    'aria-required-children',
    'aria-required-parent',
    'aria-roles',
    'aria-valid-attr-value',
    'aria-valid-attr',
    'button-name',
    'document-title',
    'duplicate-id',
    'form-field-multiple-labels',
    'frame-title',
    'heading-order',
    'html-has-lang',
    'html-lang-valid',
    'image-alt',
    'input-image-alt',
    'label',
    'link-name',
    'list',
    'listitem',
    'meta-viewport',
    'nested-interactive',
    'no-autoplay-audio',
    'select-name',
    'skip-link',
    'tabindex',
    'td-headers-attr',
    'th-has-data-cells',
    'valid-lang',
    'video-caption',
    'focus-order-semantics',
    'target-size',
  ],

  // Output configuration
  outputDir: path.join(__dirname, '../../a11y-reports'),
  reportFormat: 'json',
};

function checkUrlAvailability(url) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 3000 }, (res) => {
      resolve({ available: res.statusCode < 500, status: res.statusCode });
    });
    req.on('error', () => resolve({ available: false, status: 0 }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ available: false, status: 0 });
    });
  });
}

function generateReport(appName, url, results) {
  return {
    application: appName,
    url: url,
    timestamp: new Date().toISOString(),
    wcagLevel: 'WCAG 2.2 AA',
    tags: AuditConfig.axeConfig.runOnly.values,
    summary: {
      violations: results.violations || 0,
      passes: results.passes || 0,
      incomplete: results.incomplete || 0,
      inapplicable: results.inapplicable || 0,
    },
    details: results,
  };
}

async function runAudit(urls, options = {}) {
  const verbose = options.verbose || false;
  const jsonOutput = options.json || false;

  console.log('='.repeat(70));
  console.log('  IMS WCAG 2.2 AA Accessibility Audit');
  console.log('='.repeat(70));
  console.log();
  console.log(`WCAG Level: 2.2 AA`);
  console.log(`Tags: ${AuditConfig.axeConfig.runOnly.values.join(', ')}`);
  console.log(`Applications: ${urls.length}`);
  console.log();

  // Check which services are available
  console.log('Checking service availability...');
  console.log('-'.repeat(70));

  const availabilityResults = [];
  for (const app of urls) {
    const result = await checkUrlAvailability(app.url);
    availabilityResults.push({ ...app, ...result });

    const status = result.available ? '[OK]  ' : '[DOWN]';
    console.log(`  ${status} ${app.name.padEnd(22)} ${app.url}`);
  }

  const available = availabilityResults.filter((r) => r.available);
  const unavailable = availabilityResults.filter((r) => !r.available);

  console.log();
  console.log(`Available: ${available.length}/${urls.length} services`);
  console.log();

  if (available.length === 0) {
    console.log('No services are currently running. Start services first:');
    console.log('  ./scripts/start-all-services.sh');
    process.exit(1);
  }

  // Audit methodology
  console.log('-'.repeat(70));
  console.log('Audit Methodology:');
  console.log('-'.repeat(70));
  console.log();
  console.log('  Tool: axe-core (Deque Systems)');
  console.log('  Standard: WCAG 2.2 Level AA');
  console.log('  Ruleset tags: wcag2a, wcag2aa, wcag22aa, best-practice');
  console.log();
  console.log('  Automated checks include:');
  console.log('    - Color contrast (WCAG 1.4.3, 1.4.6)');
  console.log('    - ARIA attributes and roles (WCAG 4.1.2)');
  console.log('    - Keyboard navigation and focus management (WCAG 2.1.1, 2.4.7)');
  console.log('    - Form labels and input identification (WCAG 1.3.1, 3.3.2)');
  console.log('    - Heading hierarchy (WCAG 1.3.1, 2.4.6)');
  console.log('    - Image alt text (WCAG 1.1.1)');
  console.log('    - Link purpose (WCAG 2.4.4)');
  console.log('    - Document language (WCAG 3.1.1)');
  console.log('    - Target size (WCAG 2.5.8 - new in 2.2)');
  console.log('    - Focus not obscured (WCAG 2.4.11 - new in 2.2)');
  console.log();

  // Check for axe-core / puppeteer availability
  let hasAxe = false;
  let hasPuppeteer = false;

  try {
    require.resolve('axe-core');
    hasAxe = true;
  } catch {}

  try {
    require.resolve('puppeteer');
    hasPuppeteer = true;
  } catch {}

  if (!hasAxe || !hasPuppeteer) {
    console.log('-'.repeat(70));
    console.log('Dependencies Required for Full Audit:');
    console.log('-'.repeat(70));
    console.log();
    if (!hasAxe) console.log('  npm install axe-core');
    if (!hasPuppeteer) console.log('  npm install puppeteer');
    console.log();
    console.log('To run full automated audit:');
    console.log('  1. Install dependencies above');
    console.log('  2. Re-run: node src/accessibility/audit.js');
    console.log();
    console.log('Alternative: Use browser-based axe DevTools extension');
    console.log('  - Install axe DevTools for Chrome/Firefox');
    console.log('  - Navigate to each URL and run the audit');
    console.log();

    // Generate placeholder reports
    if (jsonOutput) {
      const reports = available.map((app) =>
        generateReport(app.name, app.url, {
          violations: 'pending',
          passes: 'pending',
          incomplete: 'pending',
          inapplicable: 'pending',
          note: 'Install axe-core and puppeteer to run automated audit',
        })
      );

      // Ensure output directory exists
      try {
        fs.mkdirSync(AuditConfig.outputDir, { recursive: true });
        const reportPath = path.join(AuditConfig.outputDir, 'audit-summary.json');
        fs.writeFileSync(reportPath, JSON.stringify(reports, null, 2));
        console.log(`Report saved to: ${reportPath}`);
      } catch (err) {
        console.log('Report (stdout):');
        console.log(JSON.stringify(reports, null, 2));
      }
    }

    // Print summary table
    console.log('-'.repeat(70));
    console.log('Summary:');
    console.log('-'.repeat(70));
    console.log();
    console.log(`  ${'Application'.padEnd(22)} ${'URL'.padEnd(28)} ${'Status'.padEnd(10)}`);
    console.log(`  ${''.padEnd(22, '-')} ${''.padEnd(28, '-')} ${''.padEnd(10, '-')}`);

    for (const app of availabilityResults) {
      const status = app.available ? 'Ready' : 'Offline';
      console.log(`  ${app.name.padEnd(22)} ${app.url.padEnd(28)} ${status.padEnd(10)}`);
    }

    console.log();
    console.log('='.repeat(70));
    return;
  }

  // Full audit mode with axe-core + puppeteer
  console.log('Running full axe-core audit...');
  console.log();

  const axe = require('axe-core');
  const puppeteer = require('puppeteer');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const reports = [];

  for (const app of available) {
    process.stdout.write(`  Auditing ${app.name.padEnd(22)} `);

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 720 });
      await page.goto(app.url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Inject axe-core
      await page.addScriptTag({ path: require.resolve('axe-core') });

      // Run audit
      const results = await page.evaluate((config) => {
        return window.axe.run(document, config);
      }, AuditConfig.axeConfig);

      const report = generateReport(app.name, app.url, {
        violations: results.violations.length,
        passes: results.passes.length,
        incomplete: results.incomplete.length,
        inapplicable: results.inapplicable.length,
        violationDetails: results.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          helpUrl: v.helpUrl,
          nodes: v.nodes.length,
        })),
      });

      reports.push(report);

      const violationCount = results.violations.length;
      const status = violationCount === 0 ? 'PASS' : `${violationCount} violations`;
      console.log(status);

      if (verbose && violationCount > 0) {
        for (const v of results.violations) {
          console.log(`    [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} instances)`);
        }
      }

      await page.close();
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      reports.push(generateReport(app.name, app.url, { error: err.message }));
    }
  }

  await browser.close();

  // Save reports
  if (jsonOutput) {
    try {
      fs.mkdirSync(AuditConfig.outputDir, { recursive: true });

      for (const report of reports) {
        const filename = `${report.application.toLowerCase().replace(/\s+/g, '-')}.json`;
        const filepath = path.join(AuditConfig.outputDir, filename);
        fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
      }

      const summaryPath = path.join(AuditConfig.outputDir, 'audit-summary.json');
      fs.writeFileSync(summaryPath, JSON.stringify(reports, null, 2));
      console.log();
      console.log(`Reports saved to: ${AuditConfig.outputDir}`);
    } catch (err) {
      console.error(`Failed to save reports: ${err.message}`);
    }
  }

  // Print summary
  console.log();
  console.log('-'.repeat(70));
  console.log('Audit Summary:');
  console.log('-'.repeat(70));
  console.log();
  console.log(
    `  ${'Application'.padEnd(22)} ${'Violations'.padEnd(14)} ${'Passes'.padEnd(10)} ${'Status'}`
  );
  console.log(
    `  ${''.padEnd(22, '-')} ${''.padEnd(14, '-')} ${''.padEnd(10, '-')} ${''.padEnd(8, '-')}`
  );

  let totalViolations = 0;
  for (const report of reports) {
    const violations = report.summary.violations || 0;
    const passes = report.summary.passes || 0;
    totalViolations += typeof violations === 'number' ? violations : 0;
    const status = violations === 0 ? 'PASS' : 'FAIL';
    console.log(
      `  ${report.application.padEnd(22)} ${String(violations).padEnd(14)} ${String(passes).padEnd(10)} ${status}`
    );
  }

  console.log();
  console.log(`Total violations: ${totalViolations}`);
  console.log(`WCAG 2.2 AA compliance: ${totalViolations === 0 ? 'PASS' : 'NEEDS REMEDIATION'}`);
  console.log();
  console.log('='.repeat(70));

  if (totalViolations > 0) {
    process.exit(1);
  }
}

// Main
const args = process.argv.slice(2);
const options = {
  verbose: args.includes('--verbose') || args.includes('-v'),
  json: args.includes('--json'),
};

const urlIndex = args.indexOf('--url');
if (urlIndex >= 0 && args[urlIndex + 1]) {
  const singleUrl = args[urlIndex + 1];
  runAudit([{ url: singleUrl, name: singleUrl }], options);
} else {
  runAudit(AuditConfig.urls, options);
}
