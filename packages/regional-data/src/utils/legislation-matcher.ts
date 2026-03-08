// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { RegionConfig, LegislationItem } from '../types/region-config.types';

export function getLegislationByCategory(config: RegionConfig, category: LegislationItem['category']): LegislationItem[] {
  return config.legislation.primaryLaws.filter((l) => l.category === category);
}

export function getLegislationForISOStandard(config: RegionConfig, isoStandard: string): LegislationItem[] {
  return config.legislation.primaryLaws.filter((l) => l.relatedISOStandards.includes(isoStandard));
}

export function getLegislationForSector(config: RegionConfig, sector: LegislationItem['applicableTo'][number]): LegislationItem[] {
  return config.legislation.primaryLaws.filter((l) => l.applicableTo.includes('all') || l.applicableTo.includes(sector));
}

export function getMandatoryLegislation(config: RegionConfig): LegislationItem[] {
  return config.legislation.primaryLaws.filter((l) => l.isMandatory);
}

export function getISOAdoptionStatus(config: RegionConfig, isoStandard: string) {
  return config.isoContext.adoptedStandards.find(
    (s) => s.standard === isoStandard || s.standard.includes(isoStandard)
  );
}

export function compareRegions(configs: RegionConfig[], isoStandard: string): {
  countryCode: string;
  countryName: string;
  adoptionStatus: string;
  localStandard?: string;
  certificationBodies: string[];
}[] {
  return configs.map((c) => {
    const adoption = getISOAdoptionStatus(c, isoStandard);
    return {
      countryCode: c.countryCode,
      countryName: c.countryName,
      adoptionStatus: adoption?.adoptionStatus ?? 'NOT_ADOPTED',
      localStandard: adoption?.localStandard,
      certificationBodies: adoption?.certificationBodies ?? [],
    };
  });
}
