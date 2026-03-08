// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import express from 'express';
import { prisma } from '../prisma';
import type { ApacLegislationCategory } from '@ims/database';

const router = express.Router();

// GET /api/legislation/iso/:isoStandard — countries with legislation for an ISO standard
// NOTE: This must come BEFORE /:countryCode to avoid route shadowing
router.get('/iso/:isoStandard', async (req, res) => {
  const isoStandard = decodeURIComponent(req.params.isoStandard);

  try {
    const mappings = await prisma.apacIsoLegislationMapping.findMany({
      where: { isoStandard: { contains: isoStandard, mode: 'insensitive' } },
      include: {
        country: true,
        legislation: true,
      },
      orderBy: { countryCode: 'asc' },
    });

    return res.json({ success: true, data: mappings });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch ISO mappings' },
    });
  }
});

// GET /api/legislation/:countryCode — all legislation for country
router.get('/:countryCode', async (req, res) => {
  const countryCode = req.params.countryCode.toUpperCase();

  try {
    const legislation = await prisma.apacLegislation.findMany({
      where: { countryCode, isActive: true },
      include: { country: true },
      orderBy: [{ category: 'asc' }, { title: 'asc' }],
    });

    return res.json({ success: true, data: legislation });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch legislation' },
    });
  }
});

// GET /api/legislation/:countryCode/:category — legislation by category
router.get('/:countryCode/:category', async (req, res) => {
  const countryCode = req.params.countryCode.toUpperCase();
  const category = req.params.category.toUpperCase() as ApacLegislationCategory;

  const validCategories: ApacLegislationCategory[] = [
    'WORKPLACE_SAFETY', 'ENVIRONMENTAL', 'DATA_PRIVACY', 'EMPLOYMENT',
    'ANTI_CORRUPTION', 'FINANCIAL_REPORTING', 'CONSUMER_PROTECTION',
    'IMPORT_EXPORT', 'QUALITY_STANDARDS', 'INFORMATION_SECURITY',
    'FOOD_SAFETY', 'MEDICAL_DEVICES', 'ENERGY', 'ANTI_MONEY_LAUNDERING', 'OTHER',
  ];

  if (!validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      },
    });
  }

  try {
    const legislation = await prisma.apacLegislation.findMany({
      where: { countryCode, category, isActive: true },
      include: { country: true },
      orderBy: { title: 'asc' },
    });

    return res.json({ success: true, data: legislation });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch legislation by category' },
    });
  }
});

export default router;
