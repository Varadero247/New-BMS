export const NEXARA_EVENTS: Record<string, { description: string; triggers: string[] }> = {
  // Quality → CMMS
  'calibration.failed': {
    description: 'Calibration result out of tolerance',
    triggers: ['quality.ncr.auto_create', 'cmms.asset.quarantine'],
  },
  'calibration.out_of_tolerance': {
    description: 'Measurement equipment out of tolerance',
    triggers: ['quality.ncr.create', 'inventory.batch.quarantine', 'quality.notification.manager'],
  },
  'quality.ncr.created': {
    description: 'Non-conformance report created',
    triggers: ['crm.account.risk_flag', 'supplier.notification'],
  },
  // H&S → CMMS
  'incident.reported': {
    description: 'Health and safety incident reported',
    triggers: ['cmms.permit_to_work.review', 'hr.absence.check'],
  },
  // Finance → CRM
  'invoice.overdue': {
    description: 'Invoice past payment due date',
    triggers: ['crm.account.alert', 'crm.activity.auto_log'],
  },
  // ISO 14001 → ESG
  'environmental.aspect.updated': {
    description: 'Environmental aspect significance changed',
    triggers: ['esg.scope1_2.recalculate'],
  },
  'energy.consumption.logged': {
    description: 'Energy consumption reading recorded',
    triggers: ['esg.carbon_intensity.update', 'iso50001.enpi.recalculate'],
  },
  // CRM → Finance → PM
  'deal.closed_won': {
    description: 'Sales deal closed as won',
    triggers: ['finance.invoice.draft_create', 'pm.project.auto_create', 'workflow.onboarding.trigger'],
  },
  // CMMS → H&S
  'equipment.failure': {
    description: 'Equipment failure or breakdown',
    triggers: ['health_safety.incident.prompt', 'cmms.permit_to_work.required'],
  },
  // HR → ESG
  'payroll.run.complete': {
    description: 'Payroll run completed',
    triggers: ['esg.social.gender_pay_gap.recalculate'],
  },
  'training.completed': {
    description: 'Employee training completed',
    triggers: ['quality.competency.update', 'hr.training_matrix.update'],
  },
  // Field Service
  'field_service.job.completed': {
    description: 'Field service job completed',
    triggers: ['finance.invoice.auto_create', 'cmms.asset.service_logged'],
  },
  // Portal
  'portal.complaint.submitted': {
    description: 'Customer complaint via portal',
    triggers: ['quality.ncr.auto_create', 'crm.case.create'],
  },
  'portal.supplier.ppap_submitted': {
    description: 'Supplier PPAP documents submitted',
    triggers: ['quality.ppap.review_required', 'automotive.ppap.notification'],
  },
  // AI Management
  'ai.incident.reported': {
    description: 'AI system incident reported',
    triggers: ['infosec.incident.review', 'ai.risk.reassess'],
  },
  // Anti-Bribery
  'antibribery.gift.reported': {
    description: 'Gift or hospitality reported',
    triggers: ['antibribery.review.required'],
  },
  'antibribery.investigation.opened': {
    description: 'Anti-bribery investigation opened',
    triggers: ['hr.suspension.review', 'infosec.access.review'],
  },
};

export function getEventTriggers(eventType: string): string[] {
  return NEXARA_EVENTS[eventType]?.triggers || [];
}

export function getAllEventTypes(): string[] {
  return Object.keys(NEXARA_EVENTS);
}
