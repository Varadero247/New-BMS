import { getRiskColor, getRiskLevel, API_ENDPOINTS, ISO_STANDARD_LABELS, ISO_STANDARD_COLORS } from '../src/index';

// ── getRiskColor ────────────────────────────────────────────────

describe('getRiskColor', () => {
  it('returns green (#22c55e) for LOW scores (≤8)', () => {
    expect(getRiskColor(0)).toBe('#22c55e');
    expect(getRiskColor(1)).toBe('#22c55e');
    expect(getRiskColor(8)).toBe('#22c55e');
  });

  it('returns yellow (#eab308) for MEDIUM scores (9–27)', () => {
    expect(getRiskColor(9)).toBe('#eab308');
    expect(getRiskColor(15)).toBe('#eab308');
    expect(getRiskColor(27)).toBe('#eab308');
  });

  it('returns orange (#f97316) for HIGH scores (28–64)', () => {
    expect(getRiskColor(28)).toBe('#f97316');
    expect(getRiskColor(50)).toBe('#f97316');
    expect(getRiskColor(64)).toBe('#f97316');
  });

  it('returns red (#ef4444) for CRITICAL scores (>64)', () => {
    expect(getRiskColor(65)).toBe('#ef4444');
    expect(getRiskColor(100)).toBe('#ef4444');
    expect(getRiskColor(125)).toBe('#ef4444');
  });
});

// ── getRiskLevel ────────────────────────────────────────────────

describe('getRiskLevel', () => {
  it('returns LOW for scores ≤8', () => {
    expect(getRiskLevel(0)).toBe('LOW');
    expect(getRiskLevel(8)).toBe('LOW');
  });

  it('returns MEDIUM for scores 9–27', () => {
    expect(getRiskLevel(9)).toBe('MEDIUM');
    expect(getRiskLevel(27)).toBe('MEDIUM');
  });

  it('returns HIGH for scores 28–64', () => {
    expect(getRiskLevel(28)).toBe('HIGH');
    expect(getRiskLevel(64)).toBe('HIGH');
  });

  it('returns CRITICAL for scores >64', () => {
    expect(getRiskLevel(65)).toBe('CRITICAL');
    expect(getRiskLevel(125)).toBe('CRITICAL');
  });

  it('getRiskColor and getRiskLevel agree on boundaries', () => {
    const boundaries = [0, 8, 9, 27, 28, 64, 65, 100];
    for (const score of boundaries) {
      const level = getRiskLevel(score);
      const color = getRiskColor(score);
      if (level === 'LOW') expect(color).toBe('#22c55e');
      else if (level === 'MEDIUM') expect(color).toBe('#eab308');
      else if (level === 'HIGH') expect(color).toBe('#f97316');
      else expect(color).toBe('#ef4444');
    }
  });
});

// ── API_ENDPOINTS ───────────────────────────────────────────────

describe('API_ENDPOINTS', () => {
  describe('AUTH', () => {
    it('has correct static paths', () => {
      expect(API_ENDPOINTS.AUTH.LOGIN).toBe('/auth/login');
      expect(API_ENDPOINTS.AUTH.REGISTER).toBe('/auth/register');
      expect(API_ENDPOINTS.AUTH.LOGOUT).toBe('/auth/logout');
      expect(API_ENDPOINTS.AUTH.REFRESH).toBe('/auth/refresh');
      expect(API_ENDPOINTS.AUTH.ME).toBe('/auth/me');
    });
  });

  describe('RISKS', () => {
    it('has correct static paths', () => {
      expect(API_ENDPOINTS.RISKS.LIST).toBe('/risks');
      expect(API_ENDPOINTS.RISKS.MATRIX).toBe('/risks/matrix');
    });

    it('GET(id) generates correct dynamic path', () => {
      expect(API_ENDPOINTS.RISKS.GET('risk-1')).toBe('/risks/risk-1');
    });

    it('UPDATE(id) generates correct dynamic path', () => {
      expect(API_ENDPOINTS.RISKS.UPDATE('abc-123')).toBe('/risks/abc-123');
    });

    it('DELETE(id) generates correct dynamic path', () => {
      expect(API_ENDPOINTS.RISKS.DELETE('del-id')).toBe('/risks/del-id');
    });

    it('BY_STANDARD generates path with ISO standard query param', () => {
      expect(API_ENDPOINTS.RISKS.BY_STANDARD('ISO_9001')).toBe('/risks?standard=ISO_9001');
      expect(API_ENDPOINTS.RISKS.BY_STANDARD('ISO_45001')).toBe('/risks?standard=ISO_45001');
    });
  });

  describe('INCIDENTS', () => {
    it('GET(id) generates correct path', () => {
      expect(API_ENDPOINTS.INCIDENTS.GET('inc-42')).toBe('/incidents/inc-42');
    });

    it('BY_STANDARD generates path with ISO standard', () => {
      expect(API_ENDPOINTS.INCIDENTS.BY_STANDARD('ISO_14001')).toBe(
        '/incidents?standard=ISO_14001'
      );
    });
  });

  describe('LEGAL', () => {
    it('has list and CRUD paths', () => {
      expect(API_ENDPOINTS.LEGAL.LIST).toBe('/legal-requirements');
      expect(API_ENDPOINTS.LEGAL.GET('lr-1')).toBe('/legal-requirements/lr-1');
    });
  });
});

// ── ISO_STANDARD_LABELS & ISO_STANDARD_COLORS ───────────────────

describe('ISO_STANDARD_LABELS', () => {
  it('has human-readable labels for key standards', () => {
    expect(typeof ISO_STANDARD_LABELS['ISO_9001']).toBe('string');
    expect(ISO_STANDARD_LABELS['ISO_9001'].length).toBeGreaterThan(0);
    expect(typeof ISO_STANDARD_LABELS['ISO_45001']).toBe('string');
    expect(typeof ISO_STANDARD_LABELS['ISO_14001']).toBe('string');
  });
});

describe('ISO_STANDARD_COLORS', () => {
  it('has hex color strings for key standards', () => {
    expect(ISO_STANDARD_COLORS['ISO_9001']).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(ISO_STANDARD_COLORS['ISO_45001']).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(ISO_STANDARD_COLORS['ISO_14001']).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});
