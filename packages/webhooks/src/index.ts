import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// ─── Types ──────────────────────────────────────────────────────────────────

export type DeliveryStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface WebhookEndpoint {
  id: string;
  orgId: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  enabled: boolean;
  headers: Record<string, string>;
  lastTriggeredAt: string | null;
  failureCount: number;
  createdAt: string;
}

export interface WebhookDelivery {
  id: string;
  endpointId: string;
  event: string;
  payload: Record<string, unknown>;
  responseCode: number | null;
  status: DeliveryStatus;
  attempts: number;
  createdAt: string;
}

export interface CreateEndpointParams {
  orgId: string;
  name: string;
  url: string;
  events: string[];
  headers?: Record<string, string>;
}

export interface UpdateEndpointParams {
  name?: string;
  url?: string;
  events?: string[];
  enabled?: boolean;
  headers?: Record<string, string>;
}

// ─── Webhook Events ─────────────────────────────────────────────────────────

export const WEBHOOK_EVENTS = [
  'ncr.created',
  'ncr.status_changed',
  'ncr.closed',
  'capa.created',
  'capa.status_changed',
  'capa.closed',
  'capa.overdue',
  'audit.created',
  'audit.finding_added',
  'audit.complete',
  'csat.complaint_received',
  'csat.escalated',
  'risk.score_changed',
  'risk.treatment_changed',
  'certificate.expiring',
  'certificate.expired',
  'ai.analysis_complete',
  'ai.review_required',
  'user.created',
  'user.deactivated',
  'trial.expiring',
  'trial.expired',
] as const;

export type WebhookEvent = typeof WEBHOOK_EVENTS[number];

// ─── In-Memory Stores ───────────────────────────────────────────────────────

const endpointStore = new Map<string, WebhookEndpoint>();
const deliveryStore: WebhookDelivery[] = [];

// ─── HMAC Signing ───────────────────────────────────────────────────────────

export function generateSecret(): string {
  return 'whsec_' + crypto.randomBytes(32).toString('hex');
}

export function signPayload(payload: string | Record<string, unknown>, secret: string): string {
  const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

// ─── Endpoint Management ────────────────────────────────────────────────────

export function createEndpoint(params: CreateEndpointParams): WebhookEndpoint {
  const endpoint: WebhookEndpoint = {
    id: uuidv4(),
    orgId: params.orgId,
    name: params.name,
    url: params.url,
    secret: generateSecret(),
    events: params.events,
    enabled: true,
    headers: params.headers || {},
    lastTriggeredAt: null,
    failureCount: 0,
    createdAt: new Date().toISOString(),
  };
  endpointStore.set(endpoint.id, endpoint);
  return endpoint;
}

export function listEndpoints(orgId: string): WebhookEndpoint[] {
  return Array.from(endpointStore.values())
    .filter(ep => ep.orgId === orgId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getEndpoint(id: string): WebhookEndpoint | undefined {
  return endpointStore.get(id);
}

export function deleteEndpoint(id: string): boolean {
  return endpointStore.delete(id);
}

export function updateEndpoint(id: string, updates: UpdateEndpointParams): WebhookEndpoint | null {
  const endpoint = endpointStore.get(id);
  if (!endpoint) return null;

  if (updates.name !== undefined) endpoint.name = updates.name;
  if (updates.url !== undefined) endpoint.url = updates.url;
  if (updates.events !== undefined) endpoint.events = updates.events;
  if (updates.enabled !== undefined) endpoint.enabled = updates.enabled;
  if (updates.headers !== undefined) endpoint.headers = updates.headers;

  endpointStore.set(id, endpoint);
  return endpoint;
}

// ─── Dispatch & Delivery ────────────────────────────────────────────────────

export function dispatch(event: string, orgId: string, payload: Record<string, unknown>): WebhookDelivery[] {
  const endpoints = Array.from(endpointStore.values())
    .filter(ep => ep.orgId === orgId && ep.enabled && ep.events.includes(event));

  const deliveries: WebhookDelivery[] = [];

  for (const endpoint of endpoints) {
    const delivery: WebhookDelivery = {
      id: uuidv4(),
      endpointId: endpoint.id,
      event,
      payload,
      responseCode: null,
      status: 'PENDING',
      attempts: 1,
      createdAt: new Date().toISOString(),
    };

    // Mock send: simulate successful delivery
    const signature = signPayload(payload, endpoint.secret);
    console.log(`[Webhook] Dispatching ${event} to ${endpoint.url}`, {
      signature: `sha256=${signature}`,
      deliveryId: delivery.id,
    });

    // Simulate success
    delivery.status = 'SUCCESS';
    delivery.responseCode = 200;

    // Update endpoint last triggered
    endpoint.lastTriggeredAt = new Date().toISOString();
    endpointStore.set(endpoint.id, endpoint);

    deliveryStore.push(delivery);
    deliveries.push(delivery);
  }

  return deliveries;
}

export function listDeliveries(endpointId: string, limit: number = 20): WebhookDelivery[] {
  return deliveryStore
    .filter(d => d.endpointId === endpointId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function getDelivery(id: string): WebhookDelivery | undefined {
  return deliveryStore.find(d => d.id === id);
}

// ─── Reset (for testing) ────────────────────────────────────────────────────

export function _resetStores(): void {
  endpointStore.clear();
  deliveryStore.length = 0;
}
