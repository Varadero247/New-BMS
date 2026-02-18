export class IntercomClient {
  private accessToken: string;
  private baseUrl = 'https://api.intercom.io';

  constructor(accessToken?: string) {
    this.accessToken = accessToken || process.env.INTERCOM_ACCESS_TOKEN || '';
  }

  private async request(path: string, options: RequestInit = {}) {
    if (!this.accessToken) return null;
    try {
      const resp = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'Intercom-Version': '2.10',
          ...options.headers,
        },
      });
      if (resp.ok) return resp.json();
      return null;
    } catch {
      return null;
    }
  }

  async sendInAppMessage(userId: string, body: string) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify({
        message_type: 'inapp',
        body,
        from: { type: 'admin', id: 'default' },
        to: { type: 'user', user_id: userId },
      }),
    });
  }

  async createContact(email: string, name: string, customAttributes?: Record<string, any>) {
    return this.request('/contacts', {
      method: 'POST',
      body: JSON.stringify({
        role: 'user',
        email,
        name,
        custom_attributes: customAttributes,
      }),
    });
  }
}

export default IntercomClient;
