/**
 * Tests for WebSocketNotificationServer.
 * Uses mock ws/WebSocket instances — no real HTTP server needed.
 * Covers: sendToUser, broadcast, broadcastToOrg,
 *         getConnectedUsers, getConnectionCount, stop.
 */

import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
import { WebSocketNotificationServer, type WSNotification } from '../src/websocket';

// ── Helper types ───────────────────────────────────────────────────────────────

interface AuthWsMock extends Partial<WebSocket> {
  userId: string;
  orgId?: string;
  isAlive: boolean;
  readyState: number;
  send: jest.Mock;
  ping: jest.Mock;
  terminate: jest.Mock;
  close: jest.Mock;
  on: jest.Mock;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeMockWs(
  userId: string,
  opts: { orgId?: string; readyState?: number } = {}
): AuthWsMock {
  return {
    userId,
    orgId: opts.orgId,
    isAlive: true,
    readyState: opts.readyState ?? WebSocket.OPEN,
    send: jest.fn(),
    ping: jest.fn(),
    terminate: jest.fn(),
    close: jest.fn(),
    on: jest.fn(),
  };
}

function makeNotification(overrides: Partial<WSNotification> = {}): WSNotification {
  return {
    id: 'n1',
    type: 'INFO',
    title: 'Hello',
    message: 'World',
    severity: 'LOW',
    createdAt: new Date(),
    read: false,
    ...overrides,
  };
}

/**
 * Build a server with pre-populated clients by injecting into the private
 * `clients` Map (accessed via type assertion) — avoids needing a real WS handshake.
 */
function buildServer(
  clientMap: Record<string, AuthWsMock[]>
): WebSocketNotificationServer {
  const server = new WebSocketNotificationServer(() => null);
  // Access private clients map
  const clients = (server as unknown as { clients: Map<string, Set<AuthWsMock>> }).clients;

  for (const [userId, sockets] of Object.entries(clientMap)) {
    clients.set(userId, new Set(sockets));
  }
  return server;
}

// ── sendToUser ─────────────────────────────────────────────────────────────────

describe('WebSocketNotificationServer — sendToUser', () => {
  it('sends a JSON notification to the specified user', () => {
    const ws = makeMockWs('alice');
    const server = buildServer({ alice: [ws] });
    const notification = makeNotification({ id: 'msg-1' });

    server.sendToUser('alice', notification);

    expect(ws.send).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(ws.send.mock.calls[0][0] as string);
    expect(payload.type).toBe('notification');
    expect(payload.data.id).toBe('msg-1');
  });

  it('sends to all sockets for the same user', () => {
    const ws1 = makeMockWs('alice');
    const ws2 = makeMockWs('alice');
    const server = buildServer({ alice: [ws1, ws2] });

    server.sendToUser('alice', makeNotification());

    expect(ws1.send).toHaveBeenCalledTimes(1);
    expect(ws2.send).toHaveBeenCalledTimes(1);
  });

  it('skips sockets that are not OPEN', () => {
    const closedWs = makeMockWs('alice', { readyState: WebSocket.CLOSED });
    const openWs = makeMockWs('alice');
    const server = buildServer({ alice: [closedWs, openWs] });

    server.sendToUser('alice', makeNotification());

    expect(closedWs.send).not.toHaveBeenCalled();
    expect(openWs.send).toHaveBeenCalledTimes(1);
  });

  it('does nothing when user has no connections', () => {
    const server = buildServer({});
    expect(() => server.sendToUser('nobody', makeNotification())).not.toThrow();
  });

  it('does not send to other users', () => {
    const aliceWs = makeMockWs('alice');
    const bobWs = makeMockWs('bob');
    const server = buildServer({ alice: [aliceWs], bob: [bobWs] });

    server.sendToUser('alice', makeNotification());

    expect(bobWs.send).not.toHaveBeenCalled();
  });
});

// ── broadcast ──────────────────────────────────────────────────────────────────

describe('WebSocketNotificationServer — broadcast', () => {
  it('sends to all OPEN clients', () => {
    const ws1 = makeMockWs('u1');
    const ws2 = makeMockWs('u2');
    const server = buildServer({ u1: [ws1], u2: [ws2] });

    // Also need a real wss attached for broadcast to iterate wss.clients
    // We inject a mock wss with a clients Set
    const mockWss = {
      clients: new Set([ws1, ws2]),
    };
    (server as unknown as { wss: unknown }).wss = mockWss;

    server.broadcast(makeNotification({ id: 'bc-1' }));

    expect(ws1.send).toHaveBeenCalledTimes(1);
    expect(ws2.send).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(ws1.send.mock.calls[0][0] as string);
    expect(payload.data.id).toBe('bc-1');
  });

  it('skips closed sockets', () => {
    const openWs = makeMockWs('u1');
    const closedWs = makeMockWs('u2', { readyState: WebSocket.CLOSED });
    const mockWss = { clients: new Set([openWs, closedWs]) };
    const server = buildServer({});
    (server as unknown as { wss: unknown }).wss = mockWss;

    server.broadcast(makeNotification());

    expect(openWs.send).toHaveBeenCalledTimes(1);
    expect(closedWs.send).not.toHaveBeenCalled();
  });

  it('does nothing when wss is null', () => {
    const server = buildServer({});
    (server as unknown as { wss: unknown }).wss = null;
    expect(() => server.broadcast(makeNotification())).not.toThrow();
  });
});

// ── broadcastToOrg ─────────────────────────────────────────────────────────────

describe('WebSocketNotificationServer — broadcastToOrg', () => {
  it('sends only to clients with matching orgId', () => {
    const acmeWs = makeMockWs('u1', { orgId: 'acme' });
    const betaWs = makeMockWs('u2', { orgId: 'beta' });
    const mockWss = { clients: new Set([acmeWs, betaWs]) };

    const server = buildServer({});
    (server as unknown as { wss: unknown }).wss = mockWss;

    server.broadcastToOrg('acme', makeNotification({ id: 'org-1' }));

    expect(acmeWs.send).toHaveBeenCalledTimes(1);
    expect(betaWs.send).not.toHaveBeenCalled();
    const payload = JSON.parse(acmeWs.send.mock.calls[0][0] as string);
    expect(payload.data.id).toBe('org-1');
  });

  it('sends to all sockets in the org', () => {
    const ws1 = makeMockWs('u1', { orgId: 'acme' });
    const ws2 = makeMockWs('u2', { orgId: 'acme' });
    const mockWss = { clients: new Set([ws1, ws2]) };
    const server = buildServer({});
    (server as unknown as { wss: unknown }).wss = mockWss;

    server.broadcastToOrg('acme', makeNotification());

    expect(ws1.send).toHaveBeenCalledTimes(1);
    expect(ws2.send).toHaveBeenCalledTimes(1);
  });

  it('does nothing when wss is null', () => {
    const server = buildServer({});
    (server as unknown as { wss: unknown }).wss = null;
    expect(() => server.broadcastToOrg('acme', makeNotification())).not.toThrow();
  });

  it('skips closed sockets even in matching org', () => {
    const openWs = makeMockWs('u1', { orgId: 'acme' });
    const closedWs = makeMockWs('u2', { orgId: 'acme', readyState: WebSocket.CLOSED });
    const mockWss = { clients: new Set([openWs, closedWs]) };
    const server = buildServer({});
    (server as unknown as { wss: unknown }).wss = mockWss;

    server.broadcastToOrg('acme', makeNotification());

    expect(openWs.send).toHaveBeenCalledTimes(1);
    expect(closedWs.send).not.toHaveBeenCalled();
  });
});

// ── getConnectedUsers ──────────────────────────────────────────────────────────

describe('WebSocketNotificationServer — getConnectedUsers', () => {
  it('returns user IDs of all clients with at least one socket', () => {
    const server = buildServer({
      alice: [makeMockWs('alice')],
      bob: [makeMockWs('bob')],
    });

    const users = server.getConnectedUsers();
    expect(users).toContain('alice');
    expect(users).toContain('bob');
    expect(users).toHaveLength(2);
  });

  it('excludes users with zero sockets', () => {
    const server = buildServer({});
    const clients = (server as unknown as { clients: Map<string, Set<AuthWsMock>> }).clients;
    clients.set('ghost', new Set()); // empty set

    expect(server.getConnectedUsers()).not.toContain('ghost');
  });

  it('returns empty array when no clients', () => {
    const server = buildServer({});
    expect(server.getConnectedUsers()).toEqual([]);
  });
});

// ── getConnectionCount ────────────────────────────────────────────────────────

describe('WebSocketNotificationServer — getConnectionCount', () => {
  it('returns total number of sockets across all users', () => {
    const server = buildServer({
      alice: [makeMockWs('alice'), makeMockWs('alice')],
      bob: [makeMockWs('bob')],
    });

    expect(server.getConnectionCount()).toBe(3);
  });

  it('returns 0 when no connections', () => {
    const server = buildServer({});
    expect(server.getConnectionCount()).toBe(0);
  });
});

// ── stop ──────────────────────────────────────────────────────────────────────

describe('WebSocketNotificationServer — stop', () => {
  it('clears heartbeat interval', () => {
    const server = buildServer({});
    const fakeTimer = setInterval(() => {}, 99999);
    (server as unknown as { heartbeatInterval: NodeJS.Timeout }).heartbeatInterval = fakeTimer;

    server.stop();

    expect((server as unknown as { heartbeatInterval: unknown }).heartbeatInterval).toBeNull();
  });

  it('closes all client sockets and clears clients map', () => {
    const ws1 = makeMockWs('u1');
    const ws2 = makeMockWs('u2');
    const mockWss = {
      clients: new Set([ws1, ws2]),
      close: jest.fn(),
    };

    const server = buildServer({ u1: [ws1], u2: [ws2] });
    (server as unknown as { wss: unknown }).wss = mockWss;

    server.stop();

    expect(ws1.close).toHaveBeenCalledWith(1001, 'Server shutting down');
    expect(ws2.close).toHaveBeenCalledWith(1001, 'Server shutting down');
    expect(mockWss.close).toHaveBeenCalled();
    expect((server as unknown as { wss: unknown }).wss).toBeNull();
    expect(server.getConnectionCount()).toBe(0);
  });

  it('is safe to call when wss is already null', () => {
    const server = buildServer({});
    (server as unknown as { wss: unknown }).wss = null;
    expect(() => server.stop()).not.toThrow();
  });
});
