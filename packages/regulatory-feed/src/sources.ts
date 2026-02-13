import { RegulatorySource } from './types';

/**
 * Known regulatory sources for monitoring.
 */
export const REGULATORY_SOURCES: Record<string, RegulatorySource> = {
  uk_hse: {
    id: 'uk_hse',
    name: 'UK Health and Safety Executive',
    url: 'https://www.hse.gov.uk',
    jurisdiction: 'UK',
    updateFrequency: 'weekly',
    categories: ['health-safety', 'occupational-health', 'workplace-safety'],
    description: 'UK HSE publishes guidance, regulations, and enforcement notices for workplace health and safety.',
  },
  uk_ea: {
    id: 'uk_ea',
    name: 'UK Environment Agency',
    url: 'https://www.gov.uk/government/organisations/environment-agency',
    jurisdiction: 'UK',
    updateFrequency: 'weekly',
    categories: ['environment', 'emissions', 'waste', 'water'],
    description: 'Environment Agency regulates environmental protection, water quality, and waste management in England.',
  },
  uk_mhra: {
    id: 'uk_mhra',
    name: 'UK MHRA',
    url: 'https://www.gov.uk/government/organisations/medicines-and-healthcare-products-regulatory-agency',
    jurisdiction: 'UK',
    updateFrequency: 'weekly',
    categories: ['medical-devices', 'pharmaceuticals', 'healthcare'],
    description: 'Medicines and Healthcare products Regulatory Agency regulates medicines and medical devices in the UK.',
  },
  eu_oj: {
    id: 'eu_oj',
    name: 'EU Official Journal',
    url: 'https://eur-lex.europa.eu',
    jurisdiction: 'EU',
    updateFrequency: 'daily',
    categories: ['general', 'environment', 'health-safety', 'quality', 'data-protection'],
    description: 'Official Journal of the European Union publishes EU legislation, directives, and regulations.',
  },
  uae_mohre: {
    id: 'uae_mohre',
    name: 'UAE Ministry of Human Resources and Emiratisation',
    url: 'https://www.mohre.gov.ae',
    jurisdiction: 'UAE',
    updateFrequency: 'monthly',
    categories: ['labour', 'hr', 'health-safety', 'employment'],
    description: 'UAE MOHRE publishes labour regulations, workplace safety standards, and employment laws.',
  },
  uae_dm: {
    id: 'uae_dm',
    name: 'Dubai Municipality',
    url: 'https://www.dm.gov.ae',
    jurisdiction: 'UAE',
    updateFrequency: 'monthly',
    categories: ['environment', 'food-safety', 'building-safety', 'waste'],
    description: 'Dubai Municipality regulates environmental standards, food safety, and building codes.',
  },
  us_osha: {
    id: 'us_osha',
    name: 'US OSHA',
    url: 'https://www.osha.gov',
    jurisdiction: 'US',
    updateFrequency: 'weekly',
    categories: ['health-safety', 'workplace-safety', 'occupational-health'],
    description: 'Occupational Safety and Health Administration sets and enforces workplace safety standards.',
  },
  us_epa: {
    id: 'us_epa',
    name: 'US EPA',
    url: 'https://www.epa.gov',
    jurisdiction: 'US',
    updateFrequency: 'weekly',
    categories: ['environment', 'emissions', 'waste', 'water', 'chemicals'],
    description: 'Environmental Protection Agency protects human health and the environment.',
  },
};

/**
 * Get all regulatory sources for a given jurisdiction.
 */
export function getSourcesByJurisdiction(jurisdiction: string): RegulatorySource[] {
  return Object.values(REGULATORY_SOURCES).filter(
    (s) => s.jurisdiction === jurisdiction || s.jurisdiction === 'GLOBAL',
  );
}

/**
 * Get all regulatory sources for a given category.
 */
export function getSourcesByCategory(category: string): RegulatorySource[] {
  return Object.values(REGULATORY_SOURCES).filter((s) =>
    s.categories.includes(category),
  );
}
