// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import {
  SearchAdapter,
  SearchQuery,
  SearchResults,
  SearchResultItem,
  SearchEntityType,
  SuggestQuery,
  SuggestResult,
} from './types';

// ---------------------------------------------------------------------------
// Sample data — representative fixture records used by MockSearchAdapter
// ---------------------------------------------------------------------------

const SAMPLE_DATA: SearchResultItem[] = [
  // NCRs
  {
    id: 'ncr-001', type: 'ncr', title: 'Non-Conformance Report: Weld Defect',
    ref: 'NCR-2026-001', status: 'OPEN', description: 'Weld defect found on batch A',
    createdAt: '2026-01-15T09:00:00.000Z', module: 'quality', url: '/quality/ncr/ncr-001',
  },
  {
    id: 'ncr-002', type: 'ncr', title: 'Surface Finish Non-Conformance',
    ref: 'NCR-2026-002', status: 'IN_REVIEW', description: 'Surface finish outside tolerance',
    createdAt: '2026-01-20T10:00:00.000Z', module: 'quality', url: '/quality/ncr/ncr-002',
  },
  {
    id: 'ncr-003', type: 'ncr', title: 'Dimensional Non-Conformance on Part X',
    ref: 'NCR-2026-003', status: 'CLOSED', description: 'Part dimensions out of spec',
    createdAt: '2026-01-25T11:00:00.000Z', module: 'quality', url: '/quality/ncr/ncr-003',
  },
  {
    id: 'ncr-004', type: 'ncr', title: 'Material Traceability NCR',
    ref: 'NCR-2026-004', status: 'OPEN', description: 'Missing material certificates',
    createdAt: '2026-02-01T08:00:00.000Z', module: 'quality', url: '/quality/ncr/ncr-004',
  },
  {
    id: 'ncr-005', type: 'ncr', title: 'Packaging NCR Detected',
    ref: 'NCR-2026-005', status: 'OPEN', description: 'Incorrect packaging used',
    createdAt: '2026-02-05T09:30:00.000Z', module: 'quality', url: '/quality/ncr/ncr-005',
  },

  // CAPAs
  {
    id: 'capa-001', type: 'capa', title: 'CAPA for Welding Process Improvement',
    ref: 'CAPA-2026-001', status: 'IN_PROGRESS', description: 'Root cause: inadequate training',
    createdAt: '2026-01-16T09:00:00.000Z', module: 'quality', url: '/quality/capa/capa-001',
  },
  {
    id: 'capa-002', type: 'capa', title: 'Corrective Action: Surface Treatment',
    ref: 'CAPA-2026-002', status: 'PENDING', description: 'Process parameter adjustment required',
    createdAt: '2026-01-22T10:00:00.000Z', module: 'quality', url: '/quality/capa/capa-002',
  },
  {
    id: 'capa-003', type: 'capa', title: 'Preventive Action: Inspection Frequency',
    ref: 'CAPA-2026-003', status: 'CLOSED', description: 'Increase inspection frequency',
    createdAt: '2026-01-28T11:00:00.000Z', module: 'quality', url: '/quality/capa/capa-003',
  },
  {
    id: 'capa-004', type: 'capa', title: 'CAPA: Supplier Quality Issue',
    ref: 'CAPA-2026-004', status: 'IN_PROGRESS', description: 'Supplier material non-conformance',
    createdAt: '2026-02-02T08:00:00.000Z', module: 'quality', url: '/quality/capa/capa-004',
  },
  {
    id: 'capa-005', type: 'capa', title: 'CAPA: Documentation Gap Closure',
    ref: 'CAPA-2026-005', status: 'PENDING', description: 'Missing work instructions identified',
    createdAt: '2026-02-06T09:00:00.000Z', module: 'quality', url: '/quality/capa/capa-005',
  },

  // Documents
  {
    id: 'doc-001', type: 'document', title: 'Quality Management Procedure QP-001',
    ref: 'QP-001', status: 'APPROVED', description: 'Document control procedure',
    createdAt: '2026-01-01T09:00:00.000Z', module: 'documents', url: '/documents/doc-001',
  },
  {
    id: 'doc-002', type: 'document', title: 'Health and Safety Policy HS-POL-001',
    ref: 'HS-POL-001', status: 'APPROVED', description: 'Organisation H&S policy',
    createdAt: '2026-01-02T09:00:00.000Z', module: 'documents', url: '/documents/doc-002',
  },
  {
    id: 'doc-003', type: 'document', title: 'Environmental Management Procedure ENV-001',
    ref: 'ENV-001', status: 'DRAFT', description: 'Aspect identification procedure',
    createdAt: '2026-01-03T09:00:00.000Z', module: 'documents', url: '/documents/doc-003',
  },
  {
    id: 'doc-004', type: 'document', title: 'ISO 9001 Internal Audit Checklist',
    ref: 'ISO-CHK-001', status: 'APPROVED', description: 'Internal audit checklist',
    createdAt: '2026-01-04T09:00:00.000Z', module: 'documents', url: '/documents/doc-004',
  },
  {
    id: 'doc-005', type: 'document', title: 'Contractor Induction Document',
    ref: 'HS-DOC-002', status: 'APPROVED', description: 'Contractor site induction',
    createdAt: '2026-01-05T09:00:00.000Z', module: 'documents', url: '/documents/doc-005',
  },

  // Incidents
  {
    id: 'inc-001', type: 'incident', title: 'Trip Hazard Near Entrance',
    ref: 'INC-2026-001', status: 'OPEN', description: 'Employee tripped on loose cable',
    createdAt: '2026-01-10T08:00:00.000Z', module: 'health-safety', url: '/health-safety/incidents/inc-001',
  },
  {
    id: 'inc-002', type: 'incident', title: 'Chemical Spill in Lab',
    ref: 'INC-2026-002', status: 'INVESTIGATING', description: 'Minor chemical spill contained',
    createdAt: '2026-01-14T10:00:00.000Z', module: 'health-safety', url: '/health-safety/incidents/inc-002',
  },
  {
    id: 'inc-003', type: 'incident', title: 'Near Miss: Forklift Incident',
    ref: 'INC-2026-003', status: 'CLOSED', description: 'Near miss involving forklift',
    createdAt: '2026-01-18T11:00:00.000Z', module: 'health-safety', url: '/health-safety/incidents/inc-003',
  },
  {
    id: 'inc-004', type: 'incident', title: 'Manual Handling Injury',
    ref: 'INC-2026-004', status: 'OPEN', description: 'Back strain from heavy lifting',
    createdAt: '2026-01-22T09:00:00.000Z', module: 'health-safety', url: '/health-safety/incidents/inc-004',
  },
  {
    id: 'inc-005', type: 'incident', title: 'Electrical Fault Reported',
    ref: 'INC-2026-005', status: 'INVESTIGATING', description: 'Fault in production area',
    createdAt: '2026-01-26T08:30:00.000Z', module: 'health-safety', url: '/health-safety/incidents/inc-005',
  },

  // Risks
  {
    id: 'risk-001', type: 'risk', title: 'Supplier Dependency Risk',
    ref: 'RISK-2026-001', status: 'ACTIVE', description: 'Single-source critical component',
    createdAt: '2026-01-05T09:00:00.000Z', module: 'risk', url: '/risk/risk-001',
  },
  {
    id: 'risk-002', type: 'risk', title: 'Cybersecurity Data Breach Risk',
    ref: 'RISK-2026-002', status: 'ACTIVE', description: 'Risk of unauthorised data access',
    createdAt: '2026-01-06T09:00:00.000Z', module: 'risk', url: '/risk/risk-002',
  },
  {
    id: 'risk-003', type: 'risk', title: 'Regulatory Non-Compliance Risk',
    ref: 'RISK-2026-003', status: 'MITIGATED', description: 'Risk of GDPR non-compliance',
    createdAt: '2026-01-07T09:00:00.000Z', module: 'risk', url: '/risk/risk-003',
  },
  {
    id: 'risk-004', type: 'risk', title: 'Business Continuity Risk',
    ref: 'RISK-2026-004', status: 'ACTIVE', description: 'Single site dependency',
    createdAt: '2026-01-08T09:00:00.000Z', module: 'risk', url: '/risk/risk-004',
  },
  {
    id: 'risk-005', type: 'risk', title: 'Environmental Compliance Risk',
    ref: 'RISK-2026-005', status: 'ACTIVE', description: 'Waste disposal compliance gap',
    createdAt: '2026-01-09T09:00:00.000Z', module: 'risk', url: '/risk/risk-005',
  },

  // Audits
  {
    id: 'aud-001', type: 'audit', title: 'ISO 9001 Internal Audit Q1 2026',
    ref: 'AUD-2026-001', status: 'PLANNED', description: 'Q1 quality management audit',
    createdAt: '2026-01-01T09:00:00.000Z', module: 'audits', url: '/audits/aud-001',
  },
  {
    id: 'aud-002', type: 'audit', title: 'ISO 14001 Environmental Audit',
    ref: 'AUD-2026-002', status: 'IN_PROGRESS', description: 'Environmental management audit',
    createdAt: '2026-01-08T09:00:00.000Z', module: 'audits', url: '/audits/aud-002',
  },
  {
    id: 'aud-003', type: 'audit', title: 'Health & Safety Compliance Audit',
    ref: 'AUD-2026-003', status: 'COMPLETED', description: 'Annual H&S compliance review',
    createdAt: '2026-01-12T09:00:00.000Z', module: 'audits', url: '/audits/aud-003',
  },
  {
    id: 'aud-004', type: 'audit', title: 'Supplier Quality Audit',
    ref: 'AUD-2026-004', status: 'PLANNED', description: 'Key supplier quality assessment',
    createdAt: '2026-01-15T09:00:00.000Z', module: 'audits', url: '/audits/aud-004',
  },
  {
    id: 'aud-005', type: 'audit', title: 'Financial Controls Audit',
    ref: 'AUD-2026-005', status: 'IN_PROGRESS', description: 'Internal financial controls review',
    createdAt: '2026-01-20T09:00:00.000Z', module: 'audits', url: '/audits/aud-005',
  },

  // Suppliers
  {
    id: 'sup-001', type: 'supplier', title: 'Acme Materials Ltd',
    ref: 'SUP-001', status: 'APPROVED', description: 'Raw materials supplier',
    createdAt: '2025-06-01T09:00:00.000Z', module: 'suppliers', url: '/suppliers/sup-001',
  },
  {
    id: 'sup-002', type: 'supplier', title: 'Global Components Corp',
    ref: 'SUP-002', status: 'APPROVED', description: 'Electronic components supplier',
    createdAt: '2025-07-01T09:00:00.000Z', module: 'suppliers', url: '/suppliers/sup-002',
  },
  {
    id: 'sup-003', type: 'supplier', title: 'Premier Logistics Services',
    ref: 'SUP-003', status: 'UNDER_REVIEW', description: 'Freight and logistics partner',
    createdAt: '2025-08-01T09:00:00.000Z', module: 'suppliers', url: '/suppliers/sup-003',
  },
  {
    id: 'sup-004', type: 'supplier', title: 'ChemPro Supplies Ltd',
    ref: 'SUP-004', status: 'APPROVED', description: 'Chemical consumables supplier',
    createdAt: '2025-09-01T09:00:00.000Z', module: 'suppliers', url: '/suppliers/sup-004',
  },
  {
    id: 'sup-005', type: 'supplier', title: 'TechWeld Solutions',
    ref: 'SUP-005', status: 'SUSPENDED', description: 'Welding equipment supplier',
    createdAt: '2025-10-01T09:00:00.000Z', module: 'suppliers', url: '/suppliers/sup-005',
  },

  // Users
  {
    id: 'usr-001', type: 'user', title: 'Alice Johnson',
    ref: 'USR-001', status: 'ACTIVE', description: 'Quality Manager',
    createdAt: '2025-01-01T09:00:00.000Z', module: 'users', url: '/users/usr-001',
  },
  {
    id: 'usr-002', type: 'user', title: 'Bob Smith',
    ref: 'USR-002', status: 'ACTIVE', description: 'Health & Safety Officer',
    createdAt: '2025-01-02T09:00:00.000Z', module: 'users', url: '/users/usr-002',
  },
  {
    id: 'usr-003', type: 'user', title: 'Carol White',
    ref: 'USR-003', status: 'ACTIVE', description: 'Environmental Manager',
    createdAt: '2025-01-03T09:00:00.000Z', module: 'users', url: '/users/usr-003',
  },
  {
    id: 'usr-004', type: 'user', title: 'David Brown',
    ref: 'USR-004', status: 'INACTIVE', description: 'Finance Controller',
    createdAt: '2025-01-04T09:00:00.000Z', module: 'users', url: '/users/usr-004',
  },
  {
    id: 'usr-005', type: 'user', title: 'Emma Davis',
    ref: 'USR-005', status: 'ACTIVE', description: 'Operations Director',
    createdAt: '2025-01-05T09:00:00.000Z', module: 'users', url: '/users/usr-005',
  },

  // Assets
  {
    id: 'ast-001', type: 'asset', title: 'CNC Machine CNC-001',
    ref: 'AST-001', status: 'OPERATIONAL', description: '5-axis CNC machining centre',
    createdAt: '2024-06-01T09:00:00.000Z', module: 'assets', url: '/assets/ast-001',
  },
  {
    id: 'ast-002', type: 'asset', title: 'Forklift FL-002',
    ref: 'AST-002', status: 'OPERATIONAL', description: '3-tonne counterbalance forklift',
    createdAt: '2024-07-01T09:00:00.000Z', module: 'assets', url: '/assets/ast-002',
  },
  {
    id: 'ast-003', type: 'asset', title: 'Welding Robot WR-003',
    ref: 'AST-003', status: 'MAINTENANCE', description: 'Automated welding robot arm',
    createdAt: '2024-08-01T09:00:00.000Z', module: 'assets', url: '/assets/ast-003',
  },
  {
    id: 'ast-004', type: 'asset', title: 'Coordinate Measuring Machine CMM-001',
    ref: 'AST-004', status: 'OPERATIONAL', description: 'Brown & Sharpe CMM',
    createdAt: '2024-09-01T09:00:00.000Z', module: 'assets', url: '/assets/ast-004',
  },
  {
    id: 'ast-005', type: 'asset', title: 'Air Compressor AC-005',
    ref: 'AST-005', status: 'DECOMMISSIONED', description: 'Main site air compressor',
    createdAt: '2024-10-01T09:00:00.000Z', module: 'assets', url: '/assets/ast-005',
  },

  // Training
  {
    id: 'trn-001', type: 'training', title: 'Manual Handling Training',
    ref: 'TRN-001', status: 'ACTIVE', description: 'Manual handling and back safety',
    createdAt: '2025-01-01T09:00:00.000Z', module: 'training', url: '/training/trn-001',
  },
  {
    id: 'trn-002', type: 'training', title: 'Fire Safety Awareness',
    ref: 'TRN-002', status: 'ACTIVE', description: 'Fire evacuation and prevention',
    createdAt: '2025-01-05T09:00:00.000Z', module: 'training', url: '/training/trn-002',
  },
  {
    id: 'trn-003', type: 'training', title: 'COSHH Awareness Training',
    ref: 'TRN-003', status: 'ACTIVE', description: 'Chemical hazard awareness',
    createdAt: '2025-01-10T09:00:00.000Z', module: 'training', url: '/training/trn-003',
  },
  {
    id: 'trn-004', type: 'training', title: 'ISO 9001 Awareness Course',
    ref: 'TRN-004', status: 'ACTIVE', description: 'Quality management fundamentals',
    createdAt: '2025-01-15T09:00:00.000Z', module: 'training', url: '/training/trn-004',
  },
  {
    id: 'trn-005', type: 'training', title: 'Environmental Awareness Training',
    ref: 'TRN-005', status: 'ARCHIVED', description: 'ISO 14001 environmental basics',
    createdAt: '2025-01-20T09:00:00.000Z', module: 'training', url: '/training/trn-005',
  },
];

// Common search terms for suggestions
const SUGGESTION_TERMS = [
  'non-conformance', 'capa', 'audit', 'risk', 'incident', 'supplier', 'document',
  'training', 'asset', 'user', 'corrective action', 'preventive action', 'weld',
  'chemical', 'environmental', 'quality', 'health safety', 'compliance', 'iso 9001',
  'iso 14001', 'inspection', 'calibration', 'procedure', 'policy', 'checklist',
  'ncr', 'forklift', 'machine', 'equipment', 'employee', 'contractor',
];

// ---------------------------------------------------------------------------
// Score calculation
// ---------------------------------------------------------------------------

function calcScore(item: SearchResultItem, q: string): number {
  const lq = q.toLowerCase();
  const titleLower = item.title.toLowerCase();
  const refLower = (item.ref || '').toLowerCase();
  const descLower = (item.description || '').toLowerCase();

  if (titleLower.includes(lq)) return 100;
  if (refLower.includes(lq)) return 90;
  if (descLower.includes(lq)) return 50;
  return 0;
}

// ---------------------------------------------------------------------------
// MockSearchAdapter
// ---------------------------------------------------------------------------

export class MockSearchAdapter implements SearchAdapter {
  async search(query: SearchQuery): Promise<SearchResults> {
    const { q, type = 'all', limit = 20, offset = 0, sort = 'relevance' } = query;
    const effectiveLimit = Math.min(limit, 100);
    const lq = q.toLowerCase();

    // Filter by type
    let pool = type === 'all' ? SAMPLE_DATA : SAMPLE_DATA.filter(item => item.type === type);

    // Text filter
    pool = pool.filter(item => {
      const titleLower = item.title.toLowerCase();
      const refLower = (item.ref || '').toLowerCase();
      const descLower = (item.description || '').toLowerCase();
      return titleLower.includes(lq) || refLower.includes(lq) || descLower.includes(lq);
    });

    // Score
    const scored = pool.map(item => ({ ...item, score: calcScore(item, q) }));

    // Sort
    if (sort === 'relevance') {
      scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    } else if (sort === 'date') {
      scored.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'title') {
      scored.sort((a, b) => a.title.localeCompare(b.title));
    }

    const total = scored.length;
    const items = scored.slice(offset, offset + effectiveLimit);

    return {
      items,
      total,
      limit: effectiveLimit,
      offset,
      query: q,
      type,
    };
  }

  async suggest(query: SuggestQuery): Promise<SuggestResult> {
    const { q, limit = 5 } = query;
    const lq = q.toLowerCase();
    const effectiveLimit = Math.min(limit, 20);

    const suggestions = SUGGESTION_TERMS
      .filter(term => term.startsWith(lq) || term.includes(lq))
      .slice(0, effectiveLimit);

    return { suggestions };
  }
}
