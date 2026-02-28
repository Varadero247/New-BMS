import { createHash, randomBytes } from 'crypto';
import { SessionConfig, Session, SessionValidationResult } from './types';

export class SessionSecurityService {
  private readonly config: SessionConfig;
  private readonly sessions = new Map<string, Session>();

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = {
      idLength: config.idLength ?? 32,
      expiryMs: config.expiryMs ?? 8 * 60 * 60 * 1000,
      absoluteExpiryMs: config.absoluteExpiryMs ?? 24 * 60 * 60 * 1000,
      bindToIP: config.bindToIP ?? true,
      bindToUserAgent: config.bindToUserAgent ?? true,
    };
  }

  createSession(userId: string, ipAddress: string, userAgent: string): Session {
    const id = randomBytes(this.config.idLength).toString('hex');
    const now = new Date();
    const session: Session = {
      id,
      userId,
      ipHash: this.hash(ipAddress),
      userAgentHash: this.hash(userAgent),
      createdAt: now,
      expiresAt: new Date(now.getTime() + this.config.expiryMs),
      absoluteExpiresAt: new Date(now.getTime() + this.config.absoluteExpiryMs),
      isActive: true,
      rotationCount: 0,
    };
    this.sessions.set(id, session);
    return session;
  }

  validateSession(sessionId: string, ipAddress: string, userAgent: string): SessionValidationResult {
    const session = this.sessions.get(sessionId);
    if (!session) return { valid: false, reason: 'Session not found' };
    if (!session.isActive) return { valid: false, reason: 'Session revoked' };

    const now = new Date();
    if (session.expiresAt <= now) return { valid: false, reason: 'Session expired (idle timeout)' };
    if (session.absoluteExpiresAt <= now) return { valid: false, reason: 'Session expired (absolute timeout)' };

    if (this.config.bindToIP && session.ipHash !== this.hash(ipAddress)) {
      return { valid: false, reason: 'Session bound to different IP — possible hijacking' };
    }
    if (this.config.bindToUserAgent && session.userAgentHash !== this.hash(userAgent)) {
      return { valid: false, reason: 'Session bound to different User-Agent — possible hijacking' };
    }

    // Refresh idle timeout on valid access
    this.sessions.set(sessionId, {
      ...session,
      expiresAt: new Date(now.getTime() + this.config.expiryMs),
    });

    return { valid: true, session };
  }

  rotateSession(oldSessionId: string): string | null {
    const old = this.sessions.get(oldSessionId);
    if (!old) return null;

    const newId = randomBytes(this.config.idLength).toString('hex');
    const now = new Date();
    const newSession: Session = {
      ...old,
      id: newId,
      expiresAt: new Date(now.getTime() + this.config.expiryMs),
      rotationCount: old.rotationCount + 1,
    };

    this.sessions.set(newId, newSession);
    this.sessions.delete(oldSessionId);
    return newId;
  }

  revokeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) this.sessions.set(sessionId, { ...session, isActive: false });
  }

  revokeAllUserSessions(userId: string): number {
    let count = 0;
    for (const [id, session] of this.sessions) {
      if (session.userId === userId) {
        this.sessions.set(id, { ...session, isActive: false });
        count++;
      }
    }
    return count;
  }

  getActiveSessions(userId: string): Session[] {
    const now = new Date();
    return Array.from(this.sessions.values()).filter(
      s => s.userId === userId && s.isActive && s.expiresAt > now
    );
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  getConfig(): SessionConfig { return { ...this.config }; }
  getTotalSessions(): number { return this.sessions.size; }
}
