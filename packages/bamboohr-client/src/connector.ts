// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { BaseConnector } from '@ims/sync-engine';
import type { ConnectorConfig, ConnectorHealthStatus, SyncRecord, EntityType } from '@ims/sync-engine';

const BAMBOOHR_BASE = 'https://api.bamboohr.com/api/gateway.php';

interface BambooEmployee {
  id: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  department: string;
  jobTitle: string;
  employmentStatus: string;
  hireDate: string;
  location: string;
  mobilePhone?: string;
  supervisor?: string;
}

interface BambooDepartment {
  id: string;
  name: string;
}

export class BambooHRConnector extends BaseConnector {
  private get apiKey(): string {
    return this.config.credentials.apiKey ?? '';
  }

  private get subdomain(): string {
    return this.config.credentials.subdomain ?? '';
  }

  private get baseUrl(): string {
    return `${BAMBOOHR_BASE}/${this.subdomain}/v1`;
  }

  private authHeader(): Record<string, string> {
    const encoded = Buffer.from(`${this.apiKey}:x`).toString('base64');
    return {
      Authorization: `Basic ${encoded}`,
      Accept: 'application/json',
    };
  }

  async testConnection(): Promise<ConnectorHealthStatus> {
    const start = Date.now();
    try {
      const res = await fetch(`${this.baseUrl}/employees/directory`, {
        headers: this.authHeader(),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { connectorId: this.id, healthy: true, lastCheckedAt: new Date(), latencyMs: Date.now() - start };
    } catch (err) {
      return { connectorId: this.id, healthy: false, lastCheckedAt: new Date(), errorMessage: String(err) };
    }
  }

  async fetchRecords(entityType: EntityType, _since?: Date): Promise<SyncRecord[]> {
    switch (entityType) {
      case 'EMPLOYEE': return this.fetchEmployees();
      case 'DEPARTMENT': return this.fetchDepartments();
      default: return [];
    }
  }

  private async fetchEmployees(): Promise<SyncRecord[]> {
    const fields = ['id', 'firstName', 'lastName', 'workEmail', 'department', 'jobTitle', 'employmentStatus', 'hireDate', 'location', 'mobilePhone'].join(',');
    const res = await fetch(`${this.baseUrl}/reports/custom?format=JSON&fd=yes`, {
      method: 'POST',
      headers: { ...this.authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'IMS Sync', fields: fields.split(',') }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`BambooHR employees fetch failed: HTTP ${res.status}`);
    const body = await res.json() as { employees: BambooEmployee[] };

    return (body.employees ?? []).map(emp => ({
      entityType: 'EMPLOYEE' as EntityType,
      externalId: `bamboohr_${emp.id}`,
      data: {
        externalId: `bamboohr_${emp.id}`,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.workEmail,
        department: emp.department,
        jobTitle: emp.jobTitle,
        status: emp.employmentStatus === 'Active' ? 'ACTIVE' : 'INACTIVE',
        hireDate: emp.hireDate,
        location: emp.location,
        phone: emp.mobilePhone,
        source: 'BAMBOOHR',
      },
      checksum: this.checksum(emp),
    }));
  }

  private async fetchDepartments(): Promise<SyncRecord[]> {
    const res = await fetch(`${this.baseUrl}/lists/department`, {
      headers: this.authHeader(),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`BambooHR departments fetch failed: HTTP ${res.status}`);
    const body = await res.json() as { options: BambooDepartment[] };

    return (body.options ?? []).map(dept => ({
      entityType: 'DEPARTMENT' as EntityType,
      externalId: `bamboohr_dept_${dept.id}`,
      data: { externalId: `bamboohr_dept_${dept.id}`, name: dept.name, source: 'BAMBOOHR' },
      checksum: this.checksum(dept),
    }));
  }
}

export function createBambooHRConnector(config: ConnectorConfig): BambooHRConnector {
  return new BambooHRConnector(config);
}
