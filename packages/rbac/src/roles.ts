import { PermissionLevel, ImsModule, RoleDefinition, ModulePermissions } from './types';

const P = PermissionLevel;

function allModules(level: PermissionLevel): ModulePermissions[] {
  const modules: ImsModule[] = [
    'health-safety',
    'environment',
    'quality',
    'hr',
    'payroll',
    'inventory',
    'workflows',
    'project-management',
    'automotive',
    'medical',
    'aerospace',
    'finance',
    'crm',
    'infosec',
    'esg',
    'cmms',
    'portal',
    'food-safety',
    'energy',
    'analytics',
    'field-service',
    'iso42001',
    'iso37001',
    'ai',
    'settings',
    'templates',
    'reports',
    'dashboard',
  ];
  return modules.map((m) => ({ module: m, level }));
}

function specificModules(
  mapping: Partial<Record<ImsModule, PermissionLevel>>
): ModulePermissions[] {
  const result: ModulePermissions[] = [];
  for (const [mod, level] of Object.entries(mapping)) {
    result.push({ module: mod as ImsModule, level: level! });
  }
  // All unspecified modules get VIEW
  const allMods: ImsModule[] = [
    'health-safety',
    'environment',
    'quality',
    'hr',
    'payroll',
    'inventory',
    'workflows',
    'project-management',
    'automotive',
    'medical',
    'aerospace',
    'finance',
    'crm',
    'infosec',
    'esg',
    'cmms',
    'portal',
    'food-safety',
    'energy',
    'analytics',
    'field-service',
    'iso42001',
    'iso37001',
    'ai',
    'settings',
    'templates',
    'reports',
    'dashboard',
  ];
  for (const m of allMods) {
    if (!(m in mapping)) {
      result.push({ module: m, level: P.VIEW });
    }
  }
  return result;
}

export const PLATFORM_ROLES: RoleDefinition[] = [
  // Tier 1: Super Admin
  {
    id: 'super-admin',
    name: 'Super Administrator',
    description: 'Full system access',
    permissions: allModules(P.FULL),
    isSystem: true,
  },

  // Tier 2: Organizational Admins
  {
    id: 'org-admin',
    name: 'Organization Admin',
    description: 'Full org access',
    permissions: allModules(P.FULL),
    isSystem: true,
  },
  {
    id: 'compliance-director',
    name: 'Compliance Director',
    description: 'Compliance oversight',
    permissions: specificModules({
      'health-safety': P.APPROVE,
      environment: P.APPROVE,
      quality: P.APPROVE,
      automotive: P.APPROVE,
      medical: P.APPROVE,
      aerospace: P.APPROVE,
      reports: P.FULL,
      dashboard: P.FULL,
      templates: P.FULL,
    }),
    isSystem: true,
  },
  {
    id: 'it-admin',
    name: 'IT Administrator',
    description: 'System configuration',
    permissions: specificModules({
      settings: P.FULL,
      ai: P.FULL,
      templates: P.FULL,
      reports: P.FULL,
      dashboard: P.FULL,
    }),
    isSystem: true,
  },

  // Tier 3: Department Heads
  {
    id: 'hs-manager',
    name: 'Health & Safety Manager',
    description: 'H&S department head',
    permissions: specificModules({
      'health-safety': P.FULL,
      environment: P.EDIT,
      quality: P.EDIT,
      reports: P.FULL,
      dashboard: P.FULL,
      templates: P.EDIT,
    }),
    isSystem: true,
  },
  {
    id: 'env-manager',
    name: 'Environment Manager',
    description: 'Environment department head',
    permissions: specificModules({
      environment: P.FULL,
      'health-safety': P.EDIT,
      quality: P.EDIT,
      reports: P.FULL,
      dashboard: P.FULL,
      templates: P.EDIT,
    }),
    isSystem: true,
  },
  {
    id: 'quality-manager',
    name: 'Quality Manager',
    description: 'Quality department head',
    permissions: specificModules({
      quality: P.FULL,
      'health-safety': P.EDIT,
      environment: P.EDIT,
      reports: P.FULL,
      dashboard: P.FULL,
      templates: P.EDIT,
    }),
    isSystem: true,
  },
  {
    id: 'hr-manager',
    name: 'HR Manager',
    description: 'HR department head',
    permissions: specificModules({
      hr: P.FULL,
      payroll: P.APPROVE,
      reports: P.FULL,
      dashboard: P.FULL,
      templates: P.EDIT,
    }),
    isSystem: true,
  },
  {
    id: 'finance-manager',
    name: 'Finance Manager',
    description: 'Finance department head',
    permissions: specificModules({
      finance: P.FULL,
      payroll: P.APPROVE,
      reports: P.FULL,
      dashboard: P.FULL,
      templates: P.EDIT,
      inventory: P.EDIT,
    }),
    isSystem: true,
  },
  {
    id: 'inventory-manager',
    name: 'Inventory Manager',
    description: 'Inventory department head',
    permissions: specificModules({
      inventory: P.FULL,
      finance: P.EDIT,
      reports: P.FULL,
      dashboard: P.FULL,
      templates: P.EDIT,
    }),
    isSystem: true,
  },
  {
    id: 'pm-manager',
    name: 'Project Manager',
    description: 'Project management head',
    permissions: specificModules({
      'project-management': P.FULL,
      workflows: P.FULL,
      reports: P.FULL,
      dashboard: P.FULL,
      templates: P.EDIT,
    }),
    isSystem: true,
  },
  {
    id: 'automotive-manager',
    name: 'Automotive Manager',
    description: 'Automotive vertical head',
    permissions: specificModules({
      automotive: P.FULL,
      quality: P.EDIT,
      reports: P.FULL,
      dashboard: P.FULL,
      templates: P.EDIT,
    }),
    isSystem: true,
  },
  {
    id: 'medical-manager',
    name: 'Medical Device Manager',
    description: 'Medical device vertical head',
    permissions: specificModules({
      medical: P.FULL,
      quality: P.EDIT,
      reports: P.FULL,
      dashboard: P.FULL,
      templates: P.EDIT,
    }),
    isSystem: true,
  },
  {
    id: 'aerospace-manager',
    name: 'Aerospace Manager',
    description: 'Aerospace vertical head',
    permissions: specificModules({
      aerospace: P.FULL,
      quality: P.EDIT,
      reports: P.FULL,
      dashboard: P.FULL,
      templates: P.EDIT,
    }),
    isSystem: true,
  },
  {
    id: 'crm-manager',
    name: 'CRM Manager',
    description: 'Sales & CRM head',
    permissions: specificModules({
      crm: P.FULL,
      finance: P.EDIT,
      reports: P.FULL,
      dashboard: P.FULL,
      templates: P.EDIT,
    }),
    isSystem: true,
  },
  {
    id: 'infosec-manager',
    name: 'InfoSec Manager',
    description: 'Information security head',
    permissions: specificModules({
      infosec: P.FULL,
      reports: P.FULL,
      dashboard: P.FULL,
      templates: P.EDIT,
    }),
    isSystem: true,
  },
  {
    id: 'esg-manager',
    name: 'ESG Manager',
    description: 'ESG & sustainability head',
    permissions: specificModules({
      esg: P.FULL,
      environment: P.EDIT,
      reports: P.FULL,
      dashboard: P.FULL,
      templates: P.EDIT,
    }),
    isSystem: true,
  },
  {
    id: 'cmms-manager',
    name: 'Maintenance Manager',
    description: 'Asset & maintenance head',
    permissions: specificModules({
      cmms: P.FULL,
      inventory: P.EDIT,
      reports: P.FULL,
      dashboard: P.FULL,
      templates: P.EDIT,
    }),
    isSystem: true,
  },
  {
    id: 'food-safety-manager',
    name: 'Food Safety Manager',
    description: 'Food safety head',
    permissions: specificModules({
      'food-safety': P.FULL,
      quality: P.EDIT,
      reports: P.FULL,
      dashboard: P.FULL,
      templates: P.EDIT,
    }),
    isSystem: true,
  },
  {
    id: 'energy-manager',
    name: 'Energy Manager',
    description: 'Energy management head',
    permissions: specificModules({
      energy: P.FULL,
      environment: P.EDIT,
      esg: P.EDIT,
      reports: P.FULL,
      dashboard: P.FULL,
      templates: P.EDIT,
    }),
    isSystem: true,
  },
  {
    id: 'ai-governance-manager',
    name: 'AI Governance Manager',
    description: 'ISO 42001 AI management head',
    permissions: specificModules({
      iso42001: P.FULL,
      infosec: P.EDIT,
      reports: P.FULL,
      dashboard: P.FULL,
      templates: P.EDIT,
    }),
    isSystem: true,
  },
  {
    id: 'antibribery-manager',
    name: 'Anti-Bribery Manager',
    description: 'ISO 37001 anti-bribery head',
    permissions: specificModules({
      iso37001: P.FULL,
      hr: P.VIEW,
      reports: P.FULL,
      dashboard: P.FULL,
      templates: P.EDIT,
    }),
    isSystem: true,
  },
  {
    id: 'field-service-manager',
    name: 'Field Service Manager',
    description: 'Field service operations head',
    permissions: specificModules({
      'field-service': P.FULL,
      cmms: P.EDIT,
      finance: P.EDIT,
      reports: P.FULL,
      dashboard: P.FULL,
      templates: P.EDIT,
    }),
    isSystem: true,
  },
  {
    id: 'analytics-manager',
    name: 'Analytics Manager',
    description: 'BI & analytics head',
    permissions: specificModules({
      analytics: P.FULL,
      reports: P.FULL,
      dashboard: P.FULL,
      templates: P.EDIT,
    }),
    isSystem: true,
  },
  {
    id: 'portal-manager',
    name: 'Portal Manager',
    description: 'Customer & supplier portal head',
    permissions: specificModules({
      portal: P.FULL,
      crm: P.EDIT,
      quality: P.VIEW,
      reports: P.FULL,
      dashboard: P.FULL,
    }),
    isSystem: true,
  },

  // Tier 4: Team Leads / Approvers
  {
    id: 'hs-lead',
    name: 'H&S Team Lead',
    description: 'H&S team lead',
    permissions: specificModules({
      'health-safety': P.APPROVE,
      environment: P.CREATE,
      quality: P.CREATE,
      dashboard: P.VIEW,
      templates: P.VIEW,
    }),
    isSystem: true,
  },
  {
    id: 'env-lead',
    name: 'Environment Team Lead',
    description: 'Environment team lead',
    permissions: specificModules({
      environment: P.APPROVE,
      'health-safety': P.CREATE,
      quality: P.CREATE,
      dashboard: P.VIEW,
      templates: P.VIEW,
    }),
    isSystem: true,
  },
  {
    id: 'quality-lead',
    name: 'Quality Team Lead',
    description: 'Quality team lead',
    permissions: specificModules({
      quality: P.APPROVE,
      'health-safety': P.CREATE,
      environment: P.CREATE,
      dashboard: P.VIEW,
      templates: P.VIEW,
    }),
    isSystem: true,
  },
  {
    id: 'finance-lead',
    name: 'Finance Team Lead',
    description: 'Finance team lead',
    permissions: specificModules({
      finance: P.APPROVE,
      payroll: P.EDIT,
      dashboard: P.VIEW,
      templates: P.VIEW,
    }),
    isSystem: true,
  },
  {
    id: 'crm-lead',
    name: 'Sales Team Lead',
    description: 'CRM team lead',
    permissions: specificModules({
      crm: P.APPROVE,
      finance: P.CREATE,
      dashboard: P.VIEW,
      templates: P.VIEW,
    }),
    isSystem: true,
  },
  {
    id: 'infosec-lead',
    name: 'InfoSec Team Lead',
    description: 'InfoSec team lead',
    permissions: specificModules({ infosec: P.APPROVE, dashboard: P.VIEW, templates: P.VIEW }),
    isSystem: true,
  },

  // Tier 5: Specialists / Contributors
  {
    id: 'hs-officer',
    name: 'H&S Officer',
    description: 'H&S specialist',
    permissions: specificModules({ 'health-safety': P.EDIT, dashboard: P.VIEW, templates: P.VIEW }),
    isSystem: true,
  },
  {
    id: 'env-officer',
    name: 'Environment Officer',
    description: 'Environment specialist',
    permissions: specificModules({ environment: P.EDIT, dashboard: P.VIEW, templates: P.VIEW }),
    isSystem: true,
  },
  {
    id: 'quality-officer',
    name: 'Quality Officer',
    description: 'Quality specialist',
    permissions: specificModules({ quality: P.EDIT, dashboard: P.VIEW, templates: P.VIEW }),
    isSystem: true,
  },
  {
    id: 'accountant',
    name: 'Accountant',
    description: 'Finance specialist',
    permissions: specificModules({
      finance: P.EDIT,
      reports: P.VIEW,
      dashboard: P.VIEW,
      templates: P.VIEW,
    }),
    isSystem: true,
  },
  {
    id: 'hr-officer',
    name: 'HR Officer',
    description: 'HR specialist',
    permissions: specificModules({ hr: P.EDIT, dashboard: P.VIEW, templates: P.VIEW }),
    isSystem: true,
  },
  {
    id: 'payroll-officer',
    name: 'Payroll Officer',
    description: 'Payroll specialist',
    permissions: specificModules({
      payroll: P.EDIT,
      hr: P.VIEW,
      finance: P.VIEW,
      dashboard: P.VIEW,
    }),
    isSystem: true,
  },
  {
    id: 'sales-rep',
    name: 'Sales Representative',
    description: 'CRM specialist',
    permissions: specificModules({
      crm: P.EDIT,
      reports: P.VIEW,
      dashboard: P.VIEW,
      templates: P.VIEW,
    }),
    isSystem: true,
  },
  {
    id: 'infosec-analyst',
    name: 'InfoSec Analyst',
    description: 'InfoSec specialist',
    permissions: specificModules({ infosec: P.EDIT, dashboard: P.VIEW, templates: P.VIEW }),
    isSystem: true,
  },
  {
    id: 'dpo',
    name: 'Data Protection Officer',
    description: 'DPO — privacy specialist',
    permissions: specificModules({
      infosec: P.APPROVE,
      hr: P.VIEW,
      dashboard: P.FULL,
      reports: P.FULL,
    }),
    isSystem: true,
  },
  {
    id: 'auditor',
    name: 'Auditor',
    description: 'Read-only audit access',
    permissions: allModules(P.VIEW),
    isSystem: true,
  },

  // Tier 6: Basic Users
  {
    id: 'employee',
    name: 'Employee',
    description: 'Basic employee access',
    permissions: [
      { module: 'hr', level: P.CREATE },
      { module: 'dashboard', level: P.VIEW },
      { module: 'templates', level: P.VIEW },
    ],
    isSystem: true,
  },
  {
    id: 'contractor',
    name: 'Contractor',
    description: 'Limited contractor access',
    permissions: [
      { module: 'health-safety', level: P.CREATE },
      { module: 'dashboard', level: P.VIEW },
    ],
    isSystem: true,
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access',
    permissions: [{ module: 'dashboard', level: P.VIEW }],
    isSystem: true,
  },
];

export function getRoleById(roleId: string): RoleDefinition | undefined {
  return PLATFORM_ROLES.find((r) => r.id === roleId);
}

export function getRolesByIds(roleIds: string[]): RoleDefinition[] {
  return roleIds.map((id) => getRoleById(id)).filter((r): r is RoleDefinition => r !== undefined);
}
