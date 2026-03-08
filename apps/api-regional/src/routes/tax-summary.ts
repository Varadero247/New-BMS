// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import express from 'express';
import { prisma } from '../prisma';

const router = express.Router();

// GET /api/tax-summary/:countryCode — tax overview card for a country
router.get('/:countryCode', async (req, res) => {
  const countryCode = req.params.countryCode.toUpperCase();

  try {
    const country = await prisma.apacCountry.findUnique({
      where: { code: countryCode },
      select: {
        code: true,
        name: true,
        currency: true,
        currencySymbol: true,
        gstRate: true,
        taxSystem: true,
        locale: true,
      },
    });

    if (!country) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Country '${countryCode}' not found` },
      });
    }

    const rules = await prisma.apacFinancialRule.findMany({
      where: { countryCode, isActive: true },
      select: {
        ruleType: true,
        name: true,
        rate: true,
        governingBody: true,
        filingFrequency: true,
        filingDeadline: true,
        thresholdAmount: true,
        thresholdCurrency: true,
        officialUrl: true,
        description: true,
      },
      orderBy: { ruleType: 'asc' },
    });

    // Compute today's upcoming deadlines
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const upcomingRules = rules.filter((r) => r.filingDeadline).slice(0, 3);

    const summary = {
      country,
      totalTaxObligations: rules.length,
      primaryTaxRules: rules.slice(0, 5),
      upcomingDeadlines: upcomingRules,
      taxSystemNote: country.taxSystem === 'None'
        ? 'This country does not levy GST or VAT.'
        : `Primary tax system: ${country.taxSystem ?? 'N/A'}`,
      generatedAt: new Date().toISOString(),
      currentMonth,
    };

    return res.json({ success: true, data: summary });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch tax summary' },
    });
  }
});

export default router;
