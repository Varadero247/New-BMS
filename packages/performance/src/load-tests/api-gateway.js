import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const authDuration = new Trend('auth_duration', true);

// Test configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';
const AUTH_EMAIL = __ENV.AUTH_EMAIL || 'admin@ims.local';
const AUTH_PASSWORD = __ENV.AUTH_PASSWORD || 'admin123';

// Test data
const testData = new SharedArray('endpoints', function () {
  return [
    // Health & Safety
    { service: 'health-safety', path: '/api/health-safety/risks', method: 'GET' },
    // Environment
    { service: 'environment', path: '/api/environment/aspects', method: 'GET' },
    // Quality
    { service: 'quality', path: '/api/quality/ncrs', method: 'GET' },
    // Finance
    { service: 'finance', path: '/api/finance/accounts', method: 'GET' },
    // CRM
    { service: 'crm', path: '/api/crm/contacts', method: 'GET' },
    // InfoSec
    { service: 'infosec', path: '/api/infosec/assets', method: 'GET' },
    // ESG
    { service: 'esg', path: '/api/esg/emissions', method: 'GET' },
    // CMMS
    { service: 'cmms', path: '/api/cmms/assets', method: 'GET' },
    // Food Safety
    { service: 'food-safety', path: '/api/food-safety/haccp-plans', method: 'GET' },
    // Energy
    { service: 'energy', path: '/api/energy/consumption', method: 'GET' },
    // Analytics
    { service: 'analytics', path: '/api/analytics/kpis', method: 'GET' },
    // Field Service
    { service: 'field-service', path: '/api/field-service/jobs', method: 'GET' },
    // Gateway - Auth
    { service: 'gateway-auth', path: '/api/auth/login', method: 'POST' },
    // Gateway - Roles
    { service: 'gateway-roles', path: '/api/roles', method: 'GET' },
    // Gateway - Notifications
    { service: 'gateway-notifications', path: '/api/notifications', method: 'GET' },
  ];
});

// k6 options
export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Ramp up to 50 VUs over 30s
    { duration: '2m', target: 50 },    // Hold 50 VUs for 2 minutes
    { duration: '30s', target: 0 },    // Ramp down over 30s
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],   // p95 response time < 200ms
    http_req_failed: ['rate<0.01'],     // Error rate < 1%
    errors: ['rate<0.01'],
  },
  tags: {
    testSuite: 'api-gateway',
  },
};

// Setup: authenticate and return token
export function setup() {
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({
      email: AUTH_EMAIL,
      password: AUTH_PASSWORD,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const success = check(loginRes, {
    'login successful': (r) => r.status === 200,
    'login returns token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && body.data.accessToken;
      } catch {
        return false;
      }
    },
  });

  if (!success) {
    console.error(`Authentication failed: ${loginRes.status} ${loginRes.body}`);
    return { token: null };
  }

  const body = JSON.parse(loginRes.body);
  authDuration.add(loginRes.timings.duration);

  return { token: body.data.accessToken };
}

// Main test function
export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (data.token) {
    headers['Authorization'] = `Bearer ${data.token}`;
  }

  const params = { headers };

  // Test Health & Safety endpoints
  group('Health & Safety', function () {
    const res = http.get(`${BASE_URL}/api/health-safety/risks`, params);
    const passed = check(res, {
      'health-safety risks status 200': (r) => r.status === 200,
      'health-safety risks p95 < 200ms': (r) => r.timings.duration < 200,
    });
    errorRate.add(!passed);
    sleep(0.5);
  });

  // Test Environment endpoints
  group('Environment', function () {
    const res = http.get(`${BASE_URL}/api/environment/aspects`, params);
    const passed = check(res, {
      'environment aspects status 200': (r) => r.status === 200,
      'environment aspects p95 < 200ms': (r) => r.timings.duration < 200,
    });
    errorRate.add(!passed);
    sleep(0.5);
  });

  // Test Quality endpoints
  group('Quality', function () {
    const res = http.get(`${BASE_URL}/api/quality/ncrs`, params);
    const passed = check(res, {
      'quality ncrs status 200': (r) => r.status === 200,
      'quality ncrs p95 < 200ms': (r) => r.timings.duration < 200,
    });
    errorRate.add(!passed);
    sleep(0.5);
  });

  // Test Finance endpoints
  group('Finance', function () {
    const res = http.get(`${BASE_URL}/api/finance/accounts`, params);
    const passed = check(res, {
      'finance accounts status 200': (r) => r.status === 200,
      'finance accounts p95 < 200ms': (r) => r.timings.duration < 200,
    });
    errorRate.add(!passed);
    sleep(0.5);
  });

  // Test CRM endpoints
  group('CRM', function () {
    const res = http.get(`${BASE_URL}/api/crm/contacts`, params);
    const passed = check(res, {
      'crm contacts status 200': (r) => r.status === 200,
      'crm contacts p95 < 200ms': (r) => r.timings.duration < 200,
    });
    errorRate.add(!passed);
    sleep(0.5);
  });

  // Test InfoSec endpoints
  group('InfoSec', function () {
    const res = http.get(`${BASE_URL}/api/infosec/assets`, params);
    const passed = check(res, {
      'infosec assets status 200': (r) => r.status === 200,
      'infosec assets p95 < 200ms': (r) => r.timings.duration < 200,
    });
    errorRate.add(!passed);
    sleep(0.5);
  });

  // Test ESG endpoints
  group('ESG', function () {
    const res = http.get(`${BASE_URL}/api/esg/emissions`, params);
    const passed = check(res, {
      'esg emissions status 200': (r) => r.status === 200,
      'esg emissions p95 < 200ms': (r) => r.timings.duration < 200,
    });
    errorRate.add(!passed);
    sleep(0.5);
  });

  // Test CMMS endpoints
  group('CMMS', function () {
    const res = http.get(`${BASE_URL}/api/cmms/assets`, params);
    const passed = check(res, {
      'cmms assets status 200': (r) => r.status === 200,
      'cmms assets p95 < 200ms': (r) => r.timings.duration < 200,
    });
    errorRate.add(!passed);
    sleep(0.5);
  });

  // Test Food Safety endpoints
  group('Food Safety', function () {
    const res = http.get(`${BASE_URL}/api/food-safety/haccp-plans`, params);
    const passed = check(res, {
      'food-safety haccp-plans status 200': (r) => r.status === 200,
      'food-safety haccp-plans p95 < 200ms': (r) => r.timings.duration < 200,
    });
    errorRate.add(!passed);
    sleep(0.5);
  });

  // Test Energy endpoints
  group('Energy', function () {
    const res = http.get(`${BASE_URL}/api/energy/consumption`, params);
    const passed = check(res, {
      'energy consumption status 200': (r) => r.status === 200,
      'energy consumption p95 < 200ms': (r) => r.timings.duration < 200,
    });
    errorRate.add(!passed);
    sleep(0.5);
  });

  // Test Analytics endpoints
  group('Analytics', function () {
    const res = http.get(`${BASE_URL}/api/analytics/kpis`, params);
    const passed = check(res, {
      'analytics kpis status 200': (r) => r.status === 200,
      'analytics kpis p95 < 200ms': (r) => r.timings.duration < 200,
    });
    errorRate.add(!passed);
    sleep(0.5);
  });

  // Test Field Service endpoints
  group('Field Service', function () {
    const res = http.get(`${BASE_URL}/api/field-service/jobs`, params);
    const passed = check(res, {
      'field-service jobs status 200': (r) => r.status === 200,
      'field-service jobs p95 < 200ms': (r) => r.timings.duration < 200,
    });
    errorRate.add(!passed);
    sleep(0.5);
  });

  // Test Auth flow
  group('Auth', function () {
    const res = http.post(
      `${BASE_URL}/api/auth/login`,
      JSON.stringify({
        email: AUTH_EMAIL,
        password: AUTH_PASSWORD,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    const passed = check(res, {
      'auth login status 200': (r) => r.status === 200,
      'auth login returns token': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.data && body.data.accessToken;
        } catch {
          return false;
        }
      },
    });
    errorRate.add(!passed);
    sleep(0.5);
  });

  // Test Roles endpoint
  group('Roles', function () {
    const res = http.get(`${BASE_URL}/api/roles`, params);
    const passed = check(res, {
      'roles listing status 200': (r) => r.status === 200,
    });
    errorRate.add(!passed);
    sleep(0.5);
  });

  // Test Notifications endpoint
  group('Notifications', function () {
    const res = http.get(`${BASE_URL}/api/notifications`, params);
    const passed = check(res, {
      'notifications listing status 200': (r) => r.status === 200,
    });
    errorRate.add(!passed);
    sleep(0.5);
  });

  sleep(1);
}

// Teardown
export function teardown(data) {
  console.log('API Gateway load test completed.');
  if (!data.token) {
    console.warn('WARNING: Tests ran without authentication. Results may not reflect production behavior.');
  }
}
