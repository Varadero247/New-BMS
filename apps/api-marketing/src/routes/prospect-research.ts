import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { AutomationConfig } from '../config';

const logger = createLogger('api-marketing:prospect');
const router = Router();

const researchSchema = z.object({
  companyName: z.string().min(1),
  website: z.string().url().optional(),
  linkedinUrl: z.string().optional(),
  industry: z.string().optional(),
  sourceContext: z.string().optional(),
});

// POST /api/prospects/research
router.post('/research', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = researchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const data = parsed.data;
    const userId = (req as AuthRequest).user?.id || 'system';

    // Step 1: Companies House lookup (fire and forget on failure)
    let companiesHouseData = null;
    try {
      const chKey = process.env.COMPANIES_HOUSE_API_KEY;
      if (chKey) {
        const chResp = await fetch(
          `https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(data.companyName)}`,
          { headers: { Authorization: `Basic ${Buffer.from(chKey + ':').toString('base64')}` } }
        );
        if (chResp.ok) {
          companiesHouseData = await chResp.json();
        }
      }
    } catch (err) {
      logger.warn('Companies House lookup failed', { error: String(err) });
    }

    // Step 2: AI outreach generation
    let generatedEmail = null;
    try {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (apiKey) {
        const prompt = `You are a B2B SaaS sales expert. Generate a personalised cold outreach email for Nexara IMS.

Company: ${data.companyName}
Industry: ${data.industry || 'Unknown'}
ISO certifications found: none found
Company size: unknown
Source context: ${data.sourceContext || 'none'}

Write a 5-sentence cold outreach email that:
1. Opens with a specific, relevant observation about their business or industry
2. References their industry compliance requirements
3. Names exactly 2-3 Nexara features most relevant to their situation
4. States the specific ROI metric most relevant to their industry
5. Ends with a soft CTA: "Would a 20-minute walkthrough make sense this week?"

Subject line: make it specific and curiosity-driven, under 60 characters.
Sign from: ${AutomationConfig.founder.name}, Founder — Nexara IMS

Return as JSON: {"subject": "...", "body": "..."}`;

        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 500,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (resp.ok) {
          const aiData = await resp.json() as any;
          const text = aiData.content?.[0]?.text || '';
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            generatedEmail = JSON.parse(jsonMatch[0]);
          }
        }
      }
    } catch (err) {
      logger.warn('AI email generation failed', { error: String(err) });
    }

    const research = await prisma.mktProspectResearch.create({
      data: {
        companyName: data.companyName,
        website: data.website,
        industry: data.industry,
        companiesHouseData: companiesHouseData as any,
        generatedEmail: generatedEmail as any,
        sourceContext: data.sourceContext,
        createdBy: userId,
      },
    });

    res.status(201).json({ success: true, data: research });
  } catch (error) {
    logger.error('Prospect research failed', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to research prospect' },
    });
  }
});

// GET /api/prospects
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const prospects = await prisma.mktProspectResearch.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: prospects });
  } catch (error) {
    logger.error('Failed to fetch prospects', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch prospects' },
    });
  }
});

// POST /api/prospects/:id/save-to-hubspot
router.post('/:id/save-to-hubspot', authenticate, async (req: Request, res: Response) => {
  try {
    const prospect = await prisma.mktProspectResearch.findUnique({
      where: { id: req.params.id },
    });

    if (!prospect) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Prospect not found' },
      });
    }

    // Push to HubSpot
    let hubspotDealId = null;
    const apiKey = process.env.HUBSPOT_API_KEY;
    if (apiKey) {
      try {
        const resp = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            properties: {
              dealname: `${prospect.companyName} - Prospect`,
              pipeline: AutomationConfig.hubspot.pipelineId || 'default',
              dealstage: AutomationConfig.hubspot.stageIds.prospecting || 'appointmentscheduled',
            },
          }),
        });

        if (resp.ok) {
          const dealData = await resp.json() as any;
          hubspotDealId = dealData.id;
        }
      } catch (err) {
        logger.error('HubSpot deal creation failed', { error: String(err) });
      }
    }

    if (hubspotDealId) {
      await prisma.mktProspectResearch.update({
        where: { id: req.params.id },
        data: { hubspotDealId, status: 'outreached' },
      });
    }

    res.json({
      success: true,
      data: { hubspotDealId, saved: !!hubspotDealId },
    });
  } catch (error) {
    logger.error('Save to HubSpot failed', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to save to HubSpot' },
    });
  }
});

export default router;
