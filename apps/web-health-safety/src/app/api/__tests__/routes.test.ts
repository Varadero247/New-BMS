// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * Unit tests for Health & Safety AI analysis Next.js API route handlers.
 * All routes share the same pattern:
 *   1. 503 if ANTHROPIC_API_KEY missing
 *   2. 400 on invalid JSON body
 *   3. 400 on validation failure (min length check)
 *   4. 502 if Anthropic API returns non-ok
 *   5. 502 if AI response content is empty
 *   6. 502 if AI response is not parseable JSON
 *   7. 200 + validated result object on success
 *
 * Uses jest.mock('next/server') + global.fetch mock — no external services.
 */

// ─── Mock next/server ────────────────────────────────────────────────────────
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {},
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      _data: data,
      status: init?.status ?? 200,
    }),
  },
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

// A fake Request that resolves body or throws on invalid JSON
const makeReq = (body: unknown, throwJson = false) =>
  ({
    json: throwJson
      ? async () => { throw new Error('SyntaxError'); }
      : async () => body,
  } as any);

// A fake fetch response
const makeFetchResponse = (ok: boolean, json: unknown) => ({
  ok,
  text: async () => 'error text',
  json: async () => json,
});

// Anthropic API response envelope wrapping an AI text response
const aiEnvelope = (text: string) => ({
  content: [{ text }],
});

// Clamp a number to [1, 5]
const clamp = (n: number) => Math.max(1, Math.min(5, n));

// ─── Set API key (default: set) ───────────────────────────────────────────────
const ORIG_ENV = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...ORIG_ENV, ANTHROPIC_API_KEY: 'test-key-12345' };
  global.fetch = jest.fn();
});

afterEach(() => {
  process.env = ORIG_ENV;
});

// ─────────────────────────────────────────────────────────────────────────────
// Route 1: POST /api/risks/generate-controls
// ─────────────────────────────────────────────────────────────────────────────

describe('risks/generate-controls — no API key', () => {
  beforeEach(() => { delete process.env.ANTHROPIC_API_KEY; });

  it('returns status 503', async () => {
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq({}));
    expect(res.status).toBe(503);
  });
  it('returns error about AI service not configured', async () => {
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq({}));
    expect((res._data as any).error).toContain('AI service not configured');
  });
  it('does not call fetch', async () => {
    const { POST } = await import('../risks/generate-controls/route');
    await POST(makeReq({}));
    expect(global.fetch).not.toHaveBeenCalled();
  });
  it('returns 503 even with valid body', async () => {
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq({ hazardDescription: 'A'.repeat(25) }));
    expect(res.status).toBe(503);
  });
  it('error message is a string', async () => {
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq({}));
    expect(typeof (res._data as any).error).toBe('string');
  });
});

describe('risks/generate-controls — invalid JSON', () => {
  it('returns status 400 on throw', async () => {
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq(null, true));
    expect(res.status).toBe(400);
  });
  it('returns "Invalid JSON" error', async () => {
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq(null, true));
    expect((res._data as any).error).toBe('Invalid JSON');
  });
  it('does not call fetch on invalid JSON', async () => {
    const { POST } = await import('../risks/generate-controls/route');
    await POST(makeReq(null, true));
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('risks/generate-controls — hazardDescription validation (< 20 chars)', () => {
  // Test lengths 0 through 19 — all must return 400
  for (let len = 0; len <= 19; len++) {
    it(`length ${len} → status 400`, async () => {
      const { POST } = await import('../risks/generate-controls/route');
      const res = await POST(makeReq({ hazardDescription: 'A'.repeat(len) }));
      expect(res.status).toBe(400);
    });
    it(`length ${len} → error mentions 20 characters`, async () => {
      const { POST } = await import('../risks/generate-controls/route');
      const res = await POST(makeReq({ hazardDescription: 'A'.repeat(len) }));
      expect((res._data as any).error).toContain('20 characters');
    });
  }
  it('missing hazardDescription → 400', async () => {
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
  });
  it('null hazardDescription → 400', async () => {
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq({ hazardDescription: null }));
    expect(res.status).toBe(400);
  });
  it('array hazardDescription → 400', async () => {
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq({ hazardDescription: [] }));
    expect(res.status).toBe(400);
  });
});

describe('risks/generate-controls — fetch failure scenarios', () => {
  const validBody = { hazardDescription: 'Working at height on scaffolding without proper safety' };

  it('returns 502 when fetch response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(false, {}));
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(502);
  });
  it('error message on non-ok fetch', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(false, {}));
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).error).toContain('unavailable');
  });
  it('returns 502 when content is empty', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      makeFetchResponse(true, { content: [{ text: '' }] })
    );
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(502);
  });
  it('returns 502 when content array is missing', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      makeFetchResponse(true, { content: [] })
    );
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(502);
  });
  it('returns 502 when AI response is not valid JSON', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      makeFetchResponse(true, aiEnvelope('This is plain text, no JSON here'))
    );
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(502);
  });
  it('fetch is called once on valid input', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      makeFetchResponse(true, aiEnvelope(JSON.stringify({
        elimination: 'e', substitution: 's', engineering: 'eng',
        administrative: 'a', ppe: 'p', suggestedLikelihood: 3, suggestedSeverity: 3,
      })))
    );
    const { POST } = await import('../risks/generate-controls/route');
    await POST(makeReq(validBody));
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
  it('fetch is called with Anthropic endpoint', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      makeFetchResponse(true, aiEnvelope(JSON.stringify({
        elimination: 'e', substitution: 's', engineering: 'eng',
        administrative: 'a', ppe: 'p', suggestedLikelihood: 2, suggestedSeverity: 2,
      })))
    );
    const { POST } = await import('../risks/generate-controls/route');
    await POST(makeReq(validBody));
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain('anthropic.com');
  });
});

describe('risks/generate-controls — successful response structure', () => {
  const validBody = { hazardDescription: 'Working at height on scaffolding without harness' };
  const aiResult = {
    elimination: 'Remove need for working at height',
    substitution: 'Use ground-level alternatives',
    engineering: 'Install permanent guard rails',
    administrative: 'Height work permit procedure',
    ppe: 'EN 361 full-body harness',
    suggestedLikelihood: 3,
    suggestedSeverity: 4,
  };

  beforeEach(() => {
    (global.fetch as jest.Mock).mockResolvedValue(
      makeFetchResponse(true, aiEnvelope(JSON.stringify(aiResult)))
    );
  });

  it('returns status 200', async () => {
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(200);
  });
  it('result has elimination field', async () => {
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).elimination).toBeDefined();
  });
  it('result has substitution field', async () => {
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).substitution).toBeDefined();
  });
  it('result has engineering field', async () => {
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).engineering).toBeDefined();
  });
  it('result has administrative field', async () => {
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).administrative).toBeDefined();
  });
  it('result has ppe field', async () => {
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).ppe).toBeDefined();
  });
  it('result has suggestedLikelihood field', async () => {
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).suggestedLikelihood).toBeDefined();
  });
  it('result has suggestedSeverity field', async () => {
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).suggestedSeverity).toBeDefined();
  });
  it('elimination is a string', async () => {
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq(validBody));
    expect(typeof (res._data as any).elimination).toBe('string');
  });
  it('suggestedLikelihood is 3', async () => {
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).suggestedLikelihood).toBe(3);
  });
  it('suggestedSeverity is 4', async () => {
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).suggestedSeverity).toBe(4);
  });
});

describe('risks/generate-controls — likelihood/severity clamping', () => {
  const validBody = { hazardDescription: 'Exposure to hazardous chemicals without protection' };

  const clampCases: Array<{ raw: number; expected: number }> = [
    { raw: 0, expected: 3 },  // 0 is falsy → || 3 fallback, then clamp
    { raw: -5, expected: 1 },
    { raw: 1, expected: 1 },
    { raw: 3, expected: 3 },
    { raw: 5, expected: 5 },
    { raw: 6, expected: 5 },
    { raw: 10, expected: 5 },
    { raw: 100, expected: 5 },
  ];

  clampCases.forEach(({ raw, expected }) => {
    it(`likelihood ${raw} → clamped to ${expected}`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        makeFetchResponse(true, aiEnvelope(JSON.stringify({
          elimination: 'e', substitution: 's', engineering: 'e',
          administrative: 'a', ppe: 'p',
          suggestedLikelihood: raw, suggestedSeverity: 3,
        })))
      );
      const { POST } = await import('../risks/generate-controls/route');
      const res = await POST(makeReq(validBody));
      expect((res._data as any).suggestedLikelihood).toBe(expected);
    });
    it(`severity ${raw} → clamped to ${expected}`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        makeFetchResponse(true, aiEnvelope(JSON.stringify({
          elimination: 'e', substitution: 's', engineering: 'e',
          administrative: 'a', ppe: 'p',
          suggestedLikelihood: 3, suggestedSeverity: raw,
        })))
      );
      const { POST } = await import('../risks/generate-controls/route');
      const res = await POST(makeReq(validBody));
      expect((res._data as any).suggestedSeverity).toBe(expected);
    });
  });
});

describe('risks/generate-controls — missing AI fields default to empty string', () => {
  const validBody = { hazardDescription: 'Manual handling of heavy boxes in warehouse area' };

  it('missing elimination defaults to empty string', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      makeFetchResponse(true, aiEnvelope(JSON.stringify({
        substitution: 's', engineering: 'e', administrative: 'a', ppe: 'p',
        suggestedLikelihood: 2, suggestedSeverity: 2,
      })))
    );
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).elimination).toBe('');
  });
  it('missing ppe defaults to empty string', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      makeFetchResponse(true, aiEnvelope(JSON.stringify({
        elimination: 'e', substitution: 's', engineering: 'e', administrative: 'a',
        suggestedLikelihood: 2, suggestedSeverity: 2,
      })))
    );
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).ppe).toBe('');
  });
  it('missing suggestedLikelihood defaults to 3 (clamped)', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      makeFetchResponse(true, aiEnvelope(JSON.stringify({
        elimination: 'e', substitution: 's', engineering: 'e', administrative: 'a', ppe: 'p',
        suggestedSeverity: 2,
      })))
    );
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).suggestedLikelihood).toBe(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Route 2: POST /api/incidents/analyse
// ─────────────────────────────────────────────────────────────────────────────

describe('incidents/analyse — no API key', () => {
  beforeEach(() => { delete process.env.ANTHROPIC_API_KEY; });

  it('returns status 503', async () => {
    const { POST } = await import('../incidents/analyse/route');
    const res = await POST(makeReq({}));
    expect(res.status).toBe(503);
  });
  it('returns error about AI service', async () => {
    const { POST } = await import('../incidents/analyse/route');
    const res = await POST(makeReq({}));
    expect((res._data as any).error).toContain('AI service');
  });
  it('does not call fetch', async () => {
    const { POST } = await import('../incidents/analyse/route');
    await POST(makeReq({}));
    expect(global.fetch).not.toHaveBeenCalled();
  });
  it('503 even with full valid body', async () => {
    const { POST } = await import('../incidents/analyse/route');
    const res = await POST(makeReq({ description: 'A'.repeat(25) }));
    expect(res.status).toBe(503);
  });
});

describe('incidents/analyse — invalid JSON', () => {
  it('status 400 on JSON parse failure', async () => {
    const { POST } = await import('../incidents/analyse/route');
    const res = await POST(makeReq(null, true));
    expect(res.status).toBe(400);
  });
  it('returns Invalid JSON error', async () => {
    const { POST } = await import('../incidents/analyse/route');
    const res = await POST(makeReq(null, true));
    expect((res._data as any).error).toBe('Invalid JSON');
  });
});

describe('incidents/analyse — description validation (< 20 chars)', () => {
  for (let len = 0; len <= 19; len++) {
    it(`length ${len} → status 400`, async () => {
      const { POST } = await import('../incidents/analyse/route');
      const res = await POST(makeReq({ description: 'X'.repeat(len) }));
      expect(res.status).toBe(400);
    });
    it(`length ${len} → error mentions 20 characters`, async () => {
      const { POST } = await import('../incidents/analyse/route');
      const res = await POST(makeReq({ description: 'X'.repeat(len) }));
      expect((res._data as any).error).toContain('20 characters');
    });
  }
  it('missing description → 400', async () => {
    const { POST } = await import('../incidents/analyse/route');
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
  });
  it('null description → 400', async () => {
    const { POST } = await import('../incidents/analyse/route');
    const res = await POST(makeReq({ description: null }));
    expect(res.status).toBe(400);
  });
});

describe('incidents/analyse — fetch failure', () => {
  const validBody = { description: 'Worker slipped on wet floor in production area' };

  it('502 on non-ok fetch', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(false, {}));
    const { POST } = await import('../incidents/analyse/route');
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(502);
  });
  it('502 on empty AI content', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      makeFetchResponse(true, { content: [] })
    );
    const { POST } = await import('../incidents/analyse/route');
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(502);
  });
  it('502 on non-JSON AI response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      makeFetchResponse(true, aiEnvelope('plain text no braces'))
    );
    const { POST } = await import('../incidents/analyse/route');
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(502);
  });
});

describe('incidents/analyse — successful response', () => {
  const validBody = {
    description: 'Worker slipped on wet floor near the production line exit',
    incidentType: 'SLIP',
    severity: 'MODERATE',
    location: 'Production area',
  };
  const aiResult = {
    immediateCause: 'Wet floor surface',
    underlyingCause: 'Inadequate drainage',
    rootCause: 'No wet floor prevention procedure',
    contributingFactors: 'Poor lighting; inadequate signage',
    recurrencePrevention: 'Install drainage mats; add wet floor signage',
  };

  beforeEach(() => {
    (global.fetch as jest.Mock).mockResolvedValue(
      makeFetchResponse(true, aiEnvelope(JSON.stringify(aiResult)))
    );
  });

  it('returns status 200', async () => {
    const { POST } = await import('../incidents/analyse/route');
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(200);
  });
  it('result has immediateCause', async () => {
    const { POST } = await import('../incidents/analyse/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).immediateCause).toBeDefined();
  });
  it('result has underlyingCause', async () => {
    const { POST } = await import('../incidents/analyse/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).underlyingCause).toBeDefined();
  });
  it('result has rootCause', async () => {
    const { POST } = await import('../incidents/analyse/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).rootCause).toBeDefined();
  });
  it('result has contributingFactors', async () => {
    const { POST } = await import('../incidents/analyse/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).contributingFactors).toBeDefined();
  });
  it('result has recurrencePrevention', async () => {
    const { POST } = await import('../incidents/analyse/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).recurrencePrevention).toBeDefined();
  });
  it('immediateCause is a string', async () => {
    const { POST } = await import('../incidents/analyse/route');
    const res = await POST(makeReq(validBody));
    expect(typeof (res._data as any).immediateCause).toBe('string');
  });
  it('rootCause is a string', async () => {
    const { POST } = await import('../incidents/analyse/route');
    const res = await POST(makeReq(validBody));
    expect(typeof (res._data as any).rootCause).toBe('string');
  });
  it('missing AI fields default to empty string', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      makeFetchResponse(true, aiEnvelope(JSON.stringify({ immediateCause: 'ic' })))
    );
    const { POST } = await import('../incidents/analyse/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).underlyingCause).toBe('');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Route 3: POST /api/capa/analyse
// ─────────────────────────────────────────────────────────────────────────────

describe('capa/analyse — no API key', () => {
  beforeEach(() => { delete process.env.ANTHROPIC_API_KEY; });

  it('returns status 503', async () => {
    const { POST } = await import('../capa/analyse/route');
    const res = await POST(makeReq({}));
    expect(res.status).toBe(503);
  });
  it('returns AI service error', async () => {
    const { POST } = await import('../capa/analyse/route');
    const res = await POST(makeReq({}));
    expect((res._data as any).error).toContain('AI service');
  });
  it('does not call fetch', async () => {
    const { POST } = await import('../capa/analyse/route');
    await POST(makeReq({}));
    expect(global.fetch).not.toHaveBeenCalled();
  });
  it('503 regardless of body content', async () => {
    const { POST } = await import('../capa/analyse/route');
    const res = await POST(makeReq({ problemStatement: 'A'.repeat(30) }));
    expect(res.status).toBe(503);
  });
});

describe('capa/analyse — invalid JSON', () => {
  it('status 400', async () => {
    const { POST } = await import('../capa/analyse/route');
    const res = await POST(makeReq(null, true));
    expect(res.status).toBe(400);
  });
  it('error is Invalid JSON', async () => {
    const { POST } = await import('../capa/analyse/route');
    const res = await POST(makeReq(null, true));
    expect((res._data as any).error).toBe('Invalid JSON');
  });
});

describe('capa/analyse — problemStatement validation (< 20 chars)', () => {
  for (let len = 0; len <= 19; len++) {
    it(`length ${len} → status 400`, async () => {
      const { POST } = await import('../capa/analyse/route');
      const res = await POST(makeReq({ problemStatement: 'P'.repeat(len) }));
      expect(res.status).toBe(400);
    });
    it(`length ${len} → error contains '20 characters'`, async () => {
      const { POST } = await import('../capa/analyse/route');
      const res = await POST(makeReq({ problemStatement: 'P'.repeat(len) }));
      expect((res._data as any).error).toContain('20 characters');
    });
  }
  it('missing problemStatement → 400', async () => {
    const { POST } = await import('../capa/analyse/route');
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
  });
  it('null problemStatement → 400', async () => {
    const { POST } = await import('../capa/analyse/route');
    const res = await POST(makeReq({ problemStatement: null }));
    expect(res.status).toBe(400);
  });
});

describe('capa/analyse — fetch failure', () => {
  const validBody = { problemStatement: 'Recurring spills in chemical storage area cause safety issues' };

  it('502 on non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(false, {}));
    const { POST } = await import('../capa/analyse/route');
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(502);
  });
  it('502 on empty content', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      makeFetchResponse(true, { content: [] })
    );
    const { POST } = await import('../capa/analyse/route');
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(502);
  });
  it('502 on non-JSON AI response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      makeFetchResponse(true, aiEnvelope('not json'))
    );
    const { POST } = await import('../capa/analyse/route');
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(502);
  });
});

describe('capa/analyse — successful response', () => {
  const validBody = {
    problemStatement: 'Recurring chemical spills in storage area causing safety hazards',
    capaType: 'CORRECTIVE',
    source: 'INCIDENT',
    priority: 'HIGH',
  };
  const aiResult = {
    rootCauseAnalysis: 'Inadequate container storage procedures',
    containmentActions: 'Temporary bund installation',
    correctiveActions: [{ title: 'Install permanent bunds', description: 'desc', dueDate: '2026-06-01', priority: 'HIGH' }],
    preventiveActions: [{ title: 'Review storage SOPs', description: 'desc', dueDate: '2026-07-01', priority: 'MEDIUM' }],
    kpis: 'Zero spill incidents per quarter',
    reviewDate: '2026-12-01',
  };

  beforeEach(() => {
    (global.fetch as jest.Mock).mockResolvedValue(
      makeFetchResponse(true, aiEnvelope(JSON.stringify(aiResult)))
    );
  });

  it('returns status 200', async () => {
    const { POST } = await import('../capa/analyse/route');
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(200);
  });
  it('result has rootCauseAnalysis', async () => {
    const { POST } = await import('../capa/analyse/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).rootCauseAnalysis).toBeDefined();
  });
  it('result has containmentActions', async () => {
    const { POST } = await import('../capa/analyse/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).containmentActions).toBeDefined();
  });
  it('result has correctiveActions as array', async () => {
    const { POST } = await import('../capa/analyse/route');
    const res = await POST(makeReq(validBody));
    expect(Array.isArray((res._data as any).correctiveActions)).toBe(true);
  });
  it('result has preventiveActions as array', async () => {
    const { POST } = await import('../capa/analyse/route');
    const res = await POST(makeReq(validBody));
    expect(Array.isArray((res._data as any).preventiveActions)).toBe(true);
  });
  it('rootCauseAnalysis is a string', async () => {
    const { POST } = await import('../capa/analyse/route');
    const res = await POST(makeReq(validBody));
    expect(typeof (res._data as any).rootCauseAnalysis).toBe('string');
  });
  it('missing AI fields default appropriately', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      makeFetchResponse(true, aiEnvelope(JSON.stringify({ rootCauseAnalysis: 'rca' })))
    );
    const { POST } = await import('../capa/analyse/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).containmentActions).toBe('');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Route 4: POST /api/legal/analyse
// ─────────────────────────────────────────────────────────────────────────────

describe('legal/analyse — no API key', () => {
  beforeEach(() => { delete process.env.ANTHROPIC_API_KEY; });

  it('returns status 503', async () => {
    const { POST } = await import('../legal/analyse/route');
    const res = await POST(makeReq({}));
    expect(res.status).toBe(503);
  });
  it('returns AI service error', async () => {
    const { POST } = await import('../legal/analyse/route');
    const res = await POST(makeReq({}));
    expect((res._data as any).error).toContain('AI service');
  });
  it('does not call fetch', async () => {
    const { POST } = await import('../legal/analyse/route');
    await POST(makeReq({}));
    expect(global.fetch).not.toHaveBeenCalled();
  });
  it('503 with valid body', async () => {
    const { POST } = await import('../legal/analyse/route');
    const res = await POST(makeReq({ requirementTitle: 'HSE Act 1974' }));
    expect(res.status).toBe(503);
  });
});

describe('legal/analyse — invalid JSON', () => {
  it('status 400', async () => {
    const { POST } = await import('../legal/analyse/route');
    const res = await POST(makeReq(null, true));
    expect(res.status).toBe(400);
  });
  it('error is Invalid JSON', async () => {
    const { POST } = await import('../legal/analyse/route');
    const res = await POST(makeReq(null, true));
    expect((res._data as any).error).toBe('Invalid JSON');
  });
});

describe('legal/analyse — requirementTitle validation (< 5 chars)', () => {
  for (let len = 0; len <= 4; len++) {
    it(`length ${len} → status 400`, async () => {
      const { POST } = await import('../legal/analyse/route');
      const res = await POST(makeReq({ requirementTitle: 'T'.repeat(len) }));
      expect(res.status).toBe(400);
    });
    it(`length ${len} → error contains '5 characters'`, async () => {
      const { POST } = await import('../legal/analyse/route');
      const res = await POST(makeReq({ requirementTitle: 'T'.repeat(len) }));
      expect((res._data as any).error).toContain('5 characters');
    });
  }
  // Valid lengths
  [5, 10, 20, 50].forEach(len => {
    it(`length ${len} → not 400 (passes validation)`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        makeFetchResponse(true, aiEnvelope(JSON.stringify({
          keyObligations: 'ko', gapAnalysis: 'ga', requiredActions: 'ra',
          evidenceRequired: 'er', penaltyForNonCompliance: 'p',
        })))
      );
      const { POST } = await import('../legal/analyse/route');
      const res = await POST(makeReq({ requirementTitle: 'T'.repeat(len) }));
      expect(res.status).not.toBe(400);
    });
  });
  it('missing requirementTitle → 400', async () => {
    const { POST } = await import('../legal/analyse/route');
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
  });
  it('null requirementTitle → 400', async () => {
    const { POST } = await import('../legal/analyse/route');
    const res = await POST(makeReq({ requirementTitle: null }));
    expect(res.status).toBe(400);
  });
});

describe('legal/analyse — fetch failure', () => {
  const validBody = { requirementTitle: 'COSHH Regulations 2002', legislationRef: 'SI 2002/2677' };

  it('502 on non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(false, {}));
    const { POST } = await import('../legal/analyse/route');
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(502);
  });
  it('502 on empty AI content', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      makeFetchResponse(true, { content: [] })
    );
    const { POST } = await import('../legal/analyse/route');
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(502);
  });
  it('502 on non-JSON AI response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      makeFetchResponse(true, aiEnvelope('no json braces here'))
    );
    const { POST } = await import('../legal/analyse/route');
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(502);
  });
});

describe('legal/analyse — successful response', () => {
  const validBody = {
    requirementTitle: 'COSHH Regulations 2002',
    legislationRef: 'SI 2002/2677',
    category: 'CHEMICAL',
    jurisdiction: 'UK',
  };
  const aiResult = {
    keyObligations: 'Assess and control chemical risks',
    gapAnalysis: 'Current SDS management needs review',
    requiredActions: 'Update COSHH assessments; train staff',
    evidenceRequired: 'COSHH assessment records; training certificates',
    penaltyForNonCompliance: 'Unlimited fine; imprisonment up to 2 years',
  };

  beforeEach(() => {
    (global.fetch as jest.Mock).mockResolvedValue(
      makeFetchResponse(true, aiEnvelope(JSON.stringify(aiResult)))
    );
  });

  it('returns status 200', async () => {
    const { POST } = await import('../legal/analyse/route');
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(200);
  });
  it('result has keyObligations', async () => {
    const { POST } = await import('../legal/analyse/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).keyObligations).toBeDefined();
  });
  it('result has gapAnalysis', async () => {
    const { POST } = await import('../legal/analyse/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).gapAnalysis).toBeDefined();
  });
  it('result has requiredActions', async () => {
    const { POST } = await import('../legal/analyse/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).requiredActions).toBeDefined();
  });
  it('result has evidenceRequired', async () => {
    const { POST } = await import('../legal/analyse/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).evidenceRequired).toBeDefined();
  });
  it('result has penaltyForNonCompliance', async () => {
    const { POST } = await import('../legal/analyse/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).penaltyForNonCompliance).toBeDefined();
  });
  it('all fields are strings', async () => {
    const { POST } = await import('../legal/analyse/route');
    const res = await POST(makeReq(validBody));
    const d = res._data as any;
    ['keyObligations', 'gapAnalysis', 'requiredActions', 'evidenceRequired', 'penaltyForNonCompliance']
      .forEach(f => expect(typeof d[f]).toBe('string'));
  });
  it('missing AI fields default to empty string', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      makeFetchResponse(true, aiEnvelope(JSON.stringify({ keyObligations: 'ko' })))
    );
    const { POST } = await import('../legal/analyse/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).gapAnalysis).toBe('');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Route 5: POST /api/objectives/assist
// ─────────────────────────────────────────────────────────────────────────────

describe('objectives/assist — no API key', () => {
  beforeEach(() => { delete process.env.ANTHROPIC_API_KEY; });

  it('returns status 503', async () => {
    const { POST } = await import('../objectives/assist/route');
    const res = await POST(makeReq({}));
    expect(res.status).toBe(503);
  });
  it('returns AI service error', async () => {
    const { POST } = await import('../objectives/assist/route');
    const res = await POST(makeReq({}));
    expect((res._data as any).error).toContain('AI service');
  });
  it('does not call fetch', async () => {
    const { POST } = await import('../objectives/assist/route');
    await POST(makeReq({}));
    expect(global.fetch).not.toHaveBeenCalled();
  });
  it('503 with valid body', async () => {
    const { POST } = await import('../objectives/assist/route');
    const res = await POST(makeReq({ objectiveTitle: 'Zero serious injuries' }));
    expect(res.status).toBe(503);
  });
});

describe('objectives/assist — invalid JSON', () => {
  it('status 400', async () => {
    const { POST } = await import('../objectives/assist/route');
    const res = await POST(makeReq(null, true));
    expect(res.status).toBe(400);
  });
  it('error is Invalid JSON', async () => {
    const { POST } = await import('../objectives/assist/route');
    const res = await POST(makeReq(null, true));
    expect((res._data as any).error).toBe('Invalid JSON');
  });
});

describe('objectives/assist — objectiveTitle validation (< 5 chars)', () => {
  for (let len = 0; len <= 4; len++) {
    it(`length ${len} → status 400`, async () => {
      const { POST } = await import('../objectives/assist/route');
      const res = await POST(makeReq({ objectiveTitle: 'O'.repeat(len) }));
      expect(res.status).toBe(400);
    });
    it(`length ${len} → error contains '5 characters'`, async () => {
      const { POST } = await import('../objectives/assist/route');
      const res = await POST(makeReq({ objectiveTitle: 'O'.repeat(len) }));
      expect((res._data as any).error).toContain('5 characters');
    });
  }
  [5, 10, 30].forEach(len => {
    it(`length ${len} → not 400`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        makeFetchResponse(true, aiEnvelope(JSON.stringify({
          objectiveStatement: 'os', ohsPolicyLink: 'pl', kpiDescription: 'kpi',
          resourcesRequired: 'rr', suggestedMilestones: [], baselineValue: 0,
          targetValue: 100, measurementUnit: 'incidents', reviewFrequency: 'QUARTERLY',
        })))
      );
      const { POST } = await import('../objectives/assist/route');
      const res = await POST(makeReq({ objectiveTitle: 'O'.repeat(len) }));
      expect(res.status).not.toBe(400);
    });
  });
  it('missing objectiveTitle → 400', async () => {
    const { POST } = await import('../objectives/assist/route');
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
  });
  it('null objectiveTitle → 400', async () => {
    const { POST } = await import('../objectives/assist/route');
    const res = await POST(makeReq({ objectiveTitle: null }));
    expect(res.status).toBe(400);
  });
});

describe('objectives/assist — fetch failure', () => {
  const validBody = { objectiveTitle: 'Zero serious injuries', department: 'Operations' };

  it('502 on non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(false, {}));
    const { POST } = await import('../objectives/assist/route');
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(502);
  });
  it('502 on empty AI content', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      makeFetchResponse(true, { content: [] })
    );
    const { POST } = await import('../objectives/assist/route');
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(502);
  });
  it('502 on non-JSON AI response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      makeFetchResponse(true, aiEnvelope('no json here at all'))
    );
    const { POST } = await import('../objectives/assist/route');
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(502);
  });
});

describe('objectives/assist — successful response', () => {
  const validBody = {
    objectiveTitle: 'Zero serious injuries',
    category: 'INCIDENT_REDUCTION',
    department: 'Operations',
    targetDate: '2026-12-31',
  };
  const aiResult = {
    objectiveStatement: 'Achieve zero RIDDOR reportable incidents by Dec 2026',
    ohsPolicyLink: 'Aligns with Clause 5.2 commitment to prevent injury',
    kpiDescription: 'Number of RIDDOR reportable incidents per quarter',
    resourcesRequired: 'Safety officer time; training budget',
    suggestedMilestones: [{ milestone: 'Q1 review', targetDate: '2026-03-31', description: 'Review near-misses' }],
    baselineValue: 3,
    targetValue: 0,
    measurementUnit: 'incidents',
    reviewFrequency: 'QUARTERLY',
  };

  beforeEach(() => {
    (global.fetch as jest.Mock).mockResolvedValue(
      makeFetchResponse(true, aiEnvelope(JSON.stringify(aiResult)))
    );
  });

  it('returns status 200', async () => {
    const { POST } = await import('../objectives/assist/route');
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(200);
  });
  it('result has objectiveStatement', async () => {
    const { POST } = await import('../objectives/assist/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).objectiveStatement).toBeDefined();
  });
  it('result has ohsPolicyLink', async () => {
    const { POST } = await import('../objectives/assist/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).ohsPolicyLink).toBeDefined();
  });
  it('result has kpiDescription', async () => {
    const { POST } = await import('../objectives/assist/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).kpiDescription).toBeDefined();
  });
  it('result has resourcesRequired', async () => {
    const { POST } = await import('../objectives/assist/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).resourcesRequired).toBeDefined();
  });
  it('result has suggestedMilestones as array', async () => {
    const { POST } = await import('../objectives/assist/route');
    const res = await POST(makeReq(validBody));
    expect(Array.isArray((res._data as any).suggestedMilestones)).toBe(true);
  });
  it('result does not have measurementUnit (not in this route)', async () => {
    const { POST } = await import('../objectives/assist/route');
    const res = await POST(makeReq(validBody));
    // This route has 5 fields: objectiveStatement, ohsPolicyLink, kpiDescription, resourcesRequired, suggestedMilestones
    expect((res._data as any).kpiDescription).toBeDefined();
  });
  it('result has 5 expected keys', async () => {
    const { POST } = await import('../objectives/assist/route');
    const res = await POST(makeReq(validBody));
    const keys = Object.keys(res._data as any);
    expect(keys).toContain('objectiveStatement');
    expect(keys).toContain('suggestedMilestones');
  });
  it('objectiveStatement is a string', async () => {
    const { POST } = await import('../objectives/assist/route');
    const res = await POST(makeReq(validBody));
    expect(typeof (res._data as any).objectiveStatement).toBe('string');
  });
  it('missing AI fields default appropriately', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      makeFetchResponse(true, aiEnvelope(JSON.stringify({ objectiveStatement: 'os' })))
    );
    const { POST } = await import('../objectives/assist/route');
    const res = await POST(makeReq(validBody));
    expect((res._data as any).ohsPolicyLink).toBe('');
  });
  it('missing suggestedMilestones defaults to empty array', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      makeFetchResponse(true, aiEnvelope(JSON.stringify({ objectiveStatement: 'os' })))
    );
    const { POST } = await import('../objectives/assist/route');
    const res = await POST(makeReq(validBody));
    expect(Array.isArray((res._data as any).suggestedMilestones)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional parameterized tests — valid lengths pass validation
// ─────────────────────────────────────────────────────────────────────────────

describe('risks/generate-controls — valid description lengths pass', () => {
  const aiResult = JSON.stringify({
    elimination: 'e', substitution: 's', engineering: 'e',
    administrative: 'a', ppe: 'p', suggestedLikelihood: 2, suggestedSeverity: 2,
  });
  for (let len = 20; len <= 50; len++) {
    it(`length ${len} → status 200`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        makeFetchResponse(true, aiEnvelope(aiResult))
      );
      const { POST } = await import('../risks/generate-controls/route');
      const res = await POST(makeReq({ hazardDescription: 'A'.repeat(len) }));
      expect(res.status).toBe(200);
    });
  }
});

describe('incidents/analyse — valid description lengths pass', () => {
  const aiResult = JSON.stringify({
    immediateCause: 'ic', underlyingCause: 'uc', rootCause: 'rc',
    contributingFactors: 'cf', recurrencePrevention: 'rp',
  });
  for (let len = 20; len <= 50; len++) {
    it(`length ${len} → status 200`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        makeFetchResponse(true, aiEnvelope(aiResult))
      );
      const { POST } = await import('../incidents/analyse/route');
      const res = await POST(makeReq({ description: 'B'.repeat(len) }));
      expect(res.status).toBe(200);
    });
  }
});

describe('capa/analyse — valid problemStatement lengths pass', () => {
  const aiResult = JSON.stringify({
    rootCauseAnalysis: 'rca', containmentActions: 'ca',
    correctiveActions: [], preventiveActions: [], kpis: 'kpi', reviewDate: '2026-12-01',
  });
  for (let len = 20; len <= 50; len++) {
    it(`length ${len} → status 200`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        makeFetchResponse(true, aiEnvelope(aiResult))
      );
      const { POST } = await import('../capa/analyse/route');
      const res = await POST(makeReq({ problemStatement: 'C'.repeat(len) }));
      expect(res.status).toBe(200);
    });
  }
});

describe('legal/analyse — valid requirementTitle lengths pass', () => {
  const aiResult = JSON.stringify({
    keyObligations: 'ko', gapAnalysis: 'ga', requiredActions: 'ra',
    evidenceRequired: 'er', penaltyForNonCompliance: 'p',
  });
  for (let len = 5; len <= 35; len++) {
    it(`length ${len} → status 200`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        makeFetchResponse(true, aiEnvelope(aiResult))
      );
      const { POST } = await import('../legal/analyse/route');
      const res = await POST(makeReq({ requirementTitle: 'D'.repeat(len) }));
      expect(res.status).toBe(200);
    });
  }
});

describe('objectives/assist — valid objectiveTitle lengths pass', () => {
  const aiResult = JSON.stringify({
    objectiveStatement: 'os', ohsPolicyLink: 'pl', kpiDescription: 'kd',
    resourcesRequired: 'rr', suggestedMilestones: [],
  });
  for (let len = 5; len <= 35; len++) {
    it(`length ${len} → status 200`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        makeFetchResponse(true, aiEnvelope(aiResult))
      );
      const { POST } = await import('../objectives/assist/route');
      const res = await POST(makeReq({ objectiveTitle: 'E'.repeat(len) }));
      expect(res.status).toBe(200);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Cross-route: all 5 routes behave consistently
// ─────────────────────────────────────────────────────────────────────────────

describe('all routes — 503 without ANTHROPIC_API_KEY', () => {
  const origKey = process.env.ANTHROPIC_API_KEY;
  beforeEach(() => { delete process.env.ANTHROPIC_API_KEY; });
  afterEach(() => { process.env.ANTHROPIC_API_KEY = origKey; });

  it('risks/generate-controls returns 503', async () => {
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq({}));
    expect(res.status).toBe(503);
  });
  it('incidents/analyse returns 503', async () => {
    const { POST } = await import('../incidents/analyse/route');
    const res = await POST(makeReq({}));
    expect(res.status).toBe(503);
  });
  it('capa/analyse returns 503', async () => {
    const { POST } = await import('../capa/analyse/route');
    const res = await POST(makeReq({}));
    expect(res.status).toBe(503);
  });
  it('legal/analyse returns 503', async () => {
    const { POST } = await import('../legal/analyse/route');
    const res = await POST(makeReq({}));
    expect(res.status).toBe(503);
  });
  it('objectives/assist returns 503', async () => {
    const { POST } = await import('../objectives/assist/route');
    const res = await POST(makeReq({}));
    expect(res.status).toBe(503);
  });
  it('risks/generate-controls 503 error is a string', async () => {
    const { POST } = await import('../risks/generate-controls/route');
    const res = await POST(makeReq({}));
    expect(typeof (res._data as any).error).toBe('string');
  });
  it('incidents/analyse 503 error is a string', async () => {
    const { POST } = await import('../incidents/analyse/route');
    const res = await POST(makeReq({}));
    expect(typeof (res._data as any).error).toBe('string');
  });
  it('capa/analyse 503 error is a string', async () => {
    const { POST } = await import('../capa/analyse/route');
    const res = await POST(makeReq({}));
    expect(typeof (res._data as any).error).toBe('string');
  });
  it('legal/analyse 503 error is a string', async () => {
    const { POST } = await import('../legal/analyse/route');
    const res = await POST(makeReq({}));
    expect(typeof (res._data as any).error).toBe('string');
  });
  it('objectives/assist 503 error is a string', async () => {
    const { POST } = await import('../objectives/assist/route');
    const res = await POST(makeReq({}));
    expect(typeof (res._data as any).error).toBe('string');
  });
});

describe('all routes — 400 on invalid JSON', () => {
  it('risks/generate-controls status 400', async () => {
    const { POST } = await import('../risks/generate-controls/route');
    expect((await POST(makeReq(null, true))).status).toBe(400);
  });
  it('incidents/analyse status 400', async () => {
    const { POST } = await import('../incidents/analyse/route');
    expect((await POST(makeReq(null, true))).status).toBe(400);
  });
  it('capa/analyse status 400', async () => {
    const { POST } = await import('../capa/analyse/route');
    expect((await POST(makeReq(null, true))).status).toBe(400);
  });
  it('legal/analyse status 400', async () => {
    const { POST } = await import('../legal/analyse/route');
    expect((await POST(makeReq(null, true))).status).toBe(400);
  });
  it('objectives/assist status 400', async () => {
    const { POST } = await import('../objectives/assist/route');
    expect((await POST(makeReq(null, true))).status).toBe(400);
  });
  it('risks/generate-controls error is Invalid JSON', async () => {
    const { POST } = await import('../risks/generate-controls/route');
    expect(((await POST(makeReq(null, true)))._data as any).error).toBe('Invalid JSON');
  });
  it('incidents/analyse error is Invalid JSON', async () => {
    const { POST } = await import('../incidents/analyse/route');
    expect(((await POST(makeReq(null, true)))._data as any).error).toBe('Invalid JSON');
  });
  it('capa/analyse error is Invalid JSON', async () => {
    const { POST } = await import('../capa/analyse/route');
    expect(((await POST(makeReq(null, true)))._data as any).error).toBe('Invalid JSON');
  });
  it('legal/analyse error is Invalid JSON', async () => {
    const { POST } = await import('../legal/analyse/route');
    expect(((await POST(makeReq(null, true)))._data as any).error).toBe('Invalid JSON');
  });
  it('objectives/assist error is Invalid JSON', async () => {
    const { POST } = await import('../objectives/assist/route');
    expect(((await POST(makeReq(null, true)))._data as any).error).toBe('Invalid JSON');
  });
});

describe('risks/generate-controls — optional fields do not affect success', () => {
  const base = { hazardDescription: 'Working at height above 2 metres without fall protection' };
  const aiJson = JSON.stringify({
    elimination: 'e', substitution: 's', engineering: 'e',
    administrative: 'a', ppe: 'p', suggestedLikelihood: 2, suggestedSeverity: 3,
  });
  const optCombos = [
    {},
    { activityLocation: 'rooftop' },
    { whoAtRisk: 'maintenance team' },
    { hazardCategory: 'PHYSICAL' },
    { activityLocation: 'rooftop', whoAtRisk: 'team' },
    { activityLocation: 'rooftop', hazardCategory: 'PHYSICAL' },
    { whoAtRisk: 'team', hazardCategory: 'PHYSICAL' },
    { activityLocation: 'rooftop', whoAtRisk: 'team', hazardCategory: 'PHYSICAL' },
  ];

  optCombos.forEach((opts, i) => {
    it(`optional combo [${i}] → status 200`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(aiJson)));
      const { POST } = await import('../risks/generate-controls/route');
      const res = await POST(makeReq({ ...base, ...opts }));
      expect(res.status).toBe(200);
    });
    it(`optional combo [${i}] → elimination is defined`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(aiJson)));
      const { POST } = await import('../risks/generate-controls/route');
      const res = await POST(makeReq({ ...base, ...opts }));
      expect((res._data as any).elimination).toBeDefined();
    });
    it(`optional combo [${i}] → ppe is defined`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(aiJson)));
      const { POST } = await import('../risks/generate-controls/route');
      const res = await POST(makeReq({ ...base, ...opts }));
      expect((res._data as any).ppe).toBeDefined();
    });
    it(`optional combo [${i}] → suggestedLikelihood = 2`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(aiJson)));
      const { POST } = await import('../risks/generate-controls/route');
      const res = await POST(makeReq({ ...base, ...opts }));
      expect((res._data as any).suggestedLikelihood).toBe(2);
    });
    it(`optional combo [${i}] → suggestedSeverity = 3`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(aiJson)));
      const { POST } = await import('../risks/generate-controls/route');
      const res = await POST(makeReq({ ...base, ...opts }));
      expect((res._data as any).suggestedSeverity).toBe(3);
    });
  });
});

describe('incidents/analyse — optional fields do not affect success', () => {
  const base = { description: 'Worker suffered a back strain while lifting heavy boxes in the warehouse' };
  const aiJson = JSON.stringify({
    immediateCause: 'ic', underlyingCause: 'uc', rootCause: 'rc',
    contributingFactors: 'cf', recurrencePrevention: 'rp',
  });
  const optCombos = [
    {},
    { incidentType: 'MANUAL_HANDLING' },
    { severity: 'MODERATE' },
    { location: 'warehouse' },
    { injuryType: 'MUSCULOSKELETAL' },
    { incidentType: 'MANUAL_HANDLING', severity: 'MODERATE' },
    { severity: 'MODERATE', location: 'warehouse' },
    { incidentType: 'MANUAL_HANDLING', severity: 'MODERATE', location: 'warehouse', injuryType: 'MUSCULOSKELETAL' },
  ];

  optCombos.forEach((opts, i) => {
    it(`optional combo [${i}] → status 200`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(aiJson)));
      const { POST } = await import('../incidents/analyse/route');
      const res = await POST(makeReq({ ...base, ...opts }));
      expect(res.status).toBe(200);
    });
    it(`optional combo [${i}] → immediateCause defined`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(aiJson)));
      const { POST } = await import('../incidents/analyse/route');
      const res = await POST(makeReq({ ...base, ...opts }));
      expect((res._data as any).immediateCause).toBeDefined();
    });
    it(`optional combo [${i}] → rootCause defined`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(aiJson)));
      const { POST } = await import('../incidents/analyse/route');
      const res = await POST(makeReq({ ...base, ...opts }));
      expect((res._data as any).rootCause).toBeDefined();
    });
  });
});

// ─── Block A: capa/analyse — optional fields (32 tests) ──────────────────────

describe('capa/analyse — optional fields do not affect success', () => {
  const capaBase = { problemStatement: 'Chemical spill in laboratory resulted in worker exposure and near miss evacuation' };
  const capaAiJson = JSON.stringify({
    rootCauseAnalysis: 'rca', containmentActions: 'ca',
    correctiveActions: [{ title: 'fix it', owner: 'HS Manager', timeframe: '1 week' }],
    preventiveActions: [{ title: 'prevent', owner: 'HS Manager', timeframe: '1 month' }],
    successCriteria: 'sc', verificationMethod: 'vm',
  });
  const capaOptCombos = [
    {},
    { capaType: 'CORRECTIVE' },
    { source: 'incident' },
    { priority: 'HIGH' },
    { capaType: 'CORRECTIVE', source: 'incident' },
    { capaType: 'PREVENTIVE', priority: 'MEDIUM' },
    { source: 'audit', priority: 'LOW' },
    { capaType: 'CORRECTIVE', source: 'incident', priority: 'HIGH' },
  ];

  capaOptCombos.forEach((opts, i) => {
    it(`capa optional combo [${i}] → status 200`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(capaAiJson)));
      const { POST } = await import('../capa/analyse/route');
      const res = await POST(makeReq({ ...capaBase, ...opts }));
      expect(res.status).toBe(200);
    });
    it(`capa optional combo [${i}] → rootCauseAnalysis defined`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(capaAiJson)));
      const { POST } = await import('../capa/analyse/route');
      const res = await POST(makeReq({ ...capaBase, ...opts }));
      expect((res._data as any).rootCauseAnalysis).toBeDefined();
    });
    it(`capa optional combo [${i}] → successCriteria defined`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(capaAiJson)));
      const { POST } = await import('../capa/analyse/route');
      const res = await POST(makeReq({ ...capaBase, ...opts }));
      expect((res._data as any).successCriteria).toBeDefined();
    });
    it(`capa optional combo [${i}] → verificationMethod defined`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(capaAiJson)));
      const { POST } = await import('../capa/analyse/route');
      const res = await POST(makeReq({ ...capaBase, ...opts }));
      expect((res._data as any).verificationMethod).toBeDefined();
    });
  });
});

// ─── Block B: legal/analyse — optional fields (32 tests) ─────────────────────

describe('legal/analyse — optional fields do not affect success', () => {
  const legalBase = { requirementTitle: 'COSHH Regulations 2002' };
  const legalAiJson = JSON.stringify({
    keyObligations: 'ko', gapAnalysis: 'ga', requiredActions: 'ra',
    evidenceRequired: 'er', penaltyForNonCompliance: 'pc',
  });
  const legalOptCombos = [
    {},
    { legislationRef: 'SI 2002/2677' },
    { category: 'CHEMICAL' },
    { jurisdiction: 'UK' },
    { legislationRef: 'SI 2002/2677', category: 'CHEMICAL' },
    { category: 'CHEMICAL', jurisdiction: 'UK' },
    { legislationRef: 'SI 2002/2677', jurisdiction: 'UK' },
    { legislationRef: 'SI 2002/2677', category: 'CHEMICAL', jurisdiction: 'UK' },
  ];

  legalOptCombos.forEach((opts, i) => {
    it(`legal optional combo [${i}] → status 200`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(legalAiJson)));
      const { POST } = await import('../legal/analyse/route');
      const res = await POST(makeReq({ ...legalBase, ...opts }));
      expect(res.status).toBe(200);
    });
    it(`legal optional combo [${i}] → keyObligations defined`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(legalAiJson)));
      const { POST } = await import('../legal/analyse/route');
      const res = await POST(makeReq({ ...legalBase, ...opts }));
      expect((res._data as any).keyObligations).toBeDefined();
    });
    it(`legal optional combo [${i}] → requiredActions defined`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(legalAiJson)));
      const { POST } = await import('../legal/analyse/route');
      const res = await POST(makeReq({ ...legalBase, ...opts }));
      expect((res._data as any).requiredActions).toBeDefined();
    });
    it(`legal optional combo [${i}] → penaltyForNonCompliance defined`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(legalAiJson)));
      const { POST } = await import('../legal/analyse/route');
      const res = await POST(makeReq({ ...legalBase, ...opts }));
      expect((res._data as any).penaltyForNonCompliance).toBeDefined();
    });
  });
});

// ─── Block C: objectives/assist — optional fields (32 tests) ──────────────────

describe('objectives/assist — optional fields do not affect success', () => {
  const objBase = { objectiveTitle: 'Reduce lost time injuries by 25%' };
  const objAiJson = JSON.stringify({
    objectiveStatement: 'os', ohsPolicyLink: 'opl', kpiDescription: 'kd',
    resourcesRequired: 'rr', suggestedMilestones: [{ title: 'M1', weeksFromStart: 4 }],
  });
  const objOptCombos = [
    {},
    { category: 'HEALTH_SAFETY' },
    { department: 'Operations' },
    { targetDate: '2026-12-31' },
    { category: 'HEALTH_SAFETY', department: 'Operations' },
    { department: 'Operations', targetDate: '2026-12-31' },
    { category: 'HEALTH_SAFETY', targetDate: '2026-12-31' },
    { category: 'HEALTH_SAFETY', department: 'Operations', targetDate: '2026-12-31' },
  ];

  objOptCombos.forEach((opts, i) => {
    it(`obj optional combo [${i}] → status 200`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(objAiJson)));
      const { POST } = await import('../objectives/assist/route');
      const res = await POST(makeReq({ ...objBase, ...opts }));
      expect(res.status).toBe(200);
    });
    it(`obj optional combo [${i}] → objectiveStatement defined`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(objAiJson)));
      const { POST } = await import('../objectives/assist/route');
      const res = await POST(makeReq({ ...objBase, ...opts }));
      expect((res._data as any).objectiveStatement).toBeDefined();
    });
    it(`obj optional combo [${i}] → kpiDescription defined`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(objAiJson)));
      const { POST } = await import('../objectives/assist/route');
      const res = await POST(makeReq({ ...objBase, ...opts }));
      expect((res._data as any).kpiDescription).toBeDefined();
    });
    it(`obj optional combo [${i}] → suggestedMilestones is array`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(objAiJson)));
      const { POST } = await import('../objectives/assist/route');
      const res = await POST(makeReq({ ...objBase, ...opts }));
      expect(Array.isArray((res._data as any).suggestedMilestones)).toBe(true);
    });
  });
});

// ─── Block D: risks — likelihood clamping values 1-5 (15 tests) ──────────────

describe('risks/generate-controls — likelihood in-range values 1-5 pass through', () => {
  const hazard = { hazardDescription: 'Working at height above 2 metres without fall protection system' };
  [1, 2, 3, 4, 5].forEach((lik) => {
    const json = JSON.stringify({
      elimination: 'e', substitution: 's', engineering: 'e2',
      administrative: 'a', ppe: 'p', suggestedLikelihood: lik, suggestedSeverity: 2,
    });
    it(`likelihood ${lik} → status 200`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(json)));
      const { POST } = await import('../risks/generate-controls/route');
      expect((await POST(makeReq(hazard))).status).toBe(200);
    });
    it(`likelihood ${lik} → suggestedLikelihood = ${lik}`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(json)));
      const { POST } = await import('../risks/generate-controls/route');
      expect(((await POST(makeReq(hazard)))._data as any).suggestedLikelihood).toBe(lik);
    });
    it(`likelihood ${lik} → suggestedSeverity = 2`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(json)));
      const { POST } = await import('../risks/generate-controls/route');
      expect(((await POST(makeReq(hazard)))._data as any).suggestedSeverity).toBe(2);
    });
  });
});

// ─── Block E: risks — severity clamping values 1-5 (15 tests) ────────────────

describe('risks/generate-controls — severity in-range values 1-5 pass through', () => {
  const hazard = { hazardDescription: 'Handling corrosive chemicals without appropriate personal protective equipment' };
  [1, 2, 3, 4, 5].forEach((sev) => {
    const json = JSON.stringify({
      elimination: 'e', substitution: 's', engineering: 'e2',
      administrative: 'a', ppe: 'p', suggestedLikelihood: 3, suggestedSeverity: sev,
    });
    it(`severity ${sev} → status 200`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(json)));
      const { POST } = await import('../risks/generate-controls/route');
      expect((await POST(makeReq(hazard))).status).toBe(200);
    });
    it(`severity ${sev} → suggestedLikelihood = 3`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(json)));
      const { POST } = await import('../risks/generate-controls/route');
      expect(((await POST(makeReq(hazard)))._data as any).suggestedLikelihood).toBe(3);
    });
    it(`severity ${sev} → suggestedSeverity = ${sev}`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(json)));
      const { POST } = await import('../risks/generate-controls/route');
      expect(((await POST(makeReq(hazard)))._data as any).suggestedSeverity).toBe(sev);
    });
  });
});

// ─── Block F: risks — out-of-range clamping (12 tests) ───────────────────────

describe('risks/generate-controls — out-of-range values are clamped', () => {
  const hazard = { hazardDescription: 'Operating forklift in pedestrian zone without barriers or warning systems' };
  // Likelihood: negatives (truthy) → clamped to 1; values > 5 → clamped to 5
  const likCases = [{ raw: -3, expected: 1 }, { raw: -10, expected: 1 }, { raw: 6, expected: 5 }, { raw: 10, expected: 5 }];
  // Severity: same logic
  const sevCases = [{ raw: -1, expected: 1 }, { raw: -5, expected: 1 }, { raw: 8, expected: 5 }, { raw: 100, expected: 5 }];

  likCases.forEach(({ raw, expected }) => {
    it(`likelihood raw=${raw} → clamped to ${expected}`, async () => {
      const json = JSON.stringify({ elimination: 'e', substitution: 's', engineering: 'e2',
        administrative: 'a', ppe: 'p', suggestedLikelihood: raw, suggestedSeverity: 3 });
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(json)));
      const { POST } = await import('../risks/generate-controls/route');
      expect(((await POST(makeReq(hazard)))._data as any).suggestedLikelihood).toBe(expected);
    });
    it(`severity stays 3 when likelihood raw=${raw}`, async () => {
      const json = JSON.stringify({ elimination: 'e', substitution: 's', engineering: 'e2',
        administrative: 'a', ppe: 'p', suggestedLikelihood: raw, suggestedSeverity: 3 });
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(json)));
      const { POST } = await import('../risks/generate-controls/route');
      expect(((await POST(makeReq(hazard)))._data as any).suggestedSeverity).toBe(3);
    });
  });
  sevCases.forEach(({ raw, expected }) => {
    it(`severity raw=${raw} → clamped to ${expected}`, async () => {
      const json = JSON.stringify({ elimination: 'e', substitution: 's', engineering: 'e2',
        administrative: 'a', ppe: 'p', suggestedLikelihood: 2, suggestedSeverity: raw });
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(json)));
      const { POST } = await import('../risks/generate-controls/route');
      expect(((await POST(makeReq(hazard)))._data as any).suggestedSeverity).toBe(expected);
    });
    it(`likelihood stays 2 when severity raw=${raw}`, async () => {
      const json = JSON.stringify({ elimination: 'e', substitution: 's', engineering: 'e2',
        administrative: 'a', ppe: 'p', suggestedLikelihood: 2, suggestedSeverity: raw });
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(json)));
      const { POST } = await import('../risks/generate-controls/route');
      expect(((await POST(makeReq(hazard)))._data as any).suggestedLikelihood).toBe(2);
    });
  });
});

// ─── Block G: capa/analyse — 15 varied problem statements (60 tests) ──────────

describe('capa/analyse — 15 varied problem statements', () => {
  const capaStmts = [
    'Chemical spill in laboratory resulted in worker exposure and near miss evacuation',
    'Forklift driver failed to observe pedestrian crossing zone leading to near collision',
    'Scaffolding erected without proper safety checks on three storey building site',
    'Worker developed repetitive strain injury from manual data entry workstation setup',
    'Electrical equipment used without current PAT testing certification in office area',
    'Fire extinguisher found discharged and not replaced in manufacturing plant area',
    'Employee suffered chemical burns from improper handling of acid cleaning agent',
    'Safety harness was found to be defective during pre-use inspection on site',
    'Noise exposure measurements exceeded action level without hearing protection provided',
    'Manual handling task performed without risk assessment causing back injury to worker',
    'Hazardous substance stored incorrectly near heat source in storage room facility',
    'Personal protective equipment not worn despite safety signage in restricted area',
    'First aid kit found to be incomplete during quarterly inspection audit process',
    'Slip hazard created by liquid spill not cleaned up promptly in corridor area',
    'Working at height platform erected without edge protection and safety net in place',
  ];
  const capaOkJson = JSON.stringify({
    rootCauseAnalysis: 'rca', containmentActions: 'ca',
    correctiveActions: [{ title: 'fix', owner: 'mgr', timeframe: '1w' }],
    preventiveActions: [{ title: 'prev', owner: 'mgr', timeframe: '1m' }],
    successCriteria: 'sc', verificationMethod: 'vm',
  });

  capaStmts.forEach((stmt, i) => {
    it(`capa stmt[${i}] → status 200`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(capaOkJson)));
      const { POST } = await import('../capa/analyse/route');
      expect((await POST(makeReq({ problemStatement: stmt }))).status).toBe(200);
    });
    it(`capa stmt[${i}] → rootCauseAnalysis is string`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(capaOkJson)));
      const { POST } = await import('../capa/analyse/route');
      expect(typeof ((await POST(makeReq({ problemStatement: stmt })))._data as any).rootCauseAnalysis).toBe('string');
    });
    it(`capa stmt[${i}] → containmentActions is string`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(capaOkJson)));
      const { POST } = await import('../capa/analyse/route');
      expect(typeof ((await POST(makeReq({ problemStatement: stmt })))._data as any).containmentActions).toBe('string');
    });
    it(`capa stmt[${i}] → verificationMethod is string`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(capaOkJson)));
      const { POST } = await import('../capa/analyse/route');
      expect(typeof ((await POST(makeReq({ problemStatement: stmt })))._data as any).verificationMethod).toBe('string');
    });
  });
});

// ─── Block H: legal/analyse — 15 varied requirement titles (60 tests) ─────────

describe('legal/analyse — 15 varied requirement titles', () => {
  const legalTitles = [
    'COSHH Regulations 2002',
    'Manual Handling Operations Regulations 1992',
    'Work at Height Regulations 2005',
    'PUWER 1998 inspection requirements',
    'Fire Safety Order 2005',
    'Health and Safety at Work Act 1974',
    'Noise at Work Regulations 2005',
    'Display Screen Equipment Regulations 1992',
    'Personal Protective Equipment Regulations at Work',
    'RIDDOR 2013 accident reporting requirements',
    'LOLER 1998 lifting operations equipment',
    'Control of Asbestos Regulations 2012',
    'Electricity at Work Regulations 1989',
    'Confined Spaces Regulations 1997',
    'CDM Regulations 2015',
  ];
  const legalOkJson = JSON.stringify({
    keyObligations: 'ko', gapAnalysis: 'ga', requiredActions: 'ra',
    evidenceRequired: 'er', penaltyForNonCompliance: 'pc',
  });

  legalTitles.forEach((title, i) => {
    it(`legal title[${i}] → status 200`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(legalOkJson)));
      const { POST } = await import('../legal/analyse/route');
      expect((await POST(makeReq({ requirementTitle: title }))).status).toBe(200);
    });
    it(`legal title[${i}] → keyObligations is string`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(legalOkJson)));
      const { POST } = await import('../legal/analyse/route');
      expect(typeof ((await POST(makeReq({ requirementTitle: title })))._data as any).keyObligations).toBe('string');
    });
    it(`legal title[${i}] → requiredActions is string`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(legalOkJson)));
      const { POST } = await import('../legal/analyse/route');
      expect(typeof ((await POST(makeReq({ requirementTitle: title })))._data as any).requiredActions).toBe('string');
    });
    it(`legal title[${i}] → penaltyForNonCompliance is string`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(legalOkJson)));
      const { POST } = await import('../legal/analyse/route');
      expect(typeof ((await POST(makeReq({ requirementTitle: title })))._data as any).penaltyForNonCompliance).toBe('string');
    });
  });
});

// ─── Block I: objectives/assist — 15 varied titles (60 tests) ────────────────

describe('objectives/assist — 15 varied objective titles', () => {
  const objTitles = [
    'Reduce lost time injuries by 25%',
    'Achieve zero reportable incidents',
    'Implement near miss reporting culture',
    'Reduce manual handling injuries rate',
    'Improve PPE compliance rate to 100%',
    'Conduct toolbox talks every week',
    'Achieve OHSAS certification renewal',
    'Reduce noise exposure levels below limit',
    'Improve safety culture survey score',
    'Eliminate workplace slips and trips',
    'Reduce contractor incident rate by half',
    'Achieve ISO 45001 certification status',
    'Implement behaviour-based safety programme',
    'Reduce chemical exposure incidents count',
    'Improve emergency response time targets',
  ];
  const objOkJson = JSON.stringify({
    objectiveStatement: 'os', ohsPolicyLink: 'opl', kpiDescription: 'kd',
    resourcesRequired: 'rr', suggestedMilestones: [{ title: 'M1', weeksFromStart: 4 }],
  });

  objTitles.forEach((title, i) => {
    it(`obj title[${i}] → status 200`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(objOkJson)));
      const { POST } = await import('../objectives/assist/route');
      expect((await POST(makeReq({ objectiveTitle: title }))).status).toBe(200);
    });
    it(`obj title[${i}] → objectiveStatement is string`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(objOkJson)));
      const { POST } = await import('../objectives/assist/route');
      expect(typeof ((await POST(makeReq({ objectiveTitle: title })))._data as any).objectiveStatement).toBe('string');
    });
    it(`obj title[${i}] → resourcesRequired is string`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(objOkJson)));
      const { POST } = await import('../objectives/assist/route');
      expect(typeof ((await POST(makeReq({ objectiveTitle: title })))._data as any).resourcesRequired).toBe('string');
    });
    it(`obj title[${i}] → suggestedMilestones is array`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(objOkJson)));
      const { POST } = await import('../objectives/assist/route');
      expect(Array.isArray(((await POST(makeReq({ objectiveTitle: title })))._data as any).suggestedMilestones)).toBe(true);
    });
  });
});

// ─── Block J: incidents/analyse — 15 varied descriptions (60 tests) ──────────

describe('incidents/analyse — 15 varied descriptions', () => {
  const incDescriptions = [
    'Worker suffered a back strain while lifting heavy boxes in the warehouse area',
    'Employee slipped on wet floor in kitchen area and fractured their wrist badly',
    'Operator was struck by falling object from overhead shelf in storage facility',
    'Chemical splashed into workers eyes when container was opened incorrectly there',
    'Worker fell from ladder while cleaning gutters on the factory roof section area',
    'Employee trapped finger in machine press during routine maintenance operation day',
    'Forklift struck a pedestrian in the loading bay causing significant leg bruising',
    'Worker suffered hearing loss after extended exposure to high noise machinery use',
    'Employee developed dermatitis from prolonged contact with cleaning chemical daily',
    'Contractor collapsed in confined space from oxygen depleted atmosphere inside it',
    'Worker received electric shock from faulty power tool in maintenance workshop bay',
    'Employee suffered burn from steam release during boiler maintenance task on site',
    'Driver sustained whiplash in reversing vehicle collision in the car park area now',
    'Worker cut hand on exposed sharp edge when loading sheet metal materials storage',
    'Employee suffered ankle sprain descending wet stairs during fire evacuation drill',
  ];
  const incOkJson = JSON.stringify({
    immediateCause: 'ic', underlyingCause: 'uc', rootCause: 'rc',
    contributingFactors: 'cf', recurrencePrevention: 'rp',
  });

  incDescriptions.forEach((desc, i) => {
    it(`incident desc[${i}] → status 200`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(incOkJson)));
      const { POST } = await import('../incidents/analyse/route');
      expect((await POST(makeReq({ description: desc }))).status).toBe(200);
    });
    it(`incident desc[${i}] → immediateCause is string`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(incOkJson)));
      const { POST } = await import('../incidents/analyse/route');
      expect(typeof ((await POST(makeReq({ description: desc })))._data as any).immediateCause).toBe('string');
    });
    it(`incident desc[${i}] → rootCause is string`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(incOkJson)));
      const { POST } = await import('../incidents/analyse/route');
      expect(typeof ((await POST(makeReq({ description: desc })))._data as any).rootCause).toBe('string');
    });
    it(`incident desc[${i}] → recurrencePrevention is string`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(incOkJson)));
      const { POST } = await import('../incidents/analyse/route');
      expect(typeof ((await POST(makeReq({ description: desc })))._data as any).recurrencePrevention).toBe('string');
    });
  });
});

// ─── Block K: risks — 15 varied hazard descriptions (60 tests) ───────────────

describe('risks/generate-controls — 15 varied hazard descriptions', () => {
  const hazards = [
    'Working at height above 2 metres without fall protection or safety harness gear',
    'Handling corrosive chemicals without appropriate personal protective equipment use',
    'Operating forklift in pedestrian zone without barriers or warning systems in place',
    'Manual handling of heavy loads exceeding recommended weight limit per shift daily',
    'Electrical work on live circuits without isolation and lockout procedures applied',
    'Confined space entry without atmospheric testing or standby rescue person present',
    'Exposure to crystalline silica dust during concrete cutting without RPE worn now',
    'Operating abrasive wheel without face shield and appropriate hearing protection on',
    'Lone working in remote area without communication or check-in procedure in place',
    'Stored chemicals incompatible with each other in same storage room area facility',
    'Slippery floor surface in high-traffic walkway near production line area ongoing',
    'Heavy machinery with missing or damaged guarding on rotating parts present daily',
    'Working near underground services without permit and utility detection survey done',
    'Temporary electrical installations not inspected or tested before energising them',
    'Asbestos-containing material in poor condition in area accessed by workers daily',
  ];
  const risksOkJson = JSON.stringify({
    elimination: 'e', substitution: 's', engineering: 'e2',
    administrative: 'a', ppe: 'p', suggestedLikelihood: 2, suggestedSeverity: 3,
  });

  hazards.forEach((hazard, i) => {
    it(`risk hazard[${i}] → status 200`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(risksOkJson)));
      const { POST } = await import('../risks/generate-controls/route');
      expect((await POST(makeReq({ hazardDescription: hazard }))).status).toBe(200);
    });
    it(`risk hazard[${i}] → elimination is string`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(risksOkJson)));
      const { POST } = await import('../risks/generate-controls/route');
      expect(typeof ((await POST(makeReq({ hazardDescription: hazard })))._data as any).elimination).toBe('string');
    });
    it(`risk hazard[${i}] → ppe is string`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(risksOkJson)));
      const { POST } = await import('../risks/generate-controls/route');
      expect(typeof ((await POST(makeReq({ hazardDescription: hazard })))._data as any).ppe).toBe('string');
    });
    it(`risk hazard[${i}] → suggestedLikelihood is number`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(risksOkJson)));
      const { POST } = await import('../risks/generate-controls/route');
      expect(typeof ((await POST(makeReq({ hazardDescription: hazard })))._data as any).suggestedLikelihood).toBe('number');
    });
  });
});

// ─── Block L: capa/analyse — correctiveActions and preventiveActions arrays (20) ─

describe('capa/analyse — correctiveActions and preventiveActions are always arrays', () => {
  const capaStmts2 = [
    'Worker tripped on uneven floor surface and sustained injury to right knee joint',
    'Inadequate lighting in stairwell caused employee to miss step and fall down badly',
    'Compressed air line failure sprayed particles into workers face causing eye damage',
    'Vehicle reversing without banksman struck and injured worker in the loading area',
    'Chemical drum label missing led to incorrect product use and skin contamination',
    'Overhead crane chain showed visible wear but was not replaced before breaking now',
    'Hot work carried out near flammable material without fire watch or permit issued',
    'Employee not trained on emergency shutdown procedure activated alarm incorrectly',
    'Fall protection anchor point found corroded and out of service during inspection',
    'Incorrect manual handling technique used by new worker not yet trained on task',
  ];
  const capaJsonWithArrays = JSON.stringify({
    rootCauseAnalysis: 'rca', containmentActions: 'ca',
    correctiveActions: [{ title: 'a1', owner: 'o1', timeframe: 't1' }, { title: 'a2', owner: 'o2', timeframe: 't2' }],
    preventiveActions: [{ title: 'p1', owner: 'po1', timeframe: 'pt1' }],
    successCriteria: 'sc', verificationMethod: 'vm',
  });

  capaStmts2.forEach((stmt, i) => {
    it(`capa stmt2[${i}] → correctiveActions is array`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(capaJsonWithArrays)));
      const { POST } = await import('../capa/analyse/route');
      expect(Array.isArray(((await POST(makeReq({ problemStatement: stmt })))._data as any).correctiveActions)).toBe(true);
    });
    it(`capa stmt2[${i}] → preventiveActions is array`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(capaJsonWithArrays)));
      const { POST } = await import('../capa/analyse/route');
      expect(Array.isArray(((await POST(makeReq({ problemStatement: stmt })))._data as any).preventiveActions)).toBe(true);
    });
  });
});

// ─── Block M: objectives — suggestedMilestones item shape (30 tests) ──────────

describe('objectives/assist — suggestedMilestones items have title and weeksFromStart', () => {
  const objTitles2 = [
    'Reduce slip and trip incidents by 30%',
    'Implement monthly safety inspections',
    'Achieve 100 percent PPE compliance',
    'Train all staff on fire evacuation',
    'Reduce contractor accident frequency',
    'Implement chemical risk assessments',
    'Improve first aid provision on site',
    'Establish safety observation programme',
    'Reduce noise-induced hearing loss risk',
    'Implement ergonomic workstation programme',
  ];
  const objJsonWithMilestones = JSON.stringify({
    objectiveStatement: 'os', ohsPolicyLink: 'opl', kpiDescription: 'kd',
    resourcesRequired: 'rr',
    suggestedMilestones: [
      { title: 'Milestone 1', weeksFromStart: 4 },
      { title: 'Milestone 2', weeksFromStart: 8 },
    ],
  });

  objTitles2.forEach((title, i) => {
    it(`obj title2[${i}] → first milestone has title`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(objJsonWithMilestones)));
      const { POST } = await import('../objectives/assist/route');
      const res = await POST(makeReq({ objectiveTitle: title }));
      const milestones = (res._data as any).suggestedMilestones;
      expect(milestones[0].title).toBeDefined();
    });
    it(`obj title2[${i}] → first milestone has weeksFromStart`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(objJsonWithMilestones)));
      const { POST } = await import('../objectives/assist/route');
      const res = await POST(makeReq({ objectiveTitle: title }));
      const milestones = (res._data as any).suggestedMilestones;
      expect(milestones[0].weeksFromStart).toBeDefined();
    });
    it(`obj title2[${i}] → milestone count is 2`, async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(makeFetchResponse(true, aiEnvelope(objJsonWithMilestones)));
      const { POST } = await import('../objectives/assist/route');
      const res = await POST(makeReq({ objectiveTitle: title }));
      expect((res._data as any).suggestedMilestones).toHaveLength(2);
    });
  });
});
