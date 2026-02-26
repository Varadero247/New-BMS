// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * k6 Stress Test
 *
 * Ramps the system up to 3× the expected production load to identify
 * the breaking point and measure degradation behaviour.
 *
 * Expected production VUs: ~100
 * Stress target:           300 VUs (3×)
 *
 * Run:
 *   k6 run tests/load/scenarios/stress.js
 *   k6 run -e BASE_URL=https://api.example.com tests/load/scenarios/stress.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { login, authHeaders, BASE_URL } from '../helpers/auth.js';

// ── Custom metrics ─────────────────────────────────────────────────────────

const errorRate      = new Rate('stress_error_rate');
const apiLatency     = new Trend('stress_api_latency_ms', true);
const authLatency    = new Trend('stress_auth_latency_ms', true);

// ── Thresholds ─────────────────────────────────────────────────────────────

export const options = {
  scenarios: {
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m',  target: 100 },   // ramp to normal load
        { duration: '5m',  target: 100 },   // hold normal load
        { duration: '2m',  target: 200 },   // ramp to 2× load
        { duration: '5m',  target: 200 },   // hold 2× load
        { duration: '2m',  target: 300 },   // ramp to 3× (stress point)
        { duration: '5m',  target: 300 },   // hold at stress
        { duration: '5m',  target: 0   },   // ramp down / recovery
      ],
    },
  },
  thresholds: {
    // Core SLO: error rate must stay below 5%
    'stress_error_rate':              [{ threshold: 'rate<0.05',  abortOnFail: false }],
    // p95 latency under sustained load
    'stress_api_latency_ms':          [{ threshold: 'p(95)<1000', abortOnFail: false }],
    // Auth endpoint p95 under stress
    'stress_auth_latency_ms':         [{ threshold: 'p(95)<2000', abortOnFail: false }],
    // HTTP failures (network / 5xx)
    'http_req_failed':                [{ threshold: 'rate<0.10',  abortOnFail: false }],
  },
};

// ── Setup ──────────────────────────────────────────────────────────────────

export function setup() {
  const token = login();
  if (!token) {
    console.error('Setup failed: could not authenticate');
  }
  return { token };
}

// ── Default function (VU workload) ─────────────────────────────────────────

export default function ({ token }) {
  if (!token) return;

  const headers = authHeaders(token);

  // Mix of read-heavy operations (realistic production traffic profile)
  const scenario = Math.random();

  if (scenario < 0.40) {
    // 40%: List health-safety incidents (paginated)
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/health-safety/incidents?page=1&limit=20`, { headers });
    apiLatency.add(Date.now() - start);
    errorRate.add(res.status >= 400);
    check(res, { 'hs incidents 2xx': (r) => r.status < 400 });

  } else if (scenario < 0.65) {
    // 25%: List quality documents
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/quality/documents?page=1&limit=20`, { headers });
    apiLatency.add(Date.now() - start);
    errorRate.add(res.status >= 400);
    check(res, { 'quality docs 2xx': (r) => r.status < 400 });

  } else if (scenario < 0.80) {
    // 15%: Environment aspects list
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/environment/aspects?page=1&limit=20`, { headers });
    apiLatency.add(Date.now() - start);
    errorRate.add(res.status >= 400);
    check(res, { 'env aspects 2xx': (r) => r.status < 400 });

  } else if (scenario < 0.90) {
    // 10%: Dashboard (gateway-handled)
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/dashboard`, { headers });
    apiLatency.add(Date.now() - start);
    errorRate.add(res.status >= 400);
    check(res, { 'dashboard 2xx': (r) => r.status < 400 });

  } else {
    // 10%: Auth refresh (simulates token renewal)
    const start = Date.now();
    const res = http.post(`${BASE_URL}/api/auth/login`,
      JSON.stringify({ email: 'admin@ims.local', password: 'admin123' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    authLatency.add(Date.now() - start);
    errorRate.add(res.status >= 400);
    check(res, { 'login 2xx': (r) => r.status < 400 });
  }

  // Think time: 0.5–2s between requests (simulates real user pacing)
  sleep(0.5 + Math.random() * 1.5);
}

// ── Teardown ───────────────────────────────────────────────────────────────

export function teardown(data) {
  console.log('Stress test complete. Check thresholds above for SLO violations.');
}
