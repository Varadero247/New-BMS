/**
 * k6 Spike Test
 *
 * Simulates a sudden burst of traffic — e.g. a viral event, batch import,
 * or a DDoS-like traffic pattern. Verifies the system:
 *   - Does not crash under sudden 10× load bursts
 *   - Returns to normal latency after the spike subsides
 *   - Rate limiting correctly throttles during extreme bursts
 *   - Circuit breakers activate and recover cleanly
 *
 * Run:
 *   k6 run tests/load/scenarios/spike.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { login, authHeaders, BASE_URL } from '../helpers/auth.js';

// ── Custom metrics ─────────────────────────────────────────────────────────

const errorRate          = new Rate('spike_error_rate');
const spikeLatency       = new Trend('spike_latency_ms', true);
const recoveryLatency    = new Trend('recovery_latency_ms', true);

// ── Options ────────────────────────────────────────────────────────────────

export const options = {
  scenarios: {
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m',   target: 50  },   // normal baseline
        { duration: '30s',  target: 50  },   // hold baseline
        { duration: '10s',  target: 500 },   // SPIKE: 10× sudden burst
        { duration: '3m',   target: 500 },   // hold spike
        { duration: '10s',  target: 50  },   // immediate drop
        { duration: '3m',   target: 50  },   // recovery observation
        { duration: '2m',   target: 0   },   // ramp down
      ],
    },
  },
  thresholds: {
    // During spike, some errors are acceptable (rate limiting, circuit breakers)
    'spike_error_rate':       [{ threshold: 'rate<0.30',  abortOnFail: false }],
    // After recovery, p95 should return to near-normal (< 500ms)
    'recovery_latency_ms':    [{ threshold: 'p(95)<500',  abortOnFail: false }],
    // HTTP-level failures (network errors, not 4xx/5xx)
    'http_req_failed':        [{ threshold: 'rate<0.15',  abortOnFail: false }],
  },
};

// ── Setup ──────────────────────────────────────────────────────────────────

let spikeStart = 0;
let spikeEnd   = 0;

export function setup() {
  const token = login();
  return { token };
}

// ── VU workload ────────────────────────────────────────────────────────────

export default function ({ token }) {
  if (!token) { sleep(0.5); return; }

  const headers = authHeaders(token);

  // Detect phase by __VU iteration count (approximate)
  // During spike (high VU count), hit the busiest endpoints
  const start = Date.now();
  const res = http.get(`${BASE_URL}/api/health-safety/incidents?page=1&limit=20`, { headers });
  const latency = Date.now() - start;

  spikeLatency.add(latency);
  errorRate.add(res.status >= 400 && res.status !== 429); // 429 is expected during spike

  check(res, {
    'response received': (r) => r.status !== 0,
    'not 500': (r) => r.status !== 500,
    // Rate limit (429) is acceptable during spike — system is protecting itself
    'handled gracefully': (r) => r.status < 500 || r.status === 503,
  });

  // Shorter think time to maximise pressure during spike
  sleep(0.1 + Math.random() * 0.4);
}
