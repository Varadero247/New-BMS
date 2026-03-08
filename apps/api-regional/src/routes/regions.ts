// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import express from 'express';
import { prisma } from '../prisma';

const router = express.Router();

// GET /api/regions — list all regions with country counts
router.get('/', async (_req, res) => {
  try {
    const regions = await prisma.apacRegion.findMany({
      include: {
        _count: { select: { countries: { where: { isActive: true } } } },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: regions });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch regions' },
    });
  }
});

// GET /api/regions/:name/countries — countries in a region
router.get('/:name/countries', async (req, res) => {
  const { name } = req.params;

  try {
    const region = await prisma.apacRegion.findFirst({
      where: { name: { equals: decodeURIComponent(name), mode: 'insensitive' } },
      include: {
        countries: {
          where: { isActive: true },
          include: {
            _count: {
              select: {
                legislation: { where: { isActive: true } },
                financialRules: { where: { isActive: true } },
              },
            },
          },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!region) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Region '${name}' not found` },
      });
    }

    return res.json({ success: true, data: region });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch region countries' },
    });
  }
});

export default router;
