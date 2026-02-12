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
];
