// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import express from 'express';
import { prisma } from '../prisma';

const router = express.Router();

// GET /api/iso-mappings/:countryCode/:isoStandard — legislation mapped to ISO standard for a country
router.get('/:countryCode/:isoStandard', async (req, res) => {
  const countryCode = req.params.countryCode.toUpperCase();
  const isoStandard = decodeURIComponent(req.params.isoStandard);

  try {
    const mappings = await prisma.apacIsoLegislationMapping.findMany({
      where: {
        countryCode,
        isoStandard: { contains: isoStandard, mode: 'insensitive' },
      },
      include: {
        legislation: true,
        country: { select: { code: true, name: true, currency: true } },
      },
      orderBy: { isoClause: 'asc' },
    });

    return res.json({ success: true, data: mappings });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch ISO mappings' },
    });
  }
});

export default router;
