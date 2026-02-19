import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const healthCheckDuration = new Trend('health_check_duration', true);

// Configuration
const GATEWAY_URL = __ENV.GATEWAY_URL || 'http://localhost:4000';
const AUTH_EMAIL = __ENV.AUTH_EMAIL || 'admin@ims.local';
const AUTH_PASSWORD = __ENV.AUTH_PASSWORD || 'admin123';

// Service definitions with direct ports and key endpoints
const services = new SharedArray('services', function () {
  return [
    {
      name: 'Health & Safety',
      port: 4001,
      healthPath: '/health',
      endpoints: [
        { path: '/api/risks', method: 'GET' },
        { path: '/api/incidents', method: 'GET' },
        { path: '/api/audits', method: 'GET' },
      ],
    },
    {
      name: 'Environment',
      port: 4002,
      healthPath: '/health',
      endpoints: [
        { path: '/api/aspects', method: 'GET' },
        { path: '/api/events', method: 'GET' },
        { path: '/api/legal', method: 'GET' },
      ],
    },
    {
      name: 'Quality',
      port: 4003,
      healthPath: '/health',
      endpoints: [
        { path: '/api/ncrs', method: 'GET' },
        { path: '/api/audits', method: 'GET' },
        { path: '/api/documents', method: 'GET' },
      ],
    },
    {
      name: 'AI Analysis',
      port: 4004,
      healthPath: '/health',
      endpoints: [{ path: '/api/status', method: 'GET' }],
    },
    {
      name: 'Inventory',
      port: 4005,
      healthPath: '/health',
      endpoints: [
        { path: '/api/items', method: 'GET' },
        { path: '/api/warehouses', method: 'GET' },
        { path: '/api/movements', method: 'GET' },
      ],
    },
    {
      name: 'HR',
      port: 4006,
      healthPath: '/health',
      endpoints: [
        { path: '/api/employees', method: 'GET' },
        { path: '/api/departments', method: 'GET' },
        { path: '/api/positions', method: 'GET' },
      ],
    },
    {
      name: 'Payroll',
      port: 4007,
      healthPath: '/health',
      endpoints: [
        { path: '/api/payroll-runs', method: 'GET' },
        { path: '/api/jurisdictions', method: 'GET' },
      ],
    },
    {
      name: 'Workflows',
      port: 4008,
      healthPath: '/health',
      endpoints: [
        { path: '/api/workflows', method: 'GET' },
        { path: '/api/tasks', method: 'GET' },
      ],
    },
    {
      name: 'Project Management',
      port: 4009,
      healthPath: '/health',
      endpoints: [
        { path: '/api/projects', method: 'GET' },
        { path: '/api/tasks', method: 'GET' },
      ],
    },
    {
      name: 'Automotive',
      port: 4010,
      healthPath: '/health',
      endpoints: [
        { path: '/api/ppap', method: 'GET' },
        { path: '/api/fmea', method: 'GET' },
      ],
    },
    {
      name: 'Medical',
      port: 4011,
      healthPath: '/health',
      endpoints: [
        { path: '/api/devices', method: 'GET' },
        { path: '/api/complaints', method: 'GET' },
      ],
    },
    {
      name: 'Aerospace',
      port: 4012,
      healthPath: '/health',
      endpoints: [
        { path: '/api/parts', method: 'GET' },
        { path: '/api/ncrs', method: 'GET' },
      ],
    },
    {
      name: 'Finance',
      port: 4013,
      healthPath: '/health',
      endpoints: [
        { path: '/api/accounts', method: 'GET' },
        { path: '/api/journal-entries', method: 'GET' },
        { path: '/api/invoices', method: 'GET' },
      ],
    },
    {
      name: 'CRM',
      port: 4014,
      healthPath: '/health',
      endpoints: [
        { path: '/api/contacts', method: 'GET' },
        { path: '/api/companies', method: 'GET' },
        { path: '/api/deals', method: 'GET' },
      ],
    },
    {
      name: 'InfoSec',
      port: 4015,
      healthPath: '/health',
      endpoints: [
        { path: '/api/assets', method: 'GET' },
        { path: '/api/risks', method: 'GET' },
        { path: '/api/incidents', method: 'GET' },
      ],
    },
    {
      name: 'ESG',
      port: 4016,
      healthPath: '/health',
      endpoints: [
        { path: '/api/emissions', method: 'GET' },
        { path: '/api/targets', method: 'GET' },
        { path: '/api/initiatives', method: 'GET' },
      ],
    },
    {
      name: 'CMMS',
      port: 4017,
      healthPath: '/health',
      endpoints: [
        { path: '/api/assets', method: 'GET' },
        { path: '/api/work-orders', method: 'GET' },
        { path: '/api/preventive-maintenance', method: 'GET' },
      ],
    },
    {
      name: 'Portal',
      port: 4018,
      healthPath: '/health',
      endpoints: [
        { path: '/api/portal/customer/dashboard', method: 'GET' },
        { path: '/api/portal/supplier/dashboard', method: 'GET' },
      ],
    },
    {
      name: 'Food Safety',
      port: 4019,
      healthPath: '/health',
      endpoints: [
        { path: '/api/haccp-plans', method: 'GET' },
        { path: '/api/ccps', method: 'GET' },
        { path: '/api/audits', method: 'GET' },
      ],
    },
    {
      name: 'Energy',
      port: 4020,
      healthPath: '/health',
      endpoints: [
        { path: '/api/consumption', method: 'GET' },
        { path: '/api/meters', method: 'GET' },
        { path: '/api/baselines', method: 'GET' },
      ],
    },
    {
      name: 'Analytics',
      port: 4021,
      healthPath: '/health',
      endpoints: [
        { path: '/api/kpis', method: 'GET' },
        { path: '/api/dashboards', method: 'GET' },
      ],
    },
    {
      name: 'Field Service',
      port: 4022,
      healthPath: '/health',
      endpoints: [
        { path: '/api/jobs', method: 'GET' },
        { path: '/api/technicians', method: 'GET' },
        { path: '/api/schedules', method: 'GET' },
      ],
    },
    {
      name: 'ISO 42001',
      port: 4023,
      healthPath: '/health',
      endpoints: [
        { path: '/api/systems', method: 'GET' },
        { path: '/api/risks', method: 'GET' },
      ],
    },
    {
      name: 'ISO 37001',
      port: 4024,
      healthPath: '/health',
      endpoints: [
        { path: '/api/risks', method: 'GET' },
        { path: '/api/controls', method: 'GET' },
      ],
    },
    {
      name: 'Marketing',
      port: 4025,
      healthPath: '/health',
      endpoints: [
        { path: '/api/leads', method: 'GET' },
        { path: '/api/chatbot/sessions', method: 'GET' },
      ],
    },
    {
      name: 'Partners',
      port: 4026,
      healthPath: '/health',
      endpoints: [
        { path: '/api/deals', method: 'GET' },
        { path: '/api/referrals', method: 'GET' },
      ],
    },
    {
      name: 'Risk',
      port: 4027,
      healthPath: '/health',
      endpoints: [
        { path: '/api/risks', method: 'GET' },
        { path: '/api/controls', method: 'GET' },
        { path: '/api/kri', method: 'GET' },
      ],
    },
    {
      name: 'Training',
      port: 4028,
      healthPath: '/health',
      endpoints: [
        { path: '/api/courses', method: 'GET' },
        { path: '/api/enrollments', method: 'GET' },
      ],
    },
    {
      name: 'Suppliers',
      port: 4029,
      healthPath: '/health',
      endpoints: [
        { path: '/api/suppliers', method: 'GET' },
        { path: '/api/evaluations', method: 'GET' },
      ],
    },
    {
      name: 'Assets',
      port: 4030,
      healthPath: '/health',
      endpoints: [
        { path: '/api/assets', method: 'GET' },
        { path: '/api/categories', method: 'GET' },
      ],
    },
    {
      name: 'Documents',
      port: 4031,
      healthPath: '/health',
      endpoints: [
        { path: '/api/documents', method: 'GET' },
        { path: '/api/categories', method: 'GET' },
      ],
    },
    {
      name: 'Complaints',
      port: 4032,
      healthPath: '/health',
      endpoints: [{ path: '/api/complaints', method: 'GET' }],
    },
    {
      name: 'Contracts',
      port: 4033,
      healthPath: '/health',
      endpoints: [{ path: '/api/contracts', method: 'GET' }],
    },
    {
      name: 'PTW',
      port: 4034,
      healthPath: '/health',
      endpoints: [{ path: '/api/permits', method: 'GET' }],
    },
    {
      name: 'Reg Monitor',
      port: 4035,
      healthPath: '/health',
      endpoints: [{ path: '/api/regulations', method: 'GET' }],
    },
    {
      name: 'Incidents',
      port: 4036,
      healthPath: '/health',
      endpoints: [{ path: '/api/incidents', method: 'GET' }],
    },
    {
      name: 'Audits',
      port: 4037,
      healthPath: '/health',
      endpoints: [{ path: '/api/audits', method: 'GET' }],
    },
    {
      name: 'Mgmt Review',
      port: 4038,
      healthPath: '/health',
      endpoints: [{ path: '/api/reviews', method: 'GET' }],
    },
    {
      name: 'Chemicals',
      port: 4040,
      healthPath: '/health',
      endpoints: [
        { path: '/api/chemicals', method: 'GET' },
        { path: '/api/sds', method: 'GET' },
        { path: '/api/coshh', method: 'GET' },
      ],
    },
    {
      name: 'Emergency',
      port: 4041,
      healthPath: '/health',
      endpoints: [
        { path: '/api/premises', method: 'GET' },
        { path: '/api/equipment', method: 'GET' },
        { path: '/api/drills', method: 'GET' },
      ],
    },
  ];
});

// k6 options - lower VU count for focused testing
export const options = {
  stages: [
    { duration: '15s', target: 10 }, // Ramp up to 10 VUs
    { duration: '1m', target: 10 }, // Hold 10 VUs for 1 minute
    { duration: '15s', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // p95 response time < 500ms
    http_req_failed: ['rate<0.05'], // Allow slightly higher error rate (services may be down)
    errors: ['rate<0.05'],
  },
  tags: {
    testSuite: 'individual-services',
  },
};

// Setup: authenticate via gateway to get token
export function setup() {
  const loginRes = http.post(
    `${GATEWAY_URL}/api/auth/login`,
    JSON.stringify({
      email: AUTH_EMAIL,
      password: AUTH_PASSWORD,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  if (loginRes.status !== 200) {
    console.warn(`Authentication failed (status ${loginRes.status}). Tests will run without auth.`);
    return { token: null };
  }

  try {
    const body = JSON.parse(loginRes.body);
    return { token: body.data.accessToken };
  } catch {
    console.warn('Failed to parse auth response. Tests will run without auth.');
    return { token: null };
  }
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

  // Iterate through each service
  for (const service of services) {
    const baseUrl = `http://localhost:${service.port}`;

    group(service.name, function () {
      // Test health endpoint
      group('Health Check', function () {
        const healthRes = http.get(`${baseUrl}${service.healthPath}`, {
          headers: { 'Content-Type': 'application/json' },
          tags: { service: service.name, endpoint: 'health' },
        });
        const passed = check(healthRes, {
          [`${service.name} health check responds`]: (r) => r.status === 200 || r.status === 503,
        });
        if (healthRes.status === 200) {
          healthCheckDuration.add(healthRes.timings.duration);
        }
        errorRate.add(!passed);
      });

      // Test key endpoints
      for (const endpoint of service.endpoints) {
        group(endpoint.path, function () {
          let res;
          if (endpoint.method === 'GET') {
            res = http.get(`${baseUrl}${endpoint.path}`, {
              ...params,
              tags: { service: service.name, endpoint: endpoint.path },
            });
          } else if (endpoint.method === 'POST' && endpoint.body) {
            res = http.post(`${baseUrl}${endpoint.path}`, JSON.stringify(endpoint.body), {
              ...params,
              tags: { service: service.name, endpoint: endpoint.path },
            });
          }

          if (res) {
            const passed = check(res, {
              [`${service.name} ${endpoint.path} status OK`]: (r) =>
                r.status === 200 || r.status === 401 || r.status === 403,
              [`${service.name} ${endpoint.path} p95 < 200ms`]: (r) => r.timings.duration < 200,
            });
            errorRate.add(!passed);
          }
        });

        sleep(0.3);
      }
    });

    sleep(0.5);
  }
}

// Teardown
export function teardown(data) {
  console.log('Individual services load test completed.');
  console.log(`Tested ${services.length} services directly.`);
}
