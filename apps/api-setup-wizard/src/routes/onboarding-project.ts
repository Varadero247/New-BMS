// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { writeRoleGuard, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const router = Router();
const logger = createLogger('api-setup-wizard:onboarding-project');

// In-memory project store
const projectStore = new Map<string, OnboardingProject>();

interface OnboardingMilestone {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  completedAt?: Date;
  owner?: string;
  dependencies: string[];  // milestone IDs
}

interface OnboardingProject {
  id: string;
  orgId: string;
  name: string;
  standards: string[];
  targetGoLiveDate?: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'AT_RISK' | 'COMPLETED';
  milestones: OnboardingMilestone[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

interface GoLiveDashboard {
  projectId: string;
  orgId: string;
  overallProgress: number;  // 0–100
  status: OnboardingProject['status'];
  daysToGoLive?: number;
  isOnTrack: boolean;
  milestoneStats: {
    total: number;
    completed: number;
    inProgress: number;
    blocked: number;
    pending: number;
  };
  criticalPathMilestones: OnboardingMilestone[];
  recentlyCompleted: OnboardingMilestone[];
  upcomingDue: OnboardingMilestone[];
  risks: string[];
}

function getOrgId(req: Request): string {
  const user = (req as AuthRequest).user as Record<string, string> | undefined;
  return user?.organisationId ?? user?.orgId ?? 'default';
}

function generateDefaultMilestones(standards: string[], targetGoLiveDate?: string): OnboardingMilestone[] {
  const baseMilestones: Omit<OnboardingMilestone, 'id'>[] = [
    { title: 'Kick-off & Scoping', description: 'Project kick-off meeting, scope confirmation, team introductions', status: 'PENDING', dependencies: [] },
    { title: 'Gap Assessment', description: 'Conduct compliance gap assessment against target standards', status: 'PENDING', dependencies: [] },
    { title: 'Instant Start Pack Installation', description: 'Install and configure industry-specific Instant Start configuration packs', status: 'PENDING', dependencies: ['Kick-off & Scoping'] },
    { title: 'Module Configuration', description: 'Configure all enabled IMS modules with organisation-specific settings', status: 'PENDING', dependencies: ['Instant Start Pack Installation'] },
    { title: 'Data Migration', description: 'Migrate existing data from legacy systems (documents, risks, incidents)', status: 'PENDING', dependencies: ['Module Configuration'] },
    { title: 'User Import & Roles', description: 'Import user accounts and assign roles and permissions', status: 'PENDING', dependencies: ['Module Configuration'] },
    { title: 'SSO Configuration', description: 'Configure Single Sign-On with corporate identity provider', status: 'PENDING', dependencies: ['User Import & Roles'] },
    { title: 'ERP/HR Integration', description: 'Connect and test ERP/HR system integrations', status: 'PENDING', dependencies: ['Module Configuration'] },
    { title: 'Superuser Training', description: 'Train system administrators and power users', status: 'PENDING', dependencies: ['Module Configuration'] },
    { title: 'Pilot Group Testing', description: 'Pilot rollout to a test group of users, gather feedback', status: 'PENDING', dependencies: ['Superuser Training', 'Data Migration'] },
    { title: 'End-User Training', description: 'Train all end-users on their respective modules', status: 'PENDING', dependencies: ['Pilot Group Testing'] },
    { title: 'UAT Sign-off', description: 'User Acceptance Testing completed and signed off by stakeholders', status: 'PENDING', dependencies: ['End-User Training'] },
    { title: 'Go-Live Readiness Review', description: 'Final go-live readiness check against all criteria', status: 'PENDING', dependencies: ['UAT Sign-off'] },
    { title: 'Go-Live', description: 'Production launch of the IMS platform', status: 'PENDING', dependencies: ['Go-Live Readiness Review'] },
    { title: 'Post-Go-Live Hypercare', description: '2-week hypercare period with enhanced support', status: 'PENDING', dependencies: ['Go-Live'] },
  ];

  // Add standard-specific milestones
  if (standards.some(s => s.includes('27001'))) {
    baseMilestones.splice(4, 0, {
      title: 'Statement of Applicability (SoA)',
      description: 'Complete ISO 27001 Statement of Applicability with control justifications',
      status: 'PENDING',
      dependencies: ['Gap Assessment'],
    });
  }

  if (standards.some(s => s.includes('9001') || s.includes('iatf'))) {
    baseMilestones.splice(4, 0, {
      title: 'Process Map & Control Plans',
      description: 'Document process interactions, process maps, and initial control plans',
      status: 'PENDING',
      dependencies: ['Gap Assessment'],
    });
  }

  return baseMilestones.map((m, i) => ({
    ...m,
    id: `ms_${i + 1}`,
  }));
}

function calculateGoLiveDashboard(project: OnboardingProject): GoLiveDashboard {
  const total = project.milestones.length;
  const completed = project.milestones.filter(m => m.status === 'COMPLETED').length;
  const inProgress = project.milestones.filter(m => m.status === 'IN_PROGRESS').length;
  const blocked = project.milestones.filter(m => m.status === 'BLOCKED').length;
  const pending = project.milestones.filter(m => m.status === 'PENDING').length;

  const overallProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

  let daysToGoLive: number | undefined;
  let isOnTrack = true;

  if (project.targetGoLiveDate) {
    const daysLeft = Math.ceil((new Date(project.targetGoLiveDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    daysToGoLive = daysLeft;
    // Simple heuristic: if less than 30% done with less than 30 days left, at risk
    if (overallProgress < 30 && daysLeft < 30) isOnTrack = false;
    if (blocked > 0) isOnTrack = false;
  }

  const criticalPath = project.milestones.filter(m => m.status !== 'COMPLETED' && m.dependencies.length > 0);
  const recentlyCompleted = project.milestones
    .filter(m => m.status === 'COMPLETED' && m.completedAt)
    .sort((a, b) => (b.completedAt!.getTime()) - (a.completedAt!.getTime()))
    .slice(0, 3);

  const upcomingDue = project.milestones
    .filter(m => m.status !== 'COMPLETED' && m.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  const risks: string[] = [];
  if (blocked > 0) risks.push(`${blocked} milestone(s) are blocked and require immediate attention`);
  if (!isOnTrack) risks.push('Project is behind schedule — consider adding resources or adjusting scope');
  if (project.milestones.some(m => m.title.includes('Data Migration') && m.status === 'PENDING' && daysToGoLive && daysToGoLive < 30)) {
    risks.push('Data migration has not started — this is a high-risk activity close to go-live');
  }
  if (project.milestones.some(m => m.title.includes('Training') && m.status === 'PENDING' && daysToGoLive && daysToGoLive < 14)) {
    risks.push('End-user training has not been completed — ensure users are ready before go-live');
  }

  return {
    projectId: project.id,
    orgId: project.orgId,
    overallProgress,
    status: project.status,
    daysToGoLive,
    isOnTrack,
    milestoneStats: { total, completed, inProgress, blocked, pending },
    criticalPathMilestones: criticalPath.slice(0, 5),
    recentlyCompleted,
    upcomingDue,
    risks,
  };
}

// GET /api/onboarding-project — list projects for org
router.get('/', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const projects = Array.from(projectStore.values()).filter(p => p.orgId === orgId);
  res.json({ success: true, data: projects });
});

// POST /api/onboarding-project — create new project
router.post('/', writeRoleGuard('ADMIN'), (req: Request, res: Response) => {
  const bodySchema = z.object({
    name: z.string().min(1).max(100),
    standards: z.array(z.string().min(1)).min(1),
    targetGoLiveDate: z.string().optional(),
  });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
  }

  const orgId = getOrgId(req);
  const id = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const project: OnboardingProject = {
    id,
    orgId,
    name: parsed.data.name,
    standards: parsed.data.standards,
    targetGoLiveDate: parsed.data.targetGoLiveDate,
    status: 'PLANNING',
    milestones: generateDefaultMilestones(parsed.data.standards, parsed.data.targetGoLiveDate),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  projectStore.set(id, project);
  logger.info('Onboarding project created', { id, orgId, standards: parsed.data.standards });
  res.status(201).json({ success: true, data: project });
});

// GET /api/onboarding-project/:id
router.get('/:id', (req: Request, res: Response) => {
  const project = projectStore.get(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
  }
  const orgId = getOrgId(req);
  if (project.orgId !== orgId) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
  }
  res.json({ success: true, data: project });
});

// GET /api/onboarding-project/:id/dashboard — go-live readiness dashboard
router.get('/:id/dashboard', (req: Request, res: Response) => {
  const project = projectStore.get(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
  }
  const orgId = getOrgId(req);
  if (project.orgId !== orgId) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
  }
  const dashboard = calculateGoLiveDashboard(project);
  res.json({ success: true, data: dashboard });
});

// PATCH /api/onboarding-project/:id/milestones/:milestoneId
router.patch('/:id/milestones/:milestoneId', writeRoleGuard('ADMIN', 'MANAGER'), (req: Request, res: Response) => {
  const project = projectStore.get(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
  }

  const orgId = getOrgId(req);
  if (project.orgId !== orgId) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
  }

  const milestoneIndex = project.milestones.findIndex(m => m.id === req.params.milestoneId);
  if (milestoneIndex === -1) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Milestone not found' } });
  }

  const bodySchema = z.object({
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED']).optional(),
    dueDate: z.string().optional(),
    owner: z.string().optional(),
  });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
  }

  const milestone = project.milestones[milestoneIndex];
  if (parsed.data.status) {
    milestone.status = parsed.data.status;
    if (parsed.data.status === 'COMPLETED') milestone.completedAt = new Date();
  }
  if (parsed.data.dueDate !== undefined) milestone.dueDate = parsed.data.dueDate;
  if (parsed.data.owner !== undefined) milestone.owner = parsed.data.owner;

  project.milestones[milestoneIndex] = milestone;
  project.updatedAt = new Date();

  // Auto-update project status
  const completedCount = project.milestones.filter(m => m.status === 'COMPLETED').length;
  if (completedCount === project.milestones.length) {
    project.status = 'COMPLETED';
    project.completedAt = new Date();
  } else if (project.milestones.some(m => m.status === 'BLOCKED')) {
    project.status = 'AT_RISK';
  } else if (project.milestones.some(m => m.status === 'IN_PROGRESS')) {
    project.status = 'IN_PROGRESS';
  }

  projectStore.set(project.id, project);
  logger.info('Milestone updated', { projectId: project.id, milestoneId: milestone.id, status: milestone.status });
  res.json({ success: true, data: milestone });
});

export default router;
