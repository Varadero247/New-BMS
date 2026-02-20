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

async function generateRef(): Promise<string> {
  const yy = String(new Date().getFullYear()).slice(-2);
  const mm = String(new Date().getMonth() + 1).padStart(2, '0');
  const prefix = `SUP-${yy}${mm}`;
  const count = await prisma.medicalSupplier.count({ where: { referenceNumber: { startsWith: prefix } } });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// GET /api/suppliers
router.get('/', async (req: Request, res: Response) => {
  try {
    const { qualificationStatus, riskLevel, search } = req.query;
    const where: Record<string, unknown> = { deletedAt: null };
    if (qualificationStatus) where.qualificationStatus = qualificationStatus as string;
    if (riskLevel) where.riskLevel = riskLevel as string;

    const suppliers = await prisma.medicalSupplier.findMany({
      where,
      take: 500,
      orderBy: { createdAt: 'desc' },
    });

    const data = search
      ? suppliers.filter((s) => s.name.toLowerCase().includes((search as string).toLowerCase()))
      : suppliers;

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching medical suppliers', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch suppliers' } });
  }
});

// GET /api/suppliers/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const supplier = await prisma.medicalSupplier.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!supplier) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Supplier not found' } });
    res.json({ success: true, data: supplier });
  } catch (error) {
    logger.error('Error fetching supplier', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch supplier' } });
  }
});

// POST /api/suppliers
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, classification, products, iso13485Certified, riskLevel, nextAuditDate } = req.body;
    const user = (req as AuthRequest).user;

    const supplier = await prisma.medicalSupplier.create({
      data: {
        referenceNumber: await generateRef(),
        name: name || 'Unknown Supplier',
        classification: classification || 'MAJOR',
        qualificationStatus: 'PENDING',
        iso13485Certified: iso13485Certified === true || iso13485Certified === 'true',
        riskLevel: riskLevel || 'MEDIUM',
        products: products || null,
        nextAuditDate: nextAuditDate ? new Date(nextAuditDate) : null,
        createdBy: user?.email || user?.id,
      },
    });

    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    logger.error('Error creating medical supplier', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create supplier' } });
  }
});

// PUT /api/suppliers/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, classification, qualificationStatus, iso13485Certified, lastAuditDate, nextAuditDate, riskLevel, products, notes } = req.body;

    const supplier = await prisma.medicalSupplier.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(classification && { classification }),
        ...(qualificationStatus && { qualificationStatus }),
        ...(iso13485Certified !== undefined && { iso13485Certified: iso13485Certified === true || iso13485Certified === 'true' }),
        ...(lastAuditDate !== undefined && { lastAuditDate: lastAuditDate ? new Date(lastAuditDate) : null }),
        ...(nextAuditDate !== undefined && { nextAuditDate: nextAuditDate ? new Date(nextAuditDate) : null }),
        ...(riskLevel && { riskLevel }),
        ...(products !== undefined && { products }),
        ...(notes !== undefined && { notes }),
      },
    });

    res.json({ success: true, data: supplier });
  } catch (error) {
    logger.error('Error updating supplier', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update supplier' } });
  }
});

// DELETE /api/suppliers/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.medicalSupplier.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { id: req.params.id } });
  } catch (error) {
    logger.error('Error deleting supplier', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete supplier' } });
  }
});

export default router;
