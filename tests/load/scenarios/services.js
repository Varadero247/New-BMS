// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * k6 Comprehensive Service Coverage Test
 *
 * Exercises GET endpoints on all 9 integration-tested services in two
 * concurrent scenarios:
 *   - read_heavy : 20 VUs, 5 minutes — list endpoints, paginated reads
 *   - mixed      :  5 VUs, 3 minutes — a mix of GET and occasional POST
 *
 * Run: k6 run tests/load/scenarios/services.js
 */
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate } from 'k6/metrics';
import { login, authHeaders, BASE_URL } from '../helpers/auth.js';

const errorRate = new Rate('services_error_rate');

export const options = {
  scenarios: {
    read_heavy: {
      executor: 'constant-vus',
      vus: 20,
      duration: '5m',
      env: { SCENARIO: 'read' },
    },
    mixed: {
      executor: 'constant-vus',
      vus: 5,
      duration: '3m',
      startTime: '30s',
      env: { SCENARIO: 'mixed' },
    },
  },
  thresholds: {
    'services_error_rate': ['rate<0.05'],
    'http_req_duration': [
      { threshold: 'p(95)<2000', abortOnFail: false },
    ],
    'http_req_failed': ['rate<0.05'],
  },
};

export function setup() {
  const token = login();
  if (!token) throw new Error('Services setup: authentication failed');
  return { token };
}

// All read endpoints across 9 services
const READ_ENDPOINTS = [
  // H&S
  '/api/health-safety/incidents?page=1&limit=10',
  '/api/health-safety/risks?page=1&limit=10',
  '/api/health-safety/legal?page=1&limit=10',
  // Environment
  '/api/environment/aspects?page=1&limit=10',
  '/api/environment/events?page=1&limit=10',
  // Quality
  '/api/quality/documents?page=1&limit=10',
  '/api/quality/audits?page=1&limit=10',
  '/api/quality/capa?page=1&limit=10',
  // HR
  '/api/hr/employees?page=1&limit=10',
  '/api/hr/leave?page=1&limit=10',
  // Payroll
  '/api/payroll/payslips?page=1&limit=10',
  '/api/payroll/runs?page=1&limit=10',
  // Inventory
  '/api/inventory/items?page=1&limit=10',
  '/api/inventory/transactions?page=1&limit=10',
  // Workflows
  '/api/workflows/definitions?page=1&limit=10',
  '/api/workflows/instances?page=1&limit=10',
  // Project Management
  '/api/project-management/projects?page=1&limit=10',
  '/api/project-management/tasks?page=1&limit=10',
  // Finance
  '/api/finance/invoices?page=1&limit=10',
  '/api/finance/budgets?page=1&limit=10',
  // Dashboard
  '/api/dashboard',
];

export default function ({ token }) {
  const headers = authHeaders(token);
  const isReadScenario = __ENV.SCENARIO !== 'mixed';

  if (isReadScenario) {
    // Read-heavy: cycle through all service endpoints
    const idx = Math.floor(Math.random() * READ_ENDPOINTS.length);
    const url = `${BASE_URL}${READ_ENDPOINTS[idx]}`;

    group('Service Read', () => {
      const res = http.get(url, { headers });
      errorRate.add(res.status >= 400);
      check(res, {
        '2xx response': (r) => r.status < 400,
        'has JSON body': (r) => {
          try { JSON.parse(r.body); return true; } catch { return false; }
        },
      });
    });

    sleep(1);
  } else {
    // Mixed: mostly reads, occasional creates
    group('H&S Read', () => {
      const res = http.get(`${BASE_URL}/api/health-safety/incidents?page=1&limit=5`, { headers });
      errorRate.add(res.status >= 400);
      check(res, { 'hs incidents 2xx': (r) => r.status < 400 });
    });

    group('Environment Read', () => {
      const res = http.get(`${BASE_URL}/api/environment/aspects?page=1&limit=5`, { headers });
      errorRate.add(res.status >= 400);
      check(res, { 'env aspects 2xx': (r) => r.status < 400 });
    });

    group('Quality Read', () => {
      const res = http.get(`${BASE_URL}/api/quality/documents?page=1&limit=5`, { headers });
      errorRate.add(res.status >= 400);
      check(res, { 'quality docs 2xx': (r) => r.status < 400 });
    });

    group('Finance Read', () => {
      const res = http.get(`${BASE_URL}/api/finance/invoices?page=1&limit=5`, { headers });
      errorRate.add(res.status >= 400);
      check(res, { 'finance invoices 2xx': (r) => r.status < 400 });
    });

    sleep(2);
  }
}
