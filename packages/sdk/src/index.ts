// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import crypto from 'crypto';

export interface NexaraConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
}

export type WebhookEventType =
  | 'incident.created'
  | 'capa.overdue'
  | 'audit.completed'
  | 'nonconformance.created'
  | 'document.approved'
  | 'risk.high_rating'
  | 'objective.overdue';

export interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  data: Record<string, any>;
}

// Export type definitions for all API models
export interface Risk {
  id: string;
  title: string;
  status: string;
  riskLevel: string;
  category?: string;
  description?: string;
  likelihood?: number;
  consequence?: number;
  riskScore?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Incident {
  id: string;
  title: string;
  type: string;
  severity: string;
  status: string;
  description?: string;
  dateOccurred?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Action {
  id: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: WebhookEventType[];
  isActive: boolean;
  headers?: Record<string, string>;
  retryCount: number;
  timeout: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  payload: Record<string, any>;
  statusCode?: number;
  response?: string;
  success: boolean;
  attempts: number;
  lastError?: string;
  deliveredAt?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class NexaraClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor(config: NexaraConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(
          `Nexara API Error ${response.status}: ${error.message || response.statusText}`
        );
      }

      return response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Health & Safety
  private toSearchParams(params?: Record<string, string | number | undefined>): URLSearchParams {
    const entries: Record<string, string> = {};
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) entries[k] = String(v);
      }
    }
    return new URLSearchParams(entries);
  }

  risks = {
    list: (params?: { page?: number; status?: string }) =>
      this.request<ApiResponse<Risk[]>>(
        'GET',
        `/api/health-safety/risks?${this.toSearchParams(params)}`
      ),
    get: (id: string) => this.request<ApiResponse<Risk>>('GET', `/api/health-safety/risks/${id}`),
    create: (data: Partial<Risk>) =>
      this.request<ApiResponse<Risk>>('POST', '/api/health-safety/risks', data),
  };

  incidents = {
    list: (params?: { page?: number; status?: string }) =>
      this.request<ApiResponse<Incident[]>>(
        'GET',
        `/api/health-safety/incidents?${this.toSearchParams(params)}`
      ),
    get: (id: string) =>
      this.request<ApiResponse<Incident>>('GET', `/api/health-safety/incidents/${id}`),
    create: (data: Partial<Incident>) =>
      this.request<ApiResponse<Incident>>('POST', '/api/health-safety/incidents', data),
  };

  actions = {
    list: (params?: { page?: number; status?: string }) =>
      this.request<ApiResponse<Action[]>>(
        'GET',
        `/api/health-safety/actions?${this.toSearchParams(params)}`
      ),
    get: (id: string) =>
      this.request<ApiResponse<Action>>('GET', `/api/health-safety/actions/${id}`),
    create: (data: Partial<Action>) =>
      this.request<ApiResponse<Action>>('POST', '/api/health-safety/actions', data),
  };

  // Webhooks
  webhooks = {
    list: (params?: { page?: number; isActive?: string }) =>
      this.request<ApiResponse<Webhook[]>>(
        'GET',
        `/api/workflows/webhooks?${this.toSearchParams(params)}`
      ),
    create: (data: {
      name: string;
      url: string;
      events: WebhookEventType[];
      headers?: Record<string, string>;
      retryCount?: number;
      timeout?: number;
    }) => this.request<ApiResponse<Webhook>>('POST', '/api/workflows/webhooks', data),
    get: (id: string) => this.request<ApiResponse<Webhook>>('GET', `/api/workflows/webhooks/${id}`),
    update: (
      id: string,
      data: Partial<{ name: string; url: string; events: WebhookEventType[]; isActive: boolean }>
    ) => this.request<ApiResponse<Webhook>>('PUT', `/api/workflows/webhooks/${id}`, data),
    delete: (id: string) =>
      this.request<ApiResponse<{ message: string }>>('DELETE', `/api/workflows/webhooks/${id}`),
    test: (id: string) =>
      this.request<ApiResponse<WebhookDelivery>>('POST', `/api/workflows/webhooks/${id}/test`),
    deliveries: (id: string, params?: { page?: number; event?: string; success?: string }) =>
      this.request<ApiResponse<WebhookDelivery[]>>(
        'GET',
        `/api/workflows/webhooks/${id}/deliveries?${this.toSearchParams(params)}`
      ),
  };

  // AI Analysis
  analyze = {
    run: (type: string, context: Record<string, any>) =>
      this.request<ApiResponse<any>>('POST', '/api/ai/analyze', { type, context }),
  };

  // Fluent Compliance API
  compliance(): ComplianceBuilder {
    return new ComplianceBuilder(this.baseUrl, this.apiKey, this.timeout);
  }

  // Verify webhook signature
  static verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  }
}

// ── Fluent Compliance Builder ─────────────────────────────────

export type ISOStandard =
  | 'ISO_9001'
  | 'ISO_14001'
  | 'ISO_45001'
  | 'ISO_27001'
  | 'ISO_22000'
  | 'ISO_50001'
  | 'ISO_42001'
  | 'ISO_37001'
  | 'IATF_16949'
  | 'ISO_13485'
  | 'AS9100';

export interface CompliancePosture {
  overall: number;
  standards: Record<
    string,
    {
      score: number;
      gaps: number;
      lastAudit?: string;
    }
  >;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  generatedAt: string;
}

export class ComplianceBuilder {
  private _standards: ISOStandard[] = [];
  private _baseUrl: string;
  private _apiKey: string;
  private _timeout: number;

  constructor(baseUrl: string, apiKey: string, timeout: number) {
    this._baseUrl = baseUrl;
    this._apiKey = apiKey;
    this._timeout = timeout;
  }

  standards(standards: ISOStandard[]): ComplianceBuilder {
    this._standards = standards;
    return this;
  }

  async posture(): Promise<CompliancePosture> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this._timeout);

    try {
      const response = await fetch(`${this._baseUrl}/api/compliance/posture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this._apiKey}`,
        },
        body: JSON.stringify({ standards: this._standards }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(
          `Nexara API Error ${response.status}: ${error.message || response.statusText}`
        );
      }

      const data = await response.json();
      return data.data;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export default NexaraClient;
