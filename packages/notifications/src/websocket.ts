import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
import { URL } from 'url';

/**
 * Notification types for WebSocket messages
 */
export type WSNotificationType =
  | 'ALERT'
  | 'WARNING'
  | 'INFO'
  | 'SUCCESS'
  | 'OVERDUE'
  | 'DUE_SOON'
  | 'ESCALATION';

export type WSNotificationSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface WSNotification {
  id: string;
  type: WSNotificationType;
  title: string;
  message: string;
  module?: string;
  severity: WSNotificationSeverity;
  userId?: string;
  orgId?: string;
  createdAt: Date;
  read: boolean;
  data?: Record<string, any>;
}

interface AuthenticatedWebSocket extends WebSocket {
  userId: string;
  orgId?: string;
  isAlive: boolean;
}

type TokenVerifier = (token: string) => { userId: string; orgId?: string } | null;

/**
 * WebSocket notification server.
 * Manages real-time notification delivery to connected clients.
 */
export class WebSocketNotificationServer {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Set<AuthenticatedWebSocket>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private verifyToken: TokenVerifier;

  constructor(verifyToken: TokenVerifier) {
    this.verifyToken = verifyToken;
  }

  /**
   * Attach WebSocket server to an existing HTTP server.
   */
  start(server: http.Server): void {
    this.wss = new WebSocketServer({ server, path: '/ws/notifications' });

    this.wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
      const authWs = ws as AuthenticatedWebSocket;

      // Authenticate via query string token
      const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
      const token = url.searchParams.get('token');

      if (!token) {
        ws.close(4001, 'Authentication required');
        return;
      }

      const user = this.verifyToken(token);
      if (!user) {
        ws.close(4003, 'Invalid token');
        return;
      }

      authWs.userId = user.userId;
      authWs.orgId = user.orgId;
      authWs.isAlive = true;

      // Track connection
      if (!this.clients.has(user.userId)) {
        this.clients.set(user.userId, new Set());
      }
      this.clients.get(user.userId)!.add(authWs);

      // Send connection confirmation
      authWs.send(JSON.stringify({
        type: 'connected',
        userId: user.userId,
        timestamp: new Date().toISOString(),
      }));

      // Handle pong for heartbeat
      authWs.on('pong', () => {
        authWs.isAlive = true;
      });

      // Handle messages from client (e.g., mark-read acknowledgments)
      authWs.on('message', (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.type === 'ping') {
            authWs.send(JSON.stringify({ type: 'pong' }));
          }
        } catch {
          // Ignore malformed messages
        }
      });

      // Cleanup on disconnect
      authWs.on('close', () => {
        this.removeClient(authWs);
      });

      authWs.on('error', () => {
        this.removeClient(authWs);
      });
    });

    // Heartbeat ping every 30 seconds to detect dead connections
    this.heartbeatInterval = setInterval(() => {
      if (!this.wss) return;

      this.wss.clients.forEach((ws) => {
        const authWs = ws as AuthenticatedWebSocket;
        if (!authWs.isAlive) {
          this.removeClient(authWs);
          authWs.terminate();
          return;
        }
        authWs.isAlive = false;
        authWs.ping();
      });
    }, 30000);
  }

  /**
   * Send a notification to a specific user.
   */
  sendToUser(userId: string, notification: WSNotification): void {
    const userSockets = this.clients.get(userId);
    if (!userSockets) return;

    const message = JSON.stringify({
      type: 'notification',
      data: notification,
    });

    userSockets.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  /**
   * Broadcast a notification to all connected clients.
   */
  broadcast(notification: WSNotification): void {
    const message = JSON.stringify({
      type: 'notification',
      data: notification,
    });

    if (!this.wss) return;

    this.wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  /**
   * Broadcast a notification to all connected members of an organisation.
   */
  broadcastToOrg(orgId: string, notification: WSNotification): void {
    const message = JSON.stringify({
      type: 'notification',
      data: notification,
    });

    if (!this.wss) return;

    this.wss.clients.forEach((ws) => {
      const authWs = ws as AuthenticatedWebSocket;
      if (authWs.orgId === orgId && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  /**
   * Get list of currently connected user IDs.
   */
  getConnectedUsers(): string[] {
    const users: string[] = [];
    this.clients.forEach((sockets, userId) => {
      if (sockets.size > 0) {
        users.push(userId);
      }
    });
    return users;
  }

  /**
   * Get total number of active connections.
   */
  getConnectionCount(): number {
    let count = 0;
    this.clients.forEach((sockets) => {
      count += sockets.size;
    });
    return count;
  }

  /**
   * Gracefully shut down the WebSocket server.
   */
  stop(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.wss) {
      this.wss.clients.forEach((ws) => {
        ws.close(1001, 'Server shutting down');
      });
      this.wss.close();
      this.wss = null;
    }

    this.clients.clear();
  }

  private removeClient(ws: AuthenticatedWebSocket): void {
    const userSockets = this.clients.get(ws.userId);
    if (userSockets) {
      userSockets.delete(ws);
      if (userSockets.size === 0) {
        this.clients.delete(ws.userId);
      }
    }
  }
}
