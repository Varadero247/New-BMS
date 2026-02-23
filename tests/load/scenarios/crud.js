/**
 * k6 CRUD Operations Load Test
 *
 * Tests CREATE / READ / UPDATE / DELETE across the major IMS services.
 * Designed to be run after baseline.js passes, to ensure write paths
 * hold up under moderate load.
 *
 * Run: k6 run tests/load/scenarios/crud.js
 */
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Counter } from 'k6/metrics';
import { login, authHeaders, BASE_URL } from '../helpers/auth.js';

const errorRate = new Rate('crud_error_rate');
const resourcesCreated = new Counter('resources_created');

export const options = {
  scenarios: {
    crud_ramp: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 5 },
        { duration: '3m', target: 5 },
        { duration: '1m', target: 0 },
      ],
    },
  },
  thresholds: {
    'crud_error_rate': ['rate<0.05'],
    'http_req_duration': [
      { threshold: 'p(95)<3000', abortOnFail: false },
      { threshold: 'p(99)<5000', abortOnFail: false },
    ],
    'http_req_failed': ['rate<0.05'],
  },
};

export function setup() {
  const token = login();
  if (!token) throw new Error('CRUD setup: authentication failed — is the gateway running?');
  return { token };
}

export default function ({ token }) {
  const headers = authHeaders(token);
  const jsonHeaders = { ...headers, 'Content-Type': 'application/json' };

  // ── H&S Incidents ───────────────────────────────────────────────────────
  group('H&S Incidents CRUD', () => {
    const body = JSON.stringify({
      title: `Load Test Incident ${Date.now()}`,
      description: 'Automated load test — can be deleted',
      type: 'NEAR_MISS',
      severity: 'MINOR',
      location: 'Test Zone',
      dateOccurred: new Date().toISOString().split('T')[0],
    });

    const createRes = http.post(`${BASE_URL}/api/health-safety/incidents`, body, { headers: jsonHeaders });
    errorRate.add(createRes.status >= 400);
    const ok = check(createRes, { 'incident POST 2xx': (r) => r.status < 400 });

    if (ok) {
      resourcesCreated.add(1);
      try {
        const id = JSON.parse(createRes.body)?.data?.id;
        if (id) {
          const getRes = http.get(`${BASE_URL}/api/health-safety/incidents/${id}`, { headers });
          check(getRes, { 'incident GET by id 200': (r) => r.status === 200 });
          errorRate.add(getRes.status >= 400);

          const patchRes = http.patch(`${BASE_URL}/api/health-safety/incidents/${id}`,
            JSON.stringify({ description: 'Updated by load test' }), { headers: jsonHeaders });
          check(patchRes, { 'incident PATCH 2xx': (r) => r.status < 400 });
          errorRate.add(patchRes.status >= 400);

          const delRes = http.del(`${BASE_URL}/api/health-safety/incidents/${id}`, null, { headers });
          check(delRes, { 'incident DELETE 2xx': (r) => r.status < 400 });
          errorRate.add(delRes.status >= 400);
        }
      } catch (_) { /* ignore JSON parse failures */ }
    }
  });

  sleep(0.5);

  // ── Environment Aspects ─────────────────────────────────────────────────
  group('Environment Aspects CRUD', () => {
    const body = JSON.stringify({
      name: `Load Test Aspect ${Date.now()}`,
      description: 'Automated load test aspect',
      activity: 'Load Testing',
      aspectType: 'EMISSION',
      impactType: 'AIR_POLLUTION',
      condition: 'NORMAL',
      isSignificant: false,
    });

    const createRes = http.post(`${BASE_URL}/api/environment/aspects`, body, { headers: jsonHeaders });
    errorRate.add(createRes.status >= 400);
    const ok = check(createRes, { 'aspect POST 2xx': (r) => r.status < 400 });

    if (ok) {
      resourcesCreated.add(1);
      try {
        const id = JSON.parse(createRes.body)?.data?.id;
        if (id) {
          const getRes = http.get(`${BASE_URL}/api/environment/aspects/${id}`, { headers });
          check(getRes, { 'aspect GET 200': (r) => r.status === 200 });
          errorRate.add(getRes.status >= 400);

          const delRes = http.del(`${BASE_URL}/api/environment/aspects/${id}`, null, { headers });
          check(delRes, { 'aspect DELETE 2xx': (r) => r.status < 400 });
          errorRate.add(delRes.status >= 400);
        }
      } catch (_) { /* ignore */ }
    }
  });

  sleep(0.5);

  // ── Quality Documents (read-heavy — no create) ─────────────────────────
  group('Quality Documents Read', () => {
    const listRes = http.get(`${BASE_URL}/api/quality/documents?page=1&limit=10`, { headers });
    errorRate.add(listRes.status >= 400);
    check(listRes, {
      'quality docs list 2xx': (r) => r.status < 400,
      'quality docs has data': (r) => {
        try { return JSON.parse(r.body)?.data !== undefined; } catch { return false; }
      },
    });
  });

  sleep(0.5);

  // ── HR Employees (read-heavy) ────────────────────────────────────────────
  group('HR Employees Read', () => {
    const listRes = http.get(`${BASE_URL}/api/hr/employees?page=1&limit=10`, { headers });
    errorRate.add(listRes.status >= 400);
    check(listRes, { 'hr employees list 2xx': (r) => r.status < 400 });
  });

  sleep(0.5);

  // ── Inventory Items Read ─────────────────────────────────────────────────
  group('Inventory Items Read', () => {
    const listRes = http.get(`${BASE_URL}/api/inventory/items?page=1&limit=10`, { headers });
    errorRate.add(listRes.status >= 400);
    check(listRes, { 'inventory items list 2xx': (r) => r.status < 400 });
  });

  sleep(1);
}
