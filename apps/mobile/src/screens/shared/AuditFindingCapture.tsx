/**
 * Universal Audit Finding Capture
 * Offline-capable: captures finding with photo + description + clause
 */

export interface AuditFinding {
  id: string;
  auditId?: string;
  standard: string;
  clause: string;
  findingType: 'MAJOR_NC' | 'MINOR_NC' | 'OBSERVATION' | 'OPPORTUNITY';
  description: string;
  objective_evidence: string;
  photoUris: string[];
  location?: string;
  timestamp: string;
  synced: boolean;
}

export function createAuditFinding(
  data: Omit<AuditFinding, 'id' | 'timestamp' | 'synced' | 'photoUris'>
): AuditFinding {
  return {
    ...data,
    id: `finding_${Date.now()}`,
    photoUris: [],
    timestamp: new Date().toISOString(),
    synced: false,
  };
}
