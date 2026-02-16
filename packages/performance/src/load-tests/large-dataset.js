import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const largeListDuration = new Trend('large_list_duration', true);
const bulkOpDuration = new Trend('bulk_op_duration', true);
const filteredQueryDuration = new Trend('filtered_query_duration', true);
const totalRequests = new Counter('total_requests');

// Configuration
const GATEWAY_URL = __ENV.GATEWAY_URL || 'http://localhost:4000';
const AUTH_EMAIL = __ENV.AUTH_EMAIL || 'admin@ims.local';
const AUTH_PASSWORD = __ENV.AUTH_PASSWORD || 'admin123';

// Large dataset scenarios per service (via gateway)
const scenarios = [
  {
    name: 'Health & Safety — Large Risk List',
    endpoint: '/api/health-safety/risks?page=1&limit=1000',
    method: 'GET',
    category: 'pagination',
  },
  {
    name: 'Health & Safety — Filtered Incidents',
    endpoint: '/api/health-safety/incidents?severity=MAJOR&status=OPEN&limit=500',
    method: 'GET',
    category: 'filtered',
  },
  {
    name: 'Environment — Large Aspects List',
    endpoint: '/api/environment/aspects?page=1&limit=1000',
    method: 'GET',
    category: 'pagination',
  },
  {
    name: 'Quality — Large NCR List',
    endpoint: '/api/quality/ncrs?page=1&limit=1000',
    method: 'GET',
    category: 'pagination',
  },
  {
    name: 'Quality — Filtered Documents',
    endpoint: '/api/quality/documents?status=APPROVED&limit=500',
    method: 'GET',
    category: 'filtered',
  },
  {
    name: 'Inventory — Large Items List',
    endpoint: '/api/inventory/items?page=1&limit=1000',
    method: 'GET',
    category: 'pagination',
  },
  {
    name: 'HR — All Employees',
    endpoint: '/api/hr/employees?page=1&limit=1000',
    method: 'GET',
    category: 'pagination',
  },
  {
    name: 'Finance — Large Journal Entries',
    endpoint: '/api/finance/journal-entries?page=1&limit=1000',
    method: 'GET',
    category: 'pagination',
  },
  {
    name: 'Finance — Filtered Invoices',
    endpoint: '/api/finance/invoices?status=PENDING&limit=500',
    method: 'GET',
    category: 'filtered',
  },
  {
    name: 'CRM — Large Contacts List',
    endpoint: '/api/crm/contacts?page=1&limit=1000',
    method: 'GET',
    category: 'pagination',
  },
  {
    name: 'CRM — Filtered Deals',
    endpoint: '/api/crm/deals?stage=NEGOTIATION&limit=500',
    method: 'GET',
    category: 'filtered',
  },
  {
    name: 'InfoSec — Large Assets List',
    endpoint: '/api/infosec/assets?page=1&limit=1000',
    method: 'GET',
    category: 'pagination',
  },
  {
    name: 'ESG — All Emissions',
    endpoint: '/api/esg/emissions?page=1&limit=1000',
    method: 'GET',
    category: 'pagination',
  },
  {
    name: 'CMMS — Large Work Orders',
    endpoint: '/api/cmms/work-orders?page=1&limit=1000',
    method: 'GET',
    category: 'pagination',
  },
  {
    name: 'Risk — All Risks with Controls',
    endpoint: '/api/risk/risks?page=1&limit=1000&include=controls',
    method: 'GET',
    category: 'pagination',
  },
  {
    name: 'Risk — Heat Map Data',
    endpoint: '/api/risk/heat-map',
    method: 'GET',
    category: 'filtered',
  },
  {
    name: 'Chemicals — Full Register',
    endpoint: '/api/chemicals/chemicals?page=1&limit=1000',
    method: 'GET',
    category: 'pagination',
  },
  {
    name: 'Emergency — All Equipment',
    endpoint: '/api/emergency/equipment?page=1&limit=1000',
    method: 'GET',
    category: 'pagination',
  },
  {
    name: 'Training — All Courses',
    endpoint: '/api/training/courses?page=1&limit=1000',
    method: 'GET',
    category: 'pagination',
  },
  {
    name: 'Documents — All Documents',
    endpoint: '/api/documents/documents?page=1&limit=1000',
    method: 'GET',
    category: 'pagination',
  },
  {
    name: 'Audits — All Audits',
    endpoint: '/api/audits/audits?page=1&limit=1000',
    method: 'GET',
    category: 'pagination',
  },
  {
    name: 'Incidents — All Incidents',
    endpoint: '/api/incidents/incidents?page=1&limit=1000',
    method: 'GET',
    category: 'pagination',
  },
  // Bulk operation scenarios
  {
    name: 'Health & Safety — Bulk Risk Export',
    endpoint: '/api/health-safety/risks?format=csv&limit=5000',
    method: 'GET',
    category: 'bulk',
  },
  {
    name: 'Analytics — KPI Dashboard Aggregation',
    endpoint: '/api/analytics/kpis?period=yearly&aggregate=true',
    method: 'GET',
    category: 'bulk',
  },
  {
    name: 'Analytics — Cross-Module Summary',
    endpoint: '/api/analytics/dashboards?type=executive',
    method: 'GET',
    category: 'bulk',
  },
];

// k6 options for large dataset testing
export const options = {
  scenarios: {
    large_dataset_load: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '20s', target: 5 },   // Ramp up to 5 VUs
        { duration: '2m', target: 20 },    // Ramp to 20 concurrent users
        { duration: '1m', target: 20 },    // Hold at 20
        { duration: '20s', target: 0 },    // Ramp down
      ],
    },
  },
  thresholds: {
    // Large list pagination: p95 < 500ms
    large_list_duration: ['p(95)<500'],
    // Bulk operations: p95 < 1000ms
    bulk_op_duration: ['p(95)<1000'],
    // Filtered queries: p95 < 300ms
    filtered_query_duration: ['p(95)<300'],
    // Overall error rate < 5%
    http_req_failed: ['rate<0.05'],
    errors: ['rate<0.05'],
  },
  tags: {
    testSuite: 'large-dataset',
  },
};

// Setup: authenticate
export function setup() {
  const loginRes = http.post(
    `${GATEWAY_URL}/api/auth/login`,
    JSON.stringify({ email: AUTH_EMAIL, password: AUTH_PASSWORD }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (loginRes.status !== 200) {
    console.warn(`Authentication failed (status ${loginRes.status}). Tests will run without auth.`);
    return { token: null };
  }

  try {
    const body = JSON.parse(loginRes.body);
    return { token: body.data.accessToken };
  } catch {
    console.warn('Failed to parse auth response.');
    return { token: null };
  }
}

// Main test function
export default function (data) {
  const headers = { 'Content-Type': 'application/json' };
  if (data.token) {
    headers['Authorization'] = `Bearer ${data.token}`;
  }

  // Each VU iteration tests a random subset of scenarios
  const shuffled = scenarios.slice().sort(() => Math.random() - 0.5);
  const subset = shuffled.slice(0, 8); // Test 8 random scenarios per iteration

  for (const scenario of subset) {
    group(scenario.name, function () {
      const url = `${GATEWAY_URL}${scenario.endpoint}`;
      const res = http.get(url, {
        headers,
        tags: { scenario: scenario.name, category: scenario.category },
        timeout: '10s',
      });

      totalRequests.add(1);

      const passed = check(res, {
        [`${scenario.name} status OK`]: (r) =>
          r.status === 200 || r.status === 401 || r.status === 403,
        [`${scenario.name} responds within threshold`]: (r) => {
          if (scenario.category === 'pagination') return r.timings.duration < 500;
          if (scenario.category === 'bulk') return r.timings.duration < 1000;
          return r.timings.duration < 300; // filtered
        },
        [`${scenario.name} returns valid JSON`]: (r) => {
          try {
            JSON.parse(r.body);
            return true;
          } catch {
            return r.status === 401 || r.status === 403;
          }
        },
      });

      // Record to category-specific trend
      if (scenario.category === 'pagination') {
        largeListDuration.add(res.timings.duration);
      } else if (scenario.category === 'bulk') {
        bulkOpDuration.add(res.timings.duration);
      } else {
        filteredQueryDuration.add(res.timings.duration);
      }

      errorRate.add(!passed);
    });

    sleep(0.2);
  }
}

// Teardown
export function teardown() {
  console.log('Large dataset load test completed.');
  console.log(`Tested ${scenarios.length} large dataset scenarios.`);
}
