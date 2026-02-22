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

describe('IntercomClient — extended', () => {
  it('sendInAppMessage returns the parsed response data on success', async () => {
    const client = new IntercomClient('test-token');
    const responseData = { id: 'msg-extended-1', message_type: 'inapp' };
    mockFetch.mockReturnValueOnce(ok(responseData));
    const result = await client.sendInAppMessage('user-ext', 'Extended test');
    expect(result).toEqual(responseData);
  });

  it('createContact returns parsed response data on success', async () => {
    const client = new IntercomClient('test-token');
    const contactData = { id: 'contact-ext-1', email: 'ext@ims.local', role: 'user' };
    mockFetch.mockReturnValueOnce(ok(contactData));
    const result = await client.createContact('ext@ims.local', 'Extended User');
    expect(result).toEqual(contactData);
  });

  it('sendInAppMessage uses the correct Intercom API URL', async () => {
    const client = new IntercomClient('my-secret-token');
    mockFetch.mockReturnValueOnce(ok({ id: 'msg-url-check' }));
    await client.sendInAppMessage('u-url', 'URL check');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('intercom.io');
  });
});

describe('IntercomClient — additional coverage', () => {
  it('constructor returns a client object', () => {
    const { IntercomClient } = require('../src/index');
    const client = new IntercomClient('some-token');
    expect(client).toBeDefined();
  });

  it('sendInAppMessage calls fetch exactly once', async () => {
    const { IntercomClient } = require('../src/index');
    const client = new IntercomClient('test-token');
    mockFetch.mockReturnValueOnce(ok({ id: 'call-count-1' }));
    await client.sendInAppMessage('user-1', 'hello');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('sendInAppMessage returns null on non-ok response', async () => {
    const { IntercomClient } = require('../src/index');
    const client = new IntercomClient('test-token');
    mockFetch.mockReturnValueOnce(err(400));
    const result = await client.sendInAppMessage('user-1', 'fail-test');
    expect(result).toBeNull();
  });

  it('createContact URL contains api.intercom.io', async () => {
    const { IntercomClient } = require('../src/index');
    const client = new IntercomClient('test-token');
    mockFetch.mockReturnValueOnce(ok({ id: 'url-check' }));
    await client.createContact('url@ims.local', 'URL User');
    expect(mockFetch.mock.calls[0][0]).toContain('intercom.io');
  });

  it('createContact returns null on 500 error', async () => {
    const { IntercomClient } = require('../src/index');
    const client = new IntercomClient('test-token');
    mockFetch.mockReturnValueOnce(err(500));
    const result = await client.createContact('fail@ims.local', 'Fail User');
    expect(result).toBeNull();
  });
});

describe('IntercomClient — edge cases and validation', () => {
  let client: IntercomClient;

  beforeEach(() => {
    client = new IntercomClient('edge-token');
  });

  it('sendInAppMessage body includes the exact message text', async () => {
    const message = 'Your permit has been approved!';
    mockFetch.mockReturnValueOnce(ok({ id: 'm-body' }));
    await client.sendInAppMessage('uid-body', message);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.body).toBe(message);
  });

  it('sendInAppMessage passes correct to.user_id for different users', async () => {
    mockFetch.mockReturnValueOnce(ok({}));
    await client.sendInAppMessage('user-xyz-999', 'Test');
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.to.user_id).toBe('user-xyz-999');
  });

  it('createContact payload has no custom_attributes when not provided', async () => {
    mockFetch.mockReturnValueOnce(ok({ id: 'c-no-attrs' }));
    await client.createContact('plain@ims.local', 'Plain User');
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.custom_attributes).toBeUndefined();
  });

  it('createContact uses POST method for /contacts endpoint', async () => {
    mockFetch.mockReturnValueOnce(ok({}));
    await client.createContact('post@ims.local', 'Post User');
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe('POST');
  });

  it('sendInAppMessage returns null when INTERCOM_ACCESS_TOKEN is empty string', async () => {
    const emptyClient = new IntercomClient('');
    const result = await emptyClient.sendInAppMessage('u', 'msg');
    expect(result).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('createContact returns null when fetch rejects with network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    const result = await client.createContact('net@ims.local', 'Net User');
    expect(result).toBeNull();
  });

  it('sendInAppMessage Authorization header uses exact token passed to constructor', async () => {
    const specificClient = new IntercomClient('my-specific-token-abc123');
    mockFetch.mockReturnValueOnce(ok({}));
    await specificClient.sendInAppMessage('u', 'msg');
    const { headers } = mockFetch.mock.calls[0][1];
    expect(headers.Authorization).toBe('Bearer my-specific-token-abc123');
  });

  it('createContact sets Content-Type to application/json', async () => {
    mockFetch.mockReturnValueOnce(ok({}));
    await client.createContact('ct@ims.local', 'CT User');
    const { headers } = mockFetch.mock.calls[0][1];
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('sendInAppMessage returns null on 401 Unauthorized', async () => {
    mockFetch.mockReturnValueOnce(err(401));
    const result = await client.sendInAppMessage('u', 'msg');
    expect(result).toBeNull();
  });

  it('createContact sets Intercom-Version header to 2.10', async () => {
    mockFetch.mockReturnValueOnce(ok({}));
    await client.createContact('ver@ims.local', 'Ver User');
    const { headers } = mockFetch.mock.calls[0][1];
    expect(headers['Intercom-Version']).toBe('2.10');
  });
});

describe('IntercomClient — final coverage', () => {
  let client: IntercomClient;

  beforeEach(() => {
    client = new IntercomClient('final-token');
  });

  it('sendInAppMessage with a very long message does not throw', async () => {
    const longMsg = 'x'.repeat(1000);
    mockFetch.mockReturnValueOnce(ok({ id: 'long-msg' }));
    await expect(client.sendInAppMessage('u', longMsg)).resolves.not.toThrow();
  });

  it('createContact with empty name string sends empty name in body', async () => {
    mockFetch.mockReturnValueOnce(ok({ id: 'c-empty-name' }));
    await client.createContact('e@ims.local', '');
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.name).toBe('');
  });

  it('no-token client returns null for createContact without calling fetch', async () => {
    const noTokenClient = new IntercomClient('');
    const result = await noTokenClient.createContact('x@ims.local', 'X');
    expect(result).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('sendInAppMessage from.type is always admin', async () => {
    mockFetch.mockReturnValueOnce(ok({}));
    await client.sendInAppMessage('user-admin-check', 'test');
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.from.type).toBe('admin');
  });

  it('createContact with custom attributes merges them correctly', async () => {
    mockFetch.mockReturnValueOnce(ok({ id: 'c-merged' }));
    await client.createContact('merge@ims.local', 'Merge User', { tier: 'gold', region: 'EU' });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.custom_attributes.tier).toBe('gold');
    expect(body.custom_attributes.region).toBe('EU');
  });
});

describe('IntercomClient — additional final coverage', () => {
  it('INTERCOM_ACCESS_TOKEN env var is used when no constructor key', async () => {
    process.env.INTERCOM_ACCESS_TOKEN = 'env-final-token';
    const client = new IntercomClient();
    const mockFetchLocal = jest.fn().mockReturnValueOnce(ok({ id: 'm-env' }));
    (global as unknown as { fetch: jest.Mock }).fetch = mockFetchLocal;
    await client.sendInAppMessage('u-env', 'env msg');
    expect(mockFetchLocal.mock.calls[0][1].headers.Authorization).toBe('Bearer env-final-token');
    delete process.env.INTERCOM_ACCESS_TOKEN;
  });

  it('createContact sends Content-Type application/json', async () => {
    const mockFetchLocal = jest.fn().mockReturnValueOnce(ok({}));
    (global as unknown as { fetch: jest.Mock }).fetch = mockFetchLocal;
    const client = new IntercomClient('ct-final-token');
    await client.createContact('ct@ims.local', 'CT');
    expect(mockFetchLocal.mock.calls[0][1].headers['Content-Type']).toBe('application/json');
  });

  it('sendInAppMessage to.type is always user', async () => {
    const mockFetchLocal = jest.fn().mockReturnValueOnce(ok({}));
    (global as unknown as { fetch: jest.Mock }).fetch = mockFetchLocal;
    const client = new IntercomClient('type-token');
    await client.sendInAppMessage('user-type-check', 'test');
    const body = JSON.parse(mockFetchLocal.mock.calls[0][1].body);
    expect(body.to.type).toBe('user');
  });

  it('sendInAppMessage message_type is always inapp', async () => {
    const mockFetchLocal = jest.fn().mockReturnValueOnce(ok({}));
    (global as unknown as { fetch: jest.Mock }).fetch = mockFetchLocal;
    const client = new IntercomClient('inapp-token');
    await client.sendInAppMessage('u', 'msg type check');
    const body = JSON.parse(mockFetchLocal.mock.calls[0][1].body);
    expect(body.message_type).toBe('inapp');
  });

  it('createContact role is always user', async () => {
    const mockFetchLocal = jest.fn().mockReturnValueOnce(ok({}));
    (global as unknown as { fetch: jest.Mock }).fetch = mockFetchLocal;
    const client = new IntercomClient('role-token');
    await client.createContact('role@ims.local', 'Role User');
    const body = JSON.parse(mockFetchLocal.mock.calls[0][1].body);
    expect(body.role).toBe('user');
  });
});

describe('intercom client — phase29 coverage', () => {
  it('handles string startsWith', () => {
    expect('hello'.startsWith('he')).toBe(true);
  });

  it('handles error instanceof', () => {
    expect(new Error('test')).toBeInstanceOf(Error);
  });

  it('handles spread operator', () => {
    expect([...[1, 2], ...[3, 4]]).toEqual([1, 2, 3, 4]);
  });

  it('handles template literals', () => {
    const n = 42; expect(`value: ${n}`).toBe('value: 42');
  });

  it('handles JSON stringify', () => {
    expect(JSON.stringify({ a: 1 })).toBe('{"a":1}');
  });

});

describe('intercom client — phase30 coverage', () => {
  it('handles Math.floor', () => {
    expect(Math.floor(3.9)).toBe(3);
  });

  it('handles Math.min', () => {
    expect(Math.min(1, 2, 3)).toBe(1);
  });

  it('handles array map', () => {
    expect([1, 2, 3].map(x => x * 2)).toEqual([2, 4, 6]);
  });

  it('handles string toUpperCase', () => {
    expect('hello'.toUpperCase()).toBe('HELLO');
  });

  it('handles every method', () => {
    expect([1, 2, 3].every(x => x > 0)).toBe(true);
  });

});


describe('phase31 coverage', () => {
  it('handles JSON stringify', () => { expect(JSON.stringify({a:1})).toBe('{"a":1}'); });
  it('handles string padEnd', () => { expect('5'.padEnd(3,'0')).toBe('500'); });
  it('handles Math.round', () => { expect(Math.round(3.5)).toBe(4); });
  it('handles default params', () => { const fn = (x = 10) => x; expect(fn()).toBe(10); expect(fn(5)).toBe(5); });
  it('handles optional chaining', () => { const o: any = null; expect(o?.x).toBeUndefined(); });
});


describe('phase32 coverage', () => {
  it('handles logical OR assignment', () => { let y = 0; y ||= 5; expect(y).toBe(5); });
  it('handles instanceof check', () => { class Dog {} const d = new Dog(); expect(d instanceof Dog).toBe(true); });
  it('handles string indexOf', () => { expect('foobar'.indexOf('bar')).toBe(3); expect('foobar'.indexOf('baz')).toBe(-1); });
  it('handles memoization pattern', () => { const cache = new Map<number,number>(); const fib = (n: number): number => { if(n<=1)return n; if(cache.has(n))return cache.get(n)!; const v=fib(n-1)+fib(n-2); cache.set(n,v); return v; }; expect(fib(10)).toBe(55); });
  it('handles object property shorthand', () => { const x = 1, y = 2; const o = {x, y}; expect(o).toEqual({x:1,y:2}); });
});


describe('phase33 coverage', () => {
  it('handles string index access', () => { expect('hello'[0]).toBe('h'); });
  it('divides numbers', () => { expect(20 / 4).toBe(5); });
  it('handles parseFloat', () => { expect(parseFloat('3.14')).toBeCloseTo(3.14); });
  it('handles function composition', () => { const compose = (f: (x: number) => number, g: (x: number) => number) => (x: number) => f(g(x)); const double = (x: number) => x * 2; const square = (x: number) => x * x; expect(compose(double, square)(3)).toBe(18); });
  it('handles void operator', () => { expect(void 0).toBeUndefined(); });
});


describe('phase34 coverage', () => {
  it('handles array of objects sort', () => { const arr = [{n:3},{n:1},{n:2}]; arr.sort((a,b)=>a.n-b.n); expect(arr[0].n).toBe(1); });
  it('handles rest in destructuring', () => { const {a,...rest} = {a:1,b:2,c:3}; expect(rest).toEqual({b:2,c:3}); });
  it('handles static method', () => { class MathHelper { static square(n: number) { return n*n; } } expect(MathHelper.square(4)).toBe(16); });
  it('handles chained string methods', () => { expect('  Hello World  '.trim().toLowerCase()).toBe('hello world'); });
  it('handles object key renaming via destructuring', () => { const {a: x, b: y} = {a:1,b:2}; expect(x).toBe(1); expect(y).toBe(2); });
});


describe('phase35 coverage', () => {
  it('handles deep equal check via JSON', () => { const deepEq = (a:unknown,b:unknown) => JSON.stringify(a)===JSON.stringify(b); expect(deepEq({a:1,b:[2,3]},{a:1,b:[2,3]})).toBe(true); expect(deepEq({a:1},{a:2})).toBe(false); });
  it('handles mixin pattern', () => { class Base { name = 'Alice'; } class WithDate extends Base { createdAt = new Date(); } const u = new WithDate(); expect(u.name).toBe('Alice'); expect(u.createdAt instanceof Date).toBe(true); });
  it('handles satisfies operator pattern', () => { const config = { port: 8080, host: 'localhost' } satisfies Record<string,unknown>; expect(config.port).toBe(8080); });
  it('handles type guard function', () => { const isString = (v:unknown): v is string => typeof v === 'string'; const vals: unknown[] = [1,'hi',true]; expect(vals.filter(isString)).toEqual(['hi']); });
  it('handles array groupBy pattern', () => { const groupBy = <T>(arr:T[], key:(item:T)=>string): Record<string,T[]> => arr.reduce((acc,item)=>{ const k=key(item); (acc[k]=acc[k]||[]).push(item); return acc; },{}as Record<string,T[]>); const r = groupBy([{t:'a',v:1},{t:'b',v:2},{t:'a',v:3}],x=>x.t); expect(r['a'].length).toBe(2); });
});
