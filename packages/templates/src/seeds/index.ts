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
import { riskTemplates } from './risk';
import { trainingTemplates } from './training';
import { suppliersTemplates } from './suppliers';
import { assetsTemplates } from './assets';
import { complaintsTemplates } from './complaints';
import { documentsTemplates } from './documents';
import { contractsTemplates } from './contracts';
import { ptwTemplates } from './ptw';
import { incidentsTemplates } from './incidents';
import { auditsTemplates } from './audits';
import { managementReviewTemplates } from './management-review';
import { chemicalsTemplates } from './chemicals';

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
  ...riskTemplates,
  ...trainingTemplates,
  ...suppliersTemplates,
  ...assetsTemplates,
  ...complaintsTemplates,
  ...documentsTemplates,
  ...contractsTemplates,
  ...ptwTemplates,
  ...incidentsTemplates,
  ...auditsTemplates,
  ...managementReviewTemplates,
  ...chemicalsTemplates,
];
