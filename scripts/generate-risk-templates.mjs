#!/usr/bin/env node
/**
 * Generate all 17 Risk Management DOCX templates from the JSON config
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configs = JSON.parse(fs.readFileSync(path.join(__dirname, 'risk-templates.json'), 'utf8'));

const tmpDir = path.join(__dirname, '.tmp-risk-configs');
fs.mkdirSync(tmpDir, { recursive: true });

let success = 0;
let failed = 0;

for (let i = 0; i < configs.length; i++) {
  const config = configs[i];
  const tmpFile = path.join(tmpDir, `config-${i}.json`);
  fs.writeFileSync(tmpFile, JSON.stringify(config, null, 2));

  try {
    execSync(`node ${path.join(__dirname, 'create-docx.mjs')} ${tmpFile}`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
    });
    console.log(`[${i + 1}/${configs.length}] Created: ${config.docNumber} — ${config.title}`);
    success++;
  } catch (err) {
    console.error(`[${i + 1}/${configs.length}] FAILED: ${config.docNumber} — ${err.message}`);
    failed++;
  }
}

// Cleanup
fs.rmSync(tmpDir, { recursive: true, force: true });

console.log(`\nDone: ${success} created, ${failed} failed out of ${configs.length} templates`);
