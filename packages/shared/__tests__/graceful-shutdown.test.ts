import { createServer } from 'http';
import type { Server } from 'http';
import type { Request, Response, NextFunction } from 'express';
import { createGracefulShutdown } from '../src/graceful-shutdown';

// ── Helpers ────────────────────────────────────────────────────────────────

/** Create a fresh HTTP server. Start with listen(0) so server.close() works. */
async function makeServer(): Promise<Server> {
  return new Promise((resolve) => {
    const s = createServer((_req, res) => res.end('ok'));
    s.listen(0, () => resolve(s));
  });
}

function stubRes() {
  const obj: {
    statusCode: number; body: unknown; headers: Record<string, unknown>;
    setHeader(k: string, v: unknown): void;
    status(code: number): typeof obj;
    json(body: unknown): typeof obj;
    on(ev: string, cb: () => void): typeof obj;
    _finishCb?: () => void;
  } = {
    statusCode: 200,
    body: null as unknown,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    on(ev, cb) { if (ev === 'finish') this._finishCb = cb; return this; },
  };
  return obj;
}

function mockReq(): Request { return {} as Request; }
function next(): jest.Mock { return jest.fn(); }

// ── Tests ──────────────────────────────────────────────────────────────────

describe('createGracefulShutdown()', () => {
  let server: Server;

  beforeEach(async () => { server = await makeServer(); });
  afterEach((done) => { if (server.listening) server.close(done); else done(); });

  describe('initial state', () => {
    it('starts with 0 in-flight requests', () => {
      const gs = createGracefulShutdown(server, { exitAfterShutdown: false });
      expect(gs.inFlightRequests).toBe(0);
      gs.destroy();
    });

    it('starts not shutting down', () => {
      const gs = createGracefulShutdown(server, { exitAfterShutdown: false });
      expect(gs.isShuttingDown).toBe(false);
      gs.destroy();
    });
  });

  describe('middleware', () => {
    it('increments inFlightRequests when a request arrives', () => {
      const gs = createGracefulShutdown(server, { exitAfterShutdown: false });
      gs.middleware(mockReq(), stubRes() as unknown as Response, next());
      expect(gs.inFlightRequests).toBe(1);
      gs.destroy();
    });

    it('decrements inFlightRequests when response finishes', () => {
      const gs = createGracefulShutdown(server, { exitAfterShutdown: false });
      const res = stubRes();
      gs.middleware(mockReq(), res as unknown as Response, next());
      res._finishCb?.(); // simulate finish event
      expect(gs.inFlightRequests).toBe(0);
      gs.destroy();
    });

    it('calls next() for normal requests', () => {
      const gs = createGracefulShutdown(server, { exitAfterShutdown: false });
      const n = next();
      gs.middleware(mockReq(), stubRes() as unknown as Response, n);
      expect(n).toHaveBeenCalled();
      gs.destroy();
    });

    it('returns 503 when shutting down', async () => {
      const gs = createGracefulShutdown(server, { exitAfterShutdown: false, drainTimeoutMs: 30 });
      const p = gs.trigger('SIGTERM');
      const res = stubRes();
      const n = next();
      gs.middleware(mockReq(), res as unknown as Response, n);
      expect(res.statusCode).toBe(503);
      expect(n).not.toHaveBeenCalled();
      await p;
      gs.destroy();
    });

    it('sets Retry-After header on 503', async () => {
      const gs = createGracefulShutdown(server, { exitAfterShutdown: false, drainTimeoutMs: 30 });
      const p = gs.trigger('SIGTERM');
      const res = stubRes();
      gs.middleware(mockReq(), res as unknown as Response, next());
      expect(res.headers['Retry-After']).toBeDefined();
      await p;
      gs.destroy();
    });
  });

  describe('trigger()', () => {
    it('sets isShuttingDown to true', async () => {
      const gs = createGracefulShutdown(server, { exitAfterShutdown: false, drainTimeoutMs: 30 });
      const p = gs.trigger('SIGTERM');
      expect(gs.isShuttingDown).toBe(true);
      await p;
      gs.destroy();
    });

    it('is idempotent — double trigger does not throw', async () => {
      const gs = createGracefulShutdown(server, { exitAfterShutdown: false, drainTimeoutMs: 30 });
      await Promise.all([gs.trigger('SIGTERM'), gs.trigger('SIGTERM')]);
      gs.destroy();
    });

    it('calls onShutdown callback', async () => {
      const onShutdown = jest.fn();
      const gs = createGracefulShutdown(server, {
        exitAfterShutdown: false,
        drainTimeoutMs: 30,
        onShutdown,
      });
      await gs.trigger('TEST');
      expect(onShutdown).toHaveBeenCalledWith('TEST');
      gs.destroy();
    });

    it('runs cleanup hooks', async () => {
      const hook = jest.fn().mockResolvedValue(undefined);
      const gs = createGracefulShutdown(server, {
        exitAfterShutdown: false,
        drainTimeoutMs: 30,
        hooks: [hook],
      });
      await gs.trigger('SIGTERM');
      expect(hook).toHaveBeenCalled();
      gs.destroy();
    });

    it('does not throw if a hook fails', async () => {
      const badHook = jest.fn().mockRejectedValue(new Error('hook error'));
      const gs = createGracefulShutdown(server, {
        exitAfterShutdown: false,
        drainTimeoutMs: 30,
        hooks: [badHook],
      });
      await expect(gs.trigger('SIGTERM')).resolves.toBeUndefined();
      gs.destroy();
    });

    it('runs multiple hooks in sequence', async () => {
      const order: number[] = [];
      const gs = createGracefulShutdown(server, {
        exitAfterShutdown: false,
        drainTimeoutMs: 30,
        hooks: [
          async () => { order.push(1); },
          async () => { order.push(2); },
        ],
      });
      await gs.trigger('SIGTERM');
      expect(order).toEqual([1, 2]);
      gs.destroy();
    });

    it('drains in-flight request before resolving', async () => {
      const gs = createGracefulShutdown(server, { exitAfterShutdown: false, drainTimeoutMs: 500 });
      const res = stubRes();
      gs.middleware(mockReq(), res as unknown as Response, next());
      expect(gs.inFlightRequests).toBe(1);
      // Finish the request after a short delay, then trigger shutdown
      setTimeout(() => res._finishCb?.(), 30);
      await gs.trigger('SIGTERM');
      expect(gs.inFlightRequests).toBe(0);
      gs.destroy();
    });
  });

  describe('destroy()', () => {
    it('removes signal listeners without throwing', () => {
      const gs = createGracefulShutdown(server, { exitAfterShutdown: false });
      expect(() => gs.destroy()).not.toThrow();
    });
  });
});

describe('Graceful Shutdown — additional coverage', () => {
  let server: import('http').Server;

  beforeEach(async () => {
    server = await (async () => {
      const { createServer } = await import('http');
      return new Promise<import('http').Server>((resolve) => {
        const s = createServer((_req, res) => res.end('ok'));
        s.listen(0, () => resolve(s));
      });
    })();
  });

  afterEach((done) => {
    if (server.listening) server.close(done); else done();
  });

  it('createGracefulShutdown returns an object with middleware and trigger', () => {
    const gs = createGracefulShutdown(server, { exitAfterShutdown: false });
    expect(typeof gs.middleware).toBe('function');
    expect(typeof gs.trigger).toBe('function');
    gs.destroy();
  });

  it('inFlightRequests starts at 0', () => {
    const gs = createGracefulShutdown(server, { exitAfterShutdown: false });
    expect(gs.inFlightRequests).toBe(0);
    gs.destroy();
  });

  it('trigger resolves without throwing', async () => {
    const gs = createGracefulShutdown(server, { exitAfterShutdown: false, drainTimeoutMs: 50 });
    await expect(gs.trigger('SIGTERM')).resolves.toBeUndefined();
    gs.destroy();
  });

  it('destroy can be called multiple times without error', () => {
    const gs = createGracefulShutdown(server, { exitAfterShutdown: false });
    expect(() => { gs.destroy(); gs.destroy(); }).not.toThrow();
  });

  it('middleware calls next when server is not shutting down', () => {
    const gs = createGracefulShutdown(server, { exitAfterShutdown: false });
    const nextFn = jest.fn();
    gs.middleware({} as any, { on: jest.fn() } as any, nextFn);
    expect(nextFn).toHaveBeenCalled();
    gs.destroy();
  });
});

// ── Further edge-case coverage ─────────────────────────────────────────────────

describe('createGracefulShutdown — further edge cases', () => {
  let server: import('http').Server;

  beforeEach(async () => {
    server = await (async () => {
      const { createServer } = await import('http');
      return new Promise<import('http').Server>((resolve) => {
        const s = createServer((_req, res) => res.end('ok'));
        s.listen(0, () => resolve(s));
      });
    })();
  });

  afterEach((done) => {
    if (server.listening) server.close(done); else done();
  });

  function stubResLocal() {
    const obj: {
      statusCode: number; body: unknown; headers: Record<string, unknown>;
      setHeader(k: string, v: unknown): void;
      status(code: number): typeof obj;
      json(body: unknown): typeof obj;
      on(ev: string, cb: () => void): typeof obj;
      _finishCb?: () => void;
    } = {
      statusCode: 200,
      body: null as unknown,
      headers: {},
      setHeader(k, v) { this.headers[k] = v; },
      status(code) { this.statusCode = code; return this; },
      json(body) { this.body = body; return this; },
      on(ev, cb) { if (ev === 'finish') this._finishCb = cb; return this; },
    };
    return obj;
  }

  it('isShuttingDown is false before trigger is called', () => {
    const gs = createGracefulShutdown(server, { exitAfterShutdown: false });
    expect(gs.isShuttingDown).toBe(false);
    gs.destroy();
  });

  it('inFlightRequests increments for each middleware call', () => {
    const gs = createGracefulShutdown(server, { exitAfterShutdown: false });
    gs.middleware({} as any, stubResLocal() as any, jest.fn());
    gs.middleware({} as any, stubResLocal() as any, jest.fn());
    expect(gs.inFlightRequests).toBe(2);
    gs.destroy();
  });

  it('inFlightRequests decrements to zero after finish events', () => {
    const gs = createGracefulShutdown(server, { exitAfterShutdown: false });
    const r1 = stubResLocal();
    const r2 = stubResLocal();
    gs.middleware({} as any, r1 as any, jest.fn());
    gs.middleware({} as any, r2 as any, jest.fn());
    r1._finishCb?.();
    r2._finishCb?.();
    expect(gs.inFlightRequests).toBe(0);
    gs.destroy();
  });

  it('middleware 503 response body has success: false', async () => {
    const gs = createGracefulShutdown(server, { exitAfterShutdown: false, drainTimeoutMs: 30 });
    const p = gs.trigger('SIGTERM');
    const res = stubResLocal();
    gs.middleware({} as any, res as any, jest.fn());
    expect((res.body as any).success).toBe(false);
    await p;
    gs.destroy();
  });

  it('onShutdown callback receives the signal string', async () => {
    const onShutdown = jest.fn();
    const gs = createGracefulShutdown(server, {
      exitAfterShutdown: false,
      drainTimeoutMs: 30,
      onShutdown,
    });
    await gs.trigger('SIGINT');
    expect(onShutdown).toHaveBeenCalledWith('SIGINT');
    gs.destroy();
  });

  it('trigger with custom signal string calls onShutdown with that signal', async () => {
    const onShutdown = jest.fn();
    const gs = createGracefulShutdown(server, {
      exitAfterShutdown: false,
      drainTimeoutMs: 30,
      onShutdown,
    });
    await gs.trigger('CUSTOM_SIGNAL');
    expect(onShutdown).toHaveBeenCalledWith('CUSTOM_SIGNAL');
    gs.destroy();
  });

  it('multiple hooks all run in order', async () => {
    const calls: string[] = [];
    const gs = createGracefulShutdown(server, {
      exitAfterShutdown: false,
      drainTimeoutMs: 30,
      hooks: [
        async () => { calls.push('first'); },
        async () => { calls.push('second'); },
        async () => { calls.push('third'); },
      ],
    });
    await gs.trigger('SIGTERM');
    expect(calls).toEqual(['first', 'second', 'third']);
    gs.destroy();
  });

  it('isShuttingDown is true immediately after trigger is called', async () => {
    const gs = createGracefulShutdown(server, { exitAfterShutdown: false, drainTimeoutMs: 50 });
    const p = gs.trigger('SIGTERM');
    expect(gs.isShuttingDown).toBe(true);
    await p;
    gs.destroy();
  });
});
