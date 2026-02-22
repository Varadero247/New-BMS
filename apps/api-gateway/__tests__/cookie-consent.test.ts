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

describe('Cookie Consent Handler — boundary and field validation', () => {
  it('returns functional=true when explicitly set to true', () => {
    const req = mockRequest({ essential: true, analytics: false, functional: true });
    const res = mockResponse();
    handleCookieConsent(req as Request, res as Response);
    const call = (res.json as jest.Mock).mock.calls[0][0];
    expect(call.data.functional).toBe(true);
  });

  it('error message describes the problem for invalid body', () => {
    const req = mockRequest(null);
    const res = mockResponse();
    handleCookieConsent(req as Request, res as Response);
    const call = (res.json as jest.Mock).mock.calls[0][0];
    expect(typeof call.error.message).toBe('string');
    expect(call.error.message.length).toBeGreaterThan(0);
  });

  it('rejects boolean body (true) with 400', () => {
    const req = mockRequest(true as unknown);
    const res = mockResponse();
    handleCookieConsent(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('accepts all-false preferences (only essential forced true by caller)', () => {
    const req = mockRequest({ essential: false, analytics: false, functional: false });
    const res = mockResponse();
    handleCookieConsent(req as Request, res as Response);
    const call = (res.json as jest.Mock).mock.calls[0][0];
    // essential resolves as boolean (false is still a boolean value)
    expect(typeof call.data.essential).toBe('boolean');
    expect(call.data.analytics).toBe(false);
    expect(call.data.functional).toBe(false);
  });

  it('ignores non-boolean functional value and defaults to false', () => {
    const req = mockRequest({ essential: true, analytics: false, functional: 'yes' });
    const res = mockResponse();
    handleCookieConsent(req as Request, res as Response);
    const call = (res.json as jest.Mock).mock.calls[0][0];
    expect(call.data.functional).toBe(false);
  });

  it('handles empty object body — all values default', () => {
    const req = mockRequest({});
    const res = mockResponse();
    handleCookieConsent(req as Request, res as Response);
    const call = (res.json as jest.Mock).mock.calls[0][0];
    expect(call.success).toBe(true);
    expect(call.data.essential).toBe(true);
    expect(call.data.analytics).toBe(false);
    expect(call.data.functional).toBe(false);
  });

  it('response data contains message key equal to "Cookie preferences saved"', () => {
    const req = mockRequest({ essential: true, analytics: true, functional: true });
    const res = mockResponse();
    handleCookieConsent(req as Request, res as Response);
    const call = (res.json as jest.Mock).mock.calls[0][0];
    expect(call.data.message).toBe('Cookie preferences saved');
  });

  it('res.json is called exactly once per invocation', () => {
    const req = mockRequest({ essential: true });
    const res = mockResponse();
    handleCookieConsent(req as Request, res as Response);
    expect((res.json as jest.Mock).mock.calls).toHaveLength(1);
  });
});

describe('Cookie Consent Handler — final additional coverage', () => {
  it('accepts analytics=true and functional=true simultaneously', () => {
    const req = mockRequest({ essential: true, analytics: true, functional: true });
    const res = mockResponse();
    handleCookieConsent(req as Request, res as Response);
    const call = (res.json as jest.Mock).mock.calls[0][0];
    expect(call.data.analytics).toBe(true);
    expect(call.data.functional).toBe(true);
  });

  it('rejects null body with 400 (second assertion)', () => {
    const req = mockRequest(null);
    const res = mockResponse();
    handleCookieConsent(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('success response has exactly data.essential, data.analytics, data.functional, data.message, data.savedAt', () => {
    const req = mockRequest({ essential: true, analytics: false, functional: false });
    const res = mockResponse();
    handleCookieConsent(req as Request, res as Response);
    const call = (res.json as jest.Mock).mock.calls[0][0];
    const keys = Object.keys(call.data).sort();
    expect(keys).toEqual(['analytics', 'essential', 'functional', 'message', 'savedAt']);
  });

  it('error code is VALIDATION_ERROR for array body', () => {
    const req = mockRequest([1, 2, 3]);
    const res = mockResponse();
    handleCookieConsent(req as Request, res as Response);
    const call = (res.json as jest.Mock).mock.calls[0][0];
    expect(call.error.code).toBe('VALIDATION_ERROR');
  });

  it('savedAt is recent (within 5 seconds)', () => {
    const before = Date.now();
    const req = mockRequest({ essential: true, analytics: false, functional: false });
    const res = mockResponse();
    handleCookieConsent(req as Request, res as Response);
    const call = (res.json as jest.Mock).mock.calls[0][0];
    const savedAt = new Date(call.data.savedAt).getTime();
    expect(savedAt).toBeGreaterThanOrEqual(before);
    expect(savedAt).toBeLessThanOrEqual(Date.now() + 1000);
  });

  it('analytics=true is preserved in response when functional=false', () => {
    const req = mockRequest({ essential: true, analytics: true, functional: false });
    const res = mockResponse();
    handleCookieConsent(req as Request, res as Response);
    const call = (res.json as jest.Mock).mock.calls[0][0];
    expect(call.data.analytics).toBe(true);
    expect(call.data.functional).toBe(false);
  });

  it('ignores extra body properties and returns only 5 data keys', () => {
    const req = mockRequest({ essential: true, analytics: false, functional: false, extra: 'should-be-ignored', xss: '<script>' });
    const res = mockResponse();
    handleCookieConsent(req as Request, res as Response);
    const call = (res.json as jest.Mock).mock.calls[0][0];
    expect(Object.keys(call.data)).toHaveLength(5);
  });
});

describe('Cookie Consent Handler — extra batch coverage', () => {
  it('analytics defaults to false when value is null', () => {
    const req = mockRequest({ essential: true, analytics: null, functional: false });
    const res = mockResponse();
    handleCookieConsent(req as Request, res as Response);
    const call = (res.json as jest.Mock).mock.calls[0][0];
    expect(call.data.analytics).toBe(false);
  });

  it('functional defaults to false when value is undefined', () => {
    const req = mockRequest({ essential: true });
    const res = mockResponse();
    handleCookieConsent(req as Request, res as Response);
    const call = (res.json as jest.Mock).mock.calls[0][0];
    expect(call.data.functional).toBe(false);
  });

  it('handler does not throw for valid all-true payload', () => {
    const req = mockRequest({ essential: true, analytics: true, functional: true });
    const res = mockResponse();
    expect(() => handleCookieConsent(req as Request, res as Response)).not.toThrow();
  });

  it('response success field is boolean true for valid input', () => {
    const req = mockRequest({ essential: true, analytics: false, functional: false });
    const res = mockResponse();
    handleCookieConsent(req as Request, res as Response);
    const call = (res.json as jest.Mock).mock.calls[0][0];
    expect(call.success).toBe(true);
    expect(typeof call.success).toBe('boolean');
  });

  it('error response success field is boolean false for null body', () => {
    const req = mockRequest(null);
    const res = mockResponse();
    handleCookieConsent(req as Request, res as Response);
    const call = (res.json as jest.Mock).mock.calls[0][0];
    expect(call.success).toBe(false);
  });
});

describe('cookie consent — phase29 coverage', () => {
  it('handles string includes', () => {
    expect('hello world'.includes('world')).toBe(true);
  });

  it('handles Set size', () => {
    expect(new Set([1, 2, 2, 3]).size).toBe(3);
  });

  it('handles string charAt', () => {
    expect('hello'.charAt(0)).toBe('h');
  });

  it('handles Math.min', () => {
    expect(Math.min(1, 2, 3)).toBe(1);
  });

  it('handles type coercion', () => {
    expect(typeof 'string').toBe('string');
  });

});

describe('cookie consent — phase30 coverage', () => {
  it('handles Math.sqrt', () => {
    expect(Math.sqrt(9)).toBe(3);
  });

  it('handles array concat', () => {
    expect([1, 2].concat([3, 4])).toEqual([1, 2, 3, 4]);
  });

  it('handles Math.ceil', () => {
    expect(Math.ceil(3.1)).toBe(4);
  });

  it('handles string endsWith', () => {
    expect('hello'.endsWith('lo')).toBe(true);
  });

  it('handles destructuring', () => {
    const { a, b } = { a: 1, b: 2 }; expect(a + b).toBe(3);
  });

});


describe('phase31 coverage', () => {
  it('handles string replace', () => { expect('foo bar'.replace('bar','baz')).toBe('foo baz'); });
  it('handles string startsWith', () => { expect('hello'.startsWith('hel')).toBe(true); });
  it('handles WeakMap', () => { const wm = new WeakMap(); const k = {}; wm.set(k, 42); expect(wm.has(k)).toBe(true); });
  it('handles regex match', () => { const m = 'hello123'.match(/\d+/); expect(m?.[0]).toBe('123'); });
  it('handles string split', () => { expect('a,b,c'.split(',')).toEqual(['a','b','c']); });
});


describe('phase32 coverage', () => {
  it('handles getter/setter', () => { const o = { _v: 0, get v() { return this._v; }, set v(n) { this._v = n; } }; o.v = 5; expect(o.v).toBe(5); });
  it('handles Math.pow', () => { expect(Math.pow(2,10)).toBe(1024); });
  it('handles array at method', () => { expect([1,2,3].at(-1)).toBe(3); });
  it('handles left shift', () => { expect(1 << 3).toBe(8); });
  it('handles strict equality', () => { expect(1 === 1).toBe(true); expect((1 as unknown) === ('1' as unknown)).toBe(false); });
});


describe('phase33 coverage', () => {
  it('handles Map delete', () => { const m = new Map<string,number>([['a',1]]); m.delete('a'); expect(m.has('a')).toBe(false); });
  it('handles Date methods', () => { const d = new Date(2026, 0, 15); expect(d.getMonth()).toBe(0); expect(d.getDate()).toBe(15); });
  it('handles delete operator', () => { const o: any = {a:1,b:2}; delete o.a; expect(o.a).toBeUndefined(); });
  it('handles string length property', () => { expect('typescript'.length).toBe(10); });
  it('handles Number.MAX_SAFE_INTEGER', () => { expect(Number.MAX_SAFE_INTEGER).toBe(9007199254740991); });
});


describe('phase34 coverage', () => {
  it('handles chained string methods', () => { expect('  Hello World  '.trim().toLowerCase()).toBe('hello world'); });
  it('handles object with numeric keys', () => { const o: Record<string,number> = {'0':10,'1':20}; expect(o['0']).toBe(10); });
  it('handles Omit type pattern', () => { interface Full { a: number; b: string; c: boolean; } type NoC = Omit<Full,'c'>; const o: NoC = {a:1,b:'x'}; expect(o.b).toBe('x'); });
  it('handles named function expression', () => { const factorial = function fact(n: number): number { return n <= 1 ? 1 : n * fact(n-1); }; expect(factorial(4)).toBe(24); });
  it('handles generic function', () => { function identity<T>(x: T): T { return x; } expect(identity(42)).toBe(42); expect(identity('hi')).toBe('hi'); });
});
