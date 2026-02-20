/**
 * k6 Soak Test (Endurance Test)
 *
 * Runs at normal production load for an extended period to detect:
 *   - Memory leaks (gradual latency / OOM)
 *   - Connection pool exhaustion
 *   - Database resource contention
 *   - Log disk growth
 *   - Rate-limit state drift
 *
 * Duration:    45 minutes
 * Target VUs:  50 (representative production load)
 *
 * Run:
 *   k6 run tests/load/scenarios/soak.js
 *   k6 run --duration 90m -e VUS=80 tests/load/scenarios/soak.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { login, authHeaders, BASE_URL } from '../helpers/auth.js';

// ── Custom metrics ─────────────────────────────────────────────────────────

const errorRate          = new Rate('soak_error_rate');
const p95Latency         = new Trend('soak_p95_latency_ms', true);
const totalRequests      = new Counter('soak_total_requests');
const successCount       = new Counter('soak_success_count');

// ── Options ────────────────────────────────────────────────────────────────

const TARGET_VUS  = parseInt(__ENV.VUS  || '50');
const DURATION    = __ENV.DURATION || '45m';

export const options = {
  scenarios: {
    soak: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '3m',    target: TARGET_VUS },  // gentle ramp up
        { duration: DURATION, target: TARGET_VUS },  // sustained load
        { duration: '5m',    target: 0 },            // cool down
      ],
    },
  },
  thresholds: {
    // Error rate must stay below 2% throughout the soak
    'soak_error_rate':         [{ threshold: 'rate<0.02',  abortOnFail: true }],
    // p95 latency must stay below 800ms (allows for slight degradation)
    'soak_p95_latency_ms':     [{ threshold: 'p(95)<800',  abortOnFail: false }],
    // HTTP network failures must stay below 1%
    'http_req_failed':         [{ threshold: 'rate<0.01',  abortOnFail: false }],
    // Median latency must stay below 200ms throughout
    'http_req_duration':       [
      { threshold: 'p(50)<200',  abortOnFail: false },
      { threshold: 'p(95)<800',  abortOnFail: false },
    ],
  },
};

// ── Setup ──────────────────────────────────────────────────────────────────

export function setup() {
  const token = login();
  if (!token) console.error('Setup: authentication failed');
  return { token, startTime: Date.now() };
}

// ── VU workload ────────────────────────────────────────────────────────────

export default function ({ token }) {
  if (!token) { sleep(1); return; }

  const headers = authHeaders(token);
  totalRequests.add(1);

  // Broad endpoint coverage to exercise all major DB tables
  const endpoints = [
    `${BASE_URL}/api/health-safety/risks?page=1&limit=10`,
    `${BASE_URL}/api/environment/aspects?page=1&limit=10`,
    `${BASE_URL}/api/quality/documents?page=1&limit=10`,
    `${BASE_URL}/api/inventory/items?page=1&limit=10`,
    `${BASE_URL}/api/hr/employees?page=1&limit=10`,
    `${BASE_URL}/api/workflows/definitions?page=1&limit=10`,
    `${BASE_URL}/api/dashboard`,
    `${BASE_URL}/api/audits?page=1&limit=10`,
    `${BASE_URL}/api/incidents?page=1&limit=10`,
    `${BASE_URL}/api/training/courses?page=1&limit=10`,
  ];

  const url = endpoints[Math.floor(Math.random() * endpoints.length)];
  const start = Date.now();
  const res = http.get(url, { headers });
  const latency = Date.now() - start;

  p95Latency.add(latency);
  errorRate.add(res.status >= 400);

  const ok = check(res, {
    'response is 2xx or 3xx': (r) => r.status < 400,
    'response has body': (r) => r.body && r.body.length > 0,
  });

  if (ok) successCount.add(1);

  // Representative think time
  sleep(1 + Math.random() * 2);
}

// ── Teardown ───────────────────────────────────────────────────────────────

export function teardown({ startTime }) {
  const durationMin = ((Date.now() - startTime) / 60_000).toFixed(1);
  console.log(`Soak test ran for ${durationMin} minutes. Check metrics for memory leak signatures (latency drift).`);
}
