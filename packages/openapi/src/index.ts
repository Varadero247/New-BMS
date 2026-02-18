/**
 * @ims/openapi — OpenAPI 3.0 Specification Generator
 *
 * Generates a complete OpenAPI spec covering all 42 API services.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface OpenApiSpec {
  openapi: string;
  info: Record<string, unknown>;
  servers: Record<string, unknown>[];
  components: Record<string, unknown>;
  paths: Record<string, unknown>;
  tags: Record<string, unknown>[];
}

// ─── Service Definitions ────────────────────────────────────────────────────

interface ServiceDef {
  tag: string;
  prefix: string;
  description: string;
  port: number;
  endpoints: EndpointDef[];
}

interface EndpointDef {
  method: string;
  path: string;
  summary: string;
  operationId: string;
  requestBody?: boolean;
  paginated?: boolean;
}

function crudEndpoints(prefix: string, resource: string, singular: string): EndpointDef[] {
  return [
    { method: 'get', path: `${prefix}/${resource}`, summary: `List ${resource}`, operationId: `list${singular}s`, paginated: true },
    { method: 'post', path: `${prefix}/${resource}`, summary: `Create ${singular}`, operationId: `create${singular}`, requestBody: true },
    { method: 'get', path: `${prefix}/${resource}/{id}`, summary: `Get ${singular} by ID`, operationId: `get${singular}` },
    { method: 'put', path: `${prefix}/${resource}/{id}`, summary: `Update ${singular}`, operationId: `update${singular}`, requestBody: true },
    { method: 'delete', path: `${prefix}/${resource}/{id}`, summary: `Delete ${singular}`, operationId: `delete${singular}` },
  ];
}

const SERVICES: ServiceDef[] = [
  {
    tag: 'Health & Safety', prefix: '/api/health-safety', description: 'ISO 45001 Health & Safety management', port: 4001,
    endpoints: [
      ...crudEndpoints('/api/health-safety', 'risks', 'Risk'),
      ...crudEndpoints('/api/health-safety', 'incidents', 'Incident'),
      ...crudEndpoints('/api/health-safety', 'hazards', 'Hazard'),
      ...crudEndpoints('/api/health-safety', 'inspections', 'Inspection'),
    ],
  },
  {
    tag: 'Environment', prefix: '/api/environment', description: 'ISO 14001 Environmental management', port: 4002,
    endpoints: [
      ...crudEndpoints('/api/environment', 'aspects', 'Aspect'),
      ...crudEndpoints('/api/environment', 'events', 'Event'),
      ...crudEndpoints('/api/environment', 'legal', 'LegalRequirement'),
      ...crudEndpoints('/api/environment', 'objectives', 'Objective'),
      ...crudEndpoints('/api/environment', 'actions', 'Action'),
      ...crudEndpoints('/api/environment', 'capa', 'Capa'),
    ],
  },
  {
    tag: 'Quality', prefix: '/api/quality', description: 'ISO 9001 Quality management', port: 4003,
    endpoints: [
      ...crudEndpoints('/api/quality', 'ncrs', 'Ncr'),
      ...crudEndpoints('/api/quality', 'capas', 'Capa'),
      ...crudEndpoints('/api/quality', 'audits', 'Audit'),
      ...crudEndpoints('/api/quality', 'documents', 'Document'),
    ],
  },
  {
    tag: 'AI Analysis', prefix: '/api/ai', description: 'AI-powered analysis and recommendations', port: 4004,
    endpoints: [
      { method: 'post', path: '/api/ai/analyze', summary: 'Run AI analysis', operationId: 'aiAnalyze', requestBody: true },
      { method: 'get', path: '/api/ai/recommendations', summary: 'Get AI recommendations', operationId: 'aiRecommendations' },
    ],
  },
  {
    tag: 'Inventory', prefix: '/api/inventory', description: 'Inventory and stock management', port: 4005,
    endpoints: [
      ...crudEndpoints('/api/inventory', 'items', 'Item'),
      ...crudEndpoints('/api/inventory', 'warehouses', 'Warehouse'),
      ...crudEndpoints('/api/inventory', 'movements', 'Movement'),
    ],
  },
  {
    tag: 'HR', prefix: '/api/hr', description: 'Human Resources management', port: 4006,
    endpoints: [
      ...crudEndpoints('/api/hr', 'employees', 'Employee'),
      ...crudEndpoints('/api/hr', 'departments', 'Department'),
      ...crudEndpoints('/api/hr', 'leave-requests', 'LeaveRequest'),
      ...crudEndpoints('/api/hr', 'training', 'Training'),
    ],
  },
  {
    tag: 'Payroll', prefix: '/api/payroll', description: 'Payroll processing and management', port: 4007,
    endpoints: [
      ...crudEndpoints('/api/payroll', 'pay-runs', 'PayRun'),
      ...crudEndpoints('/api/payroll', 'payslips', 'Payslip'),
      { method: 'get', path: '/api/payroll/jurisdictions', summary: 'List jurisdictions', operationId: 'listJurisdictions' },
      { method: 'post', path: '/api/payroll/tax-calculator', summary: 'Calculate tax', operationId: 'calculateTax', requestBody: true },
    ],
  },
  {
    tag: 'Workflows', prefix: '/api/workflows', description: 'Workflow automation engine', port: 4008,
    endpoints: [
      ...crudEndpoints('/api/workflows', 'workflows', 'Workflow'),
      ...crudEndpoints('/api/workflows', 'instances', 'WorkflowInstance'),
    ],
  },
  {
    tag: 'Project Management', prefix: '/api/project-management', description: 'Project and task management', port: 4009,
    endpoints: [
      ...crudEndpoints('/api/project-management', 'projects', 'Project'),
      ...crudEndpoints('/api/project-management', 'tasks', 'Task'),
      ...crudEndpoints('/api/project-management', 'milestones', 'Milestone'),
    ],
  },
  {
    tag: 'Automotive', prefix: '/api/automotive', description: 'IATF 16949 Automotive quality', port: 4010,
    endpoints: [
      ...crudEndpoints('/api/automotive', 'ppaps', 'Ppap'),
      ...crudEndpoints('/api/automotive', 'fmeas', 'Fmea'),
      ...crudEndpoints('/api/automotive', 'control-plans', 'ControlPlan'),
    ],
  },
  {
    tag: 'Medical Devices', prefix: '/api/medical', description: 'ISO 13485 Medical devices quality', port: 4011,
    endpoints: [
      ...crudEndpoints('/api/medical', 'devices', 'Device'),
      ...crudEndpoints('/api/medical', 'complaints', 'Complaint'),
      ...crudEndpoints('/api/medical', 'design-controls', 'DesignControl'),
    ],
  },
  {
    tag: 'Aerospace', prefix: '/api/aerospace', description: 'AS9100 Aerospace quality', port: 4012,
    endpoints: [
      ...crudEndpoints('/api/aerospace', 'parts', 'Part'),
      ...crudEndpoints('/api/aerospace', 'first-articles', 'FirstArticle'),
    ],
  },
  {
    tag: 'Finance', prefix: '/api/finance', description: 'Financial management and reporting', port: 4013,
    endpoints: [
      ...crudEndpoints('/api/finance', 'accounts', 'Account'),
      ...crudEndpoints('/api/finance', 'transactions', 'Transaction'),
      ...crudEndpoints('/api/finance', 'invoices', 'Invoice'),
      ...crudEndpoints('/api/finance', 'budgets', 'Budget'),
    ],
  },
  {
    tag: 'CRM', prefix: '/api/crm', description: 'Customer Relationship Management', port: 4014,
    endpoints: [
      ...crudEndpoints('/api/crm', 'contacts', 'Contact'),
      ...crudEndpoints('/api/crm', 'companies', 'Company'),
      ...crudEndpoints('/api/crm', 'opportunities', 'Opportunity'),
      ...crudEndpoints('/api/crm', 'activities', 'Activity'),
    ],
  },
  {
    tag: 'InfoSec', prefix: '/api/infosec', description: 'ISO 27001 Information Security', port: 4015,
    endpoints: [
      ...crudEndpoints('/api/infosec', 'assets', 'Asset'),
      ...crudEndpoints('/api/infosec', 'risks', 'Risk'),
      ...crudEndpoints('/api/infosec', 'controls', 'Control'),
      ...crudEndpoints('/api/infosec', 'incidents', 'SecurityIncident'),
    ],
  },
  {
    tag: 'ESG', prefix: '/api/esg', description: 'Environmental, Social & Governance reporting', port: 4016,
    endpoints: [
      ...crudEndpoints('/api/esg', 'metrics', 'Metric'),
      ...crudEndpoints('/api/esg', 'goals', 'Goal'),
      ...crudEndpoints('/api/esg', 'disclosures', 'Disclosure'),
    ],
  },
  {
    tag: 'CMMS', prefix: '/api/cmms', description: 'Computerised Maintenance Management', port: 4017,
    endpoints: [
      ...crudEndpoints('/api/cmms', 'assets', 'MaintenanceAsset'),
      ...crudEndpoints('/api/cmms', 'work-orders', 'WorkOrder'),
      ...crudEndpoints('/api/cmms', 'preventive-maintenance', 'PreventiveMaintenance'),
    ],
  },
  {
    tag: 'Portal', prefix: '/api/portal', description: 'Customer & Supplier portal', port: 4018,
    endpoints: [
      ...crudEndpoints('/api/portal', 'documents', 'PortalDocument'),
      ...crudEndpoints('/api/portal', 'tickets', 'Ticket'),
    ],
  },
  {
    tag: 'Food Safety', prefix: '/api/food-safety', description: 'ISO 22000 Food Safety management', port: 4019,
    endpoints: [
      ...crudEndpoints('/api/food-safety', 'hazards', 'FoodHazard'),
      ...crudEndpoints('/api/food-safety', 'ccps', 'Ccp'),
      ...crudEndpoints('/api/food-safety', 'haccp-plans', 'HaccpPlan'),
    ],
  },
  {
    tag: 'Energy', prefix: '/api/energy', description: 'ISO 50001 Energy management', port: 4020,
    endpoints: [
      ...crudEndpoints('/api/energy', 'meters', 'Meter'),
      ...crudEndpoints('/api/energy', 'baselines', 'Baseline'),
      ...crudEndpoints('/api/energy', 'enpi', 'Enpi'),
    ],
  },
  {
    tag: 'Analytics', prefix: '/api/analytics', description: 'Cross-module analytics and dashboards', port: 4021,
    endpoints: [
      { method: 'get', path: '/api/analytics/kpis', summary: 'Get KPI dashboard', operationId: 'getKpis' },
      { method: 'get', path: '/api/analytics/trends', summary: 'Get trend data', operationId: 'getTrends' },
      { method: 'post', path: '/api/analytics/queries', summary: 'Run analytics query', operationId: 'runQuery', requestBody: true },
    ],
  },
  {
    tag: 'Field Service', prefix: '/api/field-service', description: 'Field service management', port: 4022,
    endpoints: [
      ...crudEndpoints('/api/field-service', 'jobs', 'Job'),
      ...crudEndpoints('/api/field-service', 'technicians', 'Technician'),
      ...crudEndpoints('/api/field-service', 'schedules', 'Schedule'),
    ],
  },
  {
    tag: 'ISO 42001', prefix: '/api/iso42001', description: 'ISO 42001 AI Management System', port: 4023,
    endpoints: [
      ...crudEndpoints('/api/iso42001', 'systems', 'AiSystem'),
      ...crudEndpoints('/api/iso42001', 'controls', 'AiControl'),
      ...crudEndpoints('/api/iso42001', 'impact-assessments', 'ImpactAssessment'),
    ],
  },
  {
    tag: 'ISO 37001', prefix: '/api/iso37001', description: 'ISO 37001 Anti-Bribery Management', port: 4024,
    endpoints: [
      ...crudEndpoints('/api/iso37001', 'risks', 'BriberyRisk'),
      ...crudEndpoints('/api/iso37001', 'due-diligence', 'DueDiligence'),
      ...crudEndpoints('/api/iso37001', 'controls', 'BriberyControl'),
    ],
  },
  {
    tag: 'Training', prefix: '/api/training', description: 'Training and competency management', port: 4028,
    endpoints: [
      ...crudEndpoints('/api/training', 'courses', 'Course'),
      ...crudEndpoints('/api/training', 'records', 'TrainingRecord'),
      ...crudEndpoints('/api/training', 'tna', 'TrainingNeedsAnalysis'),
      ...crudEndpoints('/api/training', 'matrix', 'CompetencyMatrix'),
    ],
  },
  {
    tag: 'Suppliers', prefix: '/api/suppliers', description: 'Supplier management and evaluation', port: 4029,
    endpoints: [
      ...crudEndpoints('/api/suppliers', 'suppliers', 'Supplier'),
      ...crudEndpoints('/api/suppliers', 'evaluations', 'Evaluation'),
      ...crudEndpoints('/api/suppliers', 'audits', 'SupplierAudit'),
    ],
  },
  {
    tag: 'Assets', prefix: '/api/assets', description: 'Asset lifecycle management', port: 4030,
    endpoints: [
      ...crudEndpoints('/api/assets', 'assets', 'Asset'),
      ...crudEndpoints('/api/assets', 'calibrations', 'Calibration'),
      ...crudEndpoints('/api/assets', 'maintenance', 'AssetMaintenance'),
    ],
  },
  {
    tag: 'Documents', prefix: '/api/documents', description: 'Document control and management', port: 4031,
    endpoints: [
      ...crudEndpoints('/api/documents', 'documents', 'ControlledDocument'),
      ...crudEndpoints('/api/documents', 'reviews', 'DocumentReview'),
      ...crudEndpoints('/api/documents', 'distributions', 'Distribution'),
    ],
  },
  {
    tag: 'Complaints', prefix: '/api/complaints', description: 'Customer complaints handling', port: 4032,
    endpoints: [
      ...crudEndpoints('/api/complaints', 'complaints', 'Complaint'),
      ...crudEndpoints('/api/complaints', 'investigations', 'Investigation'),
    ],
  },
  {
    tag: 'Contracts', prefix: '/api/contracts', description: 'Contract lifecycle management', port: 4033,
    endpoints: [
      ...crudEndpoints('/api/contracts', 'contracts', 'Contract'),
      ...crudEndpoints('/api/contracts', 'obligations', 'ContractObligation'),
      ...crudEndpoints('/api/contracts', 'renewals', 'Renewal'),
    ],
  },
  {
    tag: 'PTW', prefix: '/api/ptw', description: 'Permit to Work management', port: 4034,
    endpoints: [
      ...crudEndpoints('/api/ptw', 'permits', 'Permit'),
      ...crudEndpoints('/api/ptw', 'templates', 'PermitTemplate'),
      ...crudEndpoints('/api/ptw', 'isolations', 'Isolation'),
    ],
  },
  {
    tag: 'Regulatory Monitor', prefix: '/api/reg-monitor', description: 'Regulatory change monitoring', port: 4035,
    endpoints: [
      ...crudEndpoints('/api/reg-monitor', 'changes', 'RegulatoryChange'),
      ...crudEndpoints('/api/reg-monitor', 'obligations', 'Obligation'),
      ...crudEndpoints('/api/reg-monitor', 'legal-register', 'LegalRegister'),
    ],
  },
  {
    tag: 'Incidents', prefix: '/api/incidents', description: 'Incident management and investigation', port: 4036,
    endpoints: [
      ...crudEndpoints('/api/incidents', 'incidents', 'ManagedIncident'),
      ...crudEndpoints('/api/incidents', 'investigations', 'IncidentInvestigation'),
      ...crudEndpoints('/api/incidents', 'actions', 'IncidentAction'),
    ],
  },
  {
    tag: 'Audits', prefix: '/api/audits', description: 'Internal and external audit management', port: 4037,
    endpoints: [
      ...crudEndpoints('/api/audits', 'audits', 'ManagedAudit'),
      ...crudEndpoints('/api/audits', 'findings', 'AuditFinding'),
      ...crudEndpoints('/api/audits', 'schedules', 'AuditSchedule'),
    ],
  },
  {
    tag: 'Management Review', prefix: '/api/mgmt-review', description: 'Management review meetings', port: 4038,
    endpoints: [
      ...crudEndpoints('/api/mgmt-review', 'reviews', 'MgmtReview'),
      ...crudEndpoints('/api/mgmt-review', 'actions', 'ReviewAction'),
      ...crudEndpoints('/api/mgmt-review', 'inputs', 'ReviewInput'),
    ],
  },
  {
    tag: 'Chemicals', prefix: '/api/chemicals', description: 'Chemical management and COSHH', port: 4040,
    endpoints: [
      ...crudEndpoints('/api/chemicals', 'chemicals', 'Chemical'),
      ...crudEndpoints('/api/chemicals', 'sds', 'Sds'),
      ...crudEndpoints('/api/chemicals', 'coshh', 'Coshh'),
      ...crudEndpoints('/api/chemicals', 'inventory', 'ChemInventory'),
    ],
  },
  {
    tag: 'Emergency', prefix: '/api/emergency', description: 'Fire, emergency and disaster management', port: 4041,
    endpoints: [
      ...crudEndpoints('/api/emergency', 'premises', 'Premises'),
      ...crudEndpoints('/api/emergency', 'fra', 'FireRiskAssessment'),
      ...crudEndpoints('/api/emergency', 'incidents', 'EmergencyIncident'),
      ...crudEndpoints('/api/emergency', 'bcp', 'BusinessContinuityPlan'),
      ...crudEndpoints('/api/emergency', 'drills', 'EvacuationDrill'),
    ],
  },
  {
    tag: 'Risk', prefix: '/api/risk', description: 'Enterprise risk management (ISO 31000)', port: 4027,
    endpoints: [
      ...crudEndpoints('/api/risk', 'risks', 'EnterpriseRisk'),
      ...crudEndpoints('/api/risk', 'controls', 'RiskControl'),
      ...crudEndpoints('/api/risk', 'kri', 'KeyRiskIndicator'),
      ...crudEndpoints('/api/risk', 'appetite', 'AppetiteStatement'),
    ],
  },
  {
    tag: 'Setup Wizard', prefix: '/api/setup-wizard', description: 'Initial setup and onboarding wizard', port: 4039,
    endpoints: [
      { method: 'get', path: '/api/setup-wizard/status', summary: 'Get wizard status', operationId: 'getWizardStatus' },
      { method: 'post', path: '/api/setup-wizard/init', summary: 'Initialize wizard', operationId: 'initWizard', requestBody: true },
      { method: 'post', path: '/api/setup-wizard/step', summary: 'Submit wizard step', operationId: 'submitWizardStep', requestBody: true },
      { method: 'post', path: '/api/setup-wizard/complete', summary: 'Complete wizard', operationId: 'completeWizard', requestBody: true },
      { method: 'post', path: '/api/setup-wizard/skip', summary: 'Skip wizard', operationId: 'skipWizard', requestBody: true },
    ],
  },
  {
    tag: 'Marketing', prefix: '/api/marketing', description: 'Marketing automation and lead management', port: 4025,
    endpoints: [
      ...crudEndpoints('/api/marketing', 'leads', 'Lead'),
      { method: 'post', path: '/api/marketing/roi-calculator', summary: 'Calculate ROI', operationId: 'calculateRoi', requestBody: true },
      { method: 'post', path: '/api/marketing/chatbot', summary: 'Chat with bot', operationId: 'chatbot', requestBody: true },
    ],
  },
  {
    tag: 'Partners', prefix: '/api/partners', description: 'Partner portal and channel management', port: 4026,
    endpoints: [
      ...crudEndpoints('/api/partners', 'deals', 'PartnerDeal'),
      ...crudEndpoints('/api/partners', 'payouts', 'PartnerPayout'),
      ...crudEndpoints('/api/partners', 'referrals', 'Referral'),
    ],
  },
  {
    tag: 'Gateway', prefix: '/api', description: 'API Gateway — auth, users, dashboard, admin', port: 4000,
    endpoints: [
      { method: 'post', path: '/api/auth/login', summary: 'User login', operationId: 'login', requestBody: true },
      { method: 'post', path: '/api/auth/register', summary: 'Register user', operationId: 'register', requestBody: true },
      { method: 'post', path: '/api/auth/refresh', summary: 'Refresh token', operationId: 'refreshToken', requestBody: true },
      { method: 'get', path: '/api/users', summary: 'List users', operationId: 'listUsers', paginated: true },
      { method: 'get', path: '/api/users/{id}', summary: 'Get user by ID', operationId: 'getUser' },
      { method: 'get', path: '/api/dashboard/stats', summary: 'Get dashboard statistics', operationId: 'getDashboardStats' },
      { method: 'get', path: '/api/notifications', summary: 'Get notifications', operationId: 'getNotifications', paginated: true },
      { method: 'get', path: '/api/roles', summary: 'List roles', operationId: 'listRoles' },
    ],
  },
];

// ─── Common Schemas ─────────────────────────────────────────────────────────

function buildCommonSchemas(): Record<string, unknown> {
  return {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token obtained from POST /api/auth/login',
      },
    },
    schemas: {
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object', description: 'Response payload' },
        },
        required: ['success', 'data'],
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Invalid input' },
            },
          },
        },
        required: ['success', 'error'],
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'array', items: { type: 'object' } },
          meta: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              page: { type: 'integer' },
              limit: { type: 'integer' },
              totalPages: { type: 'integer' },
            },
          },
        },
      },
    },
    parameters: {
      PageParam: {
        name: 'page',
        in: 'query',
        schema: { type: 'integer', default: 1, minimum: 1 },
        description: 'Page number',
      },
      LimitParam: {
        name: 'limit',
        in: 'query',
        schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 },
        description: 'Items per page',
      },
      IdParam: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'Resource UUID',
      },
    },
  };
}

// ─── Path Generation ────────────────────────────────────────────────────────

function buildPaths(): Record<string, unknown> {
  const paths: Record<string, Record<string, unknown>> = {};

  for (const service of SERVICES) {
    for (const ep of service.endpoints) {
      const pathKey = ep.path.replace(/\{id\}/g, '{id}');
      if (!paths[pathKey]) paths[pathKey] = {};

      const operation: Record<string, unknown> = {
        tags: [service.tag],
        summary: ep.summary,
        operationId: ep.operationId,
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Successful response',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
          },
          '400': {
            description: 'Validation error',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Not found' },
          '500': { description: 'Internal server error' },
        },
      };

      // Add path parameters
      const params: Record<string, unknown>[] = [];
      if (pathKey.includes('{id}')) {
        params.push({ $ref: '#/components/parameters/IdParam' });
      }
      if (ep.paginated) {
        params.push({ $ref: '#/components/parameters/PageParam' });
        params.push({ $ref: '#/components/parameters/LimitParam' });
      }
      if (params.length > 0) {
        operation.parameters = params;
      }

      if (ep.requestBody) {
        operation.requestBody = {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        };
      }

      // Remove auth for login endpoint
      if (ep.operationId === 'login' || ep.operationId === 'register') {
        delete operation.security;
      }

      paths[pathKey][ep.method] = operation;
    }
  }

  return paths;
}

// ─── Public API ─────────────────────────────────────────────────────────────

// Cache the OpenAPI spec at module load since it is entirely static.
// This avoids rebuilding ~700+ path entries on every request.
let cachedSpec: OpenApiSpec | null = null;

export function generateOpenApiSpec(): OpenApiSpec {
  if (cachedSpec) return cachedSpec;

  cachedSpec = {
    openapi: '3.0.3',
    info: {
      title: 'IMS — Integrated Management System API',
      version: '1.0.0',
      description: 'Complete API reference for the IMS platform covering 42 API services across ISO 9001, 14001, 45001, 27001, 42001, 37001, 22000, 50001, IATF 16949, AS9100, ISO 13485 and more.',
      contact: {
        name: 'IMS Platform Team',
        email: 'api@ims.local',
      },
      license: {
        name: 'Proprietary',
      },
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Local development (via API Gateway)' },
    ],
    components: buildCommonSchemas(),
    paths: buildPaths(),
    tags: SERVICES.map(s => ({ name: s.tag, description: s.description })),
  };

  return cachedSpec;
}
