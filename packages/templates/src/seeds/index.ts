import type { TemplateDefinition } from '../types';

import { healthSafetyTemplates } from './health-safety';
import { environmentTemplates } from './environment';
import { qualityTemplates } from './quality';
import { automotiveTemplates } from './automotive';
import { medicalTemplates } from './medical';
import { aerospaceTemplates } from './aerospace';
import { hrTemplates } from './hr';
import { workflowsTemplates } from './workflows';
import { projectManagementTemplates } from './project-management';
import { inventoryTemplates } from './inventory';
import { payrollTemplates } from './payroll';
import { crmTemplates } from './crm';
import { financeTemplates } from './finance';
import { infosecTemplates } from './infosec';
import { iso37001Templates } from './iso37001';
import { iso42001Templates } from './iso42001';
import { esgTemplates } from './esg';
import { cmmsTemplates } from './cmms';
import { foodSafetyTemplates } from './food-safety';
import { energyTemplates } from './energy';
import { fieldServiceTemplates } from './field-service';
import { analyticsTemplates } from './analytics';

export const allTemplates: TemplateDefinition[] = [
  ...healthSafetyTemplates,
  ...environmentTemplates,
  ...qualityTemplates,
  ...automotiveTemplates,
  ...medicalTemplates,
  ...aerospaceTemplates,
  ...hrTemplates,
  ...workflowsTemplates,
  ...projectManagementTemplates,
  ...inventoryTemplates,
  ...payrollTemplates,
  ...crmTemplates,
  ...financeTemplates,
  ...infosecTemplates,
  ...iso37001Templates,
  ...iso42001Templates,
  ...esgTemplates,
  ...cmmsTemplates,
  ...foodSafetyTemplates,
  ...energyTemplates,
  ...fieldServiceTemplates,
  ...analyticsTemplates,
];
