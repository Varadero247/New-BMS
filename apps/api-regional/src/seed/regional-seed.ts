// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { PrismaClient } from '@prisma/client';
import {
  allCountries,
  tradeAgreements,
  isoLegislationMappings,
  type CountryData,
  type RegionName,
} from '@ims/regional-data';

const prisma = new PrismaClient();

const REGIONS: Record<RegionName, string> = {
  ASEAN: 'Southeast Asian Nations free trade area covering 10 member states',
  'East Asia': 'East Asian economies including China, Japan, South Korea, Hong Kong, and Taiwan',
  'South Asia': 'South Asian economies including India, Bangladesh, and Sri Lanka',
  Pacific: 'Pacific region including Australia, New Zealand, Fiji, and Papua New Guinea',
  'Middle East': 'Middle Eastern economies including UAE and Saudi Arabia',
};

async function upsertRegions(): Promise<Map<string, string>> {
  const regionIdMap = new Map<string, string>();
  console.log('\n📍 Upserting regions...');

  for (const [regionName, description] of Object.entries(REGIONS)) {
    try {
      const region = await prisma.apacRegion.upsert({
        where: { name: regionName },
        create: { name: regionName, description },
        update: { description },
      });
      regionIdMap.set(regionName, region.id);
      console.log(`  ✓ Region: ${regionName}`);
    } catch (error) {
      console.error(`  ✗ Failed to upsert region ${regionName}:`, error);
    }
  }

  return regionIdMap;
}

async function upsertCountries(regionIdMap: Map<string, string>): Promise<void> {
  console.log('\n🌏 Upserting countries...');

  for (const country of allCountries) {
    const regionId = regionIdMap.get(country.region);
    if (!regionId) {
      console.error(`  ✗ No region found for ${country.code} (region: ${country.region})`);
      continue;
    }

    try {
      await prisma.apacCountry.upsert({
        where: { code: country.code },
        create: {
          code: country.code,
          name: country.name,
          regionId,
          currency: country.currency,
          currencySymbol: country.currencySymbol,
          locale: country.locale,
          dateFormat: country.dateFormat,
          timezone: country.timezone,
          gstRate: country.gstRate,
          taxSystem: country.taxSystem,
          phonePrefix: country.phonePrefix,
          isActive: true,
        },
        update: {
          name: country.name,
          regionId,
          currency: country.currency,
          currencySymbol: country.currencySymbol,
          locale: country.locale,
          dateFormat: country.dateFormat,
          timezone: country.timezone,
          gstRate: country.gstRate,
          taxSystem: country.taxSystem,
          phonePrefix: country.phonePrefix,
        },
      });
      console.log(`  ✓ Country: ${country.code} — ${country.name}`);
    } catch (error) {
      console.error(`  ✗ Failed to upsert country ${country.code}:`, error);
    }
  }
}

async function upsertLegislation(countries: CountryData[]): Promise<void> {
  console.log('\n📜 Upserting legislation...');

  for (const country of countries) {
    for (const leg of country.legislation) {
      try {
        await prisma.apacLegislation.upsert({
          where: {
            // Use a composite unique: countryCode + shortCode — need raw approach
            // Actually we use findFirst + upsert workaround
            id: `placeholder-${country.code}-${leg.shortCode}`,
          },
          create: {
            countryCode: country.code,
            title: leg.title,
            shortCode: leg.shortCode,
            category: leg.category,
            description: leg.description,
            effectiveDate: leg.effectiveDate ? new Date(leg.effectiveDate) : null,
            lastAmended: leg.lastAmended ? new Date(leg.lastAmended) : null,
            governingBody: leg.governingBody,
            officialUrl: leg.officialUrl,
            relevantIsoStds: leg.relevantIsoStds,
            isMandatory: leg.isMandatory,
            penaltyInfo: leg.penaltyInfo,
            complianceNotes: leg.complianceNotes,
            thresholdAmount: leg.thresholdAmount,
            isActive: true,
          },
          update: {
            title: leg.title,
            category: leg.category,
            description: leg.description,
            effectiveDate: leg.effectiveDate ? new Date(leg.effectiveDate) : null,
            lastAmended: leg.lastAmended ? new Date(leg.lastAmended) : null,
            governingBody: leg.governingBody,
            officialUrl: leg.officialUrl,
            relevantIsoStds: leg.relevantIsoStds,
            isMandatory: leg.isMandatory,
            penaltyInfo: leg.penaltyInfo,
            complianceNotes: leg.complianceNotes,
            thresholdAmount: leg.thresholdAmount,
          },
        });
      } catch {
        // id doesn't exist — create instead
        try {
          await prisma.apacLegislation.create({
            data: {
              countryCode: country.code,
              title: leg.title,
              shortCode: leg.shortCode,
              category: leg.category,
              description: leg.description,
              effectiveDate: leg.effectiveDate ? new Date(leg.effectiveDate) : null,
              lastAmended: leg.lastAmended ? new Date(leg.lastAmended) : null,
              governingBody: leg.governingBody,
              officialUrl: leg.officialUrl,
              relevantIsoStds: leg.relevantIsoStds,
              isMandatory: leg.isMandatory,
              penaltyInfo: leg.penaltyInfo,
              complianceNotes: leg.complianceNotes,
              thresholdAmount: leg.thresholdAmount,
              isActive: true,
            },
          });
          console.log(`    ✓ Legislation: ${country.code} — ${leg.shortCode}`);
        } catch (createError) {
          // Already exists with different id — find and update
          try {
            const existing = await prisma.apacLegislation.findFirst({
              where: { countryCode: country.code, shortCode: leg.shortCode },
            });
            if (existing) {
              await prisma.apacLegislation.update({
                where: { id: existing.id },
                data: {
                  title: leg.title,
                  category: leg.category,
                  description: leg.description,
                  effectiveDate: leg.effectiveDate ? new Date(leg.effectiveDate) : null,
                  lastAmended: leg.lastAmended ? new Date(leg.lastAmended) : null,
                  governingBody: leg.governingBody,
                  officialUrl: leg.officialUrl,
                  relevantIsoStds: leg.relevantIsoStds,
                  isMandatory: leg.isMandatory,
                  penaltyInfo: leg.penaltyInfo,
                  complianceNotes: leg.complianceNotes,
                  thresholdAmount: leg.thresholdAmount,
                },
              });
              console.log(`    ↻ Updated legislation: ${country.code} — ${leg.shortCode}`);
            }
          } catch (updateError) {
            console.error(`    ✗ Failed ${country.code} — ${leg.shortCode}:`, updateError);
          }
        }
      }
    }
  }
}

async function upsertFinancialRules(countries: CountryData[]): Promise<void> {
  console.log('\n💰 Upserting financial rules...');

  for (const country of countries) {
    for (const rule of country.financialRules) {
      try {
        const existing = await prisma.apacFinancialRule.findFirst({
          where: { countryCode: country.code, ruleType: rule.ruleType, name: rule.name },
        });

        if (existing) {
          await prisma.apacFinancialRule.update({
            where: { id: existing.id },
            data: {
              rate: rule.rate,
              description: rule.description,
              governingBody: rule.governingBody,
              filingFrequency: rule.filingFrequency,
              filingDeadline: rule.filingDeadline,
              thresholdAmount: rule.thresholdAmount,
              thresholdCurrency: rule.thresholdCurrency,
              officialUrl: rule.officialUrl,
              effectiveFrom: rule.effectiveFrom ? new Date(rule.effectiveFrom) : null,
            },
          });
          console.log(`    ↻ Updated rule: ${country.code} — ${rule.name}`);
        } else {
          await prisma.apacFinancialRule.create({
            data: {
              countryCode: country.code,
              ruleType: rule.ruleType,
              name: rule.name,
              rate: rule.rate,
              description: rule.description,
              governingBody: rule.governingBody,
              filingFrequency: rule.filingFrequency,
              filingDeadline: rule.filingDeadline,
              thresholdAmount: rule.thresholdAmount,
              thresholdCurrency: rule.thresholdCurrency,
              officialUrl: rule.officialUrl,
              effectiveFrom: rule.effectiveFrom ? new Date(rule.effectiveFrom) : null,
              isActive: true,
            },
          });
          console.log(`    ✓ Financial rule: ${country.code} — ${rule.name}`);
        }
      } catch (error) {
        console.error(`    ✗ Failed rule ${country.code} — ${rule.name}:`, error);
      }
    }
  }
}

async function upsertTradeAgreements(): Promise<Map<string, string>> {
  const taIdMap = new Map<string, string>();
  console.log('\n🤝 Upserting trade agreements...');

  for (const ta of tradeAgreements) {
    try {
      const record = await prisma.apacTradeAgreement.upsert({
        where: { shortCode: ta.shortCode },
        create: {
          shortCode: ta.shortCode,
          name: ta.name,
          description: ta.description,
          effectiveDate: ta.effectiveDate ? new Date(ta.effectiveDate) : null,
          officialUrl: ta.officialUrl,
          benefits: ta.benefits,
          isActive: true,
        },
        update: {
          name: ta.name,
          description: ta.description,
          effectiveDate: ta.effectiveDate ? new Date(ta.effectiveDate) : null,
          officialUrl: ta.officialUrl,
          benefits: ta.benefits,
        },
      });
      taIdMap.set(ta.shortCode, record.id);
      console.log(`  ✓ Trade agreement: ${ta.shortCode}`);
    } catch (error) {
      console.error(`  ✗ Failed trade agreement ${ta.shortCode}:`, error);
    }
  }

  return taIdMap;
}

async function upsertCountryTradeAgreements(
  countries: CountryData[],
  taIdMap: Map<string, string>
): Promise<void> {
  console.log('\n🔗 Linking countries to trade agreements...');

  for (const country of countries) {
    for (const taShortCode of country.tradeAgreements) {
      const taId = taIdMap.get(taShortCode);
      if (!taId) {
        console.warn(`    ⚠ No trade agreement found for shortCode: ${taShortCode}`);
        continue;
      }

      try {
        await prisma.apacCountryTradeAgreement.upsert({
          where: {
            countryCode_tradeAgreementId: {
              countryCode: country.code,
              tradeAgreementId: taId,
            },
          },
          create: {
            countryCode: country.code,
            tradeAgreementId: taId,
          },
          update: {},
        });
        console.log(`    ✓ ${country.code} — ${taShortCode}`);
      } catch (error) {
        console.error(`    ✗ Failed link ${country.code} — ${taShortCode}:`, error);
      }
    }
  }
}

async function upsertIsoMappings(): Promise<void> {
  console.log('\n🔄 Upserting ISO-legislation mappings...');

  for (const mapping of isoLegislationMappings) {
    try {
      // Find the legislation record
      const legislation = await prisma.apacLegislation.findFirst({
        where: {
          countryCode: mapping.countryCode,
          shortCode: mapping.legislationShortCode,
        },
      });

      if (!legislation) {
        console.warn(
          `    ⚠ Legislation not found: ${mapping.countryCode} — ${mapping.legislationShortCode}`
        );
        continue;
      }

      // Check if mapping already exists
      const existing = await prisma.apacIsoLegislationMapping.findFirst({
        where: {
          countryCode: mapping.countryCode,
          legislationId: legislation.id,
          isoStandard: mapping.isoStandard,
        },
      });

      if (existing) {
        await prisma.apacIsoLegislationMapping.update({
          where: { id: existing.id },
          data: {
            isoClause: mapping.isoClause,
            mappingNotes: mapping.mappingNotes,
          },
        });
        console.log(
          `    ↻ Updated mapping: ${mapping.countryCode} — ${mapping.legislationShortCode} → ${mapping.isoStandard}`
        );
      } else {
        await prisma.apacIsoLegislationMapping.create({
          data: {
            countryCode: mapping.countryCode,
            legislationId: legislation.id,
            isoStandard: mapping.isoStandard,
            isoClause: mapping.isoClause,
            mappingNotes: mapping.mappingNotes,
          },
        });
        console.log(
          `    ✓ Mapping: ${mapping.countryCode} — ${mapping.legislationShortCode} → ${mapping.isoStandard}`
        );
      }
    } catch (error) {
      console.error(
        `    ✗ Failed mapping ${mapping.countryCode} — ${mapping.legislationShortCode}:`,
        error
      );
    }
  }
}

async function main(): Promise<void> {
  console.log('🌏 Starting APAC Regional Localisation Seed...');
  console.log(`  Countries: ${allCountries.length}`);
  console.log(`  Trade agreements: ${tradeAgreements.length}`);
  console.log(`  ISO mappings: ${isoLegislationMappings.length}`);

  try {
    const regionIdMap = await upsertRegions();
    await upsertCountries(regionIdMap);
    await upsertLegislation(allCountries);
    await upsertFinancialRules(allCountries);
    const taIdMap = await upsertTradeAgreements();
    await upsertCountryTradeAgreements(allCountries, taIdMap);
    await upsertIsoMappings();

    // Summary
    const counts = {
      regions: await prisma.apacRegion.count(),
      countries: await prisma.apacCountry.count(),
      legislation: await prisma.apacLegislation.count(),
      financialRules: await prisma.apacFinancialRule.count(),
      tradeAgreements: await prisma.apacTradeAgreement.count(),
      countryTAs: await prisma.apacCountryTradeAgreement.count(),
      isoMappings: await prisma.apacIsoLegislationMapping.count(),
    };

    console.log('\n✅ Seed complete:');
    console.log(`   Regions: ${counts.regions}`);
    console.log(`   Countries: ${counts.countries}`);
    console.log(`   Legislation: ${counts.legislation}`);
    console.log(`   Financial Rules: ${counts.financialRules}`);
    console.log(`   Trade Agreements: ${counts.tradeAgreements}`);
    console.log(`   Country-TA Links: ${counts.countryTAs}`);
    console.log(`   ISO Mappings: ${counts.isoMappings}`);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
