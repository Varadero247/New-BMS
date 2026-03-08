// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { IsoMappingData } from '../../types/region.types';

export interface IsoLegislationMapping extends IsoMappingData {
  countryCode: string;
}

export const isoLegislationMappings: IsoLegislationMapping[] = [
  // ── Singapore ──────────────────────────────────────────────────────────
  {
    countryCode: 'SG',
    isoStandard: 'ISO/IEC 27001',
    isoClause: '5.2',
    legislationShortCode: 'PDPA-2012',
    mappingNotes: 'PDPA Part IV aligns with ISO 27001 information security policy. PDPC Advisory Guidelines map to Annex A controls.',
  },
  {
    countryCode: 'SG',
    isoStandard: 'ISO/IEC 27701',
    isoClause: '5.2',
    legislationShortCode: 'PDPA-2012',
    mappingNotes: 'ISO 27701 PIMS extends ISO 27001 with PDPA-specific privacy management controls.',
  },
  {
    countryCode: 'SG',
    isoStandard: 'ISO 45001',
    isoClause: '4.1',
    legislationShortCode: 'WSH-ACT',
    mappingNotes: 'WSH Act Section 11 (Duty of Occupier) aligns with ISO 45001 context of organisation and OH&S management system requirements.',
  },
  {
    countryCode: 'SG',
    isoStandard: 'ISO 14001',
    isoClause: '6.1.3',
    legislationShortCode: 'EPHA',
    mappingNotes: 'EPHA compliance obligations identify legislative requirements for ISO 14001 environmental aspects and impacts assessment.',
  },
  {
    countryCode: 'SG',
    isoStandard: 'ISO 37001',
    isoClause: '8.2',
    legislationShortCode: 'CDSA',
    mappingNotes: 'CDSA anti-corruption provisions align with ISO 37001 anti-bribery due diligence for controlled organisations.',
  },

  // ── Australia ──────────────────────────────────────────────────────────
  {
    countryCode: 'AU',
    isoStandard: 'ISO/IEC 27001',
    isoClause: '6.1.3',
    legislationShortCode: 'PRIVACY-ACT',
    mappingNotes: 'Australian Privacy Principles (APP 11) directly inform Annex A.18.1 compliance controls. Notifiable Data Breach aligns with A.16.1.2 reporting.',
  },
  {
    countryCode: 'AU',
    isoStandard: 'ISO/IEC 27701',
    isoClause: '6.3',
    legislationShortCode: 'PRIVACY-ACT',
    mappingNotes: 'ISO 27701 Clause 6.3 (Guidance for PII Controllers) maps to APP 3–7 on collection, use, and disclosure.',
  },
  {
    countryCode: 'AU',
    isoStandard: 'ISO 45001',
    isoClause: '4.2',
    legislationShortCode: 'WHS-ACT',
    mappingNotes: 'WHS Act primary duty of care for PCBUs maps to ISO 45001 interested parties. Model WHS Regulations align with ISO 45001 operational planning.',
  },
  {
    countryCode: 'AU',
    isoStandard: 'ISO 14001',
    isoClause: '6.1.3',
    legislationShortCode: 'EPBC-ACT',
    mappingNotes: 'EPBC Act matters of national environmental significance are compliance obligations under ISO 14001 Clause 6.1.3.',
  },
  {
    countryCode: 'AU',
    isoStandard: 'ISO 37001',
    isoClause: '4.5',
    legislationShortCode: 'CORPS-ACT',
    mappingNotes: 'Corporations Act bribery provisions (Criminal Code Act) align with ISO 37001 anti-bribery policy requirements.',
  },
  {
    countryCode: 'AU',
    isoStandard: 'ISO/IEC 27001',
    isoClause: '6.1.3',
    legislationShortCode: 'SOCI-ACT',
    mappingNotes: 'SOCI Act critical infrastructure positive security obligations map to ISO 27001 risk management and security controls.',
  },

  // ── New Zealand ────────────────────────────────────────────────────────
  {
    countryCode: 'NZ',
    isoStandard: 'ISO/IEC 27001',
    isoClause: '6.1.3',
    legislationShortCode: 'PRIVACY-2020',
    mappingNotes: 'Privacy Act 2020 Information Privacy Principles align with ISO 27001 Annex A privacy controls. Mandatory breach notification maps to A.16.1.2.',
  },
  {
    countryCode: 'NZ',
    isoStandard: 'ISO 45001',
    isoClause: '4.2',
    legislationShortCode: 'HSWA-2015',
    mappingNotes: 'HSWA 2015 PCBU duties align with ISO 45001 interested parties. Worker engagement provisions map to ISO 45001 Clause 5.4.',
  },
  {
    countryCode: 'NZ',
    isoStandard: 'ISO 14001',
    isoClause: '6.1.3',
    legislationShortCode: 'RMA-1991',
    mappingNotes: 'RMA resource consent requirements are compliance obligations for ISO 14001 environmental management system.',
  },

  // ── Malaysia ───────────────────────────────────────────────────────────
  {
    countryCode: 'MY',
    isoStandard: 'ISO/IEC 27001',
    isoClause: '6.1.3',
    legislationShortCode: 'PDPA-2010',
    mappingNotes: 'PDPA 7 data protection principles align with ISO 27001 information classification and access control requirements.',
  },
  {
    countryCode: 'MY',
    isoStandard: 'ISO 45001',
    isoClause: '4.1',
    legislationShortCode: 'OSH-ACT-1994',
    mappingNotes: 'Malaysian OSH Act establishes OSH Management System requirements that align with ISO 45001 system context and leadership requirements.',
  },
  {
    countryCode: 'MY',
    isoStandard: 'ISO 14001',
    isoClause: '6.1.3',
    legislationShortCode: 'EQA-1974',
    mappingNotes: 'EQA 1974 scheduled wastes and emission regulations are compliance obligations for ISO 14001.',
  },

  // ── Indonesia ──────────────────────────────────────────────────────────
  {
    countryCode: 'ID',
    isoStandard: 'ISO/IEC 27001',
    isoClause: '6.1.3',
    legislationShortCode: 'PDP-2022',
    mappingNotes: 'PDP Law 2022 data breach obligations align with ISO 27001 incident management and notification requirements.',
  },
  {
    countryCode: 'ID',
    isoStandard: 'ISO 45001',
    isoClause: '4.1',
    legislationShortCode: 'GNK-K3',
    mappingNotes: 'Government Regulation 50/2012 (SMK3) OSH management system requirements map directly to ISO 45001 system elements.',
  },
  {
    countryCode: 'ID',
    isoStandard: 'ISO 14001',
    isoClause: '6.1.3',
    legislationShortCode: 'ENV-LAW-32-2009',
    mappingNotes: 'AMDAL environmental impact assessment process aligns with ISO 14001 environmental aspects evaluation.',
  },

  // ── Thailand ───────────────────────────────────────────────────────────
  {
    countryCode: 'TH',
    isoStandard: 'ISO/IEC 27701',
    isoClause: '6.3',
    legislationShortCode: 'PDPA-2019',
    mappingNotes: 'Thai PDPA consent management requirements align with ISO 27701 PII consent management controls.',
  },
  {
    countryCode: 'TH',
    isoStandard: 'ISO 45001',
    isoClause: '4.2',
    legislationShortCode: 'LPA-THAILAND',
    mappingNotes: 'Labour Protection Act OSH provisions map to ISO 45001 worker participation requirements.',
  },
  {
    countryCode: 'TH',
    isoStandard: 'ISO 14001',
    isoClause: '6.1.3',
    legislationShortCode: 'EQA-THAILAND',
    mappingNotes: 'Thai EIA requirements under NEQA map to ISO 14001 environmental aspects identification and compliance obligations.',
  },

  // ── Philippines ────────────────────────────────────────────────────────
  {
    countryCode: 'PH',
    isoStandard: 'ISO/IEC 27001',
    isoClause: '6.1.3',
    legislationShortCode: 'DPA-2012',
    mappingNotes: 'Data Privacy Act NPC registration and DPO requirements align with ISO 27001 organisational controls.',
  },
  {
    countryCode: 'PH',
    isoStandard: 'ISO 45001',
    isoClause: '4.2',
    legislationShortCode: 'OSH-LAW-2018',
    mappingNotes: 'RA 11058 mandatory safety committee and officer requirements align with ISO 45001 organisational responsibilities.',
  },
  {
    countryCode: 'PH',
    isoStandard: 'ISO 14001',
    isoClause: '6.1.3',
    legislationShortCode: 'CLEAN-AIR-ACT',
    mappingNotes: 'Philippine Clean Air Act emission permits are compliance obligations for ISO 14001 environmental management.',
  },

  // ── Vietnam ────────────────────────────────────────────────────────────
  {
    countryCode: 'VN',
    isoStandard: 'ISO/IEC 27001',
    isoClause: '6.1.3',
    legislationShortCode: 'CYBERSEC-2018',
    mappingNotes: 'Vietnam Cybersecurity Law data localisation and security assessment requirements map to ISO 27001 Annex A controls.',
  },
  {
    countryCode: 'VN',
    isoStandard: 'ISO 14001',
    isoClause: '6.1.3',
    legislationShortCode: 'ENV-PROTECT-2020',
    mappingNotes: 'Environmental Protection Law 2020 environmental impact assessment requirements are compliance obligations for ISO 14001.',
  },

  // ── China ──────────────────────────────────────────────────────────────
  {
    countryCode: 'CN',
    isoStandard: 'ISO/IEC 27701',
    isoClause: '6.3',
    legislationShortCode: 'PIPL-2021',
    mappingNotes: 'PIPL data subject rights and consent framework aligns with ISO 27701 PII controller requirements.',
  },
  {
    countryCode: 'CN',
    isoStandard: 'ISO 45001',
    isoClause: '4.1',
    legislationShortCode: 'WORK-SAFETY-LAW',
    mappingNotes: 'Work Safety Law safety production licence and management system requirements align with ISO 45001 context and system requirements.',
  },
  {
    countryCode: 'CN',
    isoStandard: 'ISO 14001',
    isoClause: '6.1.3',
    legislationShortCode: 'ENV-PROTECT-LAW',
    mappingNotes: 'Environmental Protection Law emissions permits and EIA requirements are compliance obligations for ISO 14001.',
  },

  // ── Japan ──────────────────────────────────────────────────────────────
  {
    countryCode: 'JP',
    isoStandard: 'ISO/IEC 27001',
    isoClause: '6.1.3',
    legislationShortCode: 'APPI-2022',
    mappingNotes: 'Revised APPI cross-border data transfer adequacy requirements align with ISO 27001 supplier relationships and information transfer controls.',
  },
  {
    countryCode: 'JP',
    isoStandard: 'ISO 45001',
    isoClause: '4.2',
    legislationShortCode: 'ISHA-JAPAN',
    mappingNotes: 'Industrial Safety and Health Act health management requirements (occupational physician, health checks) map to ISO 45001 worker health surveillance.',
  },
  {
    countryCode: 'JP',
    isoStandard: 'ISO 14001',
    isoClause: '6.1.3',
    legislationShortCode: 'ENV-BASIC-LAW',
    mappingNotes: 'Environmental Basic Law framework and subsidiary legislation compliance obligations align with ISO 14001.',
  },

  // ── South Korea ────────────────────────────────────────────────────────
  {
    countryCode: 'KR',
    isoStandard: 'ISO/IEC 27001',
    isoClause: '6.1.3',
    legislationShortCode: 'ISBA-KOREA',
    mappingNotes: 'ISMS-P certification requirements closely align with ISO 27001 controls, enabling dual compliance.',
  },
  {
    countryCode: 'KR',
    isoStandard: 'ISO/IEC 27701',
    isoClause: '6.3',
    legislationShortCode: 'PIPA-2011',
    mappingNotes: 'PIPA personal information processing requirements map to ISO 27701 PII controller obligations.',
  },
  {
    countryCode: 'KR',
    isoStandard: 'ISO 45001',
    isoClause: '4.2',
    legislationShortCode: 'OSHA-KOREA',
    mappingNotes: 'Serious Accidents Punishment Act leadership accountability aligns with ISO 45001 top management responsibilities.',
  },

  // ── India ──────────────────────────────────────────────────────────────
  {
    countryCode: 'IN',
    isoStandard: 'ISO/IEC 27001',
    isoClause: '6.1.3',
    legislationShortCode: 'DPDP-2023',
    mappingNotes: 'DPDP Act data fiduciary obligations and breach notification requirements align with ISO 27001 information security controls and incident management.',
  },
  {
    countryCode: 'IN',
    isoStandard: 'ISO 45001',
    isoClause: '4.1',
    legislationShortCode: 'FACTORIES-ACT-1948',
    mappingNotes: 'Factories Act health and safety provisions align with ISO 45001 system context and worker safety requirements.',
  },
  {
    countryCode: 'IN',
    isoStandard: 'ISO 14001',
    isoClause: '6.1.3',
    legislationShortCode: 'EPA-1986',
    mappingNotes: 'Environment Protection Act standards and Environmental Clearance requirements are compliance obligations for ISO 14001.',
  },
  {
    countryCode: 'IN',
    isoStandard: 'ISO 37001',
    isoClause: '4.5',
    legislationShortCode: 'PMLA-2002',
    mappingNotes: 'PMLA AML requirements and beneficial ownership identification align with ISO 37001 anti-bribery due diligence.',
  },

  // ── UAE ─────────────────────────────────────────────────────────────────
  {
    countryCode: 'AE',
    isoStandard: 'ISO/IEC 27001',
    isoClause: '6.1.3',
    legislationShortCode: 'DPL-2021-UAE',
    mappingNotes: 'UAE PDPL data controller obligations and security measures align with ISO 27001 information security management requirements.',
  },
  {
    countryCode: 'AE',
    isoStandard: 'ISO 45001',
    isoClause: '4.1',
    legislationShortCode: 'OHS-LAW-UAE',
    mappingNotes: 'UAE Labour Law OSH provisions and Ministerial Decree 32/1982 requirements map to ISO 45001 operational safety controls.',
  },
  {
    countryCode: 'AE',
    isoStandard: 'ISO 14001',
    isoClause: '6.1.3',
    legislationShortCode: 'ENV-LAW-UAE',
    mappingNotes: 'UAE Environmental Law permit requirements and EIA obligations are compliance obligations for ISO 14001.',
  },
  {
    countryCode: 'AE',
    isoStandard: 'ISO 37001',
    isoClause: '8.2',
    legislationShortCode: 'AML-LAW-UAE',
    mappingNotes: 'UAE AML Law due diligence requirements align with ISO 37001 anti-bribery due diligence for business associates.',
  },

  // ── Saudi Arabia ────────────────────────────────────────────────────────
  {
    countryCode: 'SA',
    isoStandard: 'ISO/IEC 27001',
    isoClause: '6.1.3',
    legislationShortCode: 'PDPL-2021-SA',
    mappingNotes: 'Saudi PDPL DPO appointment and data localisation requirements align with ISO 27001 organisational and technical security controls.',
  },
  {
    countryCode: 'SA',
    isoStandard: 'ISO 45001',
    isoClause: '4.1',
    legislationShortCode: 'OSH-REG-SA',
    mappingNotes: 'Saudi OSH regulations workplace safety requirements map to ISO 45001 hazard identification and operational planning.',
  },
  {
    countryCode: 'SA',
    isoStandard: 'ISO 37001',
    isoClause: '4.5',
    legislationShortCode: 'AML-LAW-SA',
    mappingNotes: 'Saudi AML Law anti-corruption provisions align with ISO 37001 anti-bribery compliance programme requirements.',
  },
];
