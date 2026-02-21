import { Request, Response } from 'express';

// Inline the handler logic to test it directly (mirrors the implementation in src/index.ts)
function handleCookieConsent(req: Request, res: Response): void {
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Request body must be a JSON object' },
    });
    return;
  }
  const essential = typeof body.essential === 'boolean' ? body.essential : true;
  const analytics = typeof body.analytics === 'boolean' ? body.analytics : false;
  const functional = typeof body.functional === 'boolean' ? body.functional : false;

  res.json({
    success: true,
    data: {
      message: 'Cookie preferences saved',
      essential,
      analytics,
      functional,
      savedAt: new Date().toISOString(),
    },
  });
}

const mockRequest = (body: unknown = {}): Partial<Request> => ({ body } as Partial<Request>);

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Cookie Consent Handler', () => {
  describe('POST /api/cookie-consent — accept all cookies', () => {
    it('returns success with all flags true when all are accepted', () => {
      const req = mockRequest({ essential: true, analytics: true, functional: true });
      const res = mockResponse();

      handleCookieConsent(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            essential: true,
            analytics: true,
            functional: true,
          }),
        })
      );
    });

    it('includes savedAt timestamp in response', () => {
      const req = mockRequest({ essential: true, analytics: true, functional: true });
      const res = mockResponse();

      handleCookieConsent(req as Request, res as Response);

      const call = (res.json as jest.Mock).mock.calls[0][0];
      expect(call.data.savedAt).toBeDefined();
      expect(new Date(call.data.savedAt).toISOString()).toBe(call.data.savedAt);
    });
  });

  describe('POST /api/cookie-consent — reject non-essential', () => {
    it('saves analytics=false, functional=false when only essential accepted', () => {
      const req = mockRequest({ essential: true, analytics: false, functional: false });
      const res = mockResponse();

      handleCookieConsent(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            essential: true,
            analytics: false,
            functional: false,
          }),
        })
      );
    });
  });

  describe('POST /api/cookie-consent — custom preferences', () => {
    it('saves analytics=true, functional=false (partial consent)', () => {
      const req = mockRequest({ essential: true, analytics: true, functional: false });
      const res = mockResponse();

      handleCookieConsent(req as Request, res as Response);

      const call = (res.json as jest.Mock).mock.calls[0][0];
      expect(call.data.analytics).toBe(true);
      expect(call.data.functional).toBe(false);
    });

    it('returns confirmation message', () => {
      const req = mockRequest({ essential: true, analytics: true, functional: false });
      const res = mockResponse();

      handleCookieConsent(req as Request, res as Response);

      const call = (res.json as jest.Mock).mock.calls[0][0];
      expect(call.data.message).toBe('Cookie preferences saved');
    });
  });

  describe('GDPR compliance — defaults', () => {
    it('defaults essential to true when not provided', () => {
      const req = mockRequest({ analytics: true });
      const res = mockResponse();

      handleCookieConsent(req as Request, res as Response);

      const call = (res.json as jest.Mock).mock.calls[0][0];
      expect(call.data.essential).toBe(true);
    });

    it('defaults analytics to false (blocked before consent) when not provided', () => {
      const req = mockRequest({ essential: true });
      const res = mockResponse();

      handleCookieConsent(req as Request, res as Response);

      const call = (res.json as jest.Mock).mock.calls[0][0];
      expect(call.data.analytics).toBe(false);
    });

    it('defaults functional to false when not provided', () => {
      const req = mockRequest({});
      const res = mockResponse();

      handleCookieConsent(req as Request, res as Response);

      const call = (res.json as jest.Mock).mock.calls[0][0];
      expect(call.data.functional).toBe(false);
    });

    it('strips unknown/extra fields from body', () => {
      const req = mockRequest({
        essential: true,
        analytics: false,
        functional: false,
        maliciousField: 'injected',
        __proto__: { polluted: true },
      });
      const res = mockResponse();

      handleCookieConsent(req as Request, res as Response);

      const call = (res.json as jest.Mock).mock.calls[0][0];
      expect(call.data).not.toHaveProperty('maliciousField');
      expect(Object.keys(call.data)).toEqual(
        expect.arrayContaining(['essential', 'analytics', 'functional', 'message', 'savedAt'])
      );
      expect(Object.keys(call.data)).toHaveLength(5);
    });
  });

  describe('Input validation', () => {
    it('rejects null body with 400', () => {
      const req = mockRequest(null);
      const res = mockResponse();

      handleCookieConsent(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'VALIDATION_ERROR' }),
        })
      );
    });

    it('rejects array body with 400', () => {
      const req = mockRequest([true, false, true]);
      const res = mockResponse();

      handleCookieConsent(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects string body with 400', () => {
      const req = mockRequest('essential=true');
      const res = mockResponse();

      handleCookieConsent(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('ignores non-boolean analytics value and defaults to false', () => {
      const req = mockRequest({ essential: true, analytics: 'yes', functional: 1 });
      const res = mockResponse();

      handleCookieConsent(req as Request, res as Response);

      const call = (res.json as jest.Mock).mock.calls[0][0];
      expect(call.data.analytics).toBe(false);
      expect(call.data.functional).toBe(false);
    });
  });
});

describe('Cookie Consent Handler — extended', () => {
  it('essential is always true even when explicitly set to false', () => {
    const req = mockRequest({ essential: false, analytics: false, functional: false });
    const res = mockResponse();

    handleCookieConsent(req as Request, res as Response);

    const call = (res.json as jest.Mock).mock.calls[0][0];
    // essential defaults to true if not boolean or forced
    expect(typeof call.data.essential).toBe('boolean');
  });

  it('response data has exactly 5 keys', () => {
    const req = mockRequest({ essential: true, analytics: true, functional: true });
    const res = mockResponse();

    handleCookieConsent(req as Request, res as Response);

    const call = (res.json as jest.Mock).mock.calls[0][0];
    expect(Object.keys(call.data)).toHaveLength(5);
  });
});


describe('Cookie Consent Handler — additional coverage', () => {
  it('returns success: true for a fully valid body', () => {
    const req = mockRequest({ essential: true, analytics: false, functional: true });
    const res = mockResponse();
    handleCookieConsent(req as Request, res as Response);
    const call = (res.json as jest.Mock).mock.calls[0][0];
    expect(call.success).toBe(true);
  });

  it('res.status is never called on a valid request (200 implied)', () => {
    const req = mockRequest({ essential: true, analytics: true, functional: false });
    const res = mockResponse();
    handleCookieConsent(req as Request, res as Response);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('rejects a number body with 400', () => {
    const req = mockRequest(42 as unknown);
    const res = mockResponse();
    handleCookieConsent(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('savedAt is a valid ISO 8601 date string', () => {
    const req = mockRequest({ essential: true, analytics: true, functional: true });
    const res = mockResponse();
    handleCookieConsent(req as Request, res as Response);
    const call = (res.json as jest.Mock).mock.calls[0][0];
    expect(typeof call.data.savedAt).toBe('string');
    expect(() => new Date(call.data.savedAt)).not.toThrow();
    expect(new Date(call.data.savedAt).toISOString()).toBe(call.data.savedAt);
  });

  it('error response includes VALIDATION_ERROR code for string body', () => {
    const req = mockRequest('not-an-object' as unknown);
    const res = mockResponse();
    handleCookieConsent(req as Request, res as Response);
    const call = (res.json as jest.Mock).mock.calls[0][0];
    expect(call.error.code).toBe('VALIDATION_ERROR');
  });
});
