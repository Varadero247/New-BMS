// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { AuditFinding, FindingSeverity, FindingStatus } from './types';

let findingCounter = 0;

function generateFindingId(): string {
  return `FND-${Date.now()}-${++findingCounter}`;
}

export class FindingTracker {
  private findings: Map<string, AuditFinding> = new Map();
  private auditIndex: Map<string, string[]> = new Map();

  raise(
    auditId: string,
    severity: FindingSeverity,
    clauseReference: string,
    description: string,
    evidence: string,
    raisedBy: string,
    raisedAt: string,
    responseDeadline?: string
  ): AuditFinding {
    if (!auditId || auditId.trim() === '') {
      throw new Error('Audit ID is required');
    }
    if (!clauseReference || clauseReference.trim() === '') {
      throw new Error('Clause reference is required');
    }
    if (!description || description.trim() === '') {
      throw new Error('Description is required');
    }
    if (!evidence || evidence.trim() === '') {
      throw new Error('Evidence is required');
    }
    if (!raisedBy || raisedBy.trim() === '') {
      throw new Error('Raised by is required');
    }

    const finding: AuditFinding = {
      id: generateFindingId(),
      auditId: auditId.trim(),
      severity,
      status: 'OPEN',
      clauseReference: clauseReference.trim(),
      description: description.trim(),
      evidence: evidence.trim(),
      raisedBy: raisedBy.trim(),
      raisedAt,
      responseDeadline,
    };

    this.findings.set(finding.id, finding);

    const existing = this.auditIndex.get(auditId) ?? [];
    existing.push(finding.id);
    this.auditIndex.set(auditId, existing);

    return finding;
  }

  respond(id: string, response: string, respondedAt: string): AuditFinding {
    const finding = this.findings.get(id);
    if (!finding) {
      throw new Error(`Finding not found: ${id}`);
    }
    if (finding.status !== 'OPEN' && finding.status !== 'OVERDUE') {
      throw new Error(`Cannot respond to finding with status: ${finding.status}`);
    }
    if (!response || response.trim() === '') {
      throw new Error('Response is required');
    }
    finding.status = 'RESPONDED';
    finding.response = response.trim();
    finding.respondedAt = respondedAt;
    return finding;
  }

  verify(id: string, verifiedBy: string, verifiedAt: string): AuditFinding {
    const finding = this.findings.get(id);
    if (!finding) {
      throw new Error(`Finding not found: ${id}`);
    }
    if (finding.status !== 'RESPONDED') {
      throw new Error(`Cannot verify finding with status: ${finding.status}`);
    }
    if (!verifiedBy || verifiedBy.trim() === '') {
      throw new Error('Verified by is required');
    }
    finding.status = 'VERIFIED';
    finding.verifiedBy = verifiedBy.trim();
    finding.verifiedAt = verifiedAt;
    return finding;
  }

  close(id: string, closedAt: string): AuditFinding {
    const finding = this.findings.get(id);
    if (!finding) {
      throw new Error(`Finding not found: ${id}`);
    }
    if (finding.status !== 'VERIFIED') {
      throw new Error(`Cannot close finding with status: ${finding.status}`);
    }
    finding.status = 'CLOSED';
    finding.closedAt = closedAt;
    return finding;
  }

  markOverdue(id: string): AuditFinding {
    const finding = this.findings.get(id);
    if (!finding) {
      throw new Error(`Finding not found: ${id}`);
    }
    if (finding.status !== 'OPEN') {
      throw new Error(`Cannot mark overdue finding with status: ${finding.status}`);
    }
    finding.status = 'OVERDUE';
    return finding;
  }

  linkCAPA(id: string, capaId: string): AuditFinding {
    const finding = this.findings.get(id);
    if (!finding) {
      throw new Error(`Finding not found: ${id}`);
    }
    if (!capaId || capaId.trim() === '') {
      throw new Error('CAPA ID is required');
    }
    finding.capaId = capaId.trim();
    return finding;
  }

  getByAudit(auditId: string): AuditFinding[] {
    const ids = this.auditIndex.get(auditId) ?? [];
    return ids.map(id => this.findings.get(id)!).filter(Boolean);
  }

  getBySeverity(severity: FindingSeverity): AuditFinding[] {
    return Array.from(this.findings.values()).filter(f => f.severity === severity);
  }

  getByStatus(status: FindingStatus): AuditFinding[] {
    return Array.from(this.findings.values()).filter(f => f.status === status);
  }

  getOpen(): AuditFinding[] {
    return this.getByStatus('OPEN');
  }

  getMajorOrCritical(): AuditFinding[] {
    return Array.from(this.findings.values()).filter(
      f => f.severity === 'MAJOR_NC' || f.severity === 'CRITICAL_NC'
    );
  }

  getUnresponsed(asOf: string): AuditFinding[] {
    return Array.from(this.findings.values()).filter(
      f =>
        f.status === 'OPEN' &&
        f.responseDeadline !== undefined &&
        f.responseDeadline < asOf
    );
  }

  getCount(): number {
    return this.findings.size;
  }
}
