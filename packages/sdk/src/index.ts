import crypto from 'crypto';

export interface ResolvexConfig {
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

export class ResolvexClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor(config: ResolvexConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
  }

  private async request<T>(method: string, path: string, body?: any): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`Resolvex API Error ${response.status}: ${error.message || response.statusText}`);
      }

      return response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Health & Safety
  risks = {
    list: (params?: { page?: number; status?: string }) =>
      this.request<ApiResponse<Risk[]>>('GET', `/api/health-safety/risks?${new URLSearchParams(params as any)}`),
    get: (id: string) =>
      this.request<ApiResponse<Risk>>('GET', `/api/health-safety/risks/${id}`),
    create: (data: Partial<Risk>) =>
      this.request<ApiResponse<Risk>>('POST', '/api/health-safety/risks', data),
  };

  incidents = {
    list: (params?: { page?: number; status?: string }) =>
      this.request<ApiResponse<Incident[]>>('GET', `/api/health-safety/incidents?${new URLSearchParams(params as any)}`),
    get: (id: string) =>
      this.request<ApiResponse<Incident>>('GET', `/api/health-safety/incidents/${id}`),
    create: (data: Partial<Incident>) =>
      this.request<ApiResponse<Incident>>('POST', '/api/health-safety/incidents', data),
  };

  actions = {
    list: (params?: { page?: number; status?: string }) =>
      this.request<ApiResponse<Action[]>>('GET', `/api/health-safety/actions?${new URLSearchParams(params as any)}`),
    get: (id: string) =>
      this.request<ApiResponse<Action>>('GET', `/api/health-safety/actions/${id}`),
    create: (data: Partial<Action>) =>
      this.request<ApiResponse<Action>>('POST', '/api/health-safety/actions', data),
  };

  // Webhooks
  webhooks = {
    list: (params?: { page?: number; isActive?: string }) =>
      this.request<ApiResponse<Webhook[]>>('GET', `/api/workflows/webhooks?${new URLSearchParams(params as any)}`),
    create: (data: { name: string; url: string; events: WebhookEventType[]; headers?: Record<string, string>; retryCount?: number; timeout?: number }) =>
      this.request<ApiResponse<Webhook>>('POST', '/api/workflows/webhooks', data),
    get: (id: string) =>
      this.request<ApiResponse<Webhook>>('GET', `/api/workflows/webhooks/${id}`),
    update: (id: string, data: Partial<{ name: string; url: string; events: WebhookEventType[]; isActive: boolean }>) =>
      this.request<ApiResponse<Webhook>>('PUT', `/api/workflows/webhooks/${id}`, data),
    delete: (id: string) =>
      this.request<ApiResponse<{ message: string }>>('DELETE', `/api/workflows/webhooks/${id}`),
    test: (id: string) =>
      this.request<ApiResponse<WebhookDelivery>>('POST', `/api/workflows/webhooks/${id}/test`),
    deliveries: (id: string, params?: { page?: number; event?: string; success?: string }) =>
      this.request<ApiResponse<WebhookDelivery[]>>('GET', `/api/workflows/webhooks/${id}/deliveries?${new URLSearchParams(params as any)}`),
  };

  // AI Analysis
  analyze = {
    run: (type: string, context: Record<string, any>) =>
      this.request<ApiResponse<any>>('POST', '/api/ai/analyze', { type, context }),
  };

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

export default ResolvexClient;
