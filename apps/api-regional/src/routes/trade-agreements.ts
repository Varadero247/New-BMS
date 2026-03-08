// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import express from 'express';
import { prisma } from '../prisma';

const router = express.Router();

// GET /api/trade-agreements — all agreements
router.get('/', async (_req, res) => {
  try {
    const agreements = await prisma.apacTradeAgreement.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { countries: true } },
      },
      orderBy: { shortCode: 'asc' },
    });

    res.json({ success: true, data: agreements });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch trade agreements' },
    });
  }
});

// GET /api/trade-agreements/country/:code — agreements for a country
// NOTE: Named route must come BEFORE /:shortCode to avoid route shadowing
router.get('/country/:code', async (req, res) => {
  const countryCode = req.params.code.toUpperCase();

  try {
    const memberships = await prisma.apacCountryTradeAgreement.findMany({
      where: { countryCode },
      include: {
        tradeAgreement: {
          include: {
            _count: { select: { countries: true } },
          },
        },
      },
      orderBy: { tradeAgreement: { shortCode: 'asc' } },
    });

    return res.json({ success: true, data: memberships.map((m) => m.tradeAgreement) });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch country trade agreements' },
    });
  }
});

// GET /api/trade-agreements/:shortCode — specific agreement with member countries
router.get('/:shortCode', async (req, res) => {
  const shortCode = req.params.shortCode.toUpperCase();

  try {
    const agreement = await prisma.apacTradeAgreement.findUnique({
      where: { shortCode },
      include: {
        countries: {
          include: {
            country: {
              select: {
                code: true,
                name: true,
                currency: true,
                currencySymbol: true,
                locale: true,
              },
            },
          },
        },
      },
    });

    if (!agreement) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Trade agreement '${shortCode}' not found` },
      });
    }

    return res.json({ success: true, data: agreement });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch trade agreement' },
    });
  }
});

export default router;
