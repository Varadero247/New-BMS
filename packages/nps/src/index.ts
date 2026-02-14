// ============================================
// @ims/nps — In-memory NPS response store with analytics
// ============================================

export interface NpsResponse {
  id: string;
  userId: string;
  orgId: string;
  score: number;
  comment?: string;
  createdAt: string;
}

export interface NpsAnalytics {
  totalResponses: number;
  npsScore: number;
  promoters: number;
  passives: number;
  detractors: number;
  averageScore: number;
  breakdown: Record<number, number>;
}

// ============================================
// In-memory store
// ============================================

const responses: NpsResponse[] = [];
let nextId = 1;

// ============================================
// Core API
// ============================================

export function submitResponse(userId: string, orgId: string, score: number, comment?: string): NpsResponse {
  const response: NpsResponse = {
    id: `nps_${String(nextId++).padStart(4, '0')}`,
    userId,
    orgId,
    score: Math.max(0, Math.min(10, Math.round(score))),
    comment: comment?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  responses.push(response);
  return response;
}

export function getAnalytics(orgId?: string): NpsAnalytics {
  const filtered = orgId ? responses.filter((r) => r.orgId === orgId) : responses;

  if (filtered.length === 0) {
    return {
      totalResponses: 0,
      npsScore: 0,
      promoters: 0,
      passives: 0,
      detractors: 0,
      averageScore: 0,
      breakdown: {},
    };
  }

  let promoters = 0;
  let passives = 0;
  let detractors = 0;
  let sum = 0;
  const breakdown: Record<number, number> = {};

  for (const r of filtered) {
    sum += r.score;
    breakdown[r.score] = (breakdown[r.score] || 0) + 1;

    if (r.score >= 9) {
      promoters++;
    } else if (r.score >= 7) {
      passives++;
    } else {
      detractors++;
    }
  }

  const total = filtered.length;
  const npsScore = Math.round(((promoters - detractors) / total) * 100);

  return {
    totalResponses: total,
    npsScore,
    promoters,
    passives,
    detractors,
    averageScore: Math.round((sum / total) * 10) / 10,
    breakdown,
  };
}

export function listResponses(orgId?: string, limit = 50, offset = 0): { responses: NpsResponse[]; total: number } {
  const filtered = orgId ? responses.filter((r) => r.orgId === orgId) : responses;
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    responses: sorted.slice(offset, offset + limit),
    total: filtered.length,
  };
}
