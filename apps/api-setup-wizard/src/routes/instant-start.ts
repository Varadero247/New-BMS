// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { writeRoleGuard, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import {
  listPacks,
  listPacksByStandard,
  getManifest,
  searchPacks,
  installPack,
  validateCustomisation,
  validatePrerequisites,
} from '@ims/instant-start';

const router = Router();
const logger = createLogger('api-setup-wizard:instant-start');

function getOrgId(req: Request): string {
  const user = (req as AuthRequest).user as Record<string, string> | undefined;
  return user?.organisationId ?? user?.orgId ?? 'default';
}

// GET /api/instant-start/packs — list all available packs
router.get('/packs', (_req: Request, res: Response) => {
  const packs = listPacks();
  res.json({ success: true, data: packs });
});

// GET /api/instant-start/packs/search?q=...
router.get('/packs/search', (req: Request, res: Response) => {
  const schema = z.object({ q: z.string().min(1).max(100) });
  const parsed = schema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
  }
  const results = searchPacks(parsed.data.q);
  res.json({ success: true, data: results });
});

// GET /api/instant-start/packs/by-standard/:standard
router.get('/packs/by-standard/:standard', (req: Request, res: Response) => {
  const results = listPacksByStandard(req.params.standard);
  res.json({ success: true, data: results });
});

// GET /api/instant-start/packs/:packId
router.get('/packs/:packId', (req: Request, res: Response) => {
  const manifest = getManifest(req.params.packId);
  if (!manifest) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Pack not found' } });
  }
  res.json({ success: true, data: manifest });
});

// POST /api/instant-start/packs/:packId/validate — validate customisation + prerequisites
router.post('/packs/:packId/validate', writeRoleGuard('ADMIN', 'MANAGER'), (req: Request, res: Response) => {
  const manifest = getManifest(req.params.packId);
  if (!manifest) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Pack not found' } });
  }

  const bodySchema = z.object({
    customisationValues: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
    enabledModules: z.array(z.string()).optional(),
  });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
  }

  const customResult = validateCustomisation(manifest, parsed.data.customisationValues ?? {});
  const prereqResult = validatePrerequisites(manifest, parsed.data.enabledModules ?? []);

  res.json({
    success: true,
    data: {
      customisation: customResult,
      prerequisites: prereqResult,
      ready: customResult.valid && prereqResult.valid,
    },
  });
});

// POST /api/instant-start/packs/:packId/preview — preview what will be created
router.post('/packs/:packId/preview', writeRoleGuard('ADMIN', 'MANAGER'), (req: Request, res: Response) => {
  const manifest = getManifest(req.params.packId);
  if (!manifest) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Pack not found' } });
  }

  res.json({
    success: true,
    data: {
      manifest,
      sections: [],
      totalItems: 0,
    },
  });
});

// POST /api/instant-start/packs/:packId/install — install the pack
router.post('/packs/:packId/install', writeRoleGuard('ADMIN'), async (req: Request, res: Response) => {
  const manifest = getManifest(req.params.packId);
  if (!manifest) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Pack not found' } });
  }

  const bodySchema = z.object({
    customisationValues: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
    enabledModules: z.array(z.string()).optional(),
    dryRun: z.boolean().optional(),
  });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
  }

  const orgId = getOrgId(req);
  logger.info('Installing instant-start pack', { packId: req.params.packId, orgId, dryRun: parsed.data.dryRun });

  try {
    const result = await installPack({
      orgId,
      packId: req.params.packId,
      customisationValues: parsed.data.customisationValues ?? {},
      enabledModules: parsed.data.enabledModules ?? [],
      dryRun: parsed.data.dryRun ?? false,
    });

    logger.info('Pack installed', { packId: req.params.packId, orgId, status: result.status });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    logger.error('Pack install failed', { error: String(err), packId: req.params.packId, orgId });
    res.status(400).json({ success: false, error: { code: 'INSTALL_FAILED', message: String(err) } });
  }
});

export default router;
