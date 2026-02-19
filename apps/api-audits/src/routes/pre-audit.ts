import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
const logger = createLogger('api-audits');

const router = Router();
router.param('id', validateIdParam());

// ---------------------------------------------------------------------------
// Data-driven recommendation generator
// ---------------------------------------------------------------------------

interface AuditRecord {
  referenceNumber: string | null;
  title: string;
  scope: string | null;
  standard: string | null;
  type: string | null;
  status: string | null;
  leadAuditorName: string | null;
  scheduledDate: Date | null;
  description: string | null;
}

function buildRecommendations(audit: AuditRecord): string[] {
  const recs: string[] = [];

  // Standard-specific recommendations
  const standard = (audit.standard || '').toUpperCase();
  if (standard.includes('9001')) {
    recs.push('Verify documented information for all quality management processes');
    recs.push('Confirm customer satisfaction data and measurement results are available');
    recs.push('Review corrective action records and evidence of continual improvement');
  } else if (standard.includes('14001')) {
    recs.push(
      'Gather evidence of environmental aspects/impacts register and legal compliance evaluation'
    );
    recs.push('Ensure environmental monitoring data and emergency response test records are ready');
    recs.push('Confirm objectives, targets, and environmental performance metrics are documented');
  } else if (standard.includes('45001')) {
    recs.push('Compile hazard identification, risk assessment, and control hierarchy evidence');
    recs.push('Prepare records of incident investigations, near-misses, and corrective actions');
    recs.push('Confirm worker consultation and participation records are available');
  } else if (standard.includes('27001')) {
    recs.push('Ensure the Statement of Applicability (SoA) is current and signed off');
    recs.push(
      'Prepare asset inventory, risk treatment plan, and residual risk acceptance evidence'
    );
    recs.push('Gather access control reviews, vulnerability scan results, and patch records');
  } else if (standard.includes('22301')) {
    recs.push('Confirm Business Continuity Plans are tested, exercised, and up-to-date');
    recs.push('Prepare Business Impact Analysis and recovery time objective evidence');
  } else {
    recs.push('Review all documented procedures and work instructions relevant to the audit scope');
    recs.push('Ensure management system records demonstrate conformance and effectiveness');
  }

  // Type-specific recommendations
  const type = (audit.type || '').toUpperCase();
  if (type === 'CERTIFICATION') {
    recs.push('Ensure all mandatory documented information is current and approved');
    recs.push('Conduct a pre-audit internal gap assessment against the certification standard');
    recs.push('Prepare a list of all previous nonconformities and evidence of closure');
  } else if (type === 'EXTERNAL' || type === 'SURVEILLANCE') {
    recs.push('Notify all process owners and prepare them for auditor interviews');
    recs.push('Verify that all action plans from the previous audit cycle are closed');
  } else if (type === 'SUPPLIER') {
    recs.push('Obtain and review supplier self-assessment questionnaire before on-site visit');
    recs.push('Prepare approved supplier list and purchase order history for reference');
  } else {
    recs.push('Brief internal audit team on scope, criteria, and interview approach');
    recs.push('Review previous internal audit findings and status of open actions');
  }

  // Generic best-practice recommendations always included
  recs.push('Confirm availability of key personnel and process owners on the audit date');
  recs.push('Prepare document evidence packs for each clause within the audit scope');

  // Scope-specific
  if (audit.scope && audit.scope.length > 10) {
    recs.push(`Review all processes within scope: "${audit.scope.substring(0, 120)}"`);
  }

  return recs;
}

function estimateDurationHours(audit: AuditRecord): number {
  const type = (audit.type || '').toUpperCase();
  if (type === 'CERTIFICATION') return 16;
  if (type === 'EXTERNAL' || type === 'SURVEILLANCE') return 8;
  if (type === 'SUPPLIER') return 6;
  return 4;
}

function buildChecklist(audit: AuditRecord): string[] {
  const list = [
    'Confirm audit date and location with all stakeholders',
    'Distribute audit plan to process owners at least 5 business days in advance',
    'Prepare meeting room and equipment (projector, whiteboard, visitor passes)',
    'Compile document pack: policies, procedures, work instructions, records',
    'Review previous audit reports and open nonconformities',
    'Ensure audit management system access for the lead auditor',
  ];

  if ((audit.type || '').toUpperCase() === 'CERTIFICATION') {
    list.push('Prepare Statement of Applicability and risk register for external review');
    list.push('Arrange catering and facilities for a full-day (or multi-day) event');
  }

  return list;
}

// ---------------------------------------------------------------------------
// POST /:id/generate
// ---------------------------------------------------------------------------

router.post('/:id/generate', authenticate, async (req: Request, res: Response) => {
  try {
    const audit = await prisma.audAudit.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!audit) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Audit not found' },
      });
    }

    const auditRecord = audit as unknown as AuditRecord;
    const recommendations = buildRecommendations(auditRecord);
    const checklist = buildChecklist(auditRecord);
    const estimatedDurationHours = estimateDurationHours(auditRecord);

    const report = {
      auditRef: audit.referenceNumber,
      title: audit.title,
      scope: audit.scope,
      standard: audit.standard,
      type: audit.type,
      status: audit.status,
      leadAuditorName: (audit as any).leadAuditorName || null,
      scheduledDate: (audit as any).scheduledDate || null,
      preparedDate: new Date(),
      estimatedDurationHours,
      recommendations,
      checklist,
      generatedAt: new Date().toISOString(),
    };

    res.json({ success: true, data: report });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
});

export default router;
