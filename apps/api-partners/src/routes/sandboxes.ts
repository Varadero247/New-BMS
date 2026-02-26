// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { authenticate, writeRoleGuard, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const router = Router();
const logger = createLogger('api-partners:sandboxes');

interface SandboxEnvironment {
  id: string;
  partnerId: string;
  name: string;
  description?: string;
  status: 'PROVISIONING' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  region: string;
  adminEmail: string;
  adminPassword?: string;  // only returned on creation
  url: string;
  expiresAt: Date;
  modules: string[];
  createdAt: Date;
  lastAccessedAt?: Date;
}

const sandboxStore = new Map<string, SandboxEnvironment>();

function getPartnerId(req: Request): string {
  const user = (req as AuthRequest).user as Record<string, string> | undefined;
  return user?.organisationId ?? user?.orgId ?? 'default';
}

router.use(authenticate);

// GET /api/partner/sandboxes — list partner's sandbox environments
router.get('/', (req: Request, res: Response) => {
  const partnerId = getPartnerId(req);
  const sandboxes = Array.from(sandboxStore.values())
    .filter(s => s.partnerId === partnerId)
    .map(s => ({ ...s, adminPassword: undefined }));
  res.json({ success: true, data: sandboxes });
});

// POST /api/partner/sandboxes — provision a new sandbox
router.post('/', writeRoleGuard('ADMIN', 'MANAGER'), (req: Request, res: Response) => {
  const bodySchema = z.object({
    name: z.string().min(1).max(60),
    description: z.string().optional(),
    region: z.enum(['eu-west-1', 'eu-central-1', 'us-east-1', 'ap-southeast-1']).default('eu-west-1'),
    modules: z.array(z.string()).default(['health-safety', 'environment', 'quality', 'incidents']),
    expiryDays: z.number().int().min(7).max(90).default(30),
  });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
  }

  const partnerId = getPartnerId(req);
  const id = `sbx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const subdomain = `partner-${id.slice(-8)}`;
  const adminPassword = Math.random().toString(36).slice(2, 12) + 'A1!';

  const sandbox: SandboxEnvironment = {
    id,
    partnerId,
    name: parsed.data.name,
    description: parsed.data.description,
    status: 'PROVISIONING',
    region: parsed.data.region,
    adminEmail: `admin@${subdomain}.sandbox.nexara.io`,
    adminPassword,
    url: `https://${subdomain}.sandbox.nexara.io`,
    expiresAt: new Date(Date.now() + parsed.data.expiryDays * 24 * 60 * 60 * 1000),
    modules: parsed.data.modules,
    createdAt: new Date(),
  };
  sandboxStore.set(id, sandbox);

  // Simulate provisioning (in production: trigger async K8s namespace creation)
  setTimeout(() => {
    const s = sandboxStore.get(id);
    if (s) { s.status = 'ACTIVE'; sandboxStore.set(id, s); }
  }, 5000);

  logger.info('Sandbox provisioned', { id, partnerId, region: parsed.data.region });
  res.status(201).json({ success: true, data: sandbox });
});

// GET /api/partner/sandboxes/:id
router.get('/:id', (req: Request, res: Response) => {
  const sandbox = sandboxStore.get(req.params.id);
  if (!sandbox) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sandbox not found' } });
  }
  const partnerId = getPartnerId(req);
  if (sandbox.partnerId !== partnerId) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
  }
  res.json({ success: true, data: { ...sandbox, adminPassword: undefined } });
});

// POST /api/partner/sandboxes/:id/reset — reset sandbox to clean state
router.post('/:id/reset', writeRoleGuard('ADMIN', 'MANAGER'), (req: Request, res: Response) => {
  const sandbox = sandboxStore.get(req.params.id);
  if (!sandbox) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sandbox not found' } });
  }
  const partnerId = getPartnerId(req);
  if (sandbox.partnerId !== partnerId) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
  }

  sandbox.status = 'PROVISIONING';
  sandboxStore.set(sandbox.id, sandbox);
  setTimeout(() => {
    const s = sandboxStore.get(sandbox.id);
    if (s) { s.status = 'ACTIVE'; sandboxStore.set(sandbox.id, s); }
  }, 5000);

  logger.info('Sandbox reset', { id: sandbox.id, partnerId });
  res.json({ success: true, data: { message: 'Sandbox is being reset. It will be available again within 5 minutes.' } });
});

// DELETE /api/partner/sandboxes/:id
router.delete('/:id', writeRoleGuard('ADMIN'), (req: Request, res: Response) => {
  const sandbox = sandboxStore.get(req.params.id);
  if (!sandbox) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sandbox not found' } });
  }
  const partnerId = getPartnerId(req);
  if (sandbox.partnerId !== partnerId) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
  }
  sandboxStore.delete(req.params.id);
  logger.info('Sandbox deleted', { id: req.params.id, partnerId });
  res.json({ success: true, data: { message: 'Sandbox environment deleted' } });
});

export default router;
