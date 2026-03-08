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
  compareCountries,
  buildTaxLeagueTable,
  calculateCorporateTax,
  calculateGST,
  calculateWithholdingTax,
  calculateCPF,
  type LegislationItem,
} from '@ims/regional-data';

const router = express.Router();

// ─── Fixed paths FIRST — must precede all /:code* routes ─────────────────────

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

// GET /api/region-config/compare/countries?codes=SG,AU,MY — side-by-side country comparison
router.get('/compare/countries', (req, res) => {
  const raw = (req.query.codes as string) || '';
  const requestedCodes = raw
    .split(',')
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);

  const configs =
    requestedCodes.length > 0
      ? requestedCodes.map((code) => getRegionConfig(code)).filter((c): c is NonNullable<typeof c> => c !== undefined)
      : allRegionConfigs;

  const notFound = requestedCodes.filter((code) => getRegionConfig(code) === undefined);

  return res.json({
    success: true,
    data: {
      countries: compareCountries(configs),
      notFound, // always present; empty array when all codes found
    },
    meta: { total: configs.length },
  });
});

// GET /api/region-config/report/tax — ranked tax comparison across all 20 countries
router.get('/report/tax', (_req, res) => {
  const table = buildTaxLeagueTable(allRegionConfigs);
  return res.json({
    success: true,
    data: {
      rankedByCorpTax: table.byCorpTax.map((r, i) => ({ rank: i + 1, ...r })),
      rankedByGst: table.byGst.map((r, i) => ({ rank: i + 1, ...r })),
      rankedByWithholdingDividends: table.byWithholdingDividends.map((r, i) => ({ rank: i + 1, ...r })),
      rankedByEaseOfBusiness: table.byEaseOfBusiness.map((r, i) => ({ rank: i + 1, ...r })),
      summary: table.summary,
    },
    meta: { total: allRegionConfigs.length },
  });
});

// GET /api/region-config/report/compliance — compliance requirements across all countries
router.get('/report/compliance', (_req, res) => {
  const rows = allRegionConfigs.map((c) => ({
    countryCode: c.countryCode,
    countryName: c.countryName,
    tier: c.tier,
    region: c.region,
    regulatoryBodiesCount: c.legislation.regulatoryBodies.length,
    reportingRequirements: c.legislation.reportingRequirements,
    auditRequirements: c.legislation.auditRequirements,
    mandatoryLawsCount: c.legislation.primaryLaws.filter((l) => l.isMandatory).length,
    totalLawsCount: c.legislation.primaryLaws.length,
    isoStandardsAdopted: c.isoContext.adoptedStandards.length,
    accreditationBody: c.isoContext.accreditationBody,
    dataProtectionAuthority: c.compliance.dataProtectionAuthority,
    dataRetentionYears: c.compliance.dataRetentionYears,
    dueDiligenceRequirements: c.compliance.dueDiligenceRequirements,
    whistleblowerProtection: c.compliance.whistleblowerProtection,
    modernSlaveryAct: c.compliance.modernSlaveryAct,
    esgRequirements: c.compliance.esgRequirements,
  }));
  return res.json({
    success: true,
    data: rows,
    meta: { total: rows.length },
  });
});

// ─── Parameterised routes — after all fixed paths ─────────────────────────────

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
    const cpf = calculateCPF(salaryAmount, config);
    if (cpf !== null) result.payrollTax = cpf;
  }

  return res.json({ success: true, data: result });
});

export default router;
