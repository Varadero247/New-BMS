import { v4 as uuidv4 } from 'uuid';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ReadinessScore {
  score: number; // 0-100
  maxScore: 100;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  blockers: ReadinessBlocker[];
  lastCalculatedAt: Date;
}

export interface ReadinessBlocker {
  description: string;
  severity: 'critical' | 'major' | 'minor';
  module: string;
  url: string;
  deduction: number;
}

export interface IsoCertificate {
  id: string;
  orgId: string;
  standard: string;
  scope: string;
  certificationBody: string;
  certificateNumber: string;
  issueDate: Date;
  expiryDate: Date;
  lastSurveillanceDate?: Date;
  nextSurveillanceDate?: Date;
  status: 'ACTIVE' | 'SUSPENDED' | 'WITHDRAWN' | 'EXPIRED' | 'IN_RENEWAL';
  readinessScore?: ReadinessScore;
}

// ─── Grade Calculation ──────────────────────────────────────────────────────

function scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

// ─── Readiness Score Calculation ────────────────────────────────────────────

const STANDARD_BLOCKERS: Record<string, ReadinessBlocker[]> = {
  'ISO 9001:2015': [
    {
      description: '2 open non-conformances from last audit',
      severity: 'critical',
      module: 'quality',
      url: '/quality/non-conformances',
      deduction: 15,
    },
    {
      description: '1 overdue CAPA action (due 2026-01-20)',
      severity: 'major',
      module: 'quality',
      url: '/quality/capa',
      deduction: 8,
    },
    {
      description: 'Management review minutes not uploaded for Q4 2025',
      severity: 'minor',
      module: 'quality',
      url: '/quality/management-reviews',
      deduction: 3,
    },
  ],
  'ISO 14001:2015': [
    {
      description: 'Environmental aspects register incomplete — 4 aspects unscored',
      severity: 'major',
      module: 'environment',
      url: '/environment/aspects',
      deduction: 10,
    },
    {
      description: 'Legal compliance evaluation overdue by 30 days',
      severity: 'critical',
      module: 'environment',
      url: '/environment/legal',
      deduction: 12,
    },
  ],
  'ISO 45001:2018': [
    {
      description: '3 hazard assessments past review date',
      severity: 'major',
      module: 'health-safety',
      url: '/health-safety/risks',
      deduction: 10,
    },
    {
      description: 'Worker consultation records missing for January 2026',
      severity: 'minor',
      module: 'health-safety',
      url: '/health-safety/consultations',
      deduction: 5,
    },
    {
      description: 'Emergency drill not conducted this quarter',
      severity: 'major',
      module: 'health-safety',
      url: '/health-safety/drills',
      deduction: 8,
    },
  ],
};

/**
 * Calculate readiness score for a given standard.
 * Returns realistic mock scores with sample blockers.
 */
export function calculateReadinessScore(_orgId: string, standard: string): ReadinessScore {
  const blockers = STANDARD_BLOCKERS[standard] || [];
  const totalDeduction = blockers.reduce((sum, b) => sum + b.deduction, 0);
  const score = Math.max(0, 100 - totalDeduction);

  return {
    score,
    maxScore: 100,
    grade: scoreToGrade(score),
    blockers,
    lastCalculatedAt: new Date(),
  };
}

// ─── In-Memory Certificate Store ────────────────────────────────────────────

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

const certificateStore = new Map<string, IsoCertificate>();

// Seed data
const seedCertificates: IsoCertificate[] = [
  {
    id: uuidv4(),
    orgId: DEFAULT_ORG_ID,
    standard: 'ISO 9001:2015',
    scope: 'Design, development, and delivery of integrated management software solutions',
    certificationBody: 'BSI',
    certificateNumber: 'FS 123456',
    issueDate: new Date('2024-03-15'),
    expiryDate: new Date('2027-03-14'),
    lastSurveillanceDate: new Date('2025-09-10'),
    nextSurveillanceDate: new Date('2026-09-10'),
    status: 'ACTIVE',
  },
  {
    id: uuidv4(),
    orgId: DEFAULT_ORG_ID,
    standard: 'ISO 14001:2015',
    scope: 'Environmental management of software development and office operations',
    certificationBody: 'DNV',
    certificateNumber: 'CERT-2024-ENV-0891',
    issueDate: new Date('2024-06-01'),
    expiryDate: new Date('2027-05-31'),
    lastSurveillanceDate: new Date('2025-12-05'),
    nextSurveillanceDate: new Date('2026-12-05'),
    status: 'ACTIVE',
  },
  {
    id: uuidv4(),
    orgId: DEFAULT_ORG_ID,
    standard: 'ISO 45001:2018',
    scope: 'Occupational health and safety management for all company operations',
    certificationBody: 'Bureau Veritas',
    certificateNumber: 'BV-OHS-2024-4521',
    issueDate: new Date('2024-01-20'),
    expiryDate: new Date('2027-01-19'),
    lastSurveillanceDate: new Date('2025-07-15'),
    nextSurveillanceDate: new Date('2026-07-15'),
    status: 'ACTIVE',
  },
];

// Initialize seed data
for (const cert of seedCertificates) {
  certificateStore.set(cert.id, cert);
}

// ─── Certificate CRUD ───────────────────────────────────────────────────────

export function listCertificates(orgId?: string): IsoCertificate[] {
  const certs = Array.from(certificateStore.values());
  if (orgId) {
    return certs.filter((c) => c.orgId === orgId);
  }
  return certs;
}

export function getCertificate(id: string): IsoCertificate | undefined {
  return certificateStore.get(id);
}

export function createCertificate(data: Omit<IsoCertificate, 'id'>): IsoCertificate {
  const cert: IsoCertificate = {
    id: uuidv4(),
    ...data,
  };
  certificateStore.set(cert.id, cert);
  return cert;
}

export function updateCertificate(
  id: string,
  data: Partial<IsoCertificate>
): IsoCertificate | null {
  const existing = certificateStore.get(id);
  if (!existing) return null;

  const updated: IsoCertificate = { ...existing, ...data, id: existing.id };
  certificateStore.set(id, updated);
  return updated;
}

export function deleteCertificate(id: string): boolean {
  return certificateStore.delete(id);
}
