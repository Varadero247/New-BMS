export type Jurisdiction = 'UK' | 'EU' | 'UAE' | 'US' | 'AU' | 'CA' | 'GLOBAL';

export interface Regulation {
  id: string;
  title: string;
  description: string;
  jurisdiction: Jurisdiction;
  source: string;
  sourceUrl: string;
  publishedDate: Date;
  effectiveDate?: Date;
  categories: string[];
  standards: string[];
  keywords: string[];
  status: 'NEW' | 'UPDATED' | 'REVOKED' | 'ACTIVE';
  fullText?: string;
}

export interface RegulatorySource {
  id: string;
  name: string;
  url: string;
  jurisdiction: Jurisdiction;
  updateFrequency: 'daily' | 'weekly' | 'monthly';
  categories: string[];
  description: string;
}

export interface RelevanceScore {
  regulation: Regulation;
  score: number;
  matchedStandards: string[];
  matchedCategories: string[];
  jurisdictionMatch: boolean;
  industryMatch: boolean;
}

export interface OrgProfile {
  standards: string[];
  industry: string;
  jurisdiction: Jurisdiction;
  categories?: string[];
  keywords?: string[];
}

export interface ImportResult {
  success: boolean;
  regulationId: string;
  legalRegisterId?: string;
  message: string;
}
