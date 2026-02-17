/**
 * Mock utilities for testing
 */

/**
 * Create a mock Prisma client with common methods stubbed
 */
export function createMockPrisma() {
  return {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    session: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    auditLog: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    risk: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    incident: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((fn) => fn()),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };
}

/**
 * Create a mock Express request
 */
export function createMockRequest(overrides: Record<string, unknown> = {}) {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    cookies: {},
    ip: '127.0.0.1',
    method: 'GET',
    path: '/',
    url: '/',
    get: jest.fn((header: string) => {
      const headers: Record<string, string> = overrides.headers as Record<string, string> || {};
      return headers[header.toLowerCase()];
    }),
    ...overrides,
  };
}

/**
 * Create a mock Express response
 */
export function createMockResponse() {
  const res: Record<string, unknown> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  res.removeHeader = jest.fn().mockReturnValue(res);
  res.getHeader = jest.fn().mockReturnValue(undefined);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
}

/**
 * Create a mock next function
 */
export function createMockNext() {
  return jest.fn();
}

/**
 * Create a mock Redis client
 */
export function createMockRedis() {
  const store = new Map<string, string>();

  return {
    get: jest.fn((key: string) => Promise.resolve(store.get(key) || null)),
    set: jest.fn((key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve('OK');
    }),
    setex: jest.fn((key: string, _ttl: number, value: string) => {
      store.set(key, value);
      return Promise.resolve('OK');
    }),
    del: jest.fn((key: string) => {
      store.delete(key);
      return Promise.resolve(1);
    }),
    incr: jest.fn((key: string) => {
      const current = parseInt(store.get(key) || '0', 10);
      store.set(key, String(current + 1));
      return Promise.resolve(current + 1);
    }),
    expire: jest.fn(() => Promise.resolve(1)),
    ttl: jest.fn(() => Promise.resolve(3600)),
    exists: jest.fn((key: string) => Promise.resolve(store.has(key) ? 1 : 0)),
    keys: jest.fn((pattern: string) => {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return Promise.resolve([...store.keys()].filter((k) => regex.test(k)));
    }),
    flushall: jest.fn(() => {
      store.clear();
      return Promise.resolve('OK');
    }),
    quit: jest.fn(() => Promise.resolve('OK')),
    on: jest.fn(),
    connect: jest.fn(() => Promise.resolve()),
    disconnect: jest.fn(() => Promise.resolve()),
    // Internal: access to store for testing
    _store: store,
  };
}

/**
 * Create a mock logger
 */
export function createMockLogger() {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn(() => createMockLogger()),
  };
}

/**
 * Create a mock file for upload testing
 */
export function createMockFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'test.txt',
    encoding: '7bit',
    mimetype: 'text/plain',
    size: 1024,
    destination: '/tmp/uploads',
    filename: 'abc123.txt',
    path: '/tmp/uploads/abc123.txt',
    buffer: Buffer.from('test file content'),
    stream: {} as unknown as NodeJS.ReadableStream,
    ...overrides,
  };
}

/**
 * Create a mock image file
 */
export function createMockImageFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  // PNG magic bytes
  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  return createMockFile({
    originalname: 'test.png',
    mimetype: 'image/png',
    buffer: pngHeader,
    ...overrides,
  });
}

/**
 * Create a mock PDF file
 */
export function createMockPdfFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  // PDF magic bytes
  const pdfHeader = Buffer.from('%PDF-1.4');

  return createMockFile({
    originalname: 'test.pdf',
    mimetype: 'application/pdf',
    buffer: pdfHeader,
    ...overrides,
  });
}
