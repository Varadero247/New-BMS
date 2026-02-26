// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { PackSection } from '../../types';

export const sections: PackSection[] = [
  {
    name: 'Risk Categories',
    type: 'riskCategories',
    items: [
      { key: 'working-at-height', data: { name: 'Working at Height', description: 'Falls from scaffolding, ladders, roofs, or elevated platforms', likelihood: 3, impact: 5, category: 'PHYSICAL' } },
      { key: 'excavation-collapse', data: { name: 'Excavation & Collapse', description: 'Trenching, excavation, and ground collapse risks', likelihood: 2, impact: 5, category: 'PHYSICAL' } },
      { key: 'plant-equipment', data: { name: 'Plant & Equipment', description: 'Struck-by or run-over by mobile plant, crane operations', likelihood: 3, impact: 4, category: 'PHYSICAL' } },
      { key: 'manual-handling', data: { name: 'Manual Handling', description: 'Musculoskeletal injury from lifting, carrying, or awkward postures', likelihood: 4, impact: 3, category: 'ERGONOMIC' } },
      { key: 'hazardous-substances', data: { name: 'Hazardous Substances (COSHH)', description: 'Exposure to asbestos, silica dust, solvents, or chemicals', likelihood: 3, impact: 4, category: 'CHEMICAL' } },
      { key: 'electrical', data: { name: 'Electrical Safety', description: 'Contact with overhead lines, buried cables, or temporary supplies', likelihood: 2, impact: 5, category: 'PHYSICAL' } },
      { key: 'fire-hot-work', data: { name: 'Fire & Hot Works', description: 'Fire risk from hot works, flammable materials, site fires', likelihood: 2, impact: 4, category: 'PHYSICAL' } },
      { key: 'noise-vibration', data: { name: 'Noise & Vibration (HAV)', description: 'Hand-arm vibration and noise-induced hearing loss', likelihood: 4, impact: 3, category: 'PHYSICAL' } },
      { key: 'confined-space', data: { name: 'Confined Space Entry', description: 'Oxygen deficiency, flooding, or engulfment in confined spaces', likelihood: 2, impact: 5, category: 'PHYSICAL' } },
      { key: 'cdm-coordination', data: { name: 'CDM Coordination Failure', description: 'Failure to comply with CDM 2015 duty-holder obligations', likelihood: 2, impact: 4, category: 'REGULATORY' } },
    ],
  },
  {
    name: 'Document Types',
    type: 'documentTypes',
    items: [
      { key: 'rams', data: { name: 'Risk Assessment & Method Statement (RAMS)', code: 'RAMS', retention: 5, approvalRequired: true } },
      { key: 'cpf', data: { name: 'Construction Phase Plan', code: 'CPP', retention: 7, approvalRequired: true } },
      { key: 'ptw', data: { name: 'Permit to Work', code: 'PTW', retention: 3, approvalRequired: true } },
      { key: 'site-induction', data: { name: 'Site Induction Record', code: 'SIR', retention: 5, approvalRequired: false } },
      { key: 'toolbox-talk', data: { name: 'Toolbox Talk Record', code: 'TBT', retention: 3, approvalRequired: false } },
      { key: 'accident-report', data: { name: 'Accident / Near Miss Report', code: 'ANM', retention: 7, approvalRequired: true } },
      { key: 'inspection-record', data: { name: 'Site Safety Inspection', code: 'SSI', retention: 3, approvalRequired: false } },
      { key: 'riddor-report', data: { name: 'RIDDOR Report', code: 'RID', retention: 10, approvalRequired: true } },
    ],
  },
  {
    name: 'KPIs',
    type: 'kpis',
    items: [
      { key: 'ltifr', data: { name: 'Lost Time Injury Frequency Rate (LTIFR)', unit: 'per 1M hrs', target: 0.5, direction: 'lower_better', frequency: 'MONTHLY' } },
      { key: 'trifr', data: { name: 'Total Recordable Injury Frequency Rate', unit: 'per 1M hrs', target: 2.0, direction: 'lower_better', frequency: 'MONTHLY' } },
      { key: 'near-miss-reporting', data: { name: 'Near Miss Reports Filed', unit: 'count', target: 10, direction: 'higher_better', frequency: 'MONTHLY' } },
      { key: 'inspection-completion', data: { name: 'Site Inspection Completion', unit: '%', target: 100, direction: 'higher_better', frequency: 'WEEKLY' } },
      { key: 'toolbox-talks', data: { name: 'Toolbox Talks Completed', unit: 'count', target: 4, direction: 'higher_better', frequency: 'MONTHLY' } },
      { key: 'ptw-compliance', data: { name: 'Permit to Work Compliance', unit: '%', target: 100, direction: 'higher_better', frequency: 'MONTHLY' } },
    ],
  },
];
