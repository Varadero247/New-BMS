// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import express from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';

const router = express.Router();

const onboardingSchema = z.object({
  primaryCountryCode: z.string().length(2).toUpperCase(),
  operatingCountries: z.array(z.string().length(2).toUpperCase()),
  selectedRegions: z.array(z.string()),
  industryCode: z.string().optional(),
  businessSize: z.enum(['MICRO', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']),
  annualRevenue: z.number().positive().optional(),
  revenueCurrency: z.string().length(3).optional(),
  preferredCurrency: z.string().length(3),
  preferredLocale: z.string(),
  displayCurrency: z.string().length(3),
  taxRegistrationNo: z.string().optional(),
  vatGstNumber: z.string().optional(),
});

// POST /api/onboarding/:organisationId — save regional onboarding data
router.post('/:organisationId', authenticate, async (req, res) => {
  const { organisationId } = req.params;

  const parsed = onboardingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.message },
    });
  }

  const data = parsed.data;

  try {
    const existing = await prisma.apacOnboardingData.findUnique({
      where: { organisationId },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Onboarding data already exists. Use PUT to update.',
        },
      });
    }

    const record = await prisma.apacOnboardingData.create({
      data: {
        organisationId,
        primaryCountryCode: data.primaryCountryCode,
        operatingCountries: data.operatingCountries,
        selectedRegions: data.selectedRegions,
        industryCode: data.industryCode,
        businessSize: data.businessSize,
        annualRevenue: data.annualRevenue,
        revenueCurrency: data.revenueCurrency,
        preferredCurrency: data.preferredCurrency,
        preferredLocale: data.preferredLocale,
        displayCurrency: data.displayCurrency,
        taxRegistrationNo: data.taxRegistrationNo,
        vatGstNumber: data.vatGstNumber,
        completedAt: new Date(),
      },
      include: { primaryCountry: true },
    });

    return res.status(201).json({ success: true, data: record });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create onboarding data' },
    });
  }
});

// GET /api/onboarding/:organisationId — get saved data
router.get('/:organisationId', authenticate, async (req, res) => {
  const { organisationId } = req.params;

  try {
    const record = await prisma.apacOnboardingData.findUnique({
      where: { organisationId },
      include: { primaryCountry: { include: { region: true } } },
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'No onboarding data found for this organisation' },
      });
    }

    return res.json({ success: true, data: record });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch onboarding data' },
    });
  }
});

// PUT /api/onboarding/:organisationId — update data
router.put('/:organisationId', authenticate, async (req, res) => {
  const { organisationId } = req.params;

  const parsed = onboardingSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.message },
    });
  }

  const data = parsed.data;

  try {
    const record = await prisma.apacOnboardingData.upsert({
      where: { organisationId },
      create: {
        organisationId,
        primaryCountryCode: data.primaryCountryCode ?? 'SG',
        operatingCountries: data.operatingCountries ?? [],
        selectedRegions: data.selectedRegions ?? [],
        industryCode: data.industryCode,
        businessSize: data.businessSize ?? 'MEDIUM',
        annualRevenue: data.annualRevenue,
        revenueCurrency: data.revenueCurrency,
        preferredCurrency: data.preferredCurrency ?? 'USD',
        preferredLocale: data.preferredLocale ?? 'en-US',
        displayCurrency: data.displayCurrency ?? 'USD',
        taxRegistrationNo: data.taxRegistrationNo,
        vatGstNumber: data.vatGstNumber,
        completedAt: new Date(),
      },
      update: {
        ...data,
        completedAt: new Date(),
      },
      include: { primaryCountry: { include: { region: true } } },
    });

    return res.json({ success: true, data: record });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update onboarding data' },
    });
  }
});

export default router;
