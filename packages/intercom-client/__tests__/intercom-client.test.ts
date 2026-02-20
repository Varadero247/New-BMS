import { IntercomClient } from '../src/index';

let mockFetch: jest.Mock;

beforeEach(() => {
  mockFetch = jest.fn();
  (global as unknown as { fetch: jest.Mock }).fetch = mockFetch;
  delete process.env.INTERCOM_ACCESS_TOKEN;
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

describe('IntercomClient', () => {
  // ── No access token (short-circuit) ──────────────────────────

  describe('when no access token is provided', () => {
    it('returns null without calling fetch', async () => {
      const client = new IntercomClient();
      const result = await client.sendInAppMessage('user-1', 'Hello');
      expect(result).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('accepts token via constructor arg', async () => {
      const client = new IntercomClient('ic-token');
      mockFetch.mockReturnValueOnce(ok({ id: 'm1' }));
      await client.sendInAppMessage('u1', 'Hi');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('falls back to INTERCOM_ACCESS_TOKEN env var', async () => {
      process.env.INTERCOM_ACCESS_TOKEN = 'env-token';
      const client = new IntercomClient();
      mockFetch.mockReturnValueOnce(ok({ id: 'm2' }));
      await client.sendInAppMessage('u2', 'Hey');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  // ── sendInAppMessage ──────────────────────────────────────────

  describe('sendInAppMessage', () => {
    let client: IntercomClient;
    beforeEach(() => { client = new IntercomClient('test-token'); });

    it('sends POST to /messages', async () => {
      mockFetch.mockReturnValueOnce(ok({ id: 'msg-1' }));
      await client.sendInAppMessage('user-42', 'Welcome to IMS!');
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe('https://api.intercom.io/messages');
      expect(opts.method).toBe('POST');
    });

    it('sends correct message payload with inapp type and recipient', async () => {
      mockFetch.mockReturnValueOnce(ok({}));
      await client.sendInAppMessage('uid-99', 'Hello there');
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toMatchObject({
        message_type: 'inapp',
        body: 'Hello there',
        to: { type: 'user', user_id: 'uid-99' },
        from: { type: 'admin' },
      });
    });

    it('sets Bearer Authorization and Intercom-Version headers', async () => {
      mockFetch.mockReturnValueOnce(ok({}));
      await client.sendInAppMessage('u', 'msg');
      expect(mockFetch.mock.calls[0][1].headers).toMatchObject({
        Authorization: 'Bearer test-token',
        'Intercom-Version': '2.10',
        'Content-Type': 'application/json',
      });
    });

    it('returns null on non-ok response', async () => {
      mockFetch.mockReturnValueOnce(err(422));
      expect(await client.sendInAppMessage('u', 'x')).toBeNull();
    });

    it('returns null when fetch throws', async () => {
      mockFetch.mockRejectedValueOnce(new Error('network error'));
      expect(await client.sendInAppMessage('u', 'x')).toBeNull();
    });
  });

  // ── createContact ─────────────────────────────────────────────

  describe('createContact', () => {
    let client: IntercomClient;
    beforeEach(() => { client = new IntercomClient('test-token'); });

    it('sends POST to /contacts', async () => {
      mockFetch.mockReturnValueOnce(ok({ id: 'contact-1' }));
      await client.createContact('alice@example.com', 'Alice');
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe('https://api.intercom.io/contacts');
      expect(opts.method).toBe('POST');
    });

    it('includes email, name, and role in payload', async () => {
      mockFetch.mockReturnValueOnce(ok({}));
      await client.createContact('bob@ims.local', 'Bob Smith');
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toMatchObject({
        role: 'user',
        email: 'bob@ims.local',
        name: 'Bob Smith',
      });
    });

    it('includes custom_attributes when provided', async () => {
      mockFetch.mockReturnValueOnce(ok({}));
      await client.createContact('c@d.com', 'Carol', { plan: 'enterprise', orgId: 'org-1' });
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.custom_attributes).toMatchObject({ plan: 'enterprise', orgId: 'org-1' });
    });

    it('returns null on non-ok response', async () => {
      mockFetch.mockReturnValueOnce(err(409));
      expect(await client.createContact('dup@ims.local', 'Dup')).toBeNull();
    });
  });
});
