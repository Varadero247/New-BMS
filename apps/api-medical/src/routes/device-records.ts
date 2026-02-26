// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-medical');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// GET /api/device-records — list device history records
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, search, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status as string;

    const [records, total] = await Promise.all([
      prisma.deviceHistoryRecord.findMany({
        where,
        include: { dmr: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.deviceHistoryRecord.count({ where }),
    ]);

    const data = records
      .filter((r) => {
        if (!search) return true;
        const q = (search as string).toLowerCase();
        return (
          r.refNumber.toLowerCase().includes(q) ||
          r.dmr.deviceName.toLowerCase().includes(q)
        );
      })
      .map((r) => ({
        id: r.id,
        dhrNumber: r.refNumber,
        deviceName: r.dmr.deviceName,
        deviceModel: r.dmr.deviceId || 'N/A',
        serialNumber: r.primaryId || r.batchNumber,
        lotNumber: r.batchNumber,
        status: r.status,
        deviceClass: r.dmr.deviceClass,
        manufactureDate: r.manufacturingDate,
        releaseDate: r.releaseDate,
        owner: r.releasedBy || 'N/A',
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));

    res.json({ success: true, data, total });
  } catch (error) {
    logger.error('Error fetching device records', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch device records' } });
  }
});

// GET /api/device-records/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const record = await prisma.deviceHistoryRecord.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { dmr: true, productionRecords: true },
    });
    if (!record) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Record not found' } });
    res.json({ success: true, data: record });
  } catch (error) {
    logger.error('Error fetching device record', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch record' } });
  }
});

async function generateDHRRef(): Promise<string> {
  const yy = String(new Date().getFullYear()).slice(-2);
  const mm = String(new Date().getMonth() + 1).padStart(2, '0');
  const prefix = `DHR-${yy}${mm}`;
  const count = await prisma.deviceHistoryRecord.count({ where: { refNumber: { startsWith: prefix } } });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

async function generateDMRRef(): Promise<string> {
  const yy = String(new Date().getFullYear()).slice(-2);
  const mm = String(new Date().getMonth() + 1).padStart(2, '0');
  const prefix = `DMR-${yy}${mm}`;
  const count = await prisma.deviceMasterRecord.count({ where: { refNumber: { startsWith: prefix } } });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// POST /api/device-records — create device record
router.post('/', async (req: Request, res: Response) => {
  try {
    const { deviceName, deviceModel, serialNumber, lotNumber, status, deviceClass, manufactureDate, releaseDate, owner } = req.body;
    const user = (req as AuthRequest).user;

    // Find or create a DMR for this device
    let dmr = await prisma.deviceMasterRecord.findFirst({
      where: { deviceName: deviceName || 'Unknown', deletedAt: null },
    });

    if (!dmr) {
      dmr = await prisma.deviceMasterRecord.create({
        data: {
          refNumber: await generateDMRRef(),
          deviceName: deviceName || 'Unknown',
          deviceClass: deviceClass || 'CLASS_I',
          deviceId: deviceModel || null,
          status: 'DRAFT',
          createdBy: user?.email || user?.id,
        },
      });
    }

    const record = await prisma.deviceHistoryRecord.create({
      data: {
        refNumber: await generateDHRRef(),
        dmrId: dmr.id,
        batchNumber: lotNumber || `LOT-${Date.now()}`,
        primaryId: serialNumber || null,
        manufacturingDate: manufactureDate ? new Date(manufactureDate) : new Date(),
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        releasedBy: owner || null,
        status: status || 'IN_PRODUCTION',
        quantityManufactured: 1,
        createdBy: user?.email || user?.id,
      },
      include: { dmr: true },
    });

    res.status(201).json({
      success: true,
      data: {
        id: record.id,
        dhrNumber: record.refNumber,
        deviceName: record.dmr.deviceName,
        deviceModel: record.dmr.deviceId || 'N/A',
        serialNumber: record.primaryId || record.batchNumber,
        lotNumber: record.batchNumber,
        status: record.status,
        deviceClass: record.dmr.deviceClass,
        manufactureDate: record.manufacturingDate,
        releaseDate: record.releaseDate,
        owner: record.releasedBy || 'N/A',
      },
    });
  } catch (error) {
    logger.error('Error creating device record', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create device record' } });
  }
});

// PUT /api/device-records/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { status, serialNumber, lotNumber, releaseDate, owner } = req.body;

    const record = await prisma.deviceHistoryRecord.update({
      where: { id: req.params.id },
      data: {
        ...(status && { status }),
        ...(lotNumber && { batchNumber: lotNumber }),
        ...(serialNumber !== undefined && { primaryId: serialNumber }),
        ...(releaseDate !== undefined && { releaseDate: releaseDate ? new Date(releaseDate) : null }),
        ...(owner !== undefined && { releasedBy: owner }),
      },
      include: { dmr: true },
    });

    res.json({ success: true, data: record });
  } catch (error) {
    logger.error('Error updating device record', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update record' } });
  }
});

// DELETE /api/device-records/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.deviceHistoryRecord.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true, data: { id: req.params.id } });
  } catch (error) {
    logger.error('Error deleting device record', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete record' } });
  }
});

export default router;
