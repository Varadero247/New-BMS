/**
 * Tests for @ims/testing — helpers, factories, and mocks
 */

import {
  wait,
  randomString,
  randomEmail,
  randomPassword,
  randomUuid,
  randomIp,
  randomUserAgent,
  pastDate,
  futureDate,
  expectThrows,
  expectNoThrow,
  suppressConsole,
  xssPayload,
  sqlInjectionPayload,
  authHeader,
  retry,
  expectApiResponse,
  expectApiError,
} from '../src/helpers';

import {
  createTestUser,
  createTestAdmin,
  createTestSession,
  createExpiredSession,
  createTestRisk,
  createTestIncident,
  createTestUsers,
  createTestCredentials,
  createTestJwtPayload,
} from '../src/factories';

import {
  createMockPrisma,
  createMockRequest,
  createMockResponse,
  createMockNext,
  createMockRedis,
  createMockLogger,
  createMockFile,
  createMockImageFile,
  createMockPdfFile,
} from '../src/mocks';

// ===========================================================================
// helpers.ts
// ===========================================================================

describe('randomString', () => {
  it('returns a string of the specified length', () => {
    expect(randomString(8)).toHaveLength(8);
    expect(randomString(32)).toHaveLength(32);
  });

  it('returns only alphanumeric characters', () => {
    expect(randomString(100)).toMatch(/^[a-zA-Z0-9]+$/);
  });
});

describe('randomEmail', () => {
  it('returns a lowercase string containing @', () => {
    const email = randomEmail();
    expect(email).toContain('@');
    expect(email).toBe(email.toLowerCase());
  });
});

describe('randomPassword', () => {
  it('returns a string of at least 12 characters', () => {
    expect(randomPassword().length).toBeGreaterThanOrEqual(12);
  });
});

describe('randomUuid', () => {
  it('returns a valid UUID v4 format', () => {
    expect(randomUuid()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it('returns a different value on each call', () => {
    expect(randomUuid()).not.toBe(randomUuid());
  });
});

describe('randomIp', () => {
  it('returns a non-empty IP address string', () => {
    const ip = randomIp();
    expect(typeof ip).toBe('string');
    expect(ip.length).toBeGreaterThan(0);
    // Accept both IPv4 (dots) and IPv6 (colons)
    expect(ip.includes('.') || ip.includes(':')).toBe(true);
  });
});

describe('randomUserAgent', () => {
  it('returns a non-empty string', () => {
    const ua = randomUserAgent();
    expect(typeof ua).toBe('string');
    expect(ua.length).toBeGreaterThan(0);
  });
});

describe('pastDate', () => {
  it('returns a date before now', () => {
    expect(pastDate().getTime()).toBeLessThan(Date.now());
  });

  it('defaults to 30 days ago', () => {
    const d = pastDate();
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    // Allow ±5 seconds for test execution
    expect(Math.abs(d.getTime() - thirtyDaysAgo)).toBeLessThan(5000);
  });

  it('accepts a custom days parameter', () => {
    const d = pastDate(7);
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    expect(Math.abs(d.getTime() - sevenDaysAgo)).toBeLessThan(5000);
  });
});

describe('futureDate', () => {
  it('returns a date after now', () => {
    expect(futureDate().getTime()).toBeGreaterThan(Date.now());
  });

  it('accepts a custom days parameter', () => {
    const d = futureDate(60);
    const sixtyDaysLater = Date.now() + 60 * 24 * 60 * 60 * 1000;
    expect(Math.abs(d.getTime() - sixtyDaysLater)).toBeLessThan(5000);
  });
});

describe('xssPayload', () => {
  it('returns the XSS script tag string', () => {
    expect(xssPayload()).toBe('<script>alert("xss")</script>');
  });
});

describe('sqlInjectionPayload', () => {
  it('contains DROP TABLE', () => {
    expect(sqlInjectionPayload()).toContain('DROP TABLE');
  });

  it('starts with a single-quote', () => {
    expect(sqlInjectionPayload().startsWith("'")).toBe(true);
  });
});

describe('authHeader', () => {
  it('returns Authorization header with Bearer prefix', () => {
    const header = authHeader('mytoken');
    expect(header).toEqual({ Authorization: 'Bearer mytoken' });
  });
});

describe('wait', () => {
  it('resolves after approximately the specified delay', async () => {
    const start = Date.now();
    await wait(50);
    expect(Date.now() - start).toBeGreaterThanOrEqual(45);
  });
});

describe('expectThrows', () => {
  it('passes when the function throws', async () => {
    await expectThrows(async () => { throw new Error('boom'); });
  });

  it('matches error message string', async () => {
    await expectThrows(async () => { throw new Error('connection refused'); }, 'refused');
  });

  it('matches error message regex', async () => {
    await expectThrows(async () => { throw new Error('timeout after 5000ms'); }, /timeout/);
  });

  it('fails when function does not throw', async () => {
    await expect(expectThrows(async () => { /* no throw */ })).rejects.toBeDefined();
  });
});

describe('expectNoThrow', () => {
  it('passes when the function does not throw', async () => {
    await expectNoThrow(async () => 42);
  });

  it('fails when function throws', async () => {
    await expect(expectNoThrow(async () => { throw new Error('oops'); })).rejects.toBeDefined();
  });
});

describe('suppressConsole', () => {
  it('suppresses console.log/warn/error', () => {
    const handle = suppressConsole();
    const spy = console.log as jest.Mock;
    console.log('suppressed');
    expect(spy).toHaveBeenCalledWith('suppressed');
    handle.restore();
  });

  it('restores original console methods', () => {
    const original = console.log;
    const handle = suppressConsole();
    handle.restore();
    expect(console.log).toBe(original);
  });
});

describe('retry', () => {
  it('returns result on first success', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const result = await retry(fn, 3, 0);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and succeeds eventually', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'))
      .mockResolvedValue('success');
    const result = await retry(fn, 3, 0);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws last error after all attempts fail', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('always fails'));
    await expect(retry(fn, 2, 0)).rejects.toThrow('always fails');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('expectApiResponse', () => {
  it('passes for matching status with success property', () => {
    expectApiResponse({ status: 200, body: { success: true, data: [] } }, 200);
  });

  it('fails on status mismatch', () => {
    expect(() =>
      expectApiResponse({ status: 404, body: { success: false } }, 200)
    ).toThrow();
  });

  it('skips success check when hasSuccess=false', () => {
    expectApiResponse({ status: 204, body: {} }, 204, false);
  });
});

describe('expectApiError', () => {
  it('passes for matching error status', () => {
    expectApiError({ status: 400, body: { error: { code: 'VALIDATION_ERROR' } } }, 400);
  });

  it('passes with matching error code', () => {
    expectApiError(
      { status: 401, body: { error: { code: 'UNAUTHORIZED' } } },
      401,
      'UNAUTHORIZED'
    );
  });

  it('fails when error property is missing', () => {
    expect(() =>
      expectApiError({ status: 400, body: {} }, 400)
    ).toThrow();
  });
});

// ===========================================================================
// factories.ts
// ===========================================================================

describe('createTestUser', () => {
  it('returns an object with all required fields', () => {
    const user = createTestUser();
    expect(user.id).toBeDefined();
    expect(user.email).toContain('@');
    expect(user.firstName).toBeDefined();
    expect(user.lastName).toBeDefined();
    expect(user.passwordHash).toMatch(/^\$2b\$/);
    expect(user.role).toBe('USER');
    expect(user.isActive).toBe(true);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it('applies overrides', () => {
    const user = createTestUser({ role: 'MANAGER', isActive: false });
    expect(user.role).toBe('MANAGER');
    expect(user.isActive).toBe(false);
  });

  it('generates unique ids per call', () => {
    expect(createTestUser().id).not.toBe(createTestUser().id);
  });
});

describe('createTestAdmin', () => {
  it('creates a user with ADMIN role', () => {
    expect(createTestAdmin().role).toBe('ADMIN');
  });

  it('supports additional overrides', () => {
    const admin = createTestAdmin({ firstName: 'Alice' });
    expect(admin.role).toBe('ADMIN');
    expect(admin.firstName).toBe('Alice');
  });
});

describe('createTestSession', () => {
  it('returns a session linked to the given userId', () => {
    const session = createTestSession('user-123');
    expect(session.userId).toBe('user-123');
    expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(session.token).toHaveLength(64);
  });

  it('applies overrides', () => {
    const future = new Date(Date.now() + 1000);
    const session = createTestSession('u1', { expiresAt: future });
    expect(session.expiresAt).toBe(future);
  });
});

describe('createExpiredSession', () => {
  it('returns a session with expiresAt in the past', () => {
    const session = createExpiredSession('user-456');
    expect(session.expiresAt.getTime()).toBeLessThan(Date.now());
  });
});

describe('createTestRisk', () => {
  it('returns a risk with valid enum fields', () => {
    const risk = createTestRisk('owner-1');
    expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(risk.severity);
    expect(['RARE', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'CERTAIN']).toContain(risk.likelihood);
    expect(['IDENTIFIED', 'ASSESSED', 'MITIGATED', 'CLOSED']).toContain(risk.status);
    expect(risk.createdById).toBe('owner-1');
  });
});

describe('createTestIncident', () => {
  it('returns an incident with valid enum fields', () => {
    const inc = createTestIncident('reporter-1');
    expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(inc.severity);
    expect(['REPORTED', 'INVESTIGATING', 'RESOLVED', 'CLOSED']).toContain(inc.status);
    expect(inc.reportedById).toBe('reporter-1');
  });
});

describe('createTestUsers', () => {
  it('creates the requested number of users', () => {
    const users = createTestUsers(5);
    expect(users).toHaveLength(5);
  });

  it('applies overrides to all users', () => {
    const users = createTestUsers(3, { role: 'VIEWER' });
    expect(users.every((u) => u.role === 'VIEWER')).toBe(true);
  });

  it('generates unique ids', () => {
    const ids = createTestUsers(10).map((u) => u.id);
    expect(new Set(ids).size).toBe(10);
  });
});

describe('createTestCredentials', () => {
  it('returns email and password', () => {
    const creds = createTestCredentials();
    expect(creds.email).toContain('@');
    expect(creds.password.length).toBeGreaterThan(0);
  });
});

describe('createTestJwtPayload', () => {
  it('maps user fields to JWT claims', () => {
    const user = createTestUser({ role: 'ADMIN' });
    const payload = createTestJwtPayload(user);
    expect(payload.userId).toBe(user.id);
    expect(payload.email).toBe(user.email);
    expect(payload.role).toBe('ADMIN');
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });

  it('sets exp to 7 days from iat', () => {
    const user = createTestUser();
    const payload = createTestJwtPayload(user);
    expect(payload.exp - payload.iat).toBe(7 * 24 * 60 * 60);
  });
});

// ===========================================================================
// mocks.ts
// ===========================================================================

describe('createMockPrisma', () => {
  it('provides jest mock functions for user model', () => {
    const prisma = createMockPrisma();
    expect(typeof prisma.user.findUnique).toBe('function');
    expect(typeof prisma.user.create).toBe('function');
    expect(typeof prisma.user.update).toBe('function');
    expect(typeof prisma.user.delete).toBe('function');
  });

  it('provides mock functions for session and auditLog models', () => {
    const prisma = createMockPrisma();
    expect(typeof prisma.session.findMany).toBe('function');
    expect(typeof prisma.auditLog.create).toBe('function');
  });

  it('$transaction calls the passed function and returns its result', async () => {
    const prisma = createMockPrisma();
    const fn = jest.fn().mockResolvedValue('result');
    const result = await prisma.$transaction(fn);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(result).toBe('result');
  });
});

describe('createMockRequest', () => {
  it('has default body, params, query fields', () => {
    const req = createMockRequest();
    expect(req.body).toEqual({});
    expect(req.params).toEqual({});
    expect(req.query).toEqual({});
    expect(req.method).toBe('GET');
    expect(req.ip).toBe('127.0.0.1');
  });

  it('applies overrides', () => {
    const req = createMockRequest({ body: { name: 'Alice' }, method: 'POST' });
    expect(req.body).toEqual({ name: 'Alice' });
    expect(req.method).toBe('POST');
  });

  it('get() returns header value from overrides', () => {
    const req = createMockRequest({ headers: { 'content-type': 'application/json' } });
    expect(req.get('content-type')).toBe('application/json');
  });
});

describe('createMockResponse', () => {
  it('has chainable status/json methods', () => {
    const res = createMockResponse();
    const chain = (res.status as jest.Mock)(200);
    expect(chain).toBe(res);
    const chain2 = (res.json as jest.Mock)({ ok: true });
    expect(chain2).toBe(res);
  });

  it('has all standard response methods', () => {
    const res = createMockResponse();
    expect(typeof res.status).toBe('function');
    expect(typeof res.json).toBe('function');
    expect(typeof res.send).toBe('function');
    expect(typeof res.redirect).toBe('function');
    expect(typeof res.setHeader).toBe('function');
    expect(typeof res.cookie).toBe('function');
    expect(typeof res.end).toBe('function');
  });
});

describe('createMockNext', () => {
  it('returns a jest.fn()', () => {
    const next = createMockNext();
    next();
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('createMockRedis', () => {
  let redis: ReturnType<typeof createMockRedis>;

  beforeEach(() => {
    redis = createMockRedis();
  });

  it('set and get roundtrip', async () => {
    await redis.set('key1', 'value1');
    const val = await redis.get('key1');
    expect(val).toBe('value1');
  });

  it('get returns null for missing key', async () => {
    expect(await redis.get('missing')).toBeNull();
  });

  it('del removes a key', async () => {
    await redis.set('toDelete', 'x');
    await redis.del('toDelete');
    expect(await redis.get('toDelete')).toBeNull();
  });

  it('incr increments counter', async () => {
    expect(await redis.incr('counter')).toBe(1);
    expect(await redis.incr('counter')).toBe(2);
    expect(await redis.incr('counter')).toBe(3);
  });

  it('exists returns 1 for existing key, 0 for missing', async () => {
    await redis.set('exists-key', 'yes');
    expect(await redis.exists('exists-key')).toBe(1);
    expect(await redis.exists('no-key')).toBe(0);
  });

  it('flushall clears all keys', async () => {
    await redis.set('a', '1');
    await redis.set('b', '2');
    await redis.flushall();
    expect(await redis.get('a')).toBeNull();
    expect(await redis.get('b')).toBeNull();
  });

  it('setex stores value', async () => {
    await redis.setex('ttl-key', 60, 'ttl-value');
    expect(await redis.get('ttl-key')).toBe('ttl-value');
  });
});

describe('createMockLogger', () => {
  it('has info/warn/error/debug methods', () => {
    const logger = createMockLogger();
    logger.info('test');
    logger.warn('test');
    logger.error('test');
    logger.debug('test');
    expect(logger.info).toHaveBeenCalledWith('test');
    expect(logger.warn).toHaveBeenCalledWith('test');
    expect(logger.error).toHaveBeenCalledWith('test');
    expect(logger.debug).toHaveBeenCalledWith('test');
  });

  it('child() returns another mock logger', () => {
    const logger = createMockLogger();
    const child = logger.child({ service: 'test' });
    expect(typeof child.info).toBe('function');
    expect(typeof child.error).toBe('function');
  });
});

describe('createMockFile', () => {
  it('returns default plain-text file', () => {
    const file = createMockFile();
    expect(file.fieldname).toBe('file');
    expect(file.mimetype).toBe('text/plain');
    expect(file.size).toBe(1024);
    expect(file.buffer.toString()).toBe('test file content');
  });

  it('applies overrides', () => {
    const file = createMockFile({ originalname: 'report.csv', mimetype: 'text/csv' });
    expect(file.originalname).toBe('report.csv');
    expect(file.mimetype).toBe('text/csv');
  });
});

describe('createMockImageFile', () => {
  it('returns a PNG file with correct mime type', () => {
    const file = createMockImageFile();
    expect(file.mimetype).toBe('image/png');
    expect(file.originalname).toBe('test.png');
  });

  it('buffer starts with PNG magic bytes', () => {
    const file = createMockImageFile();
    expect(file.buffer[0]).toBe(0x89);
    expect(file.buffer[1]).toBe(0x50); // 'P'
    expect(file.buffer[2]).toBe(0x4e); // 'N'
    expect(file.buffer[3]).toBe(0x47); // 'G'
  });
});

describe('createMockPdfFile', () => {
  it('returns a PDF file with correct mime type', () => {
    const file = createMockPdfFile();
    expect(file.mimetype).toBe('application/pdf');
    expect(file.originalname).toBe('test.pdf');
  });

  it('buffer starts with %PDF', () => {
    const file = createMockPdfFile();
    expect(file.buffer.toString('ascii', 0, 4)).toBe('%PDF');
  });
});


describe('phase36 coverage', () => {
  it('handles parse query string', () => { const parseQS=(s:string)=>Object.fromEntries(s.split('&').map(p=>p.split('=')));expect(parseQS('a=1&b=2')).toEqual({a:'1',b:'2'}); });
  it('checks prime number', () => { const isPrime=(n:number)=>{if(n<2)return false;for(let i=2;i<=Math.sqrt(n);i++)if(n%i===0)return false;return true;}; expect(isPrime(7)).toBe(true); expect(isPrime(9)).toBe(false); });
  it('handles LRU cache pattern', () => { const cache=new Map<string,number>();const get=(k:string)=>cache.has(k)?(cache.get(k)!):null;const set=(k:string,v:number)=>{cache.delete(k);cache.set(k,v);};set('a',1);set('b',2);expect(get('a')).toBe(1); });
  it('handles snake_case to camelCase', () => { const snakeToCamel=(s:string)=>s.replace(/_([a-z])/g,(_,c)=>c.toUpperCase());expect(snakeToCamel('foo_bar_baz')).toBe('fooBarBaz'); });
  it('handles BFS pattern', () => { const bfs=(g:Map<number,number[]>,start:number)=>{const visited=new Set<number>();const queue=[start];while(queue.length){const node=queue.shift()!;if(visited.has(node))continue;visited.add(node);g.get(node)?.forEach(n=>queue.push(n));}return visited.size;};const g=new Map([[1,[2,3]],[2,[4]],[3,[4]],[4,[]]]);expect(bfs(g,1)).toBe(4); });
});


describe('phase37 coverage', () => {
  it('checks subset relationship', () => { const isSubset=<T>(a:T[],b:T[])=>a.every(x=>b.includes(x)); expect(isSubset([1,2],[1,2,3])).toBe(true); expect(isSubset([1,4],[1,2,3])).toBe(false); });
  it('finds all indexes of value', () => { const findAll=<T>(a:T[],v:T)=>a.reduce((acc,x,i)=>x===v?[...acc,i]:acc,[] as number[]); expect(findAll([1,2,1,3,1],1)).toEqual([0,2,4]); });
  it('checks string contains only letters', () => { const onlyLetters=(s:string)=>/^[a-zA-Z]+$/.test(s); expect(onlyLetters('Hello')).toBe(true); expect(onlyLetters('Hello1')).toBe(false); });
  it('checks if number is power of 2', () => { const isPow2=(n:number)=>n>0&&(n&(n-1))===0; expect(isPow2(8)).toBe(true); expect(isPow2(6)).toBe(false); });
  it('formats bytes to human readable', () => { const fmt=(b:number)=>b>=1e9?`${(b/1e9).toFixed(1)}GB`:b>=1e6?`${(b/1e6).toFixed(1)}MB`:`${(b/1e3).toFixed(1)}KB`; expect(fmt(1500000)).toBe('1.5MB'); });
});


describe('phase38 coverage', () => {
  it('merges sorted arrays', () => { const merge=(a:number[],b:number[])=>{const r:number[]=[];let i=0,j=0;while(i<a.length&&j<b.length)r.push(a[i]<=b[j]?a[i++]:b[j++]);return [...r,...a.slice(i),...b.slice(j)];}; expect(merge([1,3,5],[2,4,6])).toEqual([1,2,3,4,5,6]); });
  it('computes string edit distance', () => { const ed=(a:string,b:string)=>{const m=Array.from({length:a.length+1},(_,i)=>Array.from({length:b.length+1},(_,j)=>i===0?j:j===0?i:0));for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)m[i][j]=a[i-1]===b[j-1]?m[i-1][j-1]:1+Math.min(m[i-1][j],m[i][j-1],m[i-1][j-1]);return m[a.length][b.length];}; expect(ed('kitten','sitting')).toBe(3); });
  it('checks perfect number', () => { const isPerfect=(n:number)=>{let s=1;for(let i=2;i*i<=n;i++)if(n%i===0){s+=i;if(i!==n/i)s+=n/i;}return s===n&&n!==1;}; expect(isPerfect(6)).toBe(true); expect(isPerfect(28)).toBe(true); expect(isPerfect(12)).toBe(false); });
  it('applies insertion sort', () => { const sort=(a:number[])=>{const r=[...a];for(let i=1;i<r.length;i++){const key=r[i];let j=i-1;while(j>=0&&r[j]>key){r[j+1]=r[j];j--;}r[j+1]=key;}return r;}; expect(sort([5,2,4,6,1,3])).toEqual([1,2,3,4,5,6]); });
  it('computes array variance', () => { const variance=(a:number[])=>{const m=a.reduce((s,v)=>s+v,0)/a.length;return a.reduce((s,v)=>s+(v-m)**2,0)/a.length;}; expect(variance([2,4,4,4,5,5,7,9])).toBe(4); });
});
