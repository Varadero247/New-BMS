// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { BaseConnector } from '@ims/sync-engine';
import type { ConnectorConfig, ConnectorHealthStatus, SyncRecord, EntityType } from '@ims/sync-engine';

// Dynamics 365 Web API v9.2
const D365_TOKEN_URL = 'https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token';

export class Dynamics365Connector extends BaseConnector {
  private accessToken?: string;
  private tokenExpiresAt?: Date;

  private get clientId(): string { return this.config.credentials.clientId ?? ''; }
  private get clientSecret(): string { return this.config.credentials.clientSecret ?? ''; }
  private get tenantId(): string { return this.config.credentials.tenantId ?? ''; }
  private get orgUrl(): string { return this.config.credentials.orgUrl ?? ''; } // e.g. https://org.crm.dynamics.com

  private get tokenUrl(): string {
    return D365_TOKEN_URL.replace('{tenantId}', this.tenantId);
  }

  private get apiBase(): string {
    return `${this.orgUrl}/api/data/v9.2`;
  }

  private async ensureAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiresAt && this.tokenExpiresAt > new Date()) {
      return this.accessToken;
    }
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scope: `${this.orgUrl}/.default`,
    });
    const res = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`Dynamics 365 token failed: HTTP ${res.status}`);
    const body = await res.json() as { access_token: string; expires_in: number };
    this.accessToken = body.access_token;
    this.tokenExpiresAt = new Date(Date.now() + body.expires_in * 1000 - 60000);
    return this.accessToken;
  }

  private async d365Fetch(path: string): Promise<unknown> {
    const token = await this.ensureAccessToken();
    const res = await fetch(`${this.apiBase}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
      },
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`Dynamics 365 API error: HTTP ${res.status}`);
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

  async fetchRecords(entityType: EntityType, since?: Date): Promise<SyncRecord[]> {
    switch (entityType) {
      case 'EMPLOYEE': return this.fetchSystemUsers(since);
      case 'DEPARTMENT': return this.fetchBusinessUnits();
      case 'SUPPLIER': return this.fetchAccounts('vendor', since);
      case 'CUSTOMER': return this.fetchAccounts('customer', since);
      default: return [];
    }
  }

  private async fetchSystemUsers(since?: Date): Promise<SyncRecord[]> {
    const filter = since ? `&$filter=modifiedon gt ${since.toISOString()}` : '';
    const select = '$select=systemuserid,firstname,lastname,internalemailaddress,title,businessunitid,isdisabled';
    const body = await this.d365Fetch(`/systemusers?${select}${filter}`) as { value: Array<Record<string, unknown>> };

    return (body.value ?? []).map(u => ({
      entityType: 'EMPLOYEE' as EntityType,
      externalId: `d365_user_${u.systemuserid}`,
      data: {
        externalId: `d365_user_${u.systemuserid}`,
        firstName: u.firstname,
        lastName: u.lastname,
        email: u.internalemailaddress,
        jobTitle: u.title,
        status: u.isdisabled ? 'INACTIVE' : 'ACTIVE',
        source: 'DYNAMICS_365',
      },
      checksum: this.checksum(u),
    }));
  }

  private async fetchBusinessUnits(): Promise<SyncRecord[]> {
    const body = await this.d365Fetch('/businessunits?$select=businessunitid,name,parentbusinessunitid') as { value: Array<Record<string, unknown>> };
    return (body.value ?? []).map(bu => ({
      entityType: 'DEPARTMENT' as EntityType,
      externalId: `d365_bu_${bu.businessunitid}`,
      data: { externalId: `d365_bu_${bu.businessunitid}`, name: bu.name, source: 'DYNAMICS_365' },
      checksum: this.checksum(bu),
    }));
  }

  private async fetchAccounts(type: 'vendor' | 'customer', since?: Date): Promise<SyncRecord[]> {
    const typeFilter = type === 'vendor' ? 'accountcategorycode eq 2' : 'accountcategorycode eq 1';
    const sinceFilter = since ? ` and modifiedon gt ${since.toISOString()}` : '';
    const select = '$select=accountid,name,emailaddress1,telephone1,statecode';
    const body = await this.d365Fetch(`/accounts?${select}&$filter=${typeFilter}${sinceFilter}`) as { value: Array<Record<string, unknown>> };

    return (body.value ?? []).map(acc => ({
      entityType: type === 'vendor' ? 'SUPPLIER' as EntityType : 'CUSTOMER' as EntityType,
      externalId: `d365_account_${acc.accountid}`,
      data: {
        externalId: `d365_account_${acc.accountid}`,
        name: acc.name,
        email: acc.emailaddress1,
        phone: acc.telephone1,
        status: acc.statecode === 0 ? 'ACTIVE' : 'INACTIVE',
        source: 'DYNAMICS_365',
      },
      checksum: this.checksum(acc),
    }));
  }
}

export function createDynamics365Connector(config: ConnectorConfig): Dynamics365Connector {
  return new Dynamics365Connector(config);
}
