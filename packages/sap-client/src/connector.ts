// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { BaseConnector } from '@ims/sync-engine';
import type { ConnectorConfig, ConnectorHealthStatus, SyncRecord, EntityType } from '@ims/sync-engine';

// SAP SuccessFactors OData API v2
const SF_BASE = 'https://api{datacenter}.successfactors.com/odata/v2';

interface SFEmployee {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  title: string;
  status: string;
  hireDate: string;
  location: string;
}

export class SAPConnector extends BaseConnector {
  private accessToken?: string;
  private tokenExpiresAt?: Date;

  private get clientId(): string { return this.config.credentials.clientId ?? ''; }
  private get clientSecret(): string { return this.config.credentials.clientSecret ?? ''; }
  private get tokenUrl(): string { return this.config.credentials.tokenUrl ?? ''; }
  private get datacenter(): string { return this.config.credentials.datacenter ?? ''; }

  private get baseUrl(): string {
    return SF_BASE.replace('{datacenter}', this.datacenter ? `.${this.datacenter}` : '');
  }

  private async ensureAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiresAt && this.tokenExpiresAt > new Date()) {
      return this.accessToken;
    }
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });
    const res = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`SAP token request failed: HTTP ${res.status}`);
    const body = await res.json() as { access_token: string; expires_in: number };
    this.accessToken = body.access_token;
    this.tokenExpiresAt = new Date(Date.now() + body.expires_in * 1000 - 60000);
    return this.accessToken;
  }

  private async sfFetch(path: string): Promise<unknown> {
    const token = await this.ensureAccessToken();
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`SAP API error: HTTP ${res.status}`);
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
      case 'EMPLOYEE': return this.fetchEmployees(since);
      case 'DEPARTMENT': return this.fetchDepartments();
      default: return [];
    }
  }

  private async fetchEmployees(since?: Date): Promise<SyncRecord[]> {
    const filter = since ? `&$filter=lastModifiedDateTime gt datetime'${since.toISOString()}'` : '';
    const select = '$select=userId,firstName,lastName,email,department,title,status,hireDate,location';
    const body = await this.sfFetch(`/User?${select}${filter}&$format=json`) as { d: { results: SFEmployee[] } };

    return (body?.d?.results ?? []).map(emp => ({
      entityType: 'EMPLOYEE' as EntityType,
      externalId: `sap_${emp.userId}`,
      data: {
        externalId: `sap_${emp.userId}`,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        department: emp.department,
        jobTitle: emp.title,
        status: emp.status === 'active' ? 'ACTIVE' : 'INACTIVE',
        hireDate: emp.hireDate,
        location: emp.location,
        source: 'SAP_HR',
      },
      checksum: this.checksum(emp),
    }));
  }

  private async fetchDepartments(): Promise<SyncRecord[]> {
    const body = await this.sfFetch('/Department?$select=departmentId,name&$format=json') as { d: { results: Array<{ departmentId: string; name: string }> } };
    return (body?.d?.results ?? []).map(dept => ({
      entityType: 'DEPARTMENT' as EntityType,
      externalId: `sap_dept_${dept.departmentId}`,
      data: { externalId: `sap_dept_${dept.departmentId}`, name: dept.name, source: 'SAP_HR' },
      checksum: this.checksum(dept),
    }));
  }
}

export function createSAPConnector(config: ConnectorConfig): SAPConnector {
  return new SAPConnector(config);
}
