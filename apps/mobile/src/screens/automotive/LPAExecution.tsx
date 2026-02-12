/**
 * Layered Process Audit (LPA) Execution Screen
 * Offline-capable: captures audit findings locally, syncs when online
 */

export interface LPAAuditFinding {
  questionId: string;
  question: string;
  layer: 'OPERATOR' | 'SUPERVISOR' | 'MANAGEMENT';
  result: 'CONFORMING' | 'NON_CONFORMING' | 'NOT_APPLICABLE';
  notes: string;
  photoUri?: string;
  timestamp: string;
}

export interface LPASession {
  id: string;
  area: string;
  auditor: string;
  layer: string;
  findings: LPAAuditFinding[];
  startedAt: string;
  completedAt?: string;
  synced: boolean;
}

export function createLPASession(area: string, auditor: string, layer: string): LPASession {
  return {
    id: `lpa_${Date.now()}`,
    area,
    auditor,
    layer,
    findings: [],
    startedAt: new Date().toISOString(),
    synced: false,
  };
}

export function addFinding(session: LPASession, finding: Omit<LPAAuditFinding, 'timestamp'>): LPASession {
  return {
    ...session,
    findings: [...session.findings, { ...finding, timestamp: new Date().toISOString() }],
  };
}

export function completeSession(session: LPASession): LPASession {
  return { ...session, completedAt: new Date().toISOString() };
}
