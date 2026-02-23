/**
 * k6 Baseline / Smoke Test
 *
 * Runs 10 VUs for 1 minute to establish a performance baseline and
 * verify the test infrastructure itself works end-to-end.
 *
 * Covers all 9 integration-tested services with 22 endpoint hits per iteration:
 *   Health & Safety, Environment, Quality, HR, Payroll, Inventory,
 *   Workflows, Project Management, Finance, Dashboard
 *
 * Run before any other load test:
 *   k6 run tests/load/scenarios/baseline.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate } from 'k6/metrics';
import { login, authHeaders, BASE_URL } from '../helpers/auth.js';

const errorRate = new Rate('baseline_error_rate');

export const options = {
  vus: 10,
  duration: '1m',
  thresholds: {
    'baseline_error_rate': [{ threshold: 'rate<0.01', abortOnFail: true }],
    'http_req_duration': [
      { threshold: 'p(95)<500', abortOnFail: true },
      { threshold: 'p(99)<1000', abortOnFail: true },
    ],
    'http_req_failed': [{ threshold: 'rate<0.01', abortOnFail: true }],
  },
};

export function setup() {
  const token = login();
  if (!token) throw new Error('Baseline setup: authentication failed — is the gateway running?');
  return { token };
}

export default function ({ token }) {
  const headers = authHeaders(token);

  // ── Health & Safety (2 endpoints) ─────────────────────────────────────
  group('Health & Safety', () => {
    const urls = [
      `${BASE_URL}/api/health-safety/incidents?page=1&limit=5`,
      `${BASE_URL}/api/health-safety/risks?page=1&limit=5`,
    ];
    for (const url of urls) {
      const res = http.get(url, { headers });
      errorRate.add(res.status >= 400);
      check(res, {
        [`hs ${url.split('/').pop().split('?')[0]} 2xx`]: (r) => r.status < 400,
        'has JSON body': (r) => { try { JSON.parse(r.body); return true; } catch { return false; } },
      });
    }
  });

  // ── Environment (2 endpoints) ──────────────────────────────────────────
  group('Environment', () => {
    const urls = [
      `${BASE_URL}/api/environment/aspects?page=1&limit=5`,
      `${BASE_URL}/api/environment/events?page=1&limit=5`,
    ];
    for (const url of urls) {
      const res = http.get(url, { headers });
      errorRate.add(res.status >= 400);
      check(res, { [`env ${url.split('/').pop().split('?')[0]} 2xx`]: (r) => r.status < 400 });
    }
  });

  // ── Quality (3 endpoints) ──────────────────────────────────────────────
  group('Quality', () => {
    const urls = [
      `${BASE_URL}/api/quality/documents?page=1&limit=5`,
      `${BASE_URL}/api/quality/audits?page=1&limit=5`,
      `${BASE_URL}/api/quality/capa?page=1&limit=5`,
    ];
    for (const url of urls) {
      const res = http.get(url, { headers });
      errorRate.add(res.status >= 400);
      check(res, { [`quality ${url.split('/').pop().split('?')[0]} 2xx`]: (r) => r.status < 400 });
    }
  });

  // ── HR (3 endpoints) ───────────────────────────────────────────────────
  group('HR', () => {
    const urls = [
      `${BASE_URL}/api/hr/employees?page=1&limit=5`,
      `${BASE_URL}/api/hr/leave?page=1&limit=5`,
      `${BASE_URL}/api/hr/performance?page=1&limit=5`,
    ];
    for (const url of urls) {
      const res = http.get(url, { headers });
      errorRate.add(res.status >= 400);
      check(res, { [`hr ${url.split('/').pop().split('?')[0]} 2xx`]: (r) => r.status < 400 });
    }
  });

  // ── Payroll (2 endpoints) ──────────────────────────────────────────────
  group('Payroll', () => {
    const urls = [
      `${BASE_URL}/api/payroll/payslips?page=1&limit=5`,
      `${BASE_URL}/api/payroll/runs?page=1&limit=5`,
    ];
    for (const url of urls) {
      const res = http.get(url, { headers });
      errorRate.add(res.status >= 400);
      check(res, { [`payroll ${url.split('/').pop().split('?')[0]} 2xx`]: (r) => r.status < 400 });
    }
  });

  // ── Inventory (2 endpoints) ────────────────────────────────────────────
  group('Inventory', () => {
    const urls = [
      `${BASE_URL}/api/inventory/items?page=1&limit=5`,
      `${BASE_URL}/api/inventory/transactions?page=1&limit=5`,
    ];
    for (const url of urls) {
      const res = http.get(url, { headers });
      errorRate.add(res.status >= 400);
      check(res, { [`inventory ${url.split('/').pop().split('?')[0]} 2xx`]: (r) => r.status < 400 });
    }
  });

  // ── Workflows (2 endpoints) ────────────────────────────────────────────
  group('Workflows', () => {
    const urls = [
      `${BASE_URL}/api/workflows/definitions?page=1&limit=5`,
      `${BASE_URL}/api/workflows/instances?page=1&limit=5`,
    ];
    for (const url of urls) {
      const res = http.get(url, { headers });
      errorRate.add(res.status >= 400);
      check(res, { [`workflows ${url.split('/').pop().split('?')[0]} 2xx`]: (r) => r.status < 400 });
    }
  });

  // ── Project Management (3 endpoints) ──────────────────────────────────
  group('Project Management', () => {
    const urls = [
      `${BASE_URL}/api/project-management/projects?page=1&limit=5`,
      `${BASE_URL}/api/project-management/tasks?page=1&limit=5`,
      `${BASE_URL}/api/project-management/milestones?page=1&limit=5`,
    ];
    for (const url of urls) {
      const res = http.get(url, { headers });
      errorRate.add(res.status >= 400);
      check(res, { [`pm ${url.split('/').pop().split('?')[0]} 2xx`]: (r) => r.status < 400 });
    }
  });

  // ── Finance (2 endpoints) ──────────────────────────────────────────────
  group('Finance', () => {
    const urls = [
      `${BASE_URL}/api/finance/invoices?page=1&limit=5`,
      `${BASE_URL}/api/finance/budgets?page=1&limit=5`,
    ];
    for (const url of urls) {
      const res = http.get(url, { headers });
      errorRate.add(res.status >= 400);
      check(res, { [`finance ${url.split('/').pop().split('?')[0]} 2xx`]: (r) => r.status < 400 });
    }
  });

  // ── Dashboard (1 endpoint) ─────────────────────────────────────────────
  group('Dashboard', () => {
    const res = http.get(`${BASE_URL}/api/dashboard`, { headers });
    errorRate.add(res.status >= 400);
    check(res, { 'dashboard stats 2xx': (r) => r.status < 400 });
  });

  sleep(2);
}
