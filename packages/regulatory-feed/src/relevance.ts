import { Regulation, RelevanceScore, OrgProfile } from './types';

/**
 * Calculate how relevant a regulation is to an organisation's profile.
 * Score is 0-100, with higher being more relevant.
 *
 * Scoring weights:
 * - Jurisdiction match: 30 points
 * - Standards overlap: 25 points
 * - Category overlap: 20 points
 * - Industry keyword match: 15 points
 * - Recency bonus: 10 points
 *
 * @param regulation - The regulation to score
 * @param orgProfile - Organisation profile with standards, industry, jurisdiction
 * @returns Relevance score with breakdown
 */
export function calculateRelevance(regulation: Regulation, orgProfile: OrgProfile): RelevanceScore {
  let score = 0;
  const matchedStandards: string[] = [];
  const matchedCategories: string[] = [];

  // Jurisdiction match (30 points)
  const jurisdictionMatch =
    regulation.jurisdiction === orgProfile.jurisdiction ||
    regulation.jurisdiction === 'GLOBAL' ||
    (regulation.jurisdiction === 'EU' && orgProfile.jurisdiction === 'UK');

  if (jurisdictionMatch) {
    score += 30;
  }

  // Standards overlap (25 points)
  if (orgProfile.standards && orgProfile.standards.length > 0) {
    for (const standard of orgProfile.standards) {
      const normalizedStandard = standard.toLowerCase();
      const matchesTitle = regulation.title.toLowerCase().includes(normalizedStandard);
      const matchesDesc = regulation.description.toLowerCase().includes(normalizedStandard);
      const matchesStandards = regulation.standards.some(
        (s) =>
          s.toLowerCase().includes(normalizedStandard) ||
          normalizedStandard.includes(s.toLowerCase())
      );

      if (matchesTitle || matchesDesc || matchesStandards) {
        matchedStandards.push(standard);
      }
    }
    if (matchedStandards.length > 0) {
      score += Math.min(25, (matchedStandards.length / orgProfile.standards.length) * 25);
    }
  }

  // Category overlap (20 points)
  const orgCategories = orgProfile.categories || [];
  for (const cat of regulation.categories) {
    if (orgCategories.includes(cat)) {
      matchedCategories.push(cat);
    }
  }
  if (orgCategories.length > 0 && matchedCategories.length > 0) {
    score += Math.min(20, (matchedCategories.length / orgCategories.length) * 20);
  }

  // Industry keyword match (15 points)
  const industryMatch =
    regulation.keywords.some((kw) =>
      kw.toLowerCase().includes(orgProfile.industry.toLowerCase())
    ) || regulation.description.toLowerCase().includes(orgProfile.industry.toLowerCase());

  if (industryMatch) {
    score += 15;
  }

  // Recency bonus (10 points) - regulations from last 30 days get full bonus
  const daysSincePublished = Math.floor(
    (Date.now() - regulation.publishedDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSincePublished <= 30) {
    score += 10;
  } else if (daysSincePublished <= 90) {
    score += 5;
  } else if (daysSincePublished <= 365) {
    score += 2;
  }

  return {
    regulation,
    score: Math.round(score),
    matchedStandards,
    matchedCategories,
    jurisdictionMatch,
    industryMatch,
  };
}

/**
 * Filter regulations by relevance score.
 *
 * @param regulations - Array of regulations to filter
 * @param orgProfile - Organisation profile
 * @param threshold - Minimum relevance score (default: 30)
 * @returns Sorted array of relevant regulations with scores
 */
export function filterRelevant(
  regulations: Regulation[],
  orgProfile: OrgProfile,
  threshold: number = 30
): RelevanceScore[] {
  return regulations
    .map((reg) => calculateRelevance(reg, orgProfile))
    .filter((result) => result.score >= threshold)
    .sort((a, b) => b.score - a.score);
}
