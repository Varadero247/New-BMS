// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { authenticate, writeRoleGuard, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import {
  createConnector,
  CONNECTOR_METADATA,
  getSupportedConnectorTypes,
  type ConnectorConfig,
  type SyncJob,
  type ConnectorType,
  type EntityType,
  type SyncDirection,
} from '@ims/sync-engine';

// Import connector packages to auto-register them
import '@ims/bamboohr-client';
import '@ims/sap-client';
import '@ims/dynamics-client';
import '@ims/workday-client';
import '@ims/xero-client';

const router = Router();
const logger = createLogger('api-gateway:erp-connectors');

// In-memory stores (production: use DB + encrypted credential vault)
const connectorStore = new Map<string, ConnectorConfig>();
const jobStore = new Map<string, SyncJob>();

function getOrgId(req: Request): string {
  const user = (req as AuthRequest).user as Record<string, string> | undefined;
  return user?.organisationId ?? user?.orgId ?? 'default';
}

router.use(authenticate);

// GET /api/erp-connectors/types — list supported connector types
router.get('/types', (_req: Request, res: Response) => {
  const types = getSupportedConnectorTypes().map(type => ({
    type,
    ...CONNECTOR_METADATA[type],
  }));
  res.json({ success: true, data: types });
});

// GET /api/erp-connectors — list configured connectors for org
router.get('/', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const connectors = Array.from(connectorStore.values())
    .filter(c => c.orgId === orgId)
    .map(c => ({ ...c, credentials: undefined }));  // never return credentials
  res.json({ success: true, data: connectors });
});

const connectorTypeSchema = z.enum(['BAMBOOHR', 'SAP_HR', 'DYNAMICS_365', 'WORKDAY', 'XERO', 'GENERIC_REST'] as [ConnectorType, ...ConnectorType[]]);
const entityTypeSchema = z.enum(['EMPLOYEE', 'DEPARTMENT', 'POSITION', 'LEAVE', 'SUPPLIER', 'INVOICE', 'CUSTOMER'] as [EntityType, ...EntityType[]]);
const syncDirectionSchema = z.enum(['INBOUND', 'OUTBOUND', 'BIDIRECTIONAL'] as [SyncDirection, ...SyncDirection[]]);

// POST /api/erp-connectors — create a new connector configuration
router.post('/', writeRoleGuard('ADMIN'), (req: Request, res: Response) => {
  const bodySchema = z.object({
    type: connectorTypeSchema,
    name: z.string().min(1).max(100),
    credentials: z.record(z.string()),
    syncSchedule: z.string().default('0 * * * *'),  // hourly
    syncDirection: syncDirectionSchema.default('INBOUND'),
    entityTypes: z.array(entityTypeSchema).min(1),
  });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
  }

  const orgId = getOrgId(req);
  const id = `conn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const config: ConnectorConfig = {
    id,
    orgId,
    type: parsed.data.type,
    name: parsed.data.name,
    enabled: true,
    credentials: parsed.data.credentials,
    syncSchedule: parsed.data.syncSchedule,
    syncDirection: parsed.data.syncDirection,
    entityTypes: parsed.data.entityTypes,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  connectorStore.set(id, config);
  logger.info('ERP connector created', { id, type: config.type, orgId });

  res.status(201).json({ success: true, data: { ...config, credentials: undefined } });
});

// GET /api/erp-connectors/:id
router.get('/:id', (req: Request, res: Response) => {
  const config = connectorStore.get(req.params.id);
  if (!config) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Connector not found' } });
  }
  const orgId = getOrgId(req);
  if (config.orgId !== orgId) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
  }
  res.json({ success: true, data: { ...config, credentials: undefined } });
});

// DELETE /api/erp-connectors/:id
router.delete('/:id', writeRoleGuard('ADMIN'), (req: Request, res: Response) => {
  const config = connectorStore.get(req.params.id);
  if (!config) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Connector not found' } });
  }
  const orgId = getOrgId(req);
  if (config.orgId !== orgId) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
  }
  connectorStore.delete(req.params.id);
  logger.info('ERP connector deleted', { id: req.params.id, orgId });
  res.json({ success: true, data: { message: 'Connector deleted' } });
});

// POST /api/erp-connectors/:id/test — test connectivity
router.post('/:id/test', writeRoleGuard('ADMIN', 'MANAGER'), async (req: Request, res: Response) => {
  const config = connectorStore.get(req.params.id);
  if (!config) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Connector not found' } });
  }

  try {
    const connector = createConnector(config);
    const health = await connector.testConnection();
    res.json({ success: true, data: health });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'TEST_FAILED', message: String(err) } });
  }
});

// POST /api/erp-connectors/:id/sync — trigger manual sync
router.post('/:id/sync', writeRoleGuard('ADMIN', 'MANAGER'), async (req: Request, res: Response) => {
  const config = connectorStore.get(req.params.id);
  if (!config) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Connector not found' } });
  }
  if (!config.enabled) {
    return res.status(400).json({ success: false, error: { code: 'CONNECTOR_DISABLED', message: 'Connector is disabled' } });
  }

  const orgId = getOrgId(req);
  if (config.orgId !== orgId) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
  }

  const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const job: SyncJob = {
    id: jobId,
    connectorId: config.id,
    orgId,
    status: 'PENDING',
    direction: config.syncDirection,
    entityTypes: config.entityTypes,
    stats: { totalFetched: 0, created: 0, updated: 0, skipped: 0, failed: 0 },
    errors: [],
    triggeredBy: 'MANUAL',
  };
  jobStore.set(jobId, job);

  logger.info('ERP sync job triggered', { jobId, connectorId: config.id, orgId });

  // Execute async (fire and forget, client polls job status)
  const connector = createConnector(config);
  connector.executeSync(job).then(completedJob => {
    jobStore.set(jobId, completedJob);
    logger.info('ERP sync completed', { jobId, status: completedJob.status, stats: completedJob.stats });
  }).catch(err => {
    job.status = 'FAILED';
    job.errors.push({ entityType: 'EMPLOYEE', message: String(err), timestamp: new Date() });
    jobStore.set(jobId, job);
    logger.error('ERP sync failed', { jobId, error: String(err) });
  });

  res.status(202).json({ success: true, data: { jobId, status: 'PENDING', message: 'Sync started. Poll GET /api/erp-connectors/jobs/:jobId for progress.' } });
});

// GET /api/erp-connectors/jobs/:jobId — poll sync job status
router.get('/jobs/:jobId', (req: Request, res: Response) => {
  const job = jobStore.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Job not found' } });
  }
  const orgId = getOrgId(req);
  if (job.orgId !== orgId) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
  }
  res.json({ success: true, data: job });
});

export default router;
