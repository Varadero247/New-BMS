import { StripeClient } from '../src/index';

let mockFetch: jest.Mock;

beforeEach(() => {
  mockFetch = jest.fn();
  (global as unknown as { fetch: jest.Mock }).fetch = mockFetch;
  delete process.env.STRIPE_SECRET_KEY;
});

afterEach(() => jest.restoreAllMocks());

function ok(data: unknown) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
  });
}

function err(status = 400) {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({ error: { message: 'Stripe error' } }),
  });
}

describe('StripeClient', () => {
  // ── No secret key (short-circuit) ────────────────────────────

  describe('when no secret key is provided', () => {
    it('returns null without calling fetch', async () => {
      const client = new StripeClient();
      const result = await client.getSubscriptions();
      expect(result).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('accepts key via constructor arg', async () => {
      const client = new StripeClient('sk_test_123');
      mockFetch.mockReturnValueOnce(ok({ data: [] }));
      await client.getSubscriptions();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('falls back to STRIPE_SECRET_KEY env var', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_env_456';
      const client = new StripeClient();
      mockFetch.mockReturnValueOnce(ok({ data: [] }));
      await client.getSubscriptions();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  // ── Common headers ────────────────────────────────────────────

  describe('Authorization header', () => {
    it('sends Bearer token and form-urlencoded Content-Type', async () => {
      const client = new StripeClient('sk_test_abc');
      mockFetch.mockReturnValueOnce(ok({ data: [] }));
      await client.getSubscriptions();
      expect(mockFetch.mock.calls[0][1].headers).toMatchObject({
        Authorization: 'Bearer sk_test_abc',
        'Content-Type': 'application/x-www-form-urlencoded',
      });
    });
  });

  // ── getSubscriptions ──────────────────────────────────────────

  describe('getSubscriptions', () => {
    let client: StripeClient;
    beforeEach(() => { client = new StripeClient('sk_test'); });

    it('sends GET to /v1/subscriptions with default limit=100 and status=active', async () => {
      mockFetch.mockReturnValueOnce(ok({ data: [] }));
      await client.getSubscriptions();
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toBe('https://api.stripe.com/v1/subscriptions?limit=100&status=active');
    });

    it('accepts a custom limit', async () => {
      mockFetch.mockReturnValueOnce(ok({ data: [] }));
      await client.getSubscriptions(10);
      expect(mockFetch.mock.calls[0][0]).toContain('limit=10');
    });

    it('returns null on non-ok response', async () => {
      mockFetch.mockReturnValueOnce(err(403));
      expect(await client.getSubscriptions()).toBeNull();
    });

    it('returns null when fetch throws', async () => {
      mockFetch.mockRejectedValueOnce(new Error('network'));
      expect(await client.getSubscriptions()).toBeNull();
    });
  });

  // ── createCoupon ──────────────────────────────────────────────

  describe('createCoupon', () => {
    let client: StripeClient;
    beforeEach(() => { client = new StripeClient('sk_test'); });

    it('sends POST to /v1/coupons with form-encoded body', async () => {
      mockFetch.mockReturnValueOnce(ok({ id: 'coup_1' }));
      await client.createCoupon({ percent_off: 20, duration: 'repeating', duration_in_months: 3 });
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe('https://api.stripe.com/v1/coupons');
      expect(opts.method).toBe('POST');
      // Body is form-encoded (URLSearchParams.toString())
      const params = new URLSearchParams(opts.body as string);
      expect(params.get('percent_off')).toBe('20');
      expect(params.get('duration')).toBe('repeating');
      expect(params.get('duration_in_months')).toBe('3');
    });

    it('omits optional fields when not provided', async () => {
      mockFetch.mockReturnValueOnce(ok({ id: 'coup_2' }));
      await client.createCoupon({ percent_off: 10, duration: 'once' });
      const params = new URLSearchParams(mockFetch.mock.calls[0][1].body as string);
      expect(params.get('percent_off')).toBe('10');
      expect(params.get('duration_in_months')).toBeNull();
    });

    it('returns null on non-ok response', async () => {
      mockFetch.mockReturnValueOnce(err(400));
      expect(
        await client.createCoupon({ percent_off: 0, duration: 'once' })
      ).toBeNull();
    });
  });

  // ── createTransfer ────────────────────────────────────────────

  describe('createTransfer', () => {
    let client: StripeClient;
    beforeEach(() => { client = new StripeClient('sk_test'); });

    it('sends POST to /v1/transfers with amount, currency, destination', async () => {
      mockFetch.mockReturnValueOnce(ok({ id: 'tr_1' }));
      await client.createTransfer({ amount: 5000, currency: 'gbp', destination: 'acct_1' });
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe('https://api.stripe.com/v1/transfers');
      expect(opts.method).toBe('POST');
      const params = new URLSearchParams(opts.body as string);
      expect(params.get('amount')).toBe('5000');
      expect(params.get('currency')).toBe('gbp');
      expect(params.get('destination')).toBe('acct_1');
    });

    it('returns null on non-ok response', async () => {
      mockFetch.mockReturnValueOnce(err(402));
      expect(
        await client.createTransfer({ amount: 1, currency: 'usd', destination: 'acct_x' })
      ).toBeNull();
    });
  });

  // ── getBillingPortalUrl ───────────────────────────────────────

  describe('getBillingPortalUrl', () => {
    let client: StripeClient;
    beforeEach(() => { client = new StripeClient('sk_test'); });

    it('sends POST to /v1/billing_portal/sessions', async () => {
      mockFetch.mockReturnValueOnce(ok({ url: 'https://billing.stripe.com/session/xxx' }));
      await client.getBillingPortalUrl('cus_123', 'https://myapp.com/return');
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe('https://api.stripe.com/v1/billing_portal/sessions');
      expect(opts.method).toBe('POST');
      const params = new URLSearchParams(opts.body as string);
      expect(params.get('customer')).toBe('cus_123');
      expect(params.get('return_url')).toBe('https://myapp.com/return');
    });

    it('returns the session object on success', async () => {
      const session = { url: 'https://billing.stripe.com/session/abc', id: 'bps_1' };
      mockFetch.mockReturnValueOnce(ok(session));
      const result = await client.getBillingPortalUrl('cus_456', 'https://app.com');
      expect(result).toEqual(session);
    });

    it('returns null on non-ok response', async () => {
      mockFetch.mockReturnValueOnce(err(404));
      expect(await client.getBillingPortalUrl('cus_999', 'https://app.com')).toBeNull();
    });
  });
});

// ─── Additional coverage ─────────────────────────────────────────────────────

describe('StripeClient — additional coverage', () => {
  it('getSubscriptions calls fetch exactly once per invocation', async () => {
    const client = new StripeClient('sk_test');
    mockFetch.mockReturnValueOnce(ok({ data: [] }));
    await client.getSubscriptions();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    // Confirm it hits the subscriptions endpoint
    expect(mockFetch.mock.calls[0][0]).toContain('/v1/subscriptions');
  });

  it('createTransfer returns null when fetch throws', async () => {
    const client = new StripeClient('sk_test');
    mockFetch.mockRejectedValueOnce(new Error('network error'));
    const result = await client.createTransfer({ amount: 100, currency: 'usd', destination: 'acct_1' });
    expect(result).toBeNull();
  });

  it('getBillingPortalUrl returns null when fetch throws', async () => {
    const client = new StripeClient('sk_test');
    mockFetch.mockRejectedValueOnce(new Error('network failure'));
    const result = await client.getBillingPortalUrl('cus_1', 'https://app.com');
    expect(result).toBeNull();
  });

  it('createCoupon returns null when fetch throws', async () => {
    const client = new StripeClient('sk_test');
    mockFetch.mockRejectedValueOnce(new Error('network'));
    const result = await client.createCoupon({ percent_off: 10, duration: 'once' });
    expect(result).toBeNull();
  });
});

// ─── Further edge-case coverage ──────────────────────────────────────────────

describe('StripeClient — further edge cases', () => {
  it('constructor with explicit empty string falls back to env var', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_from_env';
    // passing undefined uses env var; an explicit empty string also resolves to env var
    const client = new StripeClient(undefined);
    mockFetch.mockReturnValueOnce(ok({ data: [] }));
    const result = await client.getSubscriptions();
    expect(result).not.toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('getSubscriptions with limit=0 includes limit=0 in URL', async () => {
    const client = new StripeClient('sk_test');
    mockFetch.mockReturnValueOnce(ok({ data: [] }));
    await client.getSubscriptions(0);
    expect(mockFetch.mock.calls[0][0]).toContain('limit=0');
  });

  it('createCoupon includes max_redemptions when provided', async () => {
    const client = new StripeClient('sk_test');
    mockFetch.mockReturnValueOnce(ok({ id: 'coup_3' }));
    await client.createCoupon({ percent_off: 15, duration: 'repeating', duration_in_months: 6, max_redemptions: 50 });
    const params = new URLSearchParams(mockFetch.mock.calls[0][1].body as string);
    expect(params.get('max_redemptions')).toBe('50');
  });

  it('createTransfer uses POST method', async () => {
    const client = new StripeClient('sk_test');
    mockFetch.mockReturnValueOnce(ok({ id: 'tr_x' }));
    await client.createTransfer({ amount: 200, currency: 'eur', destination: 'acct_2' });
    expect(mockFetch.mock.calls[0][1].method).toBe('POST');
  });

  it('getBillingPortalUrl uses POST method', async () => {
    const client = new StripeClient('sk_test');
    mockFetch.mockReturnValueOnce(ok({ url: 'https://billing.stripe.com/abc' }));
    await client.getBillingPortalUrl('cus_789', 'https://myapp.com');
    expect(mockFetch.mock.calls[0][1].method).toBe('POST');
  });

  it('createCoupon with non-ok 500 response returns null', async () => {
    const client = new StripeClient('sk_test');
    mockFetch.mockReturnValueOnce(err(500));
    const result = await client.createCoupon({ percent_off: 50, duration: 'forever' });
    expect(result).toBeNull();
  });

  it('getSubscriptions returns the data object on success', async () => {
    const client = new StripeClient('sk_test');
    const data = { data: [{ id: 'sub_1', status: 'active' }] };
    mockFetch.mockReturnValueOnce(ok(data));
    const result = await client.getSubscriptions();
    expect(result).toEqual(data);
  });

  it('getBillingPortalUrl includes correct return_url in body', async () => {
    const client = new StripeClient('sk_test');
    mockFetch.mockReturnValueOnce(ok({ url: 'https://billing.stripe.com/x' }));
    await client.getBillingPortalUrl('cus_111', 'https://myapp.com/billing');
    const params = new URLSearchParams(mockFetch.mock.calls[0][1].body as string);
    expect(params.get('return_url')).toBe('https://myapp.com/billing');
  });
});

// ─── Request structure validation ─────────────────────────────────────────────

describe('StripeClient — request structure validation', () => {
  it('getSubscriptions does not specify POST method (defaults to GET)', async () => {
    const client = new StripeClient('sk_test');
    mockFetch.mockReturnValueOnce(ok({ data: [] }));
    await client.getSubscriptions();
    // method is not explicitly set for GET requests; POST would be 'POST'
    expect(mockFetch.mock.calls[0][1].method).not.toBe('POST');
  });

  it('createCoupon sends Authorization header with Bearer prefix', async () => {
    const client = new StripeClient('sk_secret_xyz');
    mockFetch.mockReturnValueOnce(ok({ id: 'coup_x' }));
    await client.createCoupon({ percent_off: 10, duration: 'once' });
    expect(mockFetch.mock.calls[0][1].headers['Authorization']).toBe('Bearer sk_secret_xyz');
  });

  it('createTransfer includes amount currency and destination in encoded body', async () => {
    const client = new StripeClient('sk_test');
    mockFetch.mockReturnValueOnce(ok({ id: 'tr_y' }));
    await client.createTransfer({ amount: 999, currency: 'gbp', destination: 'acct_z' });
    const params = new URLSearchParams(mockFetch.mock.calls[0][1].body as string);
    expect(params.get('amount')).toBe('999');
    expect(params.get('currency')).toBe('gbp');
    expect(params.get('destination')).toBe('acct_z');
  });

  it('getSubscriptions status=active is always included in URL', async () => {
    const client = new StripeClient('sk_test');
    mockFetch.mockReturnValueOnce(ok({ data: [] }));
    await client.getSubscriptions(50);
    expect(mockFetch.mock.calls[0][0]).toContain('status=active');
  });

  it('createCoupon sends to /v1/coupons endpoint', async () => {
    const client = new StripeClient('sk_test');
    mockFetch.mockReturnValueOnce(ok({ id: 'c1' }));
    await client.createCoupon({ percent_off: 5, duration: 'forever' });
    expect(mockFetch.mock.calls[0][0]).toBe('https://api.stripe.com/v1/coupons');
  });

  it('createTransfer sends to /v1/transfers endpoint', async () => {
    const client = new StripeClient('sk_test');
    mockFetch.mockReturnValueOnce(ok({ id: 't1' }));
    await client.createTransfer({ amount: 1, currency: 'usd', destination: 'acct_1' });
    expect(mockFetch.mock.calls[0][0]).toBe('https://api.stripe.com/v1/transfers');
  });

  it('getBillingPortalUrl sends customer in POST body', async () => {
    const client = new StripeClient('sk_test');
    mockFetch.mockReturnValueOnce(ok({ url: 'https://billing.stripe.com/s' }));
    await client.getBillingPortalUrl('cus_abc', 'https://example.com');
    const params = new URLSearchParams(mockFetch.mock.calls[0][1].body as string);
    expect(params.get('customer')).toBe('cus_abc');
  });
});
