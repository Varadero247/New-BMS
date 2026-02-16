import type { ImsModule } from '@ims/rbac';

export type WidgetId =
  | 'compliance-gauges'
  | 'stat-cards'
  | 'quick-actions'
  | 'activity-feed'
  | 'top-risks'
  | 'overdue-capa'
  | 'ai-insights';

export type SectionId = 'iso-compliance' | 'operations' | 'portals-specialist';

export interface WidgetConfig {
  visible: boolean;
  order: number;
}

export interface SectionConfig {
  visible: boolean;
  order: number;
}

export interface DashboardConfig {
  widgets: Record<WidgetId, WidgetConfig>;
  sections: Record<SectionId, SectionConfig>;
  hiddenModules: string[];
}

export const MODULE_RBAC_MAP: Record<string, ImsModule> = {
  'Health & Safety': 'health-safety',
  'Environmental': 'environment',
  'Quality': 'quality',
  'ESG': 'esg',
  'Food Safety': 'food-safety',
  'Energy': 'energy',
  'ISO 42001 (AI)': 'iso42001',
  'ISO 37001': 'iso37001',
  'InfoSec': 'infosec',
  'Aerospace': 'aerospace',
  'Inventory': 'inventory',
  'HR Management': 'hr',
  'Payroll': 'payroll',
  'Workflows': 'workflows',
  'Project Management': 'project-management',
  'Finance': 'finance',
  'CRM': 'crm',
  'CMMS': 'cmms',
  'Field Service': 'field-service',
  'Analytics': 'analytics',
  'Customer Portal': 'portal',
  'Supplier Portal': 'portal',
  'Medical Devices': 'medical',
  'Automotive': 'automotive',
};

export const WIDGET_META: Record<WidgetId, { label: string; description: string; icon: string }> = {
  'compliance-gauges': { label: 'Compliance Gauges', description: 'ISO 45001, 14001, 9001 & overall compliance scores', icon: 'gauge' },
  'stat-cards': { label: 'Stat Cards', description: 'Active risks, open incidents, overdue actions, AI insights', icon: 'bar-chart' },
  'quick-actions': { label: 'Quick Actions', description: 'Shortcuts to report incidents, raise NCRs, create work orders', icon: 'zap' },
  'activity-feed': { label: 'Activity Feed', description: 'Recent cross-module activity timeline', icon: 'clock' },
  'top-risks': { label: 'Top Risks', description: 'Top 5 highest-scoring risks across all modules', icon: 'alert-triangle' },
  'overdue-capa': { label: 'Overdue CAPA', description: 'Corrective and preventive actions past their due date', icon: 'clock' },
  'ai-insights': { label: 'AI Insights', description: 'Latest AI-generated analyses and recommendations', icon: 'sparkles' },
};

export const SECTION_META: Record<SectionId, { label: string; description: string }> = {
  'iso-compliance': { label: 'ISO Compliance', description: 'Standards-based management modules' },
  'operations': { label: 'Operations', description: 'Day-to-day business operations modules' },
  'portals-specialist': { label: 'Portals & Specialist', description: 'External portals and industry-specific modules' },
};

export const WIDGET_IDS: WidgetId[] = [
  'compliance-gauges',
  'stat-cards',
  'quick-actions',
  'activity-feed',
  'top-risks',
  'overdue-capa',
  'ai-insights',
];

export const SECTION_IDS: SectionId[] = ['iso-compliance', 'operations', 'portals-specialist'];

export const DEFAULT_CONFIG: DashboardConfig = {
  widgets: {
    'compliance-gauges': { visible: true, order: 0 },
    'stat-cards': { visible: true, order: 1 },
    'quick-actions': { visible: true, order: 2 },
    'activity-feed': { visible: true, order: 3 },
    'top-risks': { visible: true, order: 4 },
    'overdue-capa': { visible: true, order: 5 },
    'ai-insights': { visible: true, order: 6 },
  },
  sections: {
    'iso-compliance': { visible: true, order: 0 },
    'operations': { visible: true, order: 1 },
    'portals-specialist': { visible: true, order: 2 },
  },
  hiddenModules: [],
};
