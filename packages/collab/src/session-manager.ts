// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import type { CollabDocType, CollabUser, CollabSession, CollabCursor } from './types';

export function createSessionManager() {
  const sessions = new Map<string, CollabSession>();

  function createSession(docId: string, docType: CollabDocType): CollabSession {
    const session: CollabSession = {
      docId,
      docType,
      users: new Map(),
      version: 0,
      lastModified: new Date(),
    };
    sessions.set(docId, session);
    return session;
  }

  function joinSession(docId: string, user: CollabUser): boolean {
    let session = sessions.get(docId);
    if (!session) return false;
    session.users.set(user.id, { ...user, lastActive: new Date() });
    session.lastModified = new Date();
    return true;
  }

  function leaveSession(docId: string, userId: string): boolean {
    const session = sessions.get(docId);
    if (!session) return false;
    const existed = session.users.has(userId);
    session.users.delete(userId);
    session.lastModified = new Date();
    return existed;
  }

  function getSession(docId: string): CollabSession | undefined {
    return sessions.get(docId);
  }

  function getActiveUsers(docId: string): CollabUser[] {
    const session = sessions.get(docId);
    if (!session) return [];
    return Array.from(session.users.values());
  }

  function updateCursor(docId: string, userId: string, cursor: CollabCursor): void {
    const session = sessions.get(docId);
    if (!session) return;
    const user = session.users.get(userId);
    if (!user) return;
    user.cursor = cursor;
    user.lastActive = new Date();
  }

  function isSessionActive(docId: string): boolean {
    return sessions.has(docId);
  }

  function getSessionCount(): number {
    return sessions.size;
  }

  function cleanupInactiveSessions(maxAgeMs: number): number {
    const now = Date.now();
    let removed = 0;
    for (const [docId, session] of sessions.entries()) {
      if (now - session.lastModified.getTime() > maxAgeMs) {
        sessions.delete(docId);
        removed++;
      }
    }
    return removed;
  }

  return {
    createSession,
    joinSession,
    leaveSession,
    getSession,
    getActiveUsers,
    updateCursor,
    isSessionActive,
    getSessionCount,
    cleanupInactiveSessions,
  };
}
