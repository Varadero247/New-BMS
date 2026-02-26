// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export interface KnowledgeEntry {
  id: string;
  topic: string;
  keywords: string[];
  content: string;
  suggestedActions?: Array<{ label: string; action: string }>;
  relatedTopics?: string[];
}

export const ONBOARDING_KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    id: 'instant-start-packs',
    topic: 'Instant Start Packs',
    keywords: ['instant start', 'pack', 'configuration', 'industry', 'template', 'pre-configured', 'setup pack'],
    content: `Nexara IMS includes pre-configured "Instant Start" packs for major industries. Each pack includes:
- Pre-configured risk categories for your industry
- Document type definitions with retention periods
- KPI targets aligned to industry benchmarks
- Audit checklists for relevant standards
- Workflow templates

Available packs: Automotive (IATF 16949:2016), Construction & Civil Engineering (ISO 45001:2018), Medical Devices (ISO 13485:2016), Food Manufacturing (BRCGS Issue 9), Professional Services (ISO 27001:2022).

To install a pack, go to Setup Wizard → Instant Start Packs, select your industry pack, customise the options, and click Install.`,
    suggestedActions: [
      { label: 'Browse Instant Start Packs', action: 'navigate:/setup/instant-start' },
      { label: 'Preview Automotive Pack', action: 'preview-pack:automotive-iatf-16949' },
    ],
    relatedTopics: ['gap-assessment', 'module-configuration'],
  },
  {
    id: 'gap-assessment',
    topic: 'Gap Assessment',
    keywords: ['gap', 'assessment', 'compliance', 'clause', 'conformance', 'audit', 'readiness', 'snapshot'],
    content: `The Compliance Snapshot tool allows you to assess your current compliance against ISO standards before you begin. It covers:
- ISO 9001:2015 (Quality Management)
- ISO 45001:2018 (Occupational Health & Safety)
- ISO 14001:2015 (Environmental Management)
- ISO 27001:2022 (Information Security)
- IATF 16949:2016 (Automotive Quality)

For each clause, you mark it as: Conformant, Minor Gap, Major Gap, Not Applicable, or Not Assessed.
The system then generates a Gap Report showing your overall compliance score (0–100), prioritised gaps, and estimated weeks to close them.`,
    suggestedActions: [
      { label: 'Start Gap Assessment', action: 'navigate:/setup/assessments' },
      { label: 'View Assessment Standards', action: 'navigate:/setup/assessments/standards' },
    ],
    relatedTopics: ['instant-start-packs', 'certificationtimeline'],
  },
  {
    id: 'sso-setup',
    topic: 'SSO / Single Sign-On',
    keywords: ['sso', 'single sign-on', 'saml', 'oidc', 'azure', 'okta', 'google workspace', 'auth0', 'identity', 'login'],
    content: `Nexara IMS supports SSO via SAML 2.0 and OIDC. Supported identity providers include:
- Microsoft Azure AD / Entra ID (SAML)
- Okta (SAML)
- Google Workspace (SAML)
- Auth0 (OIDC)
- Microsoft ADFS (SAML)
- Custom SAML and OIDC providers

The SSO Wizard guides you step-by-step through the configuration. You'll need to provide your IdP's metadata URL or XML, then map SAML attributes to user fields.

Password-based login is preserved as a fallback after SSO activation.`,
    suggestedActions: [
      { label: 'Start SSO Wizard', action: 'navigate:/settings/sso' },
    ],
    relatedTopics: ['user-management', 'security'],
  },
  {
    id: 'data-migration',
    topic: 'Data Migration',
    keywords: ['migration', 'import', 'csv', 'excel', 'data', 'legacy', 'transfer', 'existing data'],
    content: `The AI-powered Data Migration Assistant helps you import data from your existing systems.

Supported data types: Nonconformances, Incidents, Risks, Documents, Suppliers, Employees, Calibration records, Audit findings.

Process:
1. Upload your CSV or JSON file
2. The AI analyses your file structure and suggests field mappings
3. You review and adjust the mappings
4. Preview the first 10 rows of transformed data
5. Execute the migration (or run a dry run first)

The system supports common date formats (DD/MM/YYYY, MM/DD/YYYY, ISO 8601), boolean fields, and enumerated values.`,
    suggestedActions: [
      { label: 'Start Data Migration', action: 'navigate:/settings/migration' },
    ],
    relatedTopics: ['module-configuration'],
  },
  {
    id: 'module-configuration',
    topic: 'Module Configuration',
    keywords: ['module', 'configure', 'settings', 'enable', 'setup', 'customise'],
    content: `Nexara IMS includes modules for: Health & Safety, Environment, Quality, Automotive, Aerospace, Medical Devices, Food Safety, InfoSec, ESG, Finance, HR, Inventory, CMMS, Field Service, Contracts, CRM, and more.

Each module can be enabled or disabled based on your licence. Module settings include:
- Reference number formats (e.g. INC-YYYY-NNN)
- Default values and approval workflows
- Email notifications and escalation rules
- Custom fields (where available)

Access module settings via Settings → Modules → [Module Name]`,
    suggestedActions: [
      { label: 'Open Module Settings', action: 'navigate:/settings/modules' },
    ],
    relatedTopics: ['instant-start-packs'],
  },
  {
    id: 'user-management',
    topic: 'User Management & Roles',
    keywords: ['user', 'role', 'permission', 'access', 'invite', 'import', 'team', 'staff'],
    content: `Nexara IMS uses Role-Based Access Control (RBAC) with 39 roles across 17 modules.

Key roles:
- SUPER_ADMIN: Full system access
- ADMIN: Organisation-level administration
- MANAGER: Module management and approvals
- EDITOR: Create and edit records
- VIEWER: Read-only access
- AUDITOR: Internal audit access

To import users, use Settings → Users → Import (CSV with columns: email, firstName, lastName, role).
Users receive an invitation email to set their password (or SSO if configured).`,
    suggestedActions: [
      { label: 'Manage Users', action: 'navigate:/settings/users' },
      { label: 'Download User Import Template', action: 'download:user-import-template' },
    ],
    relatedTopics: ['sso-setup'],
  },
  {
    id: 'go-live-checklist',
    topic: 'Go-Live Readiness',
    keywords: ['go live', 'golive', 'launch', 'ready', 'checklist', 'readiness', 'production'],
    content: `Before going live with Nexara IMS, ensure you've completed:

✅ Core setup
- Organisation profile and logo configured
- All required modules enabled
- Instant Start pack installed (if applicable)

✅ Data
- Legacy data migrated or confirmed as not required
- Users imported and roles assigned
- Document templates configured

✅ Integration
- SSO configured and tested (if using)
- ERP/HR integrations connected (if applicable)

✅ Training
- Superusers trained and confident
- End-user training sessions completed or scheduled
- Training records documented

✅ Testing
- UAT completed and signed off
- Mobile app tested (if applicable)

Monitor your progress in Setup Wizard → Go-Live Dashboard.`,
    suggestedActions: [
      { label: 'View Go-Live Dashboard', action: 'navigate:/setup/onboarding-project' },
    ],
    relatedTopics: ['data-migration', 'sso-setup', 'user-management'],
  },
  {
    id: 'erp-integration',
    topic: 'ERP & HR Integrations',
    keywords: ['erp', 'hr', 'integration', 'sap', 'dynamics', 'bamboohr', 'workday', 'xero', 'sync', 'connector'],
    content: `Nexara IMS can connect to popular ERP and HR systems to synchronise employee data, financial information, and more.

Supported connectors:
- BambooHR: Employee records, departments, leave
- SAP HR / SuccessFactors: Employees, org structure
- Microsoft Dynamics 365: Employees, finance data
- Workday: Employees, positions, org hierarchy
- Xero: Financial data, supplier invoices

To configure a connector, go to Settings → Integrations. You'll need API credentials from your system administrator.
Sync runs on a configurable schedule (default: hourly) or can be triggered manually.`,
    suggestedActions: [
      { label: 'Configure Integrations', action: 'navigate:/settings/integrations' },
    ],
    relatedTopics: ['user-management', 'data-migration'],
  },
  {
    id: 'certification-timeline',
    topic: 'Certification Timeline',
    keywords: ['certification', 'audit', 'timeline', 'how long', 'certify', 'accreditation', 'schedule'],
    content: `A typical ISO certification journey using Nexara IMS takes 3–9 months depending on your starting point.

Phase 1 (Weeks 1–4): Setup & Configuration
- Install Instant Start pack
- Complete gap assessment
- Configure modules and import data

Phase 2 (Weeks 5–12): Documentation & Implementation
- Create required documented information
- Implement processes and controls
- Train staff

Phase 3 (Weeks 13–20): Internal Audit & Management Review
- Conduct internal audit against all clauses
- Hold management review
- Close corrective actions from audit

Phase 4 (Weeks 21–36): Certification Audit
- Stage 1 audit (documentation review) by certification body
- Close any Stage 1 nonconformances
- Stage 2 audit (on-site/remote assessment)
- Receive certificate

Your gap assessment score will give you a more personalised estimate.`,
    suggestedActions: [
      { label: 'Start Gap Assessment', action: 'navigate:/setup/assessments' },
    ],
    relatedTopics: ['gap-assessment'],
  },
];

export function searchKnowledgeBase(query: string): KnowledgeEntry[] {
  const q = query.toLowerCase();
  const scored = ONBOARDING_KNOWLEDGE_BASE.map(entry => {
    let score = 0;
    if (entry.topic.toLowerCase().includes(q)) score += 10;
    score += entry.keywords.filter(k => q.includes(k) || k.includes(q)).length * 5;
    if (entry.content.toLowerCase().includes(q)) score += 2;
    return { entry, score };
  });
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.entry);
}
