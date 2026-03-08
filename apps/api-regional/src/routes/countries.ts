// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import express from 'express';
import { prisma } from '../prisma';

const router = express.Router();

// GET /api/countries — list all active countries with legislation/rule counts
router.get('/', async (_req, res) => {
  try {
    const countries = await prisma.apacCountry.findMany({
      where: { isActive: true },
      include: {
        region: true,
        _count: {
          select: {
            legislation: { where: { isActive: true } },
            financialRules: { where: { isActive: true } },
            tradeAgreements: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: countries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch countries' },
    });
  }
});

// GET /api/countries/:code — get country by code (uppercase)
router.get('/:code', async (req, res) => {
  const code = req.params.code.toUpperCase();

  try {
    const country = await prisma.apacCountry.findUnique({
      where: { code },
      include: {
        region: true,
        legislation: {
          where: { isActive: true },
          orderBy: { title: 'asc' },
        },
        financialRules: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
        tradeAgreements: {
          include: { tradeAgreement: true },
        },
        isoMappings: {
          include: { legislation: true },
          orderBy: { isoStandard: 'asc' },
        },
      },
    });

    if (!country) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Country '${code}' not found` },
      });
    }

    return res.json({ success: true, data: country });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch country' },
    });
  }
});

export default router;
