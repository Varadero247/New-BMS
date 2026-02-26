// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import type { ApiEndpointDoc } from './types';

export const ENDPOINT_CATALOGUE: ApiEndpointDoc[] = [
  {
    method: 'POST',
    path: '/api/auth/login',
    summary: 'Authenticate user',
    description: 'Authenticates a user with email and password, returns JWT access token.',
    tags: ['auth'],
    requestBody: { required: true, schema: { email: 'string', password: 'string' } },
    responses: {
      '200': { description: 'Login successful', schema: { data: { accessToken: 'string' } } },
      '401': { description: 'Invalid credentials' },
    },
    auth: false,
    deprecated: false,
  },
  {
    method: 'POST',
    path: '/api/auth/logout',
    summary: 'Log out user',
    description: 'Invalidates the current session token.',
    tags: ['auth'],
    responses: {
      '200': { description: 'Logged out successfully' },
    },
    auth: true,
    deprecated: false,
  },
  {
    method: 'GET',
    path: '/api/health-safety/risks',
    summary: 'List risks',
    description: 'Returns a paginated list of health & safety risks for the organisation.',
    tags: ['health-safety', 'risks'],
    parameters: [
      { name: 'page', in: 'query', schema: { type: 'integer' } },
      { name: 'limit', in: 'query', schema: { type: 'integer' } },
    ],
    responses: {
      '200': { description: 'List of risks', schema: { success: true, data: [] } },
    },
    auth: true,
    deprecated: false,
  },
  {
    method: 'POST',
    path: '/api/health-safety/risks',
    summary: 'Create risk',
    description: 'Creates a new health & safety risk assessment.',
    tags: ['health-safety', 'risks'],
    responses: {
      '201': { description: 'Risk created' },
    },
    auth: true,
    deprecated: false,
  },
  {
    method: 'GET',
    path: '/api/health-safety/risks/:id',
    summary: 'Get risk by ID',
    description: 'Returns a single risk assessment by its ID.',
    tags: ['health-safety', 'risks'],
    responses: {
      '200': { description: 'Risk found' },
      '404': { description: 'Risk not found' },
    },
    auth: true,
    deprecated: false,
  },
  {
    method: 'PUT',
    path: '/api/health-safety/risks/:id',
    summary: 'Update risk',
    description: 'Updates an existing risk assessment.',
    tags: ['health-safety', 'risks'],
    responses: {
      '200': { description: 'Risk updated' },
    },
    auth: true,
    deprecated: false,
  },
  {
    method: 'DELETE',
    path: '/api/health-safety/risks/:id',
    summary: 'Delete risk',
    description: 'Deletes a risk assessment.',
    tags: ['health-safety', 'risks'],
    responses: {
      '204': { description: 'Risk deleted' },
    },
    auth: true,
    deprecated: false,
  },
  {
    method: 'GET',
    path: '/api/incidents',
    summary: 'List incidents',
    description: 'Returns a paginated list of incidents.',
    tags: ['incidents'],
    responses: {
      '200': { description: 'Incidents list' },
    },
    auth: true,
    deprecated: false,
  },
  {
    method: 'POST',
    path: '/api/incidents',
    summary: 'Report incident',
    description: 'Creates a new incident report.',
    tags: ['incidents'],
    responses: {
      '201': { description: 'Incident created' },
    },
    auth: true,
    deprecated: false,
  },
  {
    method: 'GET',
    path: '/api/documents',
    summary: 'List documents',
    description: 'Returns all documents for the organisation.',
    tags: ['documents'],
    responses: {
      '200': { description: 'Documents list' },
    },
    auth: true,
    deprecated: false,
  },
  {
    method: 'POST',
    path: '/api/documents',
    summary: 'Upload document',
    description: 'Creates a new document entry.',
    tags: ['documents'],
    responses: {
      '201': { description: 'Document created' },
    },
    auth: true,
    deprecated: false,
  },
  {
    method: 'GET',
    path: '/api/audits',
    summary: 'List audits',
    description: 'Returns all audit programmes and records.',
    tags: ['audits'],
    responses: {
      '200': { description: 'Audits list' },
    },
    auth: true,
    deprecated: false,
  },
  {
    method: 'POST',
    path: '/api/audits',
    summary: 'Create audit',
    description: 'Schedules a new audit.',
    tags: ['audits'],
    responses: {
      '201': { description: 'Audit created' },
    },
    auth: true,
    deprecated: false,
  },
  {
    method: 'GET',
    path: '/api/esg/emissions',
    summary: 'List GHG emissions',
    description: 'Returns greenhouse gas emission records.',
    tags: ['esg', 'emissions'],
    responses: {
      '200': { description: 'Emissions list' },
    },
    auth: true,
    deprecated: false,
  },
  {
    method: 'POST',
    path: '/api/esg/emissions',
    summary: 'Record emission',
    description: 'Creates a new GHG emission entry.',
    tags: ['esg', 'emissions'],
    responses: {
      '201': { description: 'Emission recorded' },
    },
    auth: true,
    deprecated: false,
  },
  {
    method: 'GET',
    path: '/api/analytics/kpis',
    summary: 'Get KPIs',
    description: 'Returns aggregated KPI metrics for the dashboard.',
    tags: ['analytics'],
    responses: {
      '200': { description: 'KPI data' },
    },
    auth: true,
    deprecated: false,
  },
  {
    method: 'GET',
    path: '/api/hr/employees',
    summary: 'List employees',
    description: 'Returns employee records for the organisation.',
    tags: ['hr'],
    responses: {
      '200': { description: 'Employee list' },
    },
    auth: true,
    deprecated: false,
  },
  {
    method: 'GET',
    path: '/api/training/courses',
    summary: 'List training courses',
    description: 'Returns available training courses.',
    tags: ['training'],
    responses: {
      '200': { description: 'Courses list' },
    },
    auth: true,
    deprecated: false,
  },
  {
    method: 'GET',
    path: '/api/suppliers',
    summary: 'List suppliers',
    description: 'Returns supplier records.',
    tags: ['suppliers'],
    responses: {
      '200': { description: 'Supplier list' },
    },
    auth: true,
    deprecated: false,
  },
  {
    method: 'GET',
    path: '/api/compliance',
    summary: 'Get compliance status',
    description: 'Returns compliance status across all modules.',
    tags: ['compliance'],
    responses: {
      '200': { description: 'Compliance data' },
    },
    auth: true,
    deprecated: false,
  },
];

/** Returns endpoints matching a given tag. */
export function getEndpointsByTag(tag: string): ApiEndpointDoc[] {
  return ENDPOINT_CATALOGUE.filter((e) => e.tags.includes(tag));
}

/** Returns endpoints matching a free-text query (path, summary, description). */
export function searchEndpoints(query: string): ApiEndpointDoc[] {
  const q = query.toLowerCase();
  return ENDPOINT_CATALOGUE.filter(
    (e) =>
      e.path.toLowerCase().includes(q) ||
      e.summary.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q)
  );
}

/** Generates a curl example for an endpoint. */
export function generateCurlExample(endpoint: ApiEndpointDoc): string {
  const authHeader = endpoint.auth
    ? ` \\\n  -H "Authorization: Bearer $TOKEN"`
    : '';

  const bodyFlag =
    endpoint.requestBody && ['POST', 'PUT', 'PATCH'].includes(endpoint.method)
      ? ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(endpoint.requestBody)}'`
      : '';

  return `curl -X ${endpoint.method} "https://api.nexara.io${endpoint.path}"${authHeader}${bodyFlag}`;
}

/** Generates a TypeScript fetch example for an endpoint. */
export function generateTsExample(endpoint: ApiEndpointDoc): string {
  const hasBody =
    endpoint.requestBody && ['POST', 'PUT', 'PATCH'].includes(endpoint.method);
  const bodyStr = hasBody
    ? `\n  body: JSON.stringify(${JSON.stringify(endpoint.requestBody)}),`
    : '';

  return `const response = await fetch("https://api.nexara.io${endpoint.path}", {
  method: "${endpoint.method}",
  headers: {
    "Content-Type": "application/json",
    "Authorization": \`Bearer \${token}\`,
  },${bodyStr}
});
const data = await response.json();`;
}
