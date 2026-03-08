// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import express from 'express';
import { prisma } from '../prisma';
import type { ApacFinancialRuleType } from '@ims/database';

const router = express.Router();

// GET /api/financial-rules/:countryCode — all financial rules for country
router.get('/:countryCode', async (req, res) => {
  const countryCode = req.params.countryCode.toUpperCase();

  try {
    const rules = await prisma.apacFinancialRule.findMany({
      where: { countryCode, isActive: true },
      include: { country: true },
      orderBy: [{ ruleType: 'asc' }, { name: 'asc' }],
    });

    return res.json({ success: true, data: rules });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch financial rules' },
    });
  }
});

// GET /api/financial-rules/:countryCode/:type — financial rules by type
router.get('/:countryCode/:type', async (req, res) => {
  const countryCode = req.params.countryCode.toUpperCase();
  const ruleType = req.params.type.toUpperCase() as ApacFinancialRuleType;

  const validTypes: ApacFinancialRuleType[] = [
    'GST', 'VAT', 'SST', 'CORPORATE_TAX', 'WITHHOLDING_TAX', 'PAYROLL_TAX',
    'STAMP_DUTY', 'CUSTOMS_DUTY', 'TRANSFER_PRICING', 'FINANCIAL_REPORTING',
    'AUDIT_REQUIREMENT', 'OTHER',
  ];

  if (!validTypes.includes(ruleType)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Invalid rule type. Must be one of: ${validTypes.join(', ')}`,
      },
    });
  }

  try {
    const rules = await prisma.apacFinancialRule.findMany({
      where: { countryCode, ruleType, isActive: true },
      include: { country: true },
      orderBy: { name: 'asc' },
    });

    return res.json({ success: true, data: rules });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch financial rules by type' },
    });
  }
});

export default router;
