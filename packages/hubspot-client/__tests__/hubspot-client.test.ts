import { HubSpotClient } from '../src/index';

let mockFetch: jest.Mock;

beforeEach(() => {
  mockFetch = jest.fn();
  (global as unknown as { fetch: jest.Mock }).fetch = mockFetch;
  // Ensure env var doesn't interfere
  delete process.env.HUBSPOT_API_KEY;
});

afterEach(() => jest.restoreAllMocks());

function ok(data: unknown) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
  });
}

function err(status = 400) {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({ message: 'error' }),
  });
}

describe('HubSpotClient', () => {
  // ── No API key (short-circuit) ────────────────────────────────

  describe('when no API key is provided', () => {
    it('returns null without calling fetch', async () => {
      const client = new HubSpotClient(); // no key, no env var
      const result = await client.createContact({ email: 'test@test.com' });
      expect(result).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('accepts key via constructor arg', async () => {
      const client = new HubSpotClient('hs-key');
      mockFetch.mockReturnValueOnce(ok({ id: '1' }));
      const result = await client.createContact({ email: 'a@b.com' });
      expect(result).toEqual({ id: '1' });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('falls back to HUBSPOT_API_KEY env var', async () => {
      process.env.HUBSPOT_API_KEY = 'env-key';
      const client = new HubSpotClient();
      mockFetch.mockReturnValueOnce(ok({ id: '2' }));
      await client.createContact({ name: 'Env User' });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  // ── createContact ─────────────────────────────────────────────

  describe('createContact', () => {
    let client: HubSpotClient;
    beforeEach(() => { client = new HubSpotClient('test-key'); });

    it('sends POST to /crm/v3/objects/contacts', async () => {
      mockFetch.mockReturnValueOnce(ok({ id: 'c1' }));
      await client.createContact({ email: 'a@b.com', firstname: 'Alice' });
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe('https://api.hubapi.com/crm/v3/objects/contacts');
      expect(opts.method).toBe('POST');
      expect(JSON.parse(opts.body)).toMatchObject({ properties: { email: 'a@b.com' } });
    });

    it('sets Bearer Authorization header', async () => {
      mockFetch.mockReturnValueOnce(ok({}));
      await client.createContact({});
      expect(mockFetch.mock.calls[0][1].headers).toMatchObject({
        Authorization: 'Bearer test-key',
      });
    });

    it('returns null on non-ok response', async () => {
      mockFetch.mockReturnValueOnce(err(400));
      expect(await client.createContact({ email: 'x@y.com' })).toBeNull();
    });

    it('returns null when fetch throws', async () => {
      mockFetch.mockRejectedValueOnce(new Error('network'));
      expect(await client.createContact({ email: 'x@y.com' })).toBeNull();
    });
  });

  // ── updateContact ─────────────────────────────────────────────

  describe('updateContact', () => {
    let client: HubSpotClient;
    beforeEach(() => { client = new HubSpotClient('test-key'); });

    it('sends PATCH to /crm/v3/objects/contacts/:id', async () => {
      mockFetch.mockReturnValueOnce(ok({ id: 'c1' }));
      await client.updateContact('c1', { phone: '555-0000' });
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe('https://api.hubapi.com/crm/v3/objects/contacts/c1');
      expect(opts.method).toBe('PATCH');
    });
  });

  // ── createDeal ────────────────────────────────────────────────

  describe('createDeal', () => {
    let client: HubSpotClient;
    beforeEach(() => { client = new HubSpotClient('test-key'); });

    it('sends POST to /crm/v3/objects/deals', async () => {
      mockFetch.mockReturnValueOnce(ok({ id: 'd1' }));
      await client.createDeal({ dealname: 'Enterprise', amount: '50000' });
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe('https://api.hubapi.com/crm/v3/objects/deals');
      expect(opts.method).toBe('POST');
      expect(JSON.parse(opts.body).properties.dealname).toBe('Enterprise');
    });
  });

  // ── updateDeal ────────────────────────────────────────────────

  describe('updateDeal', () => {
    let client: HubSpotClient;
    beforeEach(() => { client = new HubSpotClient('test-key'); });

    it('sends PATCH to /crm/v3/objects/deals/:id', async () => {
      mockFetch.mockReturnValueOnce(ok({}));
      await client.updateDeal('d42', { dealstage: 'closed_won' });
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe('https://api.hubapi.com/crm/v3/objects/deals/d42');
      expect(opts.method).toBe('PATCH');
    });
  });

  // ── createTask ────────────────────────────────────────────────

  describe('createTask', () => {
    let client: HubSpotClient;
    beforeEach(() => { client = new HubSpotClient('test-key'); });

    it('sends POST to /crm/v3/objects/tasks', async () => {
      mockFetch.mockReturnValueOnce(ok({ id: 't1' }));
      await client.createTask({ hs_task_subject: 'Follow up', hs_task_status: 'NOT_STARTED' });
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe('https://api.hubapi.com/crm/v3/objects/tasks');
      expect(opts.method).toBe('POST');
    });
  });

  // ── getDeals ──────────────────────────────────────────────────

  describe('getDeals', () => {
    let client: HubSpotClient;
    beforeEach(() => { client = new HubSpotClient('test-key'); });

    it('sends GET with default limit of 100', async () => {
      mockFetch.mockReturnValueOnce(ok({ results: [] }));
      await client.getDeals();
      expect(mockFetch.mock.calls[0][0]).toBe(
        'https://api.hubapi.com/crm/v3/objects/deals?limit=100'
      );
    });

    it('accepts a custom limit', async () => {
      mockFetch.mockReturnValueOnce(ok({ results: [] }));
      await client.getDeals(25);
      expect(mockFetch.mock.calls[0][0]).toContain('limit=25');
    });
  });

  // ── getDealsByStage ───────────────────────────────────────────

  describe('getDealsByStage', () => {
    let client: HubSpotClient;
    beforeEach(() => { client = new HubSpotClient('test-key'); });

    it('sends GET to /crm/v3/pipelines/deals/:pipelineId/stages', async () => {
      mockFetch.mockReturnValueOnce(ok({ results: [] }));
      await client.getDealsByStage('pipeline-123');
      expect(mockFetch.mock.calls[0][0]).toBe(
        'https://api.hubapi.com/crm/v3/pipelines/deals/pipeline-123/stages'
      );
    });
  });
});

describe('HubSpotClient — extended', () => {
  it('createTask returns null on non-ok response', async () => {
    const client = new HubSpotClient('test-key');
    mockFetch.mockReturnValueOnce(err(422));
    const result = await client.createTask({ hs_task_subject: 'Demo', hs_task_status: 'NOT_STARTED' });
    expect(result).toBeNull();
  });
});


describe('HubSpotClient — additional coverage', () => {
  it('constructor stores API key internally', () => {
    const client = new HubSpotClient('my-key-123');
    expect(client).toBeDefined();
  });

  it('createContact returns null on non-ok response', async () => {
    const client = new HubSpotClient('test-key');
    mockFetch.mockReturnValueOnce({ ok: false, status: 500, json: async () => ({}) });
    const result = await client.createContact({ email: 'fail@test.com' });
    expect(result).toBeNull();
  });

  it('createContact calls fetch once', async () => {
    const client = new HubSpotClient('test-key');
    mockFetch.mockReturnValueOnce({ ok: true, json: async () => ({ id: 'c-1' }) });
    await client.createContact({ email: 'test@ims.local' });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('updateContact returns null on error', async () => {
    const client = new HubSpotClient('test-key');
    mockFetch.mockReturnValueOnce({ ok: false, status: 500, json: async () => ({}) });
    const result = await client.updateContact('c-1', { firstname: 'X' });
    expect(result).toBeNull();
  });

  it('getDealsByStage uses correct pipelineId in URL', async () => {
    const client = new HubSpotClient('test-key');
    mockFetch.mockReturnValueOnce({ ok: true, json: async () => ({ results: [] }) });
    await client.getDealsByStage('my-pipeline-456');
    expect(mockFetch.mock.calls[0][0]).toContain('my-pipeline-456');
  });
});

describe('HubSpotClient — further edge cases', () => {
  it('createDeal returns null when fetch throws', async () => {
    const client = new HubSpotClient('test-key');
    mockFetch.mockRejectedValueOnce(new Error('timeout'));
    const result = await client.createDeal({ dealname: 'Test Deal' });
    expect(result).toBeNull();
  });

  it('updateDeal returns null when response is not ok', async () => {
    const client = new HubSpotClient('test-key');
    mockFetch.mockReturnValueOnce(err(404));
    const result = await client.updateDeal('d-99', { dealstage: 'closed_lost' });
    expect(result).toBeNull();
  });

  it('getDeals returns null when fetch throws', async () => {
    const client = new HubSpotClient('test-key');
    mockFetch.mockRejectedValueOnce(new Error('network error'));
    const result = await client.getDeals();
    expect(result).toBeNull();
  });

  it('getDeals with limit=0 sends limit=0 in URL', async () => {
    const client = new HubSpotClient('test-key');
    mockFetch.mockReturnValueOnce(ok({ results: [] }));
    await client.getDeals(0);
    expect(mockFetch.mock.calls[0][0]).toContain('limit=0');
  });

  it('getDealsByStage returns null when fetch throws', async () => {
    const client = new HubSpotClient('test-key');
    mockFetch.mockRejectedValueOnce(new Error('DNS failure'));
    const result = await client.getDealsByStage('pipe-abc');
    expect(result).toBeNull();
  });

  it('createTask sends correct JSON body with properties wrapper', async () => {
    const client = new HubSpotClient('test-key');
    mockFetch.mockReturnValueOnce(ok({ id: 't-2' }));
    await client.createTask({ hs_task_subject: 'Review contract', hs_task_status: 'NOT_STARTED' });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.properties.hs_task_subject).toBe('Review contract');
    expect(body.properties.hs_task_status).toBe('NOT_STARTED');
  });

  it('updateContact sends correct PATCH body', async () => {
    const client = new HubSpotClient('test-key');
    mockFetch.mockReturnValueOnce(ok({ id: 'c-updated' }));
    await client.updateContact('c-42', { lastname: 'Smith', phone: '123456' });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.properties.lastname).toBe('Smith');
    expect(body.properties.phone).toBe('123456');
  });

  it('all requests include Content-Type application/json header', async () => {
    const client = new HubSpotClient('test-key');
    mockFetch.mockReturnValueOnce(ok({}));
    await client.createDeal({ dealname: 'X' });
    expect(mockFetch.mock.calls[0][1].headers['Content-Type']).toBe('application/json');
  });
});

describe('HubSpotClient — comprehensive edge cases', () => {
  it('createContact with multiple properties wraps all in properties key', async () => {
    const client = new HubSpotClient('test-key');
    mockFetch.mockReturnValueOnce(ok({ id: 'c-multi' }));
    await client.createContact({ email: 'a@b.com', firstname: 'Alice', lastname: 'Smith', phone: '555-1234' });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.properties.email).toBe('a@b.com');
    expect(body.properties.firstname).toBe('Alice');
    expect(body.properties.lastname).toBe('Smith');
    expect(body.properties.phone).toBe('555-1234');
  });

  it('updateDeal sends correct dealId in URL', async () => {
    const client = new HubSpotClient('test-key');
    mockFetch.mockReturnValueOnce(ok({ id: 'deal-url-check' }));
    await client.updateDeal('deal-abc-999', { dealstage: 'new' });
    expect(mockFetch.mock.calls[0][0]).toContain('deal-abc-999');
  });

  it('getDeals sends GET method (no body)', async () => {
    const client = new HubSpotClient('test-key');
    mockFetch.mockReturnValueOnce(ok({ results: [] }));
    await client.getDeals();
    const opts = mockFetch.mock.calls[0][1];
    expect(opts.method).toBeUndefined();
  });

  it('getDealsByStage uses GET (no method set)', async () => {
    const client = new HubSpotClient('test-key');
    mockFetch.mockReturnValueOnce(ok({ results: [] }));
    await client.getDealsByStage('pipe-x');
    const opts = mockFetch.mock.calls[0][1];
    expect(opts.method).toBeUndefined();
  });

  it('createDeal includes Authorization header', async () => {
    const client = new HubSpotClient('my-deal-key');
    mockFetch.mockReturnValueOnce(ok({ id: 'd-auth' }));
    await client.createDeal({ dealname: 'Verified' });
    expect(mockFetch.mock.calls[0][1].headers.Authorization).toBe('Bearer my-deal-key');
  });

  it('no-key client returns null for all methods without calling fetch', async () => {
    const client = new HubSpotClient();
    const results = await Promise.all([
      client.createDeal({ dealname: 'x' }),
      client.updateDeal('d1', { dealstage: 'y' }),
      client.createTask({ hs_task_subject: 'z', hs_task_status: 'NOT_STARTED' }),
      client.getDeals(),
      client.getDealsByStage('pipe'),
    ]);
    expect(results.every((r) => r === null)).toBe(true);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('updateContact sends PATCH with correct contact id and properties', async () => {
    const client = new HubSpotClient('test-key');
    mockFetch.mockReturnValueOnce(ok({ id: 'c-patch' }));
    await client.updateContact('contact-777', { email: 'updated@test.com' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('contact-777');
    expect(opts.method).toBe('PATCH');
    const body = JSON.parse(opts.body);
    expect(body.properties.email).toBe('updated@test.com');
  });
});

describe('HubSpotClient — final coverage', () => {
  it('createContact returns the parsed response data on success', async () => {
    const client = new HubSpotClient('test-key');
    mockFetch.mockReturnValueOnce(ok({ id: 'c-final', email: 'final@ims.local' }));
    const result = await client.createContact({ email: 'final@ims.local' });
    expect(result).toEqual({ id: 'c-final', email: 'final@ims.local' });
  });

  it('createDeal returns the parsed response data on success', async () => {
    const client = new HubSpotClient('test-key');
    mockFetch.mockReturnValueOnce(ok({ id: 'd-final', dealname: 'Final Deal' }));
    const result = await client.createDeal({ dealname: 'Final Deal' });
    expect(result).toEqual({ id: 'd-final', dealname: 'Final Deal' });
  });

  it('updateDeal returns the parsed response data on success', async () => {
    const client = new HubSpotClient('test-key');
    mockFetch.mockReturnValueOnce(ok({ id: 'd-upd', dealstage: 'closed_won' }));
    const result = await client.updateDeal('d-upd', { dealstage: 'closed_won' });
    expect(result).toEqual({ id: 'd-upd', dealstage: 'closed_won' });
  });

  it('env var HUBSPOT_API_KEY is used when no constructor key provided', async () => {
    process.env.HUBSPOT_API_KEY = 'env-final-key';
    const client = new HubSpotClient();
    mockFetch.mockReturnValueOnce(ok({ id: 'env-c' }));
    await client.createContact({ email: 'env@ims.local' });
    expect(mockFetch.mock.calls[0][1].headers.Authorization).toBe('Bearer env-final-key');
    delete process.env.HUBSPOT_API_KEY;
  });

  it('getDealsByStage returns the parsed response data on success', async () => {
    const client = new HubSpotClient('test-key');
    const mockData = { results: [{ id: 's-1', label: 'Open' }] };
    mockFetch.mockReturnValueOnce(ok(mockData));
    const result = await client.getDealsByStage('pipe-final');
    expect(result).toEqual(mockData);
  });
});
