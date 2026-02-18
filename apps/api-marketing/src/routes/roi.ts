import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const logger = createLogger('api-marketing:roi');
const router = Router();

const roiCalculateSchema = z.object({
  companyName: z.string().trim().min(1),
  name: z.string().trim().min(1),
  email: z.string().email(),
  jobTitle: z.string().optional(),
  employeeCount: z.string().optional(),
  isoCount: z.number().int().min(1).max(20).optional(),
  currentSpend: z.number().min(0).optional(),
  industry: z.string().optional(),
});

function calculateROI(data: {
  isoCount?: number;
  employeeCount?: string;
  currentSpend?: number;
}) {
  const isoCount = data.isoCount || 1;
  const recommendedTier = isoCount >= 4 ? 'Enterprise' : 'Professional';
  const pricePerUser = recommendedTier === 'Enterprise' ? 19 : 29;
  const avgUsers = 15;
  const monthlyCost = avgUsers * pricePerUser;
  const annualCost = monthlyCost * 12;

  // Industry benchmark: £180/user/month
  const industryBenchmarkAnnual = avgUsers * 180 * 12;
  const softwareSaving = industryBenchmarkAnnual - annualCost;

  // Time saving: 8 hrs/week per ISO standard × £35/hr × 52 weeks
  const timeSavingAnnual = isoCount * 8 * 35 * 52;

  const totalROI = softwareSaving + timeSavingAnnual;

  return {
    recommendedTier,
    pricePerUser,
    monthlyCost,
    annualCost,
    softwareSaving,
    timeSavingAnnual,
    totalROI,
    avgUsers,
  };
}

// POST /api/roi/calculate (public — no auth required)
router.post('/calculate', async (req: Request, res: Response) => {
  try {
    const parsed = roiCalculateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const data = parsed.data;
    const roi = calculateROI(data);

    // Save lead to database
    try {
      await prisma.mktLead.create({
        data: {
          email: data.email,
          name: data.name,
          company: data.companyName,
          jobTitle: data.jobTitle,
          source: 'ROI_CALCULATOR',
          industry: data.industry,
          employeeCount: data.employeeCount,
          isoCount: data.isoCount,
          roiEstimate: roi.totalROI,
        },
      });
    } catch (dbErr) {
      logger.error('Failed to save ROI lead', { error: String(dbErr) });
    }

    // Push to HubSpot (fire-and-forget)
    pushToHubSpot(data, roi).catch((err) => {
      logger.error('HubSpot push failed', { error: String(err) });
    });

    res.json({ success: true, data: roi });
  } catch (error) {
    logger.error('ROI calculation failed', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to calculate ROI' },
    });
  }
});

// GET /api/roi/history (authenticated — protects lead data)
router.get('/history', authenticate, async (req: Request, res: Response) => {
  try {
    const leads = await prisma.mktLead.findMany({
      where: { source: 'ROI_CALCULATOR' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: leads });
  } catch (error) {
    logger.error('Failed to fetch ROI history', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch history' },
    });
  }
});

async function pushToHubSpot(data: z.infer<typeof roiCalculateSchema>, roi: ReturnType<typeof calculateROI>) {
  const apiKey = process.env.HUBSPOT_API_KEY;
  if (!apiKey) return;

  const nameParts = data.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  try {
    await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          email: data.email,
          firstname: firstName,
          lastname: lastName,
          company: data.companyName,
          jobtitle: data.jobTitle || '',
          industry: data.industry || '',
          employee_count: data.employeeCount || '',
          iso_standards_count: String(data.isoCount || 1),
          roi_estimate: String(roi.totalROI),
          lifecyclestage: 'marketingqualifiedlead',
          hs_lead_status: 'NEW',
        },
      }),
    });
  } catch (err) {
    logger.error('HubSpot contact creation failed', { error: String(err) });
  }
}

export { calculateROI };
export default router;
