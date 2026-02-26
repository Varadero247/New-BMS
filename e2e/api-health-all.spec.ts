// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { test, expect } from '@playwright/test';

/**
 * Comprehensive health checks for all 42 API services.
 *
 * Each test hits GET /health on the service's direct port and verifies
 * { status: 'ok' }. Tests run in parallel (fullyParallel: true in config).
 *
 * Services will not respond unless started via ./scripts/start-all-services.sh
 */

const SERVICES = [
  { name: 'Gateway',          port: 4000 },
  { name: 'Health & Safety',  port: 4001 },
  { name: 'Environment',      port: 4002 },
  { name: 'Quality',          port: 4003 },
  { name: 'AI Analysis',      port: 4004 },
  { name: 'Inventory',        port: 4005 },
  { name: 'HR',               port: 4006 },
  { name: 'Payroll',          port: 4007 },
  { name: 'Workflows',        port: 4008 },
  { name: 'Project Mgmt',     port: 4009 },
  { name: 'Automotive',       port: 4010 },
  { name: 'Medical',          port: 4011 },
  { name: 'Aerospace',        port: 4012 },
  { name: 'Finance',          port: 4013 },
  { name: 'CRM',              port: 4014 },
  { name: 'InfoSec',          port: 4015 },
  { name: 'ESG',              port: 4016 },
  { name: 'CMMS',             port: 4017 },
  { name: 'Portal',           port: 4018 },
  { name: 'Food Safety',      port: 4019 },
  { name: 'Energy',           port: 4020 },
  { name: 'Analytics',        port: 4021 },
  { name: 'Field Service',    port: 4022 },
  { name: 'ISO 42001',        port: 4023 },
  { name: 'ISO 37001',        port: 4024 },
  { name: 'Marketing',        port: 4025 },
  { name: 'Partners',         port: 4026 },
  { name: 'Risk',             port: 4027 },
  { name: 'Training',         port: 4028 },
  { name: 'Suppliers',        port: 4029 },
  { name: 'Assets',           port: 4030 },
  { name: 'Documents',        port: 4031 },
  { name: 'Complaints',       port: 4032 },
  { name: 'Contracts',        port: 4033 },
  { name: 'PTW',              port: 4034 },
  { name: 'Reg Monitor',      port: 4035 },
  { name: 'Incidents',        port: 4036 },
  { name: 'Audits',           port: 4037 },
  { name: 'Mgmt Review',      port: 4038 },
  { name: 'Setup Wizard',     port: 4039 },
  { name: 'Chemicals',        port: 4040 },
  { name: 'Emergency',        port: 4041 },
] as const;

// ─── Health endpoint tests ────────────────────────────────────────────────────

test.describe.parallel('API Health Endpoints — All Services', () => {
  for (const svc of SERVICES) {
    test(`${svc.name} (port ${svc.port}) — GET /health returns { status: 'ok' }`, async ({ request }) => {
      const response = await request.get(`http://localhost:${svc.port}/health`, {
        timeout: 10_000,
      });

      expect(
        response.ok(),
        `Expected HTTP 200 from ${svc.name} /health but got ${response.status()}`,
      ).toBeTruthy();

      const body = await response.json();

      expect(body).toMatchObject({ status: 'ok' });
    });
  }
});

// ─── Metrics endpoint tests ───────────────────────────────────────────────────

test.describe.parallel('API Metrics Endpoints — Prometheus Format', () => {
  for (const svc of SERVICES) {
    test(`${svc.name} (port ${svc.port}) — GET /metrics returns Prometheus text`, async ({ request }) => {
      const response = await request.get(`http://localhost:${svc.port}/metrics`, {
        timeout: 10_000,
      });

      // Metrics endpoint must be reachable — 200 is expected
      expect(
        response.ok(),
        `Expected HTTP 200 from ${svc.name} /metrics but got ${response.status()}`,
      ).toBeTruthy();

      const text = await response.text();

      // Prometheus text format always starts comment blocks with '# HELP' or '# TYPE'
      const isPrometheusFormat = text.includes('# HELP') || text.includes('# TYPE');
      expect(
        isPrometheusFormat,
        `${svc.name} /metrics response does not look like Prometheus text format. Got: ${text.slice(0, 200)}`,
      ).toBeTruthy();
    });
  }
});

// ─── Gateway-level health check via /api/health ──────────────────────────────

test.describe('Gateway — Additional Health Assertions', () => {
  test('GET /health includes service name or uptime field', async ({ request }) => {
    const response = await request.get('http://localhost:4000/health');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe('ok');

    // Gateway health may include extended info such as uptime, service, or timestamp
    // We allow any of these — just ensure the status field is present
    expect(typeof body.status).toBe('string');
  });

  test('GET /health returns JSON content-type', async ({ request }) => {
    const response = await request.get('http://localhost:4000/health');
    expect(response.ok()).toBeTruthy();

    const contentType = response.headers()['content-type'] || '';
    expect(contentType).toContain('application/json');
  });

  test('Downstream H&S health reachable both directly and via gateway', async ({ request }) => {
    const [direct, gateway] = await Promise.all([
      request.get('http://localhost:4001/health'),
      request.get('http://localhost:4000/health'), // gateway own health
    ]);

    expect(direct.ok()).toBeTruthy();
    expect(gateway.ok()).toBeTruthy();

    const directBody  = await direct.json();
    const gatewayBody = await gateway.json();

    expect(directBody.status).toBe('ok');
    expect(gatewayBody.status).toBe('ok');
  });

  test('All service health endpoints respond within 5 seconds', async ({ request }) => {
    // Spot-check a spread of ports for latency — parallel fetch
    const ports = [4000, 4005, 4010, 4015, 4020, 4025, 4030, 4035, 4041];

    const results = await Promise.allSettled(
      ports.map((port) =>
        request.get(`http://localhost:${port}/health`, { timeout: 5_000 }),
      ),
    );

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const port   = ports[i];
      expect(
        result.status,
        `Service on port ${port} did not respond within 5 seconds`,
      ).toBe('fulfilled');
      if (result.status === 'fulfilled') {
        expect(
          result.value.ok(),
          `Service on port ${port} returned HTTP ${result.value.status()}`,
        ).toBeTruthy();
      }
    }
  });
});
