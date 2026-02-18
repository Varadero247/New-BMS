/**
 * @ims/scheduled-reports — Scheduled Report Engine
 *
 * In-memory store for report schedules with CRUD operations.
 */

import { v4 as uuidv4 } from 'uuid';

// ─── Types ──────────────────────────────────────────────────────────────────

export type ReportFormat = 'pdf' | 'excel' | 'csv';

export type ReportType =
  | 'quality_kpi'
  | 'incident_summary'
  | 'audit_status'
  | 'capa_tracker'
  | 'environmental_metrics'
  | 'energy_consumption'
  | 'compliance_overview'
  | 'risk_register';

export interface ReportSchedule {
  id: string;
  orgId: string;
  name: string;
  reportType: ReportType;
  schedule: string; // cron expression
  recipients: string[];
  format: ReportFormat;
  lastRun: string | null;
  nextRun: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleParams {
  orgId: string;
  name: string;
  reportType: ReportType;
  schedule: string;
  recipients: string[];
  format: ReportFormat;
  enabled?: boolean;
}

export interface UpdateScheduleParams {
  name?: string;
  reportType?: ReportType;
  schedule?: string;
  recipients?: string[];
  format?: ReportFormat;
  enabled?: boolean;
}

export const REPORT_TYPES: { value: ReportType; label: string; description: string }[] = [
  {
    value: 'quality_kpi',
    label: 'Quality KPIs',
    description: 'Key quality metrics including NCR rates, CAPA closure, and audit findings',
  },
  {
    value: 'incident_summary',
    label: 'Incident Summary',
    description: 'Summary of health & safety incidents, near-misses, and trends',
  },
  {
    value: 'audit_status',
    label: 'Audit Status',
    description: 'Internal and external audit schedule, findings, and closure rates',
  },
  {
    value: 'capa_tracker',
    label: 'CAPA Tracker',
    description: 'Corrective and preventive action status and effectiveness',
  },
  {
    value: 'environmental_metrics',
    label: 'Environmental Metrics',
    description: 'Environmental aspect significance, emissions, and compliance status',
  },
  {
    value: 'energy_consumption',
    label: 'Energy Consumption',
    description: 'Energy usage trends, EnPIs, and baseline comparisons',
  },
  {
    value: 'compliance_overview',
    label: 'Compliance Overview',
    description: 'Cross-standard compliance status and upcoming deadlines',
  },
  {
    value: 'risk_register',
    label: 'Risk Register',
    description: 'Active risks, risk ratings, and mitigation status across all modules',
  },
];

// ─── In-Memory Store ────────────────────────────────────────────────────────

const scheduleStore = new Map<string, ReportSchedule>();

// ─── Seed Data ──────────────────────────────────────────────────────────────

function seedSchedules(): void {
  const seeds: CreateScheduleParams[] = [
    {
      orgId: 'default',
      name: 'Monthly Quality KPI Report',
      reportType: 'quality_kpi',
      schedule: '0 8 1 * *',
      recipients: ['quality.manager@ims.local', 'admin@ims.local'],
      format: 'pdf',
      enabled: true,
    },
    {
      orgId: 'default',
      name: 'Weekly Incident Summary',
      reportType: 'incident_summary',
      schedule: '0 9 * * 1',
      recipients: ['safety.officer@ims.local', 'admin@ims.local'],
      format: 'pdf',
      enabled: true,
    },
    {
      orgId: 'default',
      name: 'Quarterly Audit Status',
      reportType: 'audit_status',
      schedule: '0 8 1 1,4,7,10 *',
      recipients: ['audit.lead@ims.local', 'compliance@ims.local'],
      format: 'excel',
      enabled: true,
    },
    {
      orgId: 'default',
      name: 'Monthly CAPA Tracker',
      reportType: 'capa_tracker',
      schedule: '0 8 1 * *',
      recipients: ['quality.manager@ims.local'],
      format: 'csv',
      enabled: true,
    },
    {
      orgId: 'default',
      name: 'Weekly Risk Register Export',
      reportType: 'risk_register',
      schedule: '0 7 * * 5',
      recipients: ['risk.manager@ims.local', 'admin@ims.local'],
      format: 'excel',
      enabled: false,
    },
  ];

  for (const seed of seeds) {
    createSchedule(seed);
  }
}

// ─── CRUD Operations ────────────────────────────────────────────────────────

export function createSchedule(params: CreateScheduleParams): ReportSchedule {
  const now = new Date().toISOString();
  const schedule: ReportSchedule = {
    id: uuidv4(),
    orgId: params.orgId,
    name: params.name,
    reportType: params.reportType,
    schedule: params.schedule,
    recipients: params.recipients,
    format: params.format,
    lastRun: null,
    nextRun: calculateNextRun(params.schedule),
    enabled: params.enabled ?? true,
    createdAt: now,
    updatedAt: now,
  };

  scheduleStore.set(schedule.id, schedule);
  return schedule;
}

export function listSchedules(orgId: string): ReportSchedule[] {
  return Array.from(scheduleStore.values()).filter((s) => s.orgId === orgId);
}

export function getSchedule(id: string): ReportSchedule | undefined {
  return scheduleStore.get(id);
}

export function updateSchedule(id: string, updates: UpdateScheduleParams): ReportSchedule | null {
  const schedule = scheduleStore.get(id);
  if (!schedule) return null;

  if (updates.name !== undefined) schedule.name = updates.name;
  if (updates.reportType !== undefined) schedule.reportType = updates.reportType;
  if (updates.schedule !== undefined) {
    schedule.schedule = updates.schedule;
    schedule.nextRun = calculateNextRun(updates.schedule);
  }
  if (updates.recipients !== undefined) schedule.recipients = updates.recipients;
  if (updates.format !== undefined) schedule.format = updates.format;
  if (updates.enabled !== undefined) schedule.enabled = updates.enabled;
  schedule.updatedAt = new Date().toISOString();

  return schedule;
}

export function deleteSchedule(id: string): boolean {
  return scheduleStore.delete(id);
}

export function runScheduleNow(id: string): ReportSchedule | null {
  const schedule = scheduleStore.get(id);
  if (!schedule) return null;

  schedule.lastRun = new Date().toISOString();
  schedule.nextRun = calculateNextRun(schedule.schedule);
  schedule.updatedAt = new Date().toISOString();

  return schedule;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function calculateNextRun(cronExpression: string): string {
  // Simplified next-run calculation (production would use a cron parser)
  const now = new Date();
  const parts = cronExpression.split(' ');

  if (parts.length !== 5) {
    // Default to tomorrow at 8am
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    return tomorrow.toISOString();
  }

  const minute = parts[0] === '*' ? 0 : parseInt(parts[0], 10);
  const hour = parts[1] === '*' ? 8 : parseInt(parts[1], 10);

  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);

  // If the time has passed today, move to next occurrence
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  return next.toISOString();
}

// ─── Initialize seed data ───────────────────────────────────────────────────

seedSchedules();
