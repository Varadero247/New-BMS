export class StripeClient {
  private secretKey: string;
  private baseUrl = 'https://api.stripe.com/v1';

  constructor(secretKey?: string) {
    this.secretKey = secretKey || process.env.STRIPE_SECRET_KEY || '';
  }

  private async request(path: string, options: RequestInit = {}) {
    if (!this.secretKey) return null;
    try {
      const resp = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          ...options.headers,
        },
      });
      if (resp.ok) return resp.json();
      return null;
    } catch {
      return null;
    }
  }

  async getSubscriptions(limit = 100) {
    return this.request(`/subscriptions?limit=${limit}&status=active`);
  }

  async createCoupon(params: {
    percent_off: number;
    duration: string;
    duration_in_months?: number;
    max_redemptions?: number;
  }) {
    const body = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)] as [string, string])
    );
    return this.request('/coupons', { method: 'POST', body: body.toString() });
  }

  async createTransfer(params: { amount: number; currency: string; destination: string }) {
    const body = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)] as [string, string])
    );
    return this.request('/transfers', { method: 'POST', body: body.toString() });
  }

  async getBillingPortalUrl(customerId: string, returnUrl: string) {
    const body = new URLSearchParams({ customer: customerId, return_url: returnUrl });
    return this.request('/billing_portal/sessions', { method: 'POST', body: body.toString() });
  }
}

export default StripeClient;
