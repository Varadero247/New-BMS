// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export class HubSpotClient {
  private apiKey: string;
  private baseUrl = 'https://api.hubapi.com';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.HUBSPOT_API_KEY || '';
  }

  private async request(path: string, options: RequestInit = {}) {
    if (!this.apiKey) return null;
    try {
      const resp = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      if (resp.ok) return resp.json();
      return null;
    } catch {
      return null;
    }
  }

  async createContact(properties: Record<string, string>) {
    return this.request('/crm/v3/objects/contacts', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    });
  }

  async updateContact(contactId: string, properties: Record<string, string>) {
    return this.request(`/crm/v3/objects/contacts/${contactId}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties }),
    });
  }

  async createDeal(properties: Record<string, string>) {
    return this.request('/crm/v3/objects/deals', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    });
  }

  async updateDeal(dealId: string, properties: Record<string, string>) {
    return this.request(`/crm/v3/objects/deals/${dealId}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties }),
    });
  }

  async createTask(properties: Record<string, string>) {
    return this.request('/crm/v3/objects/tasks', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    });
  }

  async getDeals(limit = 100) {
    return this.request(`/crm/v3/objects/deals?limit=${limit}`);
  }

  async getDealsByStage(pipelineId: string) {
    return this.request(`/crm/v3/pipelines/deals/${pipelineId}/stages`);
  }
}

export default HubSpotClient;
