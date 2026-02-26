// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { WSNotification } from './websocket';

const MAX_NOTIFICATIONS_PER_USER = 200;

interface PaginatedResult {
  items: WSNotification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * In-app notification bell state manager.
 * Manages per-user notification state in memory with FIFO eviction.
 */
export class NotificationBellState {
  private store: Map<string, WSNotification[]> = new Map();

  /**
   * Add a notification for a user.
   * Evicts oldest notifications when exceeding MAX_NOTIFICATIONS_PER_USER.
   */
  addNotification(userId: string, notification: WSNotification): void {
    if (!this.store.has(userId)) {
      this.store.set(userId, []);
    }

    const notifications = this.store.get(userId)!;
    // Add to front (newest first)
    notifications.unshift(notification);

    // FIFO eviction if over limit
    if (notifications.length > MAX_NOTIFICATIONS_PER_USER) {
      notifications.splice(MAX_NOTIFICATIONS_PER_USER);
    }
  }

  /**
   * Get all unread notifications for a user.
   */
  getUnread(userId: string): WSNotification[] {
    const notifications = this.store.get(userId) || [];
    return notifications.filter((n) => !n.read);
  }

  /**
   * Get all notifications for a user with pagination.
   */
  getAll(userId: string, page: number = 1, limit: number = 20): PaginatedResult {
    const notifications = this.store.get(userId) || [];
    const total = notifications.length;
    const unreadCount = notifications.filter((n) => !n.read).length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const items = notifications.slice(start, start + limit);

    return {
      items,
      total,
      unreadCount,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Mark a single notification as read.
   * Returns true if the notification was found and marked.
   */
  markRead(userId: string, notificationId: string): boolean {
    const notifications = this.store.get(userId);
    if (!notifications) return false;

    const notification = notifications.find((n) => n.id === notificationId);
    if (!notification) return false;

    notification.read = true;
    return true;
  }

  /**
   * Mark all notifications as read for a user.
   * Returns the number of notifications marked.
   */
  markAllRead(userId: string): number {
    const notifications = this.store.get(userId);
    if (!notifications) return 0;

    let count = 0;
    notifications.forEach((n) => {
      if (!n.read) {
        n.read = true;
        count++;
      }
    });
    return count;
  }

  /**
   * Get the count of unread notifications for a user.
   */
  getUnreadCount(userId: string): number {
    const notifications = this.store.get(userId) || [];
    return notifications.filter((n) => !n.read).length;
  }

  /**
   * Remove all notifications for a user.
   */
  clear(userId: string): void {
    this.store.delete(userId);
  }

  /**
   * Get all tracked user IDs.
   */
  getTrackedUsers(): string[] {
    return Array.from(this.store.keys());
  }
}
