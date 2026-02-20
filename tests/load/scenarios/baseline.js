/**
 * k6 Baseline / Smoke Test
 *
 * Runs 10 VUs for 1 minute to establish a performance baseline and
 * verify the test infrastructure itself works end-to-end.
 *
 * Run before any other load test:
 *   k6 run tests/load/scenarios/baseline.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { login, authHeaders, BASE_URL } from '../helpers/auth.js';

const errorRate = new Rate('baseline_error_rate');

export const options = {
  vus: 10,
  duration: '1m',
  thresholds: {
    // Strict baselines — nothing should fail at 10 VUs
    'baseline_error_rate': [{ threshold: 'rate<0.01', abortOnFail: true }],
    'http_req_duration':   [
      { threshold: 'p(95)<500', abortOnFail: true },
      { threshold: 'p(99)<1000', abortOnFail: true },
    ],
    'http_req_failed':     [{ threshold: 'rate<0.01', abortOnFail: true }],
  },
};

export function setup() {
  const token = login();
  if (!token) throw new Error('Baseline setup: authentication failed — is the gateway running?');
  return { token };
}

export default function ({ token }) {
  const headers = authHeaders(token);

  // Exercise each major service once per iteration
  const requests = [
    ['GET', `${BASE_URL}/api/health-safety/incidents?page=1&limit=5`],
    ['GET', `${BASE_URL}/api/environment/aspects?page=1&limit=5`],
    ['GET', `${BASE_URL}/api/quality/documents?page=1&limit=5`],
    ['GET', `${BASE_URL}/api/dashboard`],
  ];

  for (const [method, url] of requests) {
    const res = http[method.toLowerCase()](url, { headers });
    errorRate.add(res.status >= 400);
    check(res, {
      [`${url} is 2xx`]: (r) => r.status < 400,
      'has JSON body': (r) => {
        try { JSON.parse(r.body); return true; } catch { return false; }
      },
    });
  }

  sleep(2);
}
