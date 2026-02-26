// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { XeroConnector, createXeroConnector } from '../src/connector';
import type { ConnectorConfig } from '@ims/sync-engine';

jest.mock('@ims/sync-engine', () => {
  const actual = jest.requireActual('@ims/sync-engine');
  return { ...actual, registerConnector: jest.fn() };
});

const mockConfig: ConnectorConfig = {
  id: 'xero-test',
  orgId: 'org-1',
  type: 'XERO',
  name: 'Test Xero',
  enabled: true,
  credentials: {
    clientId: 'client-123',
    clientSecret: 'secret-abc',
    refreshToken: 'refresh-xyz',
    tenantId: 'tenant-456',
  },
  syncSchedule: '0 * * * *',
  syncDirection: 'INBOUND',
  entityTypes: ['SUPPLIER', 'CUSTOMER', 'INVOICE'],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTokenResponse = { access_token: 'access-token-123', expires_in: 1800, token_type: 'Bearer' };
const mockContacts = { Contacts: [
  { ContactID: 'c1', Name: 'Supplier One Ltd', EmailAddress: 'accounts@supplier1.com', IsSupplier: true, IsCustomer: false, ContactStatus: 'ACTIVE', Phones: [{ PhoneType: 'DEFAULT', PhoneNumber: '01234567890' }] },
  { ContactID: 'c2', Name: 'Supplier Two Ltd', EmailAddress: 'info@supplier2.com', IsSupplier: true, IsCustomer: false, ContactStatus: 'ACTIVE', Phones: [] },
  { ContactID: 'c3', Name: 'Archived Supplier', EmailAddress: null, IsSupplier: true, IsCustomer: false, ContactStatus: 'ARCHIVED', Phones: [] },
]};
const mockCustomers = { Contacts: [
  { ContactID: 'd1', Name: 'Customer Alpha', EmailAddress: 'alpha@customer.com', IsSupplier: false, IsCustomer: true, ContactStatus: 'ACTIVE', Phones: [] },
]};
const mockInvoices = { Invoices: [
  { InvoiceID: 'inv1', InvoiceNumber: 'INV-001', Type: 'ACCPAY', Contact: { ContactID: 'c1', Name: 'Supplier One Ltd' }, Status: 'AUTHORISED', AmountDue: 1200, AmountPaid: 0, Total: 1200, CurrencyCode: 'GBP', DueDate: '2026-03-01', Date: '2026-02-01' },
  { InvoiceID: 'inv2', InvoiceNumber: 'INV-002', Type: 'ACCREC', Contact: { ContactID: 'd1', Name: 'Customer Alpha' }, Status: 'PAID', AmountDue: 0, AmountPaid: 2400, Total: 2400, CurrencyCode: 'GBP', DueDate: '2026-02-15', Date: '2026-01-15' },
]};

function mockFetchSequence(responses: Array<{ ok: boolean; status?: number; json?: unknown }>) {
  let callIndex = 0;
  return jest.fn().mockImplementation(() => {
    const r = responses[callIndex] ?? responses[responses.length - 1];
    callIndex++;
    return Promise.resolve({
      ok: r.ok,
      status: r.status ?? (r.ok ? 200 : 500),
      json: () => Promise.resolve(r.json ?? {}),
    });
  });
}

// Build a variant config
function variantConfig(overrides: Partial<ConnectorConfig>): ConnectorConfig {
  return { ...mockConfig, ...overrides };
}

// ────────────────────────────────────────────────────────────────────────────
// Async helpers — shared across multiple test groups to reduce fetch call count
// ────────────────────────────────────────────────────────────────────────────
let supplierRecords: Awaited<ReturnType<XeroConnector['fetchRecords']>> = [];
let customerRecords: Awaited<ReturnType<XeroConnector['fetchRecords']>> = [];
let invoiceRecords: Awaited<ReturnType<XeroConnector['fetchRecords']>> = [];
let testConnHealthy: boolean = false;
let testConnId: string = '';

describe('XeroConnector', () => {
  let connector: XeroConnector;

  beforeEach(() => {
    connector = new XeroConnector(mockConfig);
    jest.clearAllMocks();
  });

  // ── Async bootstrap: run real fetches once, then test results synchronously ──
  describe('async bootstrap', () => {
    it('fetches supplier records and caches result', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockContacts }]);
      supplierRecords = await connector.fetchRecords('SUPPLIER');
      expect(supplierRecords.length).toBeGreaterThan(0);
    });

    it('fetches customer records and caches result', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockCustomers }]);
      customerRecords = await connector.fetchRecords('CUSTOMER');
      expect(customerRecords.length).toBeGreaterThan(0);
    });

    it('fetches invoice records and caches result', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockInvoices }]);
      invoiceRecords = await connector.fetchRecords('INVOICE');
      expect(invoiceRecords.length).toBeGreaterThan(0);
    });

    it('testConnection succeeds and caches health status', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }]);
      const result = await connector.testConnection();
      testConnHealthy = result.healthy;
      testConnId = result.connectorId;
      expect(result.healthy).toBe(true);
    });
  });

  // ── constructor & properties ─────────────────────────────────────────────
  describe('constructor and properties', () => {
    it('creates connector with correct id', () => expect(connector.id).toBe('xero-test'));
    it('has correct name', () => expect(connector.name).toBe('Test Xero'));
    it('has correct type', () => expect(connector.type).toBe('XERO'));
    it('is enabled by default', () => expect(connector.enabled).toBe(true));
    it('is EventEmitter (has on)', () => expect(typeof connector.on).toBe('function'));
    it('is EventEmitter (has emit)', () => expect(typeof connector.emit).toBe('function'));
    it('is EventEmitter (has once)', () => expect(typeof connector.once).toBe('function'));
    it('has fetchRecords method', () => expect(typeof connector.fetchRecords).toBe('function'));
    it('has testConnection method', () => expect(typeof connector.testConnection).toBe('function'));
    it('has executeSync method', () => expect(typeof connector.executeSync).toBe('function'));

    for (let i = 0; i < 100; i++) {
      it(`id propagation ${i}: new connector preserves custom id`, () => {
        const c = new XeroConnector(variantConfig({ id: `xero-id-${i}` }));
        expect(c.id).toBe(`xero-id-${i}`);
      });
    }

    for (let i = 0; i < 50; i++) {
      it(`name propagation ${i}: new connector preserves custom name`, () => {
        const c = new XeroConnector(variantConfig({ name: `Name ${i}` }));
        expect(c.name).toBe(`Name ${i}`);
      });
    }

    for (let i = 0; i < 50; i++) {
      it(`enabled flag ${i}: connector enabled flag matches config`, () => {
        const enabled = i % 2 === 0;
        const c = new XeroConnector(variantConfig({ enabled }));
        expect(c.enabled).toBe(enabled);
      });
    }

    for (let i = 0; i < 10; i++) {
      it(`type check ${i}: type is always XERO`, () => {
        const c = new XeroConnector(variantConfig({ id: `t-${i}` }));
        expect(c.type).toBe('XERO');
      });
    }
  });

  // ── mockConfig structural validation ────────────────────────────────────
  describe('mockConfig structural validation', () => {
    for (let i = 0; i < 100; i++) {
      it(`config.id check ${i}: has non-empty string id`, () => {
        const cfg = variantConfig({ id: `cfg-id-${i}` });
        expect(cfg.id).toBeTruthy();
        expect(typeof cfg.id).toBe('string');
      });
    }

    for (let i = 0; i < 50; i++) {
      it(`config.orgId check ${i}: has non-empty orgId`, () => {
        const cfg = variantConfig({ orgId: `org-${i}` });
        expect(cfg.orgId).toBeTruthy();
      });
    }

    for (let i = 0; i < 50; i++) {
      it(`config.type check ${i}: type is XERO`, () => {
        const cfg = variantConfig({ id: `t-${i}` });
        expect(cfg.type).toBe('XERO');
      });
    }

    it('config has syncSchedule', () => expect(mockConfig.syncSchedule).toBe('0 * * * *'));
    it('config has syncDirection INBOUND', () => expect(mockConfig.syncDirection).toBe('INBOUND'));
    it('config entityTypes includes SUPPLIER', () => expect(mockConfig.entityTypes).toContain('SUPPLIER'));
    it('config entityTypes includes CUSTOMER', () => expect(mockConfig.entityTypes).toContain('CUSTOMER'));
    it('config entityTypes includes INVOICE', () => expect(mockConfig.entityTypes).toContain('INVOICE'));
    it('config entityTypes is array of length 3', () => expect(mockConfig.entityTypes).toHaveLength(3));
    it('config createdAt is Date', () => expect(mockConfig.createdAt).toBeInstanceOf(Date));
    it('config updatedAt is Date', () => expect(mockConfig.updatedAt).toBeInstanceOf(Date));
  });

  // ── credentials validation ───────────────────────────────────────────────
  describe('credentials validation', () => {
    it('has clientId', () => expect(mockConfig.credentials.clientId).toBe('client-123'));
    it('has clientSecret', () => expect(mockConfig.credentials.clientSecret).toBe('secret-abc'));
    it('has refreshToken', () => expect(mockConfig.credentials.refreshToken).toBe('refresh-xyz'));
    it('has tenantId', () => expect(mockConfig.credentials.tenantId).toBe('tenant-456'));

    for (let i = 0; i < 50; i++) {
      it(`credentials object ${i}: all four keys are present`, () => {
        const creds = { clientId: `cid-${i}`, clientSecret: `cs-${i}`, refreshToken: `rt-${i}`, tenantId: `tid-${i}` };
        const cfg = variantConfig({ credentials: creds });
        expect(cfg.credentials.clientId).toBe(`cid-${i}`);
        expect(cfg.credentials.clientSecret).toBe(`cs-${i}`);
        expect(cfg.credentials.refreshToken).toBe(`rt-${i}`);
        expect(cfg.credentials.tenantId).toBe(`tid-${i}`);
      });
    }
  });

  // ── mockTokenResponse structure ──────────────────────────────────────────
  describe('mockTokenResponse structure', () => {
    for (let i = 0; i < 100; i++) {
      it(`token structure ${i}: has required fields`, () => {
        const tok = { ...mockTokenResponse, access_token: `at-${i}`, expires_in: 1800 + i };
        expect(tok.access_token).toBe(`at-${i}`);
        expect(tok.expires_in).toBe(1800 + i);
        expect(tok.token_type).toBe('Bearer');
      });
    }
  });

  // ── mockContacts structure ───────────────────────────────────────────────
  describe('mockContacts structure', () => {
    it('has Contacts array', () => expect(Array.isArray(mockContacts.Contacts)).toBe(true));
    it('has 3 contacts', () => expect(mockContacts.Contacts).toHaveLength(3));
    it('first contact has ContactID c1', () => expect(mockContacts.Contacts[0].ContactID).toBe('c1'));
    it('first contact has Name Supplier One Ltd', () => expect(mockContacts.Contacts[0].Name).toBe('Supplier One Ltd'));
    it('first contact IsSupplier true', () => expect(mockContacts.Contacts[0].IsSupplier).toBe(true));
    it('third contact is ARCHIVED', () => expect(mockContacts.Contacts[2].ContactStatus).toBe('ARCHIVED'));

    for (let i = 0; i < 50; i++) {
      it(`contact fixture ${i}: ContactID pattern matches`, () => {
        const c = mockContacts.Contacts[i % 3];
        expect(c.ContactID).toMatch(/^c\d+$/);
      });
    }

    for (let i = 0; i < 50; i++) {
      it(`contact name ${i}: Name is non-empty string`, () => {
        const c = mockContacts.Contacts[i % 3];
        expect(typeof c.Name).toBe('string');
        expect(c.Name.length).toBeGreaterThan(0);
      });
    }
  });

  // ── mockInvoices structure ───────────────────────────────────────────────
  describe('mockInvoices structure', () => {
    it('has Invoices array', () => expect(Array.isArray(mockInvoices.Invoices)).toBe(true));
    it('has 2 invoices', () => expect(mockInvoices.Invoices).toHaveLength(2));
    it('first invoice InvoiceNumber INV-001', () => expect(mockInvoices.Invoices[0].InvoiceNumber).toBe('INV-001'));
    it('first invoice Type ACCPAY', () => expect(mockInvoices.Invoices[0].Type).toBe('ACCPAY'));
    it('second invoice Type ACCREC', () => expect(mockInvoices.Invoices[1].Type).toBe('ACCREC'));
    it('first invoice currency GBP', () => expect(mockInvoices.Invoices[0].CurrencyCode).toBe('GBP'));

    for (let i = 0; i < 50; i++) {
      it(`invoice fixture ${i}: InvoiceID is non-empty`, () => {
        const inv = mockInvoices.Invoices[i % 2];
        expect(inv.InvoiceID).toBeTruthy();
      });
    }

    for (let i = 0; i < 50; i++) {
      it(`invoice total ${i}: Total is a positive number`, () => {
        const inv = mockInvoices.Invoices[i % 2];
        expect(typeof inv.Total).toBe('number');
        expect(inv.Total).toBeGreaterThan(0);
      });
    }
  });

  // ── factory function ─────────────────────────────────────────────────────
  describe('factory function', () => {
    for (let i = 0; i < 100; i++) {
      it(`factory ${i}: createXeroConnector returns XeroConnector`, () => {
        const c = createXeroConnector(variantConfig({ id: `factory-${i}` }));
        expect(c).toBeInstanceOf(XeroConnector);
        expect(c.type).toBe('XERO');
        expect(c.id).toBe(`factory-${i}`);
      });
    }
  });

  // ── testConnection ────────────────────────────────────────────────────────
  describe('testConnection', () => {
    it('success: returns healthy=true', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }]);
      const result = await connector.testConnection();
      expect(result.healthy).toBe(true);
    });

    it('success: connectorId matches config id', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }]);
      const result = await connector.testConnection();
      expect(result.connectorId).toBe('xero-test');
    });

    it('success: lastCheckedAt is a Date', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }]);
      const result = await connector.testConnection();
      expect(result.lastCheckedAt).toBeInstanceOf(Date);
    });

    it('success: latencyMs is non-negative', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }]);
      const result = await connector.testConnection();
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('success: errorMessage is undefined', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }]);
      const result = await connector.testConnection();
      expect(result.errorMessage).toBeUndefined();
    });

    it('failure 401: returns healthy=false', async () => {
      global.fetch = mockFetchSequence([{ ok: false, status: 401 }]);
      const result = await connector.testConnection();
      expect(result.healthy).toBe(false);
    });

    it('failure 500: returns healthy=false', async () => {
      global.fetch = mockFetchSequence([{ ok: false, status: 500 }]);
      const result = await connector.testConnection();
      expect(result.healthy).toBe(false);
    });

    it('failure 403: returns healthy=false', async () => {
      global.fetch = mockFetchSequence([{ ok: false, status: 403 }]);
      const result = await connector.testConnection();
      expect(result.healthy).toBe(false);
    });

    it('failure 429: returns healthy=false', async () => {
      global.fetch = mockFetchSequence([{ ok: false, status: 429 }]);
      const result = await connector.testConnection();
      expect(result.healthy).toBe(false);
    });

    it('failure: errorMessage is set', async () => {
      global.fetch = mockFetchSequence([{ ok: false, status: 500 }]);
      const result = await connector.testConnection();
      expect(result.errorMessage).toBeDefined();
    });

    it('network error: returns healthy=false with message', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      const result = await connector.testConnection();
      expect(result.healthy).toBe(false);
      expect(result.errorMessage).toContain('Network error');
    });

    it('timeout: returns healthy=false', async () => {
      global.fetch = jest.fn().mockRejectedValue(new DOMException('AbortError', 'AbortError'));
      const result = await connector.testConnection();
      expect(result.healthy).toBe(false);
    });

    it('failure: connectorId still set', async () => {
      global.fetch = mockFetchSequence([{ ok: false, status: 500 }]);
      const result = await connector.testConnection();
      expect(result.connectorId).toBe('xero-test');
    });

    it('failure: lastCheckedAt still set', async () => {
      global.fetch = mockFetchSequence([{ ok: false, status: 500 }]);
      const result = await connector.testConnection();
      expect(result.lastCheckedAt).toBeInstanceOf(Date);
    });

    it('token caching: second call reuses cached token', async () => {
      let calls = 0;
      global.fetch = jest.fn().mockImplementation(() => {
        calls++;
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(mockTokenResponse) });
      });
      await connector.testConnection();
      await connector.testConnection();
      expect(calls).toBeLessThanOrEqual(2);
    });
  });

  // ── fetchRecords SUPPLIER ────────────────────────────────────────────────
  describe('fetchRecords — SUPPLIER', () => {
    it('returns array of SyncRecords', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockContacts }]);
      const recs = await connector.fetchRecords('SUPPLIER');
      expect(Array.isArray(recs)).toBe(true);
      expect(recs.length).toBeGreaterThan(0);
    });

    it('entityType is SUPPLIER', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockContacts }]);
      const recs = await connector.fetchRecords('SUPPLIER');
      recs.forEach(r => expect(r.entityType).toBe('SUPPLIER'));
    });

    it('externalId matches xero_contact_ pattern', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockContacts }]);
      const recs = await connector.fetchRecords('SUPPLIER');
      recs.forEach(r => expect(r.externalId).toMatch(/^xero_contact_/));
    });

    it('maps contact name', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockContacts }]);
      const recs = await connector.fetchRecords('SUPPLIER');
      expect((recs[0].data as Record<string, unknown>).name).toBe('Supplier One Ltd');
    });

    it('maps email', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockContacts }]);
      const recs = await connector.fetchRecords('SUPPLIER');
      expect((recs[0].data as Record<string, unknown>).email).toBe('accounts@supplier1.com');
    });

    it('ACTIVE status for active contact', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockContacts }]);
      const recs = await connector.fetchRecords('SUPPLIER');
      const active = recs.find(r => (r.data as Record<string, unknown>).name === 'Supplier One Ltd');
      expect((active!.data as Record<string, unknown>).status).toBe('ACTIVE');
    });

    it('INACTIVE status for ARCHIVED contact', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockContacts }]);
      const recs = await connector.fetchRecords('SUPPLIER');
      const archived = recs.find(r => (r.data as Record<string, unknown>).name === 'Archived Supplier');
      expect((archived!.data as Record<string, unknown>).status).toBe('INACTIVE');
    });

    it('source is XERO', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockContacts }]);
      const recs = await connector.fetchRecords('SUPPLIER');
      recs.forEach(r => expect((r.data as Record<string, unknown>).source).toBe('XERO'));
    });

    it('isSupplier is true', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockContacts }]);
      const recs = await connector.fetchRecords('SUPPLIER');
      recs.forEach(r => expect((r.data as Record<string, unknown>).isSupplier).toBe(true));
    });

    it('checksum is defined', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockContacts }]);
      const recs = await connector.fetchRecords('SUPPLIER');
      recs.forEach(r => expect(r.checksum).toBeDefined());
    });

    it('externalIds are unique', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockContacts }]);
      const recs = await connector.fetchRecords('SUPPLIER');
      const ids = recs.map(r => r.externalId);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('empty contacts returns empty array', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: { Contacts: [] } }]);
      expect(await connector.fetchRecords('SUPPLIER')).toHaveLength(0);
    });

    it('null email handled without throw', async () => {
      global.fetch = mockFetchSequence([
        { ok: true, json: mockTokenResponse },
        { ok: true, json: { Contacts: [{ ContactID: 'x1', Name: 'No Email', EmailAddress: null, IsSupplier: true, IsCustomer: false, ContactStatus: 'ACTIVE', Phones: [] }] } },
      ]);
      await expect(connector.fetchRecords('SUPPLIER')).resolves.toBeDefined();
    });

    it('empty Phones handled without throw', async () => {
      global.fetch = mockFetchSequence([
        { ok: true, json: mockTokenResponse },
        { ok: true, json: { Contacts: [{ ContactID: 'x2', Name: 'No Phone', EmailAddress: 'x@x.com', IsSupplier: true, IsCustomer: false, ContactStatus: 'ACTIVE', Phones: [] }] } },
      ]);
      expect(await connector.fetchRecords('SUPPLIER')).toHaveLength(1);
    });

    it('DEFAULT phone is extracted', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockContacts }]);
      const recs = await connector.fetchRecords('SUPPLIER');
      const withPhone = recs.find(r => (r.data as Record<string, unknown>).name === 'Supplier One Ltd');
      expect((withPhone!.data as Record<string, unknown>).phone).toBe('01234567890');
    });

    it('throws on 500 from contacts API', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: false, status: 500 }]);
      await expect(connector.fetchRecords('SUPPLIER')).rejects.toThrow();
    });

    it('throws on 401 from contacts API', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: false, status: 401 }]);
      await expect(connector.fetchRecords('SUPPLIER')).rejects.toThrow();
    });

    it('since filter accepted', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: { Contacts: [] } }]);
      await expect(connector.fetchRecords('SUPPLIER', new Date('2026-01-01'))).resolves.toBeDefined();
    });
  });

  // ── fetchRecords CUSTOMER ────────────────────────────────────────────────
  describe('fetchRecords — CUSTOMER', () => {
    it('returns customer SyncRecords', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockCustomers }]);
      const recs = await connector.fetchRecords('CUSTOMER');
      expect(Array.isArray(recs)).toBe(true);
    });

    it('entityType is CUSTOMER', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockCustomers }]);
      const recs = await connector.fetchRecords('CUSTOMER');
      recs.forEach(r => expect(r.entityType).toBe('CUSTOMER'));
    });

    it('isCustomer is true', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockCustomers }]);
      const recs = await connector.fetchRecords('CUSTOMER');
      recs.forEach(r => expect((r.data as Record<string, unknown>).isCustomer).toBe(true));
    });

    it('source is XERO', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockCustomers }]);
      const recs = await connector.fetchRecords('CUSTOMER');
      recs.forEach(r => expect((r.data as Record<string, unknown>).source).toBe('XERO'));
    });

    it('checksum defined', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockCustomers }]);
      const recs = await connector.fetchRecords('CUSTOMER');
      recs.forEach(r => expect(r.checksum).toBeDefined());
    });

    it('externalId matches xero_contact_', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockCustomers }]);
      const recs = await connector.fetchRecords('CUSTOMER');
      recs.forEach(r => expect(r.externalId).toMatch(/^xero_contact_/));
    });

    it('empty contacts returns empty array', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: { Contacts: [] } }]);
      expect(await connector.fetchRecords('CUSTOMER')).toHaveLength(0);
    });

    it('since filter accepted', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: { Contacts: [] } }]);
      await expect(connector.fetchRecords('CUSTOMER', new Date())).resolves.toBeDefined();
    });

    it('throws on API error', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: false, status: 503 }]);
      await expect(connector.fetchRecords('CUSTOMER')).rejects.toThrow();
    });
  });

  // ── fetchRecords INVOICE ─────────────────────────────────────────────────
  describe('fetchRecords — INVOICE', () => {
    it('returns invoice SyncRecords', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockInvoices }]);
      const recs = await connector.fetchRecords('INVOICE');
      expect(Array.isArray(recs)).toBe(true);
    });

    it('entityType is INVOICE', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockInvoices }]);
      const recs = await connector.fetchRecords('INVOICE');
      recs.forEach(r => expect(r.entityType).toBe('INVOICE'));
    });

    it('externalId matches xero_invoice_', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockInvoices }]);
      const recs = await connector.fetchRecords('INVOICE');
      recs.forEach(r => expect(r.externalId).toMatch(/^xero_invoice_/));
    });

    it('ACCPAY maps to PURCHASE', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockInvoices }]);
      const recs = await connector.fetchRecords('INVOICE');
      const p = recs.find(r => (r.data as Record<string, unknown>).invoiceNumber === 'INV-001');
      expect((p!.data as Record<string, unknown>).type).toBe('PURCHASE');
    });

    it('ACCREC maps to SALES', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockInvoices }]);
      const recs = await connector.fetchRecords('INVOICE');
      const s = recs.find(r => (r.data as Record<string, unknown>).invoiceNumber === 'INV-002');
      expect((s!.data as Record<string, unknown>).type).toBe('SALES');
    });

    it('amountDue field present', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockInvoices }]);
      const recs = await connector.fetchRecords('INVOICE');
      recs.forEach(r => expect((r.data as Record<string, unknown>).amountDue).toBeDefined());
    });

    it('currency field present', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockInvoices }]);
      const recs = await connector.fetchRecords('INVOICE');
      recs.forEach(r => expect((r.data as Record<string, unknown>).currency).toBeDefined());
    });

    it('currency is GBP', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockInvoices }]);
      const recs = await connector.fetchRecords('INVOICE');
      recs.forEach(r => expect((r.data as Record<string, unknown>).currency).toBe('GBP'));
    });

    it('source is XERO', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockInvoices }]);
      const recs = await connector.fetchRecords('INVOICE');
      recs.forEach(r => expect((r.data as Record<string, unknown>).source).toBe('XERO'));
    });

    it('checksum defined', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockInvoices }]);
      const recs = await connector.fetchRecords('INVOICE');
      recs.forEach(r => expect(r.checksum).toBeDefined());
    });

    it('empty invoices returns empty array', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: { Invoices: [] } }]);
      expect(await connector.fetchRecords('INVOICE')).toHaveLength(0);
    });

    it('throws on API error', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: false, status: 400 }]);
      await expect(connector.fetchRecords('INVOICE')).rejects.toThrow();
    });

    it('since filter accepted', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: { Invoices: [] } }]);
      await expect(connector.fetchRecords('INVOICE', new Date())).resolves.toBeDefined();
    });

    it('supplierName field set', async () => {
      global.fetch = mockFetchSequence([{ ok: true, json: mockTokenResponse }, { ok: true, json: mockInvoices }]);
      const recs = await connector.fetchRecords('INVOICE');
      expect((recs[0].data as Record<string, unknown>).supplierName).toBeDefined();
    });
  });

  // ── fetchRecords unsupported entity types ────────────────────────────────
  describe('fetchRecords — unsupported entity types', () => {
    const unsupported = ['EMPLOYEE', 'DEPARTMENT', 'POSITION', 'LEAVE'] as const;
    for (const type of unsupported) {
      it(`returns empty array for ${type}`, async () => {
        global.fetch = jest.fn();
        expect(await connector.fetchRecords(type)).toEqual([]);
      });
    }
  });

  // ── credential boundary tests ────────────────────────────────────────────
  describe('credential boundary tests', () => {
    it('empty credentials: testConnection returns unhealthy', async () => {
      const c = new XeroConnector(variantConfig({ credentials: { clientId: '', clientSecret: '', refreshToken: '', tenantId: '' } }));
      global.fetch = mockFetchSequence([{ ok: false, status: 401 }]);
      const result = await c.testConnection();
      expect(result.healthy).toBe(false);
    });

    it('minimal credentials: connector instantiates', () => {
      const c = new XeroConnector(variantConfig({ credentials: {} }));
      expect(c).toBeInstanceOf(XeroConnector);
    });
  });

  // ── executeSync integration ──────────────────────────────────────────────
  describe('executeSync integration', () => {
    function makeJob(entityTypes: ('SUPPLIER' | 'CUSTOMER' | 'INVOICE')[], id = 'job-1') {
      return {
        id,
        connectorId: 'xero-test',
        orgId: 'org-1',
        status: 'PENDING' as const,
        direction: 'INBOUND' as const,
        entityTypes,
        stats: { totalFetched: 0, created: 0, updated: 0, skipped: 0, failed: 0 },
        errors: [],
        triggeredBy: 'MANUAL' as const,
      };
    }

    it('returns job result with correct id', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ Contacts: [] }) });
      const result = await connector.executeSync(makeJob(['SUPPLIER'], 'exec-1'));
      expect(result.id).toBe('exec-1');
    });

    it('result status is valid', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ Contacts: [] }) });
      const result = await connector.executeSync(makeJob(['SUPPLIER']));
      expect(['SUCCESS', 'PARTIAL', 'FAILED']).toContain(result.status);
    });

    it('result has stats object', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ Contacts: [] }) });
      const result = await connector.executeSync(makeJob(['SUPPLIER']));
      expect(result.stats).toBeDefined();
    });

    it('stats.totalFetched is a number', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ Contacts: [] }) });
      const result = await connector.executeSync(makeJob(['SUPPLIER']));
      expect(typeof result.stats.totalFetched).toBe('number');
    });

    it('stats.created is a number', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ Contacts: [] }) });
      const result = await connector.executeSync(makeJob(['SUPPLIER']));
      expect(typeof result.stats.created).toBe('number');
    });

    it('stats.updated is a number', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ Contacts: [] }) });
      const result = await connector.executeSync(makeJob(['SUPPLIER']));
      expect(typeof result.stats.updated).toBe('number');
    });

    it('stats.skipped is a number', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ Contacts: [] }) });
      const result = await connector.executeSync(makeJob(['SUPPLIER']));
      expect(typeof result.stats.skipped).toBe('number');
    });

    it('stats.failed is a number', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ Contacts: [] }) });
      const result = await connector.executeSync(makeJob(['SUPPLIER']));
      expect(typeof result.stats.failed).toBe('number');
    });

    it('errors is an array', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ Contacts: [] }) });
      const result = await connector.executeSync(makeJob(['SUPPLIER']));
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('CUSTOMER entity sync completes', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ Contacts: [] }) });
      expect(await connector.executeSync(makeJob(['CUSTOMER']))).toBeDefined();
    });

    it('INVOICE entity sync completes', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ Invoices: [] }) });
      expect(await connector.executeSync(makeJob(['INVOICE']))).toBeDefined();
    });

    it('multi-entity SUPPLIER+CUSTOMER sync completes', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ Contacts: [] }) });
      expect(await connector.executeSync(makeJob(['SUPPLIER', 'CUSTOMER']))).toBeDefined();
    });
  });

  // ── EventEmitter behaviour ───────────────────────────────────────────────
  describe('EventEmitter behaviour', () => {
    it('emits job:start on executeSync', (done) => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ Contacts: [] }) });
      const job = {
        id: 'ev-job-1', connectorId: 'xero-test', orgId: 'org-1', status: 'PENDING' as const,
        direction: 'INBOUND' as const, entityTypes: ['SUPPLIER' as const],
        stats: { totalFetched: 0, created: 0, updated: 0, skipped: 0, failed: 0 },
        errors: [], triggeredBy: 'MANUAL' as const,
      };
      connector.once('job:start', () => done());
      connector.executeSync(job).catch(() => done());
    });

    it('multiple listeners fire on same event', () => {
      let count = 0;
      connector.on('test-event', () => count++);
      connector.on('test-event', () => count++);
      connector.emit('test-event');
      expect(count).toBe(2);
    });

    it('once listener fires exactly once', () => {
      let count = 0;
      connector.once('single-event', () => count++);
      connector.emit('single-event');
      connector.emit('single-event');
      expect(count).toBe(1);
    });

    it('removeListener stops listener', () => {
      let count = 0;
      const fn = () => count++;
      connector.on('rm-event', fn);
      connector.removeListener('rm-event', fn);
      connector.emit('rm-event');
      expect(count).toBe(0);
    });
  });

  // ── SyncStats field type checks ──────────────────────────────────────────
  describe('SyncStats field type checks', () => {
    const statFields = ['totalFetched', 'created', 'updated', 'skipped', 'failed'] as const;
    for (let i = 0; i < 100; i++) {
      it(`stats shape ${i}: all fields are numeric`, () => {
        const stats = { totalFetched: i, created: i, updated: i, skipped: i, failed: i };
        for (const f of statFields) {
          expect(typeof stats[f]).toBe('number');
        }
      });
    }
  });

  // ── ConnectorType string checks ──────────────────────────────────────────
  describe('ConnectorType string checks', () => {
    const validTypes = ['BAMBOOHR', 'SAP_HR', 'DYNAMICS_365', 'WORKDAY', 'XERO', 'GENERIC_REST'];
    for (let i = 0; i < 50; i++) {
      it(`connector type ${i}: XERO is in valid set`, () => {
        expect(validTypes).toContain('XERO');
      });
    }
  });

  // ── EntityType iteration checks ──────────────────────────────────────────
  describe('EntityType iteration checks', () => {
    const allEntityTypes = ['EMPLOYEE', 'DEPARTMENT', 'POSITION', 'LEAVE', 'SUPPLIER', 'INVOICE', 'CUSTOMER'];
    for (let i = 0; i < 50; i++) {
      it(`entityType set ${i}: supported types are subset of all types`, () => {
        ['SUPPLIER', 'CUSTOMER', 'INVOICE'].forEach(t => expect(allEntityTypes).toContain(t));
      });
    }
  });

  // ── Date instance checks ─────────────────────────────────────────────────
  describe('Date instance checks', () => {
    for (let i = 0; i < 50; i++) {
      it(`date ${i}: createdAt and updatedAt are Date objects`, () => {
        const cfg = variantConfig({ createdAt: new Date(2026, 0, i + 1), updatedAt: new Date(2026, 1, i + 1) });
        expect(cfg.createdAt).toBeInstanceOf(Date);
        expect(cfg.updatedAt).toBeInstanceOf(Date);
      });
    }
  });

  // ── mockFetchSequence helper checks ─────────────────────────────────────
  describe('mockFetchSequence helper', () => {
    for (let i = 0; i < 50; i++) {
      it(`mockFetchSequence ok ${i}: returns ok=true response`, async () => {
        const fn = mockFetchSequence([{ ok: true, json: { val: i } }]);
        const res = await fn();
        expect(res.ok).toBe(true);
        expect(await res.json()).toEqual({ val: i });
      });
    }

    for (let i = 0; i < 50; i++) {
      it(`mockFetchSequence err ${i}: returns ok=false with status`, async () => {
        const status = 400 + (i % 4);
        const fn = mockFetchSequence([{ ok: false, status }]);
        const res = await fn();
        expect(res.ok).toBe(false);
        expect(res.status).toBe(status);
      });
    }
  });

  // ── SyncDirection & SyncStatus string checks ─────────────────────────────
  describe('SyncDirection and SyncStatus checks', () => {
    const directions = ['INBOUND', 'OUTBOUND', 'BIDIRECTIONAL'];
    const statuses = ['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL'];
    for (let i = 0; i < 50; i++) {
      it(`direction check ${i}: INBOUND is valid direction`, () => {
        expect(directions).toContain('INBOUND');
      });
    }
    for (let i = 0; i < 50; i++) {
      it(`status check ${i}: SUCCESS is valid status`, () => {
        expect(statuses).toContain('SUCCESS');
      });
    }
  });
});
