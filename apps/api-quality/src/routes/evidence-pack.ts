import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { scopeToUser } from '@ims/service-auth';
import { validateIdParam } from '@ims/shared';
import { randomUUID } from 'crypto';

const logger = createLogger('api-quality:evidence-pack');

const router: Router = Router();

router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// IN-MEMORY EVIDENCE PACK STORE (v1)
// ============================================

interface EvidenceSection {
  clauseNumber: string;
  clauseTitle: string;
  documents: number;
  records: number;
  status: 'COMPLETE' | 'PARTIAL' | 'MISSING';
}

interface EvidencePack {
  id: string;
  referenceNumber: string;
  organisationId: string;
  standard: string;
  status: 'GENERATING' | 'COMPLETE' | 'FAILED';
  format: 'PDF' | 'ZIP';
  dateFrom: string | null;
  dateTo: string | null;
  sections: EvidenceSection[];
  generatedAt: string;
  generatedBy: string;
  totalDocuments: number;
  totalRecords: number;
  createdAt: string;
}

const evidencePackStore = new Map<string, EvidencePack>();

// Reference number counter tracker
let refCounter = 0;

function generateRefNumber(): string {
  const year = new Date().getFullYear();
  refCounter++;
  return `EVP-${year}-${String(refCounter).padStart(3, '0')}`;
}

// ============================================
// ISO CLAUSE DEFINITIONS PER STANDARD
// ============================================

interface ClauseDef {
  clauseNumber: string;
  clauseTitle: string;
}

const ISO_CLAUSES: Record<string, ClauseDef[]> = {
  ISO_9001: [
    { clauseNumber: '4.1', clauseTitle: 'Understanding the organization and its context' },
    {
      clauseNumber: '4.2',
      clauseTitle: 'Understanding the needs and expectations of interested parties',
    },
    { clauseNumber: '4.3', clauseTitle: 'Determining the scope of the QMS' },
    { clauseNumber: '4.4', clauseTitle: 'Quality management system and its processes' },
    { clauseNumber: '5.1', clauseTitle: 'Leadership and commitment' },
    { clauseNumber: '5.2', clauseTitle: 'Quality policy' },
    { clauseNumber: '5.3', clauseTitle: 'Organizational roles, responsibilities and authorities' },
    { clauseNumber: '6.1', clauseTitle: 'Actions to address risks and opportunities' },
    { clauseNumber: '6.2', clauseTitle: 'Quality objectives and planning to achieve them' },
    { clauseNumber: '6.3', clauseTitle: 'Planning of changes' },
    { clauseNumber: '7.1', clauseTitle: 'Resources' },
    { clauseNumber: '7.2', clauseTitle: 'Competence' },
    { clauseNumber: '7.3', clauseTitle: 'Awareness' },
    { clauseNumber: '7.4', clauseTitle: 'Communication' },
    { clauseNumber: '7.5', clauseTitle: 'Documented information' },
    { clauseNumber: '8.1', clauseTitle: 'Operational planning and control' },
    { clauseNumber: '8.2', clauseTitle: 'Requirements for products and services' },
    { clauseNumber: '8.3', clauseTitle: 'Design and development of products and services' },
    {
      clauseNumber: '8.4',
      clauseTitle: 'Control of externally provided processes, products and services',
    },
    { clauseNumber: '8.5', clauseTitle: 'Production and service provision' },
    { clauseNumber: '8.6', clauseTitle: 'Release of products and services' },
    { clauseNumber: '8.7', clauseTitle: 'Control of nonconforming outputs' },
    { clauseNumber: '9.1', clauseTitle: 'Monitoring, measurement, analysis and evaluation' },
    { clauseNumber: '9.2', clauseTitle: 'Internal audit' },
    { clauseNumber: '9.3', clauseTitle: 'Management review' },
    { clauseNumber: '10.1', clauseTitle: 'General — Improvement' },
    { clauseNumber: '10.2', clauseTitle: 'Nonconformity and corrective action' },
    { clauseNumber: '10.3', clauseTitle: 'Continual improvement' },
  ],
  ISO_14001: [
    { clauseNumber: '4.1', clauseTitle: 'Understanding the organization and its context' },
    {
      clauseNumber: '4.2',
      clauseTitle: 'Understanding the needs and expectations of interested parties',
    },
    { clauseNumber: '4.3', clauseTitle: 'Determining the scope of the EMS' },
    { clauseNumber: '4.4', clauseTitle: 'Environmental management system' },
    { clauseNumber: '5.1', clauseTitle: 'Leadership and commitment' },
    { clauseNumber: '5.2', clauseTitle: 'Environmental policy' },
    { clauseNumber: '5.3', clauseTitle: 'Organizational roles, responsibilities and authorities' },
    {
      clauseNumber: '6.1',
      clauseTitle: 'Actions to address risks and opportunities — Environmental aspects',
    },
    { clauseNumber: '6.2', clauseTitle: 'Environmental objectives and planning to achieve them' },
    { clauseNumber: '7.1', clauseTitle: 'Resources' },
    { clauseNumber: '7.2', clauseTitle: 'Competence' },
    { clauseNumber: '7.3', clauseTitle: 'Awareness' },
    { clauseNumber: '7.4', clauseTitle: 'Communication' },
    { clauseNumber: '7.5', clauseTitle: 'Documented information' },
    { clauseNumber: '8.1', clauseTitle: 'Operational planning and control' },
    { clauseNumber: '8.2', clauseTitle: 'Emergency preparedness and response' },
    { clauseNumber: '9.1', clauseTitle: 'Monitoring, measurement, analysis and evaluation' },
    { clauseNumber: '9.2', clauseTitle: 'Internal audit' },
    { clauseNumber: '9.3', clauseTitle: 'Management review' },
    { clauseNumber: '10.1', clauseTitle: 'General — Improvement' },
    { clauseNumber: '10.2', clauseTitle: 'Nonconformity and corrective action' },
    { clauseNumber: '10.3', clauseTitle: 'Continual improvement' },
  ],
  ISO_45001: [
    { clauseNumber: '4.1', clauseTitle: 'Understanding the organization and its context' },
    {
      clauseNumber: '4.2',
      clauseTitle:
        'Understanding the needs and expectations of workers and other interested parties',
    },
    { clauseNumber: '4.3', clauseTitle: 'Determining the scope of the OH&S management system' },
    { clauseNumber: '4.4', clauseTitle: 'OH&S management system' },
    { clauseNumber: '5.1', clauseTitle: 'Leadership and commitment' },
    { clauseNumber: '5.2', clauseTitle: 'OH&S policy' },
    { clauseNumber: '5.3', clauseTitle: 'Organizational roles, responsibilities and authorities' },
    { clauseNumber: '5.4', clauseTitle: 'Consultation and participation of workers' },
    {
      clauseNumber: '6.1',
      clauseTitle: 'Actions to address risks and opportunities — Hazard identification',
    },
    { clauseNumber: '6.2', clauseTitle: 'OH&S objectives and planning to achieve them' },
    { clauseNumber: '7.1', clauseTitle: 'Resources' },
    { clauseNumber: '7.2', clauseTitle: 'Competence' },
    { clauseNumber: '7.3', clauseTitle: 'Awareness' },
    { clauseNumber: '7.4', clauseTitle: 'Communication' },
    { clauseNumber: '7.5', clauseTitle: 'Documented information' },
    { clauseNumber: '8.1', clauseTitle: 'Operational planning and control' },
    { clauseNumber: '8.2', clauseTitle: 'Emergency preparedness and response' },
    { clauseNumber: '9.1', clauseTitle: 'Monitoring, measurement, analysis and evaluation' },
    { clauseNumber: '9.2', clauseTitle: 'Internal audit' },
    { clauseNumber: '9.3', clauseTitle: 'Management review' },
    { clauseNumber: '10.1', clauseTitle: 'General — Improvement' },
    { clauseNumber: '10.2', clauseTitle: 'Incident, nonconformity and corrective action' },
    { clauseNumber: '10.3', clauseTitle: 'Continual improvement' },
  ],
  ISO_27001: [
    { clauseNumber: '4.1', clauseTitle: 'Understanding the organization and its context' },
    {
      clauseNumber: '4.2',
      clauseTitle: 'Understanding the needs and expectations of interested parties',
    },
    { clauseNumber: '4.3', clauseTitle: 'Determining the scope of the ISMS' },
    { clauseNumber: '4.4', clauseTitle: 'Information security management system' },
    { clauseNumber: '5.1', clauseTitle: 'Leadership and commitment' },
    { clauseNumber: '5.2', clauseTitle: 'Information security policy' },
    { clauseNumber: '5.3', clauseTitle: 'Organizational roles, responsibilities and authorities' },
    {
      clauseNumber: '6.1',
      clauseTitle:
        'Actions to address risks and opportunities — Information security risk assessment',
    },
    {
      clauseNumber: '6.2',
      clauseTitle: 'Information security objectives and planning to achieve them',
    },
    { clauseNumber: '6.3', clauseTitle: 'Planning of changes' },
    { clauseNumber: '7.1', clauseTitle: 'Resources' },
    { clauseNumber: '7.2', clauseTitle: 'Competence' },
    { clauseNumber: '7.3', clauseTitle: 'Awareness' },
    { clauseNumber: '7.4', clauseTitle: 'Communication' },
    { clauseNumber: '7.5', clauseTitle: 'Documented information' },
    { clauseNumber: '8.1', clauseTitle: 'Operational planning and control' },
    { clauseNumber: '8.2', clauseTitle: 'Information security risk assessment' },
    { clauseNumber: '8.3', clauseTitle: 'Information security risk treatment' },
    { clauseNumber: '9.1', clauseTitle: 'Monitoring, measurement, analysis and evaluation' },
    { clauseNumber: '9.2', clauseTitle: 'Internal audit' },
    { clauseNumber: '9.3', clauseTitle: 'Management review' },
    { clauseNumber: '10.1', clauseTitle: 'Continual improvement' },
    { clauseNumber: '10.2', clauseTitle: 'Nonconformity and corrective action' },
  ],
  IATF_16949: [
    { clauseNumber: '4.1', clauseTitle: 'Understanding the organization and its context' },
    {
      clauseNumber: '4.2',
      clauseTitle: 'Understanding the needs and expectations of interested parties',
    },
    { clauseNumber: '4.3', clauseTitle: 'Determining the scope of the QMS' },
    { clauseNumber: '4.4', clauseTitle: 'Quality management system and its processes' },
    { clauseNumber: '5.1', clauseTitle: 'Leadership and commitment — Corporate responsibility' },
    { clauseNumber: '5.2', clauseTitle: 'Quality policy' },
    { clauseNumber: '5.3', clauseTitle: 'Organizational roles, responsibilities and authorities' },
    { clauseNumber: '6.1', clauseTitle: 'Actions to address risks and opportunities' },
    { clauseNumber: '6.2', clauseTitle: 'Quality objectives and planning to achieve them' },
    { clauseNumber: '7.1', clauseTitle: 'Resources — MSA, calibration, tooling' },
    { clauseNumber: '7.2', clauseTitle: 'Competence — On-the-job training' },
    { clauseNumber: '7.5', clauseTitle: 'Documented information — Engineering specifications' },
    { clauseNumber: '8.1', clauseTitle: 'Operational planning and control — Control plans' },
    {
      clauseNumber: '8.2',
      clauseTitle: 'Requirements for products and services — Special characteristics',
    },
    { clauseNumber: '8.3', clauseTitle: 'Design and development — APQP/PPAP' },
    {
      clauseNumber: '8.4',
      clauseTitle: 'Control of externally provided processes — Supplier development',
    },
    { clauseNumber: '8.5', clauseTitle: 'Production and service provision — SPC, FMEA' },
    { clauseNumber: '8.7', clauseTitle: 'Control of nonconforming outputs — Customer waivers' },
    { clauseNumber: '9.1', clauseTitle: 'Monitoring, measurement — Customer satisfaction, KPIs' },
    { clauseNumber: '9.2', clauseTitle: 'Internal audit — Product, process, system audits' },
    { clauseNumber: '9.3', clauseTitle: 'Management review — Cost of poor quality' },
    { clauseNumber: '10.2', clauseTitle: 'Nonconformity and corrective action — 8D, warranty' },
    { clauseNumber: '10.3', clauseTitle: 'Continual improvement — Lean manufacturing' },
  ],
  ISO_13485: [
    { clauseNumber: '4.1', clauseTitle: 'Quality management system — General requirements' },
    {
      clauseNumber: '4.2',
      clauseTitle: 'Documentation requirements — Quality manual, device files',
    },
    { clauseNumber: '5.1', clauseTitle: 'Management commitment' },
    { clauseNumber: '5.2', clauseTitle: 'Customer focus' },
    { clauseNumber: '5.3', clauseTitle: 'Quality policy' },
    { clauseNumber: '5.4', clauseTitle: 'Planning — Quality objectives' },
    { clauseNumber: '5.5', clauseTitle: 'Responsibility, authority and communication' },
    { clauseNumber: '5.6', clauseTitle: 'Management review' },
    { clauseNumber: '6.1', clauseTitle: 'Provision of resources' },
    { clauseNumber: '6.2', clauseTitle: 'Human resources — Competence and training' },
    { clauseNumber: '6.3', clauseTitle: 'Infrastructure' },
    { clauseNumber: '6.4', clauseTitle: 'Work environment and contamination control' },
    { clauseNumber: '7.1', clauseTitle: 'Planning of product realization — Risk management' },
    { clauseNumber: '7.2', clauseTitle: 'Customer-related processes — Regulatory requirements' },
    { clauseNumber: '7.3', clauseTitle: 'Design and development — Design controls' },
    { clauseNumber: '7.4', clauseTitle: 'Purchasing — Supplier evaluation' },
    {
      clauseNumber: '7.5',
      clauseTitle: 'Production and service provision — Validation, traceability',
    },
    { clauseNumber: '7.6', clauseTitle: 'Control of monitoring and measuring equipment' },
    { clauseNumber: '8.1', clauseTitle: 'General — Monitoring, measurement, analysis' },
    { clauseNumber: '8.2', clauseTitle: 'Monitoring and measurement — Complaints, audits' },
    { clauseNumber: '8.3', clauseTitle: 'Control of nonconforming product' },
    { clauseNumber: '8.4', clauseTitle: 'Analysis of data — CAPA trending' },
    { clauseNumber: '8.5', clauseTitle: 'Improvement — CAPA, preventive action, advisory notices' },
  ],
  AS9100D: [
    { clauseNumber: '4.1', clauseTitle: 'Understanding the organization and its context' },
    {
      clauseNumber: '4.2',
      clauseTitle: 'Understanding the needs and expectations of interested parties',
    },
    { clauseNumber: '4.3', clauseTitle: 'Determining the scope of the QMS' },
    { clauseNumber: '4.4', clauseTitle: 'Quality management system and its processes' },
    { clauseNumber: '5.1', clauseTitle: 'Leadership and commitment — Airworthiness' },
    { clauseNumber: '5.2', clauseTitle: 'Quality policy' },
    { clauseNumber: '5.3', clauseTitle: 'Organizational roles, responsibilities and authorities' },
    { clauseNumber: '6.1', clauseTitle: 'Actions to address risks and opportunities' },
    { clauseNumber: '6.2', clauseTitle: 'Quality objectives and planning to achieve them' },
    { clauseNumber: '7.1', clauseTitle: 'Resources — Calibration, tooling' },
    { clauseNumber: '7.2', clauseTitle: 'Competence — Awareness of product safety' },
    { clauseNumber: '7.5', clauseTitle: 'Documented information — Configuration management' },
    {
      clauseNumber: '8.1',
      clauseTitle: 'Operational planning and control — Risk management, project management',
    },
    { clauseNumber: '8.2', clauseTitle: 'Requirements for products and services' },
    { clauseNumber: '8.3', clauseTitle: 'Design and development — Verification, validation' },
    {
      clauseNumber: '8.4',
      clauseTitle: 'Control of externally provided processes — Supplier monitoring',
    },
    {
      clauseNumber: '8.5',
      clauseTitle: 'Production and service provision — FOD prevention, special processes',
    },
    { clauseNumber: '8.7', clauseTitle: 'Control of nonconforming outputs — Scrap, MRB' },
    { clauseNumber: '9.1', clauseTitle: 'Monitoring, measurement — KPIs, on-time delivery' },
    { clauseNumber: '9.2', clauseTitle: 'Internal audit' },
    { clauseNumber: '9.3', clauseTitle: 'Management review' },
    { clauseNumber: '10.2', clauseTitle: 'Nonconformity and corrective action' },
    { clauseNumber: '10.3', clauseTitle: 'Continual improvement' },
  ],
  ISO_22000: [
    { clauseNumber: '4.1', clauseTitle: 'Understanding the organization and its context' },
    {
      clauseNumber: '4.2',
      clauseTitle: 'Understanding the needs and expectations of interested parties',
    },
    { clauseNumber: '4.3', clauseTitle: 'Determining the scope of the FSMS' },
    { clauseNumber: '4.4', clauseTitle: 'Food safety management system' },
    { clauseNumber: '5.1', clauseTitle: 'Leadership and commitment' },
    { clauseNumber: '5.2', clauseTitle: 'Food safety policy' },
    { clauseNumber: '5.3', clauseTitle: 'Organizational roles, responsibilities and authorities' },
    { clauseNumber: '6.1', clauseTitle: 'Actions to address risks and opportunities' },
    { clauseNumber: '6.2', clauseTitle: 'Objectives of the FSMS and planning to achieve them' },
    { clauseNumber: '7.1', clauseTitle: 'Resources — PRPs, infrastructure' },
    { clauseNumber: '7.2', clauseTitle: 'Competence' },
    { clauseNumber: '7.4', clauseTitle: 'Communication — External and internal' },
    { clauseNumber: '7.5', clauseTitle: 'Documented information' },
    { clauseNumber: '8.1', clauseTitle: 'Operational planning and control' },
    { clauseNumber: '8.2', clauseTitle: 'Prerequisite programmes (PRPs)' },
    { clauseNumber: '8.3', clauseTitle: 'Traceability system' },
    { clauseNumber: '8.4', clauseTitle: 'Emergency preparedness and response' },
    { clauseNumber: '8.5', clauseTitle: 'Hazard analysis — HACCP' },
    { clauseNumber: '8.6', clauseTitle: 'Validation of control measures' },
    { clauseNumber: '8.7', clauseTitle: 'Control of monitoring and measuring' },
    { clauseNumber: '8.8', clauseTitle: 'Verification related to PRPs and hazard control plan' },
    { clauseNumber: '8.9', clauseTitle: 'Control of product and process nonconformities' },
    { clauseNumber: '9.1', clauseTitle: 'Monitoring, measurement, analysis and evaluation' },
    { clauseNumber: '9.2', clauseTitle: 'Internal audit' },
    { clauseNumber: '9.3', clauseTitle: 'Management review' },
    { clauseNumber: '10.1', clauseTitle: 'Nonconformity and corrective action' },
    { clauseNumber: '10.2', clauseTitle: 'Continual improvement' },
    { clauseNumber: '10.3', clauseTitle: 'Update of the FSMS' },
  ],
  ISO_50001: [
    { clauseNumber: '4.1', clauseTitle: 'Understanding the organization and its context' },
    {
      clauseNumber: '4.2',
      clauseTitle: 'Understanding the needs and expectations of interested parties',
    },
    { clauseNumber: '4.3', clauseTitle: 'Determining the scope of the EnMS' },
    { clauseNumber: '4.4', clauseTitle: 'Energy management system' },
    { clauseNumber: '5.1', clauseTitle: 'Leadership and commitment' },
    { clauseNumber: '5.2', clauseTitle: 'Energy policy' },
    { clauseNumber: '5.3', clauseTitle: 'Organizational roles, responsibilities and authorities' },
    { clauseNumber: '6.1', clauseTitle: 'Actions to address risks and opportunities' },
    {
      clauseNumber: '6.2',
      clauseTitle: 'Objectives, energy targets, and planning to achieve them',
    },
    { clauseNumber: '6.3', clauseTitle: 'Energy review' },
    { clauseNumber: '6.4', clauseTitle: 'Energy performance indicators' },
    { clauseNumber: '6.5', clauseTitle: 'Energy baseline' },
    { clauseNumber: '6.6', clauseTitle: 'Planning for energy data collection' },
    { clauseNumber: '7.1', clauseTitle: 'Resources' },
    { clauseNumber: '7.2', clauseTitle: 'Competence' },
    { clauseNumber: '7.4', clauseTitle: 'Communication' },
    { clauseNumber: '7.5', clauseTitle: 'Documented information' },
    { clauseNumber: '8.1', clauseTitle: 'Operational planning and control' },
    { clauseNumber: '8.2', clauseTitle: 'Design — Energy performance considerations' },
    { clauseNumber: '8.3', clauseTitle: 'Procurement — Energy services, products, equipment' },
    {
      clauseNumber: '9.1',
      clauseTitle: 'Monitoring, measurement, analysis and evaluation of energy performance',
    },
    { clauseNumber: '9.2', clauseTitle: 'Internal audit' },
    { clauseNumber: '9.3', clauseTitle: 'Management review' },
    { clauseNumber: '10.1', clauseTitle: 'Nonconformity and corrective action' },
    { clauseNumber: '10.2', clauseTitle: 'Continual improvement' },
  ],
  ISO_42001: [
    { clauseNumber: '4.1', clauseTitle: 'Understanding the organization and its context' },
    {
      clauseNumber: '4.2',
      clauseTitle: 'Understanding the needs and expectations of interested parties',
    },
    { clauseNumber: '4.3', clauseTitle: 'Determining the scope of the AIMS' },
    { clauseNumber: '4.4', clauseTitle: 'AI management system' },
    { clauseNumber: '5.1', clauseTitle: 'Leadership and commitment' },
    { clauseNumber: '5.2', clauseTitle: 'AI policy' },
    { clauseNumber: '5.3', clauseTitle: 'Organizational roles, responsibilities and authorities' },
    {
      clauseNumber: '6.1',
      clauseTitle: 'Actions to address risks and opportunities — AI risk assessment',
    },
    { clauseNumber: '6.2', clauseTitle: 'AI objectives and planning to achieve them' },
    { clauseNumber: '7.1', clauseTitle: 'Resources' },
    { clauseNumber: '7.2', clauseTitle: 'Competence' },
    { clauseNumber: '7.3', clauseTitle: 'Awareness' },
    { clauseNumber: '7.4', clauseTitle: 'Communication' },
    { clauseNumber: '7.5', clauseTitle: 'Documented information' },
    { clauseNumber: '8.1', clauseTitle: 'Operational planning and control' },
    { clauseNumber: '8.2', clauseTitle: 'AI risk assessment' },
    { clauseNumber: '8.3', clauseTitle: 'AI risk treatment' },
    { clauseNumber: '8.4', clauseTitle: 'AI system impact assessment' },
    { clauseNumber: '9.1', clauseTitle: 'Monitoring, measurement, analysis and evaluation' },
    { clauseNumber: '9.2', clauseTitle: 'Internal audit' },
    { clauseNumber: '9.3', clauseTitle: 'Management review' },
    { clauseNumber: '10.1', clauseTitle: 'Continual improvement' },
    { clauseNumber: '10.2', clauseTitle: 'Nonconformity and corrective action' },
  ],
  ISO_37001: [
    { clauseNumber: '4.1', clauseTitle: 'Understanding the organization and its context' },
    {
      clauseNumber: '4.2',
      clauseTitle: 'Understanding the needs and expectations of interested parties',
    },
    { clauseNumber: '4.3', clauseTitle: 'Determining the scope of the ABMS' },
    { clauseNumber: '4.4', clauseTitle: 'Anti-bribery management system' },
    { clauseNumber: '4.5', clauseTitle: 'Bribery risk assessment' },
    {
      clauseNumber: '5.1',
      clauseTitle: 'Leadership and commitment — Governing body, top management',
    },
    { clauseNumber: '5.2', clauseTitle: 'Anti-bribery policy' },
    {
      clauseNumber: '5.3',
      clauseTitle:
        'Organizational roles, responsibilities and authorities — Anti-bribery compliance function',
    },
    { clauseNumber: '6.1', clauseTitle: 'Actions to address risks and opportunities' },
    { clauseNumber: '6.2', clauseTitle: 'Anti-bribery objectives and planning to achieve them' },
    { clauseNumber: '7.1', clauseTitle: 'Resources' },
    { clauseNumber: '7.2', clauseTitle: 'Competence' },
    { clauseNumber: '7.3', clauseTitle: 'Awareness and training' },
    { clauseNumber: '7.4', clauseTitle: 'Communication' },
    { clauseNumber: '7.5', clauseTitle: 'Documented information' },
    { clauseNumber: '8.1', clauseTitle: 'Operational planning and control' },
    { clauseNumber: '8.2', clauseTitle: 'Due diligence' },
    { clauseNumber: '8.3', clauseTitle: 'Financial controls' },
    { clauseNumber: '8.4', clauseTitle: 'Non-financial controls' },
    { clauseNumber: '8.5', clauseTitle: 'Anti-bribery controls for business associates' },
    { clauseNumber: '8.6', clauseTitle: 'Anti-bribery commitments' },
    { clauseNumber: '8.7', clauseTitle: 'Gifts, hospitality, donations and similar benefits' },
    { clauseNumber: '8.8', clauseTitle: 'Managing inadequacy of anti-bribery controls' },
    { clauseNumber: '8.9', clauseTitle: 'Raising concerns' },
    { clauseNumber: '8.10', clauseTitle: 'Investigating and dealing with bribery' },
    { clauseNumber: '9.1', clauseTitle: 'Monitoring, measurement, analysis and evaluation' },
    { clauseNumber: '9.2', clauseTitle: 'Internal audit' },
    { clauseNumber: '9.3', clauseTitle: 'Management review' },
    { clauseNumber: '10.1', clauseTitle: 'Nonconformity and corrective action' },
    { clauseNumber: '10.2', clauseTitle: 'Continual improvement' },
  ],
};

// ============================================
// BUILD EVIDENCE PACK SECTIONS
// ============================================

async function buildEvidencePackSections(
  standard: string,
  dateFrom: string | null,
  dateTo: string | null
): Promise<{ sections: EvidenceSection[]; totalDocuments: number; totalRecords: number }> {
  const clauses = ISO_CLAUSES[standard] || ISO_CLAUSES.ISO_9001;
  const dateFilter: { createdAt?: { gte?: Date; lte?: Date } } = {};

  if (dateFrom || dateTo) {
    dateFilter.createdAt = {};
    if (dateFrom) dateFilter.createdAt.gte = new Date(dateFrom);
    if (dateTo) dateFilter.createdAt.lte = new Date(dateTo);
  }

  // Query counts from available prisma models
  let documentCount = 0;
  let ncCount = 0;
  let capaCount = 0;
  let riskCount = 0;
  let objectiveCount = 0;
  let partyCount = 0;
  let legalCount = 0;
  let supplierCount = 0;
  let improvementCount = 0;
  let processCount = 0;
  let fmeaCount = 0;
  let changeCount = 0;

  try {
    [
      documentCount,
      ncCount,
      capaCount,
      riskCount,
      objectiveCount,
      partyCount,
      legalCount,
      supplierCount,
      improvementCount,
      processCount,
      fmeaCount,
      changeCount,
    ] = await Promise.all([
      prisma.qualDocument
        .count({ where: { deletedAt: null, ...dateFilter } as any })
        .catch(() => 0),
      prisma.qualNonConformance
        .count({ where: { deletedAt: null, ...dateFilter } as any })
        .catch(() => 0),
      prisma.qualCapa.count({ where: { deletedAt: null, ...dateFilter } as any }).catch(() => 0),
      prisma.qualRisk.count({ where: { deletedAt: null, ...dateFilter } as any }).catch(() => 0),
      prisma.qualObjective
        .count({ where: { deletedAt: null, ...dateFilter } as any })
        .catch(() => 0),
      prisma.qualInterestedParty
        .count({ where: { deletedAt: null, ...dateFilter } as any })
        .catch(() => 0),
      prisma.qualLegal.count({ where: { deletedAt: null, ...dateFilter } as any }).catch(() => 0),
      prisma.qualSupplier
        .count({ where: { deletedAt: null, ...dateFilter } as any })
        .catch(() => 0),
      prisma.qualImprovement
        .count({ where: { deletedAt: null, ...dateFilter } as any })
        .catch(() => 0),
      prisma.qualProcess.count({ where: { deletedAt: null, ...dateFilter } as any }).catch(() => 0),
      prisma.qualFmea.count({ where: { deletedAt: null, ...dateFilter } as any }).catch(() => 0),
      prisma.qualChange.count({ where: { deletedAt: null, ...dateFilter } as any }).catch(() => 0),
    ]);
  } catch {
    // If any count fails, continue with zeros
  }

  // Map clause numbers to relevant data based on the standard
  const clauseDataMap = buildClauseDataMap(standard, {
    documentCount,
    ncCount,
    capaCount,
    riskCount,
    objectiveCount,
    partyCount,
    legalCount,
    supplierCount,
    improvementCount,
    processCount,
    fmeaCount,
    changeCount,
  });

  let totalDocuments = 0;
  let totalRecords = 0;

  const sections: EvidenceSection[] = clauses.map((clause) => {
    const data = clauseDataMap[clause.clauseNumber] || { documents: 0, records: 0 };
    totalDocuments += data.documents;
    totalRecords += data.records;

    let status: 'COMPLETE' | 'PARTIAL' | 'MISSING' = 'MISSING';
    if (data.documents > 0 && data.records > 0) {
      status = 'COMPLETE';
    } else if (data.documents > 0 || data.records > 0) {
      status = 'PARTIAL';
    }

    return {
      clauseNumber: clause.clauseNumber,
      clauseTitle: clause.clauseTitle,
      documents: data.documents,
      records: data.records,
      status,
    };
  });

  return { sections, totalDocuments, totalRecords };
}

interface DataCounts {
  documentCount: number;
  ncCount: number;
  capaCount: number;
  riskCount: number;
  objectiveCount: number;
  partyCount: number;
  legalCount: number;
  supplierCount: number;
  improvementCount: number;
  processCount: number;
  fmeaCount: number;
  changeCount: number;
}

function buildClauseDataMap(
  standard: string,
  counts: DataCounts
): Record<string, { documents: number; records: number }> {
  const map: Record<string, { documents: number; records: number }> = {};

  // Common mappings across most standards (Annex SL structure)
  // Clause 4.1 — Context: issues
  map['4.1'] = {
    documents: Math.min(counts.documentCount, 2),
    records: counts.partyCount > 0 ? 1 : 0,
  };
  // Clause 4.2 — Interested parties
  map['4.2'] = { documents: counts.partyCount > 0 ? 1 : 0, records: counts.partyCount };
  // Clause 4.3 — Scope
  map['4.3'] = { documents: Math.min(counts.documentCount, 1), records: 0 };
  // Clause 4.4 — Management system processes
  map['4.4'] = { documents: Math.min(counts.processCount, 5), records: counts.processCount };
  // Clause 4.5 — Bribery risk assessment (ISO 37001 only)
  if (standard === 'ISO_37001') {
    map['4.5'] = { documents: Math.min(counts.riskCount, 3), records: counts.riskCount };
  }
  // Clause 5.x — Leadership
  map['5.1'] = { documents: Math.min(counts.documentCount, 2), records: 0 };
  map['5.2'] = { documents: Math.min(counts.documentCount, 1), records: 0 };
  map['5.3'] = { documents: Math.min(counts.documentCount, 1), records: 0 };
  map['5.4'] = { documents: 0, records: 0 };
  if (standard === 'ISO_13485') {
    map['5.4'] = { documents: Math.min(counts.objectiveCount, 3), records: counts.objectiveCount };
    map['5.5'] = { documents: Math.min(counts.documentCount, 1), records: 0 };
    map['5.6'] = { documents: Math.min(counts.documentCount, 1), records: 0 };
  }
  // Clause 6.x — Planning
  map['6.1'] = { documents: Math.min(counts.riskCount, 5), records: counts.riskCount };
  map['6.2'] = { documents: Math.min(counts.objectiveCount, 5), records: counts.objectiveCount };
  map['6.3'] = { documents: Math.min(counts.changeCount, 3), records: counts.changeCount };
  if (standard === 'ISO_50001') {
    map['6.4'] = { documents: 0, records: 0 };
    map['6.5'] = { documents: 0, records: 0 };
    map['6.6'] = { documents: 0, records: 0 };
  }
  // Clause 7.x — Support
  map['7.1'] = { documents: Math.min(counts.documentCount, 2), records: 0 };
  map['7.2'] = { documents: Math.min(counts.documentCount, 2), records: 0 };
  map['7.3'] = { documents: Math.min(counts.documentCount, 1), records: 0 };
  map['7.4'] = { documents: Math.min(counts.documentCount, 1), records: 0 };
  map['7.5'] = { documents: counts.documentCount, records: counts.documentCount };
  if (standard === 'ISO_13485') {
    map['7.6'] = { documents: Math.min(counts.documentCount, 2), records: 0 };
  }
  // Clause 8.x — Operation
  map['8.1'] = { documents: Math.min(counts.processCount, 5), records: counts.processCount };
  map['8.2'] = { documents: Math.min(counts.documentCount, 2), records: 0 };
  map['8.3'] = { documents: Math.min(counts.fmeaCount, 3), records: counts.fmeaCount };
  map['8.4'] = { documents: Math.min(counts.supplierCount, 5), records: counts.supplierCount };
  map['8.5'] = { documents: Math.min(counts.processCount, 5), records: counts.processCount };
  map['8.6'] = { documents: Math.min(counts.documentCount, 1), records: 0 };
  map['8.7'] = { documents: Math.min(counts.ncCount, 5), records: counts.ncCount };
  if (standard === 'ISO_22000') {
    map['8.8'] = { documents: 0, records: 0 };
    map['8.9'] = { documents: Math.min(counts.ncCount, 3), records: counts.ncCount };
  }
  if (standard === 'ISO_37001') {
    map['8.8'] = { documents: 0, records: 0 };
    map['8.9'] = { documents: 0, records: 0 };
    map['8.10'] = { documents: 0, records: 0 };
  }
  // Clause 9.x — Performance evaluation
  map['9.1'] = { documents: Math.min(counts.documentCount, 3), records: counts.objectiveCount };
  map['9.2'] = { documents: Math.min(counts.documentCount, 2), records: 0 };
  map['9.3'] = { documents: Math.min(counts.documentCount, 1), records: 0 };
  // Clause 10.x — Improvement
  map['10.1'] = {
    documents: Math.min(counts.improvementCount, 5),
    records: counts.improvementCount,
  };
  map['10.2'] = {
    documents: Math.min(counts.capaCount, 5),
    records: counts.capaCount + counts.ncCount,
  };
  map['10.3'] = {
    documents: Math.min(counts.improvementCount, 3),
    records: counts.improvementCount,
  };

  // Standard-specific overrides
  if (standard === 'ISO_14001') {
    map['6.1'] = { documents: Math.min(counts.riskCount, 5), records: counts.riskCount };
    map['8.2'] = { documents: Math.min(counts.documentCount, 2), records: 0 }; // Emergency preparedness
  }

  if (standard === 'ISO_45001') {
    map['5.4'] = { documents: Math.min(counts.documentCount, 1), records: 0 }; // Worker consultation
    map['6.1'] = { documents: Math.min(counts.riskCount, 5), records: counts.riskCount }; // Hazards
    map['8.2'] = { documents: Math.min(counts.documentCount, 2), records: 0 }; // Emergency preparedness
    map['10.2'] = {
      documents: Math.min(counts.capaCount + counts.ncCount, 5),
      records: counts.capaCount + counts.ncCount,
    }; // Incidents
  }

  if (standard === 'ISO_27001') {
    map['6.1'] = { documents: Math.min(counts.riskCount, 5), records: counts.riskCount }; // Info sec risk
    map['8.2'] = { documents: Math.min(counts.riskCount, 3), records: counts.riskCount }; // Risk assessment
    map['8.3'] = { documents: Math.min(counts.riskCount, 3), records: counts.riskCount }; // Risk treatment
  }

  return map;
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

const standardEnum = z.enum([
  'ISO_9001',
  'ISO_14001',
  'ISO_45001',
  'ISO_27001',
  'IATF_16949',
  'ISO_13485',
  'AS9100D',
  'ISO_22000',
  'ISO_50001',
  'ISO_42001',
  'ISO_37001',
]);

const createEvidencePackSchema = z.object({
  standard: standardEnum,
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  includeDocuments: z.boolean().default(true),
  includeAudits: z.boolean().default(true),
  includeCapa: z.boolean().default(true),
  includeTraining: z.boolean().default(true),
  includeObjectives: z.boolean().default(true),
  includeLegalRegister: z.boolean().default(true),
  includeRiskRegister: z.boolean().default(true),
  includeManagementReview: z.boolean().default(true),
  format: z.enum(['PDF', 'ZIP']).default('PDF'),
});

// ============================================
// ROUTES
// ============================================

// POST / — Generate a new evidence pack
router.post('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const data = createEvidencePackSchema.parse(req.body);

    const id = randomUUID();
    const referenceNumber = generateRefNumber();
    const now = new Date().toISOString();

    // Create the pack record with GENERATING status
    const pack: EvidencePack = {
      id,
      referenceNumber,
      organisationId: (req as any).organisationId || 'default',
      standard: data.standard,
      status: 'GENERATING',
      format: data.format,
      dateFrom: data.dateFrom || null,
      dateTo: data.dateTo || null,
      sections: [],
      generatedAt: now,
      generatedBy: req.user?.id || 'unknown',
      totalDocuments: 0,
      totalRecords: 0,
      createdAt: now,
    };

    evidencePackStore.set(id, pack);

    // Build sections asynchronously then update in-memory record
    buildEvidencePackSections(data.standard, data.dateFrom || null, data.dateTo || null)
      .then(({ sections, totalDocuments, totalRecords }) => {
        // Apply inclusion filters
        const filteredSections = sections.map((section) => {
          const s = { ...section };

          // If documents are excluded, zero out document counts for document-centric clauses
          if (!data.includeDocuments && s.clauseNumber === '7.5') {
            s.documents = 0;
          }
          if (!data.includeCapa && s.clauseNumber === '10.2') {
            s.records = 0;
          }
          if (!data.includeObjectives && s.clauseNumber === '6.2') {
            s.records = 0;
          }
          if (!data.includeRiskRegister && s.clauseNumber === '6.1') {
            s.records = 0;
          }
          if (!data.includeLegalRegister) {
            // Legal register data typically in context clauses
            // No specific zeroing needed as it is embedded in clause 4.2
          }

          // Recalculate status after filtering
          if (s.documents > 0 && s.records > 0) {
            s.status = 'COMPLETE';
          } else if (s.documents > 0 || s.records > 0) {
            s.status = 'PARTIAL';
          } else {
            s.status = 'MISSING';
          }

          return s;
        });

        const stored = evidencePackStore.get(id);
        if (stored) {
          stored.sections = filteredSections;
          stored.totalDocuments = filteredSections.reduce((sum, s) => sum + s.documents, 0);
          stored.totalRecords = filteredSections.reduce((sum, s) => sum + s.records, 0);
          stored.status = 'COMPLETE';
          stored.generatedAt = new Date().toISOString();
        }
      })
      .catch((err) => {
        logger.error('Evidence pack generation failed', { id, error: (err as Error).message });
        const stored = evidencePackStore.get(id);
        if (stored) {
          stored.status = 'FAILED';
        }
      });

    // Return immediately with GENERATING status
    const clauses = (ISO_CLAUSES[data.standard] || ISO_CLAUSES.ISO_9001).map((c) => c.clauseNumber);

    res.status(201).json({
      success: true,
      data: {
        id,
        referenceNumber,
        standard: data.standard,
        status: 'GENERATING',
        clauses,
        generatedAt: now,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Generate evidence pack error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate evidence pack' },
    });
  }
});

// GET / — List evidence packs with pagination
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', standard, status } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);

    let items = Array.from(evidencePackStore.values());

    // Filter by standard
    if (standard && typeof standard === 'string') {
      items = items.filter((p) => p.standard === standard);
    }

    // Filter by status
    if (status && typeof status === 'string') {
      items = items.filter((p) => p.status === status);
    }

    // Sort by createdAt descending
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = items.length;
    const skip = (pageNum - 1) * limitNum;
    const paginatedItems = items.slice(skip, skip + limitNum);

    res.json({
      success: true,
      data: {
        items: paginatedItems,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('List evidence packs error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list evidence packs' },
    });
  }
});

// GET /:id — Get evidence pack detail
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const pack = evidencePackStore.get(req.params.id);

    if (!pack) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Evidence pack not found' } });
    }

    res.json({ success: true, data: pack });
  } catch (error) {
    logger.error('Get evidence pack error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get evidence pack' },
    });
  }
});

// GET /:id/download — Download evidence pack
router.get('/:id/download', async (req: AuthRequest, res: Response) => {
  try {
    const pack = evidencePackStore.get(req.params.id);

    if (!pack) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Evidence pack not found' } });
    }

    if (pack.status === 'GENERATING') {
      return res.status(409).json({
        success: false,
        error: { code: 'PACK_NOT_READY', message: 'Evidence pack is still being generated' },
      });
    }

    if (pack.status === 'FAILED') {
      return res.status(500).json({
        success: false,
        error: { code: 'GENERATION_FAILED', message: 'Evidence pack generation failed' },
      });
    }

    const filename = `${pack.referenceNumber}-${pack.standard}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.json({
      success: true,
      data: {
        evidencePack: pack,
        metadata: {
          generatedAt: pack.generatedAt,
          generatedBy: pack.generatedBy,
          standard: pack.standard,
          referenceNumber: pack.referenceNumber,
          dateRange: {
            from: pack.dateFrom,
            to: pack.dateTo,
          },
          summary: {
            totalSections: pack.sections.length,
            completeSections: pack.sections.filter((s) => s.status === 'COMPLETE').length,
            partialSections: pack.sections.filter((s) => s.status === 'PARTIAL').length,
            missingSections: pack.sections.filter((s) => s.status === 'MISSING').length,
            totalDocuments: pack.totalDocuments,
            totalRecords: pack.totalRecords,
          },
        },
      },
    });
  } catch (error) {
    logger.error('Download evidence pack error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to download evidence pack' },
    });
  }
});

export default router;
