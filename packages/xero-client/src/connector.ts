// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { BaseConnector } from '@ims/sync-engine';
import type { ConnectorConfig, ConnectorHealthStatus, SyncRecord, EntityType } from '@ims/sync-engine';

const XERO_BASE = 'https://api.xero.com/api.xro/2.0';
const XERO_TOKEN_URL = 'https://identity.xero.com/connect/token';

interface XeroTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface XeroContact {
  ContactID: string;
  Name: string;
  EmailAddress?: string;
  IsSupplier: boolean;
  IsCustomer: boolean;
  ContactStatus: string;
  Phones?: Array<{ PhoneType: string; PhoneNumber: string }>;
}

interface XeroInvoice {
  InvoiceID: string;
  InvoiceNumber: string;
  Type: 'ACCPAY' | 'ACCREC';
  Contact: { ContactID: string; Name: string };
  Status: string;
  AmountDue: number;
  AmountPaid: number;
  Total: number;
  CurrencyCode: string;
  DueDate: string;
  Date: string;
}

export class XeroConnector extends BaseConnector {
  private accessToken?: string;
  private tokenExpiresAt?: Date;

  private get clientId(): string { return this.config.credentials.clientId ?? ''; }
  private get clientSecret(): string { return this.config.credentials.clientSecret ?? ''; }
  private get refreshToken(): string { return this.config.credentials.refreshToken ?? ''; }
  private get tenantId(): string { return this.config.credentials.tenantId ?? ''; }

  private async ensureAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiresAt && this.tokenExpiresAt > new Date()) {
      return this.accessToken;
    }
    // Refresh token flow
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
    });
    const res = await fetch(XERO_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
      },
      body: params.toString(),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`Xero token refresh failed: HTTP ${res.status}`);
    const body = await res.json() as XeroTokenResponse;
    this.accessToken = body.access_token;
    this.tokenExpiresAt = new Date(Date.now() + body.expires_in * 1000 - 60000);
    return this.accessToken;
  }

  private async xeroFetch(path: string): Promise<unknown> {
    const token = await this.ensureAccessToken();
    const res = await fetch(`${XERO_BASE}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'xero-tenant-id': this.tenantId,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`Xero API error: HTTP ${res.status}`);
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
      case 'SUPPLIER': return this.fetchContacts('supplier', since);
      case 'CUSTOMER': return this.fetchContacts('customer', since);
      case 'INVOICE': return this.fetchInvoices(since);
      default: return [];
    }
  }

  private async fetchContacts(contactType: 'supplier' | 'customer', since?: Date): Promise<SyncRecord[]> {
    const queryParts = [contactType === 'supplier' ? 'IsSupplier=true' : 'IsCustomer=true'];
    if (since) queryParts.push(`ModifiedAfter=${since.toISOString()}`);
    const body = await this.xeroFetch(`/Contacts?where=${encodeURIComponent(queryParts.join(' AND '))}`) as { Contacts: XeroContact[] };

    return (body.Contacts ?? []).map(c => ({
      entityType: contactType === 'supplier' ? 'SUPPLIER' as EntityType : 'CUSTOMER' as EntityType,
      externalId: `xero_contact_${c.ContactID}`,
      data: {
        externalId: `xero_contact_${c.ContactID}`,
        name: c.Name,
        email: c.EmailAddress,
        status: c.ContactStatus === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
        isSupplier: c.IsSupplier,
        isCustomer: c.IsCustomer,
        phone: c.Phones?.find(p => p.PhoneType === 'DEFAULT')?.PhoneNumber,
        source: 'XERO',
      },
      checksum: this.checksum(c),
    }));
  }

  private async fetchInvoices(since?: Date): Promise<SyncRecord[]> {
    const query = since ? `?ModifiedAfter=${since.toISOString()}` : '';
    const body = await this.xeroFetch(`/Invoices${query}`) as { Invoices: XeroInvoice[] };

    return (body.Invoices ?? []).map(inv => ({
      entityType: 'INVOICE' as EntityType,
      externalId: `xero_invoice_${inv.InvoiceID}`,
      data: {
        externalId: `xero_invoice_${inv.InvoiceID}`,
        invoiceNumber: inv.InvoiceNumber,
        type: inv.Type === 'ACCPAY' ? 'PURCHASE' : 'SALES',
        supplierName: inv.Contact.Name,
        supplierExternalId: `xero_contact_${inv.Contact.ContactID}`,
        status: inv.Status,
        total: inv.Total,
        amountDue: inv.AmountDue,
        currency: inv.CurrencyCode,
        invoiceDate: inv.Date,
        dueDate: inv.DueDate,
        source: 'XERO',
      },
      checksum: this.checksum(inv),
    }));
  }
}

export function createXeroConnector(config: ConnectorConfig): XeroConnector {
  return new XeroConnector(config);
}
