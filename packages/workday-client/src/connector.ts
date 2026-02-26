// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { BaseConnector } from '@ims/sync-engine';
import type { ConnectorConfig, ConnectorHealthStatus, SyncRecord, EntityType } from '@ims/sync-engine';

// Workday REST API (v1) + OAuth2
const WORKDAY_TOKEN_SUFFIX = '/oauth2/v2/token';

export class WorkdayConnector extends BaseConnector {
  private accessToken?: string;
  private tokenExpiresAt?: Date;

  private get clientId(): string { return this.config.credentials.clientId ?? ''; }
  private get clientSecret(): string { return this.config.credentials.clientSecret ?? ''; }
  private get refreshToken(): string { return this.config.credentials.refreshToken ?? ''; }
  private get tenantUrl(): string { return this.config.credentials.tenantUrl ?? ''; } // e.g. https://wd2-impl-services1.workday.com/ccx/service/tenantname

  private get tokenUrl(): string {
    return `${this.tenantUrl}${WORKDAY_TOKEN_SUFFIX}`;
  }

  private get apiBase(): string {
    return `${this.tenantUrl}/api/v1`;
  }

  private async ensureAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiresAt && this.tokenExpiresAt > new Date()) {
      return this.accessToken;
    }
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });
    const res = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`Workday token failed: HTTP ${res.status}`);
    const body = await res.json() as { access_token: string; expires_in: number };
    this.accessToken = body.access_token;
    this.tokenExpiresAt = new Date(Date.now() + body.expires_in * 1000 - 60000);
    return this.accessToken;
  }

  private async wdFetch(path: string): Promise<unknown> {
    const token = await this.ensureAccessToken();
    const res = await fetch(`${this.apiBase}${path}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`Workday API error: HTTP ${res.status}`);
    return res.json();
  }

  async testConnection(): Promise<ConnectorHealthStatus> {
    const start = Date.now();
    try {
      await this.ensureAccessToken();
      return { connectorId: this.id, healthy: true, lastCheckedAt: new Date(), latencyMs: Date.now() - start };
    } catch (err) {
      return { connectorId: this.id, healthy: false, lastCheckedAt: new Date(), errorMessage: String(err) };
    }
  }

  async fetchRecords(entityType: EntityType): Promise<SyncRecord[]> {
    switch (entityType) {
      case 'EMPLOYEE': return this.fetchWorkers();
      case 'DEPARTMENT': return this.fetchOrganisations();
      case 'POSITION': return this.fetchPositions();
      default: return [];
    }
  }

  private async fetchWorkers(): Promise<SyncRecord[]> {
    const body = await this.wdFetch('/workers?limit=1000') as { data: Array<Record<string, unknown>> };
    return (body.data ?? []).map(w => ({
      entityType: 'EMPLOYEE' as EntityType,
      externalId: `workday_worker_${w.id}`,
      data: {
        externalId: `workday_worker_${w.id}`,
        firstName: (w.name as Record<string, unknown>)?.firstName,
        lastName: (w.name as Record<string, unknown>)?.lastName,
        email: w.primaryEmailAddress,
        jobTitle: w.jobTitle,
        department: (w.primaryJob as Record<string, unknown>)?.businessTitle,
        status: w.workerStatus === 'Active' ? 'ACTIVE' : 'INACTIVE',
        source: 'WORKDAY',
      },
      checksum: this.checksum(w),
    }));
  }

  private async fetchOrganisations(): Promise<SyncRecord[]> {
    const body = await this.wdFetch('/organizations?type=Department&limit=1000') as { data: Array<Record<string, unknown>> };
    return (body.data ?? []).map(org => ({
      entityType: 'DEPARTMENT' as EntityType,
      externalId: `workday_org_${org.id}`,
      data: { externalId: `workday_org_${org.id}`, name: org.name, source: 'WORKDAY' },
      checksum: this.checksum(org),
    }));
  }

  private async fetchPositions(): Promise<SyncRecord[]> {
    const body = await this.wdFetch('/positions?limit=1000') as { data: Array<Record<string, unknown>> };
    return (body.data ?? []).map(pos => ({
      entityType: 'POSITION' as EntityType,
      externalId: `workday_pos_${pos.id}`,
      data: {
        externalId: `workday_pos_${pos.id}`,
        title: pos.positionTitle,
        department: (pos.jobFamily as Record<string, unknown>)?.name,
        status: pos.isClosed ? 'INACTIVE' : 'ACTIVE',
        source: 'WORKDAY',
      },
      checksum: this.checksum(pos),
    }));
  }
}

export function createWorkdayConnector(config: ConnectorConfig): WorkdayConnector {
  return new WorkdayConnector(config);
}
