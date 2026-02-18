/**
 * Security Controls API — ISO 27001 Information Security Controls
 *
 * Provides read-only endpoints exposing the IMS security posture:
 * - GET /            — Summary of all ISO 27001 control domains
 * - GET /rbac-matrix — Role-Based Access Control matrix
 * - GET /status      — Live security control status (crypto, sessions, audit, GDPR)
 */
import { Router } from 'express';
import { authenticate, requireRole, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const router = Router();
const logger = createLogger('security-controls');

// ============================================
// ISO 27001 CONTROL DOMAINS (Annex A reference)
// ============================================

const CONTROL_DOMAINS = [
  {
    id: 'A.5',
    title: 'Information Security Policies',
    controls: 2,
    implemented: 2,
    status: 'COMPLIANT',
    details: [
      {
        id: 'A.5.1',
        title: 'Policies for information security',
        status: 'IMPLEMENTED',
        evidence: 'SECURITY.md, Helmet CSP headers, CORS policy',
      },
      {
        id: 'A.5.2',
        title: 'Review of policies',
        status: 'IMPLEMENTED',
        evidence: 'Automated startup secret validation, security header middleware',
      },
    ],
  },
  {
    id: 'A.6',
    title: 'Organisation of Information Security',
    controls: 7,
    implemented: 5,
    status: 'PARTIALLY_COMPLIANT',
    details: [
      {
        id: 'A.6.1',
        title: 'Internal organisation',
        status: 'IMPLEMENTED',
        evidence: 'RBAC with 4 roles (ADMIN, MANAGER, AUDITOR, USER)',
      },
      {
        id: 'A.6.2',
        title: 'Mobile devices and teleworking',
        status: 'PLANNED',
        evidence: 'JWT bearer tokens support stateless mobile access',
      },
    ],
  },
  {
    id: 'A.9',
    title: 'Access Control',
    controls: 14,
    implemented: 12,
    status: 'COMPLIANT',
    details: [
      {
        id: 'A.9.1.1',
        title: 'Access control policy',
        status: 'IMPLEMENTED',
        evidence: 'Role-based access (ADMIN > MANAGER > AUDITOR > USER)',
      },
      {
        id: 'A.9.1.2',
        title: 'Access to networks and network services',
        status: 'IMPLEMENTED',
        evidence: 'CORS allowlist, rate limiting (100 req/15min), strict API limiter for AI',
      },
      {
        id: 'A.9.2.1',
        title: 'User registration and de-registration',
        status: 'IMPLEMENTED',
        evidence: 'POST /api/v1/auth/register, soft-delete on users',
      },
      {
        id: 'A.9.2.2',
        title: 'User access provisioning',
        status: 'IMPLEMENTED',
        evidence: 'Role assignment via ADMIN-only user management endpoints',
      },
      {
        id: 'A.9.2.3',
        title: 'Privileged access management',
        status: 'IMPLEMENTED',
        evidence: 'requireRole middleware, ADMIN-only routes for user/session management',
      },
      {
        id: 'A.9.2.4',
        title: 'Management of secret authentication information',
        status: 'IMPLEMENTED',
        evidence: 'bcrypt password hashing, JWT with HMAC-SHA256',
      },
      {
        id: 'A.9.2.5',
        title: 'Review of user access rights',
        status: 'IMPLEMENTED',
        evidence: 'Session management endpoints, session cleanup job (hourly)',
      },
      {
        id: 'A.9.2.6',
        title: 'Removal of access rights',
        status: 'IMPLEMENTED',
        evidence: 'User deactivation (isActive=false), session revocation',
      },
      {
        id: 'A.9.3.1',
        title: 'Use of secret authentication information',
        status: 'IMPLEMENTED',
        evidence: 'Password complexity validation, token expiry enforcement',
      },
      {
        id: 'A.9.4.1',
        title: 'Information access restriction',
        status: 'IMPLEMENTED',
        evidence: 'Ownership-scoped queries (scopeToUser, checkOwnership middleware)',
      },
      {
        id: 'A.9.4.2',
        title: 'Secure log-on procedures',
        status: 'IMPLEMENTED',
        evidence: 'Rate-limited login endpoint, audit logging of auth events',
      },
      {
        id: 'A.9.4.3',
        title: 'Password management system',
        status: 'IMPLEMENTED',
        evidence: 'bcrypt cost factor, minimum length validation',
      },
    ],
  },
  {
    id: 'A.10',
    title: 'Cryptography',
    controls: 2,
    implemented: 2,
    status: 'COMPLIANT',
    details: [
      {
        id: 'A.10.1.1',
        title: 'Policy on the use of cryptographic controls',
        status: 'IMPLEMENTED',
        evidence: 'JWT HMAC-SHA256, bcrypt password hashing, SHA-256 audit checksums',
      },
      {
        id: 'A.10.1.2',
        title: 'Key management',
        status: 'IMPLEMENTED',
        evidence: 'JWT_SECRET env var, service token rotation (50-min refresh cycle)',
      },
    ],
  },
  {
    id: 'A.12',
    title: 'Operations Security',
    controls: 7,
    implemented: 6,
    status: 'COMPLIANT',
    details: [
      {
        id: 'A.12.1.1',
        title: 'Documented operating procedures',
        status: 'IMPLEMENTED',
        evidence: 'DEPLOYMENT_CHECKLIST.md, startup.sh, Docker Compose configs',
      },
      {
        id: 'A.12.1.2',
        title: 'Change management',
        status: 'IMPLEMENTED',
        evidence: 'Git version control, CI/CD pipeline, QualChange module',
      },
      {
        id: 'A.12.2.1',
        title: 'Controls against malware',
        status: 'IMPLEMENTED',
        evidence:
          'Input validation (express-validator), JSON schema validation, 1MB request size limit',
      },
      {
        id: 'A.12.4.1',
        title: 'Event logging',
        status: 'IMPLEMENTED',
        evidence: 'AuditLog + EnhancedAuditTrail (21 CFR Part 11), Winston structured logging',
      },
      {
        id: 'A.12.4.3',
        title: 'Administrator and operator logs',
        status: 'IMPLEMENTED',
        evidence: 'All admin actions logged with userId, IP, user agent, correlation ID',
      },
      {
        id: 'A.12.6.1',
        title: 'Management of technical vulnerabilities',
        status: 'IMPLEMENTED',
        evidence: 'Helmet security headers, HSTS, CSP, X-Frame-Options',
      },
    ],
  },
  {
    id: 'A.13',
    title: 'Communications Security',
    controls: 7,
    implemented: 5,
    status: 'COMPLIANT',
    details: [
      {
        id: 'A.13.1.1',
        title: 'Network controls',
        status: 'IMPLEMENTED',
        evidence: 'Docker network isolation, inter-service auth (X-Service-Token)',
      },
      {
        id: 'A.13.1.2',
        title: 'Security of network services',
        status: 'IMPLEMENTED',
        evidence: 'TLS termination, CORS strict origin allowlist',
      },
      {
        id: 'A.13.2.1',
        title: 'Information transfer policies',
        status: 'IMPLEMENTED',
        evidence: 'JSON-only API, Content-Type enforcement, request size limits',
      },
    ],
  },
  {
    id: 'A.16',
    title: 'Information Security Incident Management',
    controls: 7,
    implemented: 5,
    status: 'COMPLIANT',
    details: [
      {
        id: 'A.16.1.1',
        title: 'Responsibilities and procedures',
        status: 'IMPLEMENTED',
        evidence:
          'Incident model with SECURITY_BREACH, DATA_BREACH, UNAUTHORIZED_ACCESS, PHISHING_ATTEMPT types',
      },
      {
        id: 'A.16.1.2',
        title: 'Reporting information security events',
        status: 'IMPLEMENTED',
        evidence: 'Incident reporting endpoints across H&S module',
      },
      {
        id: 'A.16.1.4',
        title: 'Assessment of information security events',
        status: 'IMPLEMENTED',
        evidence:
          'Severity classification (MINOR to CATASTROPHIC), AI-assisted root cause analysis',
      },
      {
        id: 'A.16.1.5',
        title: 'Response to information security incidents',
        status: 'IMPLEMENTED',
        evidence: 'CAPA workflow, corrective/preventive action tracking',
      },
      {
        id: 'A.16.1.6',
        title: 'Learning from information security incidents',
        status: 'IMPLEMENTED',
        evidence: 'Root cause analysis (5-Why, Fishbone, Bow-Tie), lessons learned fields',
      },
    ],
  },
  {
    id: 'A.18',
    title: 'Compliance',
    controls: 8,
    implemented: 7,
    status: 'COMPLIANT',
    details: [
      {
        id: 'A.18.1.1',
        title: 'Identification of applicable legislation',
        status: 'IMPLEMENTED',
        evidence: 'Legal requirement registers across H&S, Environment, Quality modules',
      },
      {
        id: 'A.18.1.3',
        title: 'Protection of records',
        status: 'IMPLEMENTED',
        evidence: 'Soft-delete pattern, enhanced audit trail with SHA-256 checksums, e-signatures',
      },
      {
        id: 'A.18.1.4',
        title: 'Privacy and protection of personally identifiable information',
        status: 'IMPLEMENTED',
        evidence: 'GDPR module: DataRetentionPolicy, ErasureRequest, data anonymization',
      },
      {
        id: 'A.18.2.1',
        title: 'Independent review of information security',
        status: 'IMPLEMENTED',
        evidence: 'ISO audit engine (packages/iso-checklists), 6 ISO standards supported',
      },
    ],
  },
];

// ============================================
// RBAC MATRIX
// ============================================

const RBAC_MATRIX = {
  roles: ['ADMIN', 'MANAGER', 'AUDITOR', 'USER'],
  permissions: [
    { resource: 'Users', actions: { ADMIN: 'CRUD', MANAGER: 'R', AUDITOR: 'R', USER: 'R(self)' } },
    {
      resource: 'Sessions',
      actions: { ADMIN: 'CRUD', MANAGER: 'R(self)', AUDITOR: 'R(self)', USER: 'R(self)' },
    },
    { resource: 'Risks', actions: { ADMIN: 'CRUD', MANAGER: 'CRUD', AUDITOR: 'R', USER: 'CR' } },
    {
      resource: 'Incidents',
      actions: { ADMIN: 'CRUD', MANAGER: 'CRUD', AUDITOR: 'R', USER: 'CR' },
    },
    {
      resource: 'Actions',
      actions: { ADMIN: 'CRUD', MANAGER: 'CRUD', AUDITOR: 'R', USER: 'CRU(own)' },
    },
    {
      resource: 'Legal Requirements',
      actions: { ADMIN: 'CRUD', MANAGER: 'CRUD', AUDITOR: 'R', USER: 'R' },
    },
    {
      resource: 'Objectives',
      actions: { ADMIN: 'CRUD', MANAGER: 'CRUD', AUDITOR: 'R', USER: 'R' },
    },
    { resource: 'CAPA', actions: { ADMIN: 'CRUD', MANAGER: 'CRUD', AUDITOR: 'R', USER: 'CR' } },
    { resource: 'Documents', actions: { ADMIN: 'CRUD', MANAGER: 'CRUD', AUDITOR: 'R', USER: 'R' } },
    { resource: 'Audit Logs', actions: { ADMIN: 'R', MANAGER: 'R', AUDITOR: 'R', USER: '-' } },
    {
      resource: 'AI Analysis',
      actions: { ADMIN: 'CRUD', MANAGER: 'CRUD', AUDITOR: 'R', USER: 'CR' },
    },
    {
      resource: 'Compliance Calendar',
      actions: { ADMIN: 'CRUD', MANAGER: 'CRUD', AUDITOR: 'R', USER: 'R' },
    },
    {
      resource: 'Security Controls',
      actions: { ADMIN: 'R', MANAGER: 'R', AUDITOR: 'R', USER: '-' },
    },
    {
      resource: 'GDPR Erasure Requests',
      actions: { ADMIN: 'CRUD', MANAGER: 'R', AUDITOR: 'R', USER: 'C(self)' },
    },
    { resource: 'Reports', actions: { ADMIN: 'CRUD', MANAGER: 'CR', AUDITOR: 'CR', USER: 'R' } },
  ],
  notes: [
    'CRUD = Create, Read, Update, Delete',
    'R = Read only',
    'CR = Create + Read',
    'CRU(own) = Create, Read, Update own records only',
    'R(self) = Read own records only',
    '- = No access',
  ],
};

// ============================================
// ROUTES
// ============================================

/**
 * GET / — ISO 27001 control domains summary
 */
router.get('/', authenticate, requireRole('ADMIN', 'MANAGER', 'AUDITOR'), (req, res) => {
  logger.info('Security controls summary requested', { userId: (req as AuthRequest).user?.id });

  const summary = CONTROL_DOMAINS.map((domain) => ({
    id: domain.id,
    title: domain.title,
    controls: domain.controls,
    implemented: domain.implemented,
    compliancePercent: Math.round((domain.implemented / domain.controls) * 100),
    status: domain.status,
  }));

  const totalControls = CONTROL_DOMAINS.reduce((sum, d) => sum + d.controls, 0);
  const totalImplemented = CONTROL_DOMAINS.reduce((sum, d) => sum + d.implemented, 0);

  res.json({
    success: true,
    data: {
      overallCompliance: Math.round((totalImplemented / totalControls) * 100),
      totalControls,
      totalImplemented,
      domains: summary,
      detailedDomains: CONTROL_DOMAINS,
    },
  });
});

/**
 * GET /rbac-matrix — Role-Based Access Control matrix
 */
router.get('/rbac-matrix', authenticate, requireRole('ADMIN', 'MANAGER', 'AUDITOR'), (req, res) => {
  logger.info('RBAC matrix requested', { userId: (req as AuthRequest).user?.id });

  res.json({
    success: true,
    data: RBAC_MATRIX,
  });
});

/**
 * GET /status — Live security control status
 */
router.get('/status', authenticate, requireRole('ADMIN', 'MANAGER', 'AUDITOR'), (req, res) => {
  logger.info('Security status requested', { userId: (req as AuthRequest).user?.id });

  const status = {
    authentication: {
      method: 'JWT Bearer Token (HMAC-SHA256)',
      tokenExpiry: '1 hour',
      sessionManagement: 'Database-backed sessions with hourly cleanup',
      passwordHashing: 'bcrypt',
      rateLimiting: {
        general: '100 requests per 15 minutes',
        ai: 'Strict rate limiter for AI endpoints',
      },
    },
    encryption: {
      transportLayer: 'HTTPS (TLS termination at load balancer)',
      passwordStorage: 'bcrypt with auto-generated salt',
      auditIntegrity: 'SHA-256 checksums on EnhancedAuditTrail and ESignature records',
      jwtSigning: 'HMAC-SHA256',
    },
    securityHeaders: {
      helmet: true,
      csp: 'Strict Content-Security-Policy',
      hsts: 'Strict-Transport-Security enabled',
      xFrameOptions: 'DENY',
      xContentTypeOptions: 'nosniff',
      crossOriginResourcePolicy: 'cross-origin',
    },
    interServiceAuth: {
      method: 'X-Service-Token (JWT)',
      rotation: 'Every 50 minutes (before 1-hour expiry)',
    },
    dataProtection: {
      softDelete: 'All major entities use deletedAt field',
      gdprSupport: 'DataRetentionPolicy, ErasureRequest models',
      auditTrail: '21 CFR Part 11 compliant EnhancedAuditTrail',
      eSignatures: 'ESignature model with tamper-detection checksums',
    },
    inputValidation: {
      requestSizeLimit: '1MB',
      jsonParsing: 'express.json() with strict Content-Type',
      paramValidation: 'isValidId() for CUID format, express-validator',
      csrfProtection: process.env.CSRF_ENABLED !== 'false' ? 'ENABLED' : 'DISABLED',
    },
    monitoring: {
      structuredLogging: 'Winston with correlation IDs',
      metrics: 'Prometheus (HTTP duration, request count, DB query duration)',
      healthChecks: '/health and /ready endpoints on all services',
    },
  };

  res.json({
    success: true,
    data: status,
  });
});

export default router;
