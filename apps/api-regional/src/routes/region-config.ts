// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import express from 'express';
import {
  allRegionConfigs,
  getRegionConfig,
  getLegislationByCategory,
  getLegislationForISOStandard,
  getMandatoryLegislation,
  getISOAdoptionStatus,
  compareRegions,
  calculateCorporateTax,
  calculateGST,
  calculateWithholdingTax,
  calculateCPF,
  type LegislationItem,
} from '@ims/regional-data';

const router = express.Router();

// GET /api/region-config — list all region configs (summary, no legislation array)
router.get('/', (_req, res) => {
  const summary = allRegionConfigs.map((r) => ({
    countryCode: r.countryCode,
    countryName: r.countryName,
    region: r.region,
    tier: r.tier,
    currency: r.currency,
    timezone: r.timezone,
    languages: r.languages,
    corporateTaxRate: r.finance.corporateTaxRate,
    gstVatRate: r.finance.gstVatRate,
    gstVatName: r.finance.gstVatName,
    fiscalYearEnd: r.finance.fiscalYearEnd,
    easeOfDoingBusinessRank: r.business.easeOfDoingBusinessRank,
    legislationCount: r.legislation.primaryLaws.length,
    isoStandardsCount: r.isoContext.adoptedStandards.length,
  }));
  res.json({ success: true, data: summary, meta: { total: summary.length } });
});

// GET /api/region-config/:code — full config for a country code
router.get('/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const config = getRegionConfig(code);
  if (!config) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `No region config for country code '${code}'` },
    });
  }
  return res.json({ success: true, data: config });
});

// GET /api/region-config/:code/finance — tax & finance config
router.get('/:code/finance', (req, res) => {
  const code = req.params.code.toUpperCase();
  const config = getRegionConfig(code);
  if (!config) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `No region config for '${code}'` },
    });
  }
  return res.json({ success: true, data: { countryCode: code, countryName: config.countryName, finance: config.finance } });
});

// GET /api/region-config/:code/legislation — legislation items with optional category filter
router.get('/:code/legislation', (req, res) => {
  const code = req.params.code.toUpperCase();
  const config = getRegionConfig(code);
  if (!config) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `No region config for '${code}'` },
    });
  }

  const { category, mandatory, iso } = req.query as {
    category?: LegislationItem['category'];
    mandatory?: string;
    iso?: string;
  };

  let laws = config.legislation.primaryLaws;
  if (category) laws = getLegislationByCategory(config, category);
  if (iso) laws = getLegislationForISOStandard(config, iso);
  if (mandatory === 'true') laws = getMandatoryLegislation(config);

  return res.json({
    success: true,
    data: {
      countryCode: code,
      countryName: config.countryName,
      legislation: laws,
      regulatoryBodies: config.legislation.regulatoryBodies,
      reportingRequirements: config.legislation.reportingRequirements,
      auditRequirements: config.legislation.auditRequirements,
    },
    meta: { total: laws.length },
  });
});

// GET /api/region-config/:code/iso — ISO adoption status
router.get('/:code/iso', (req, res) => {
  const code = req.params.code.toUpperCase();
  const config = getRegionConfig(code);
  if (!config) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `No region config for '${code}'` },
    });
  }

  const { standard } = req.query as { standard?: string };
  const adoptedStandards = standard
    ? config.isoContext.adoptedStandards.filter((s) => s.standard.includes(standard))
    : config.isoContext.adoptedStandards;

  return res.json({
    success: true,
    data: {
      countryCode: code,
      countryName: config.countryName,
      accreditationBody: config.isoContext.accreditationBody,
      certificationBodies: config.isoContext.certificationBodies,
      adoptedStandards,
      notes: config.isoContext.notes,
    },
    meta: { total: adoptedStandards.length },
  });
});

// GET /api/region-config/:code/compliance — compliance config
router.get('/:code/compliance', (req, res) => {
  const code = req.params.code.toUpperCase();
  const config = getRegionConfig(code);
  if (!config) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `No region config for '${code}'` },
    });
  }
  return res.json({
    success: true,
    data: { countryCode: code, countryName: config.countryName, compliance: config.compliance },
  });
});

// GET /api/region-config/:code/business — business environment config
router.get('/:code/business', (req, res) => {
  const code = req.params.code.toUpperCase();
  const config = getRegionConfig(code);
  if (!config) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `No region config for '${code}'` },
    });
  }
  return res.json({
    success: true,
    data: { countryCode: code, countryName: config.countryName, business: config.business },
  });
});

// POST /api/region-config/:code/tax-calculate — calculate taxes for given income
router.post('/:code/tax-calculate', (req, res) => {
  const code = req.params.code.toUpperCase();
  const config = getRegionConfig(code);
  if (!config) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `No region config for '${code}'` },
    });
  }

  const { income, transactionAmount, withholdingType, salaryAmount } = req.body as {
    income?: number;
    transactionAmount?: number;
    withholdingType?: 'dividends' | 'interest' | 'royalties' | 'services';
    salaryAmount?: number;
  };

  const result: Record<string, unknown> = {
    countryCode: code,
    countryName: config.countryName,
    currency: config.currency.code,
  };

  if (typeof income === 'number' && income > 0) {
    result.corporateTax = calculateCorporateTax(income, config);
  }

  if (typeof transactionAmount === 'number' && transactionAmount > 0) {
    result.gst = calculateGST(transactionAmount, config);
    result.gstInclusive = calculateGST(transactionAmount, config, true);
  }

  if (typeof transactionAmount === 'number' && withholdingType) {
    result.withholding = calculateWithholdingTax(transactionAmount, withholdingType, config);
  }

  if (typeof salaryAmount === 'number' && salaryAmount > 0) {
    result.payrollTax = calculateCPF(salaryAmount, config);
  }

  return res.json({ success: true, data: result });
});

// GET /api/region-config/compare/iso/:standard — compare ISO adoption across all countries
router.get('/compare/iso/:standard', (req, res) => {
  const standard = decodeURIComponent(req.params.standard);
  const comparison = compareRegions(allRegionConfigs, standard);
  const adopted = comparison.filter((c) => c.adoptionStatus !== 'NOT_ADOPTED');
  return res.json({
    success: true,
    data: {
      isoStandard: standard,
      comparison,
      adoptedCount: adopted.length,
      totalCountries: comparison.length,
    },
    meta: { total: comparison.length },
  });
});

export default router;
