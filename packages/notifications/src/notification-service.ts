// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import {
  Notification,
  NotificationPreferences,
} from './types';
import { createChannel } from './channels';

/**
 * Core notification service.
 * Manages sending, tracking, and preferences for notifications.
 */
export class NotificationService {
  private notifications: Map<string, Notification> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();
  private userNotifications: Map<string, string[]> = new Map();

  /**
   * Send a single notification across configured channels.
   */
  async send(notification: Notification): Promise<void> {
    // Store the notification
    this.notifications.set(notification.id, {
      ...notification,
      status: 'PENDING',
    });

    // Track per user
    const userNotifs = this.userNotifications.get(notification.userId) || [];
    userNotifs.push(notification.id);
    this.userNotifications.set(notification.userId, userNotifs);

    // Check user preferences
    const prefs = this.preferences.get(notification.userId);

    // Filter out disabled notification types
    if (prefs?.disabledTypes.includes(notification.type)) {
      return;
    }

    // Check quiet hours
    if (prefs?.quietHours?.enabled && this.isQuietHours(prefs.quietHours)) {
      // During quiet hours, only send in-app notifications
      if (notification.channels.includes('in_app')) {
        const channel = createChannel('in_app');
        await channel.send(notification);
      }
      this.notifications.set(notification.id, {
        ...notification,
        status: 'SENT',
        sentAt: new Date(),
      });
      return;
    }

    // Send via each configured channel
    const channelsToUse = notification.channels.filter((ch) => {
      if (!prefs) return true;
      return prefs.channels[ch] !== false;
    });

    for (const channelType of channelsToUse) {
      const channel = createChannel(channelType);
      await channel.send(notification);
    }

    this.notifications.set(notification.id, {
      ...notification,
      status: 'SENT',
      sentAt: new Date(),
    });
  }

  /**
   * Send multiple notifications in bulk.
   */
  async sendBulk(notifications: Notification[]): Promise<void> {
    await Promise.all(notifications.map((n) => this.send(n)));
  }

  /**
   * Get all unread notifications for a user.
   */
  getUnread(userId: string): Notification[] {
    const notifIds = this.userNotifications.get(userId) || [];
    return notifIds
      .map((id) => this.notifications.get(id))
      .filter((n): n is Notification => n !== undefined && n.status !== 'READ');
  }

  /**
   * Mark a notification as read.
   */
  markRead(notificationId: string): void {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      this.notifications.set(notificationId, {
        ...notification,
        status: 'READ',
        readAt: new Date(),
      });
    }
  }

  /**
   * Get notification preferences for a user.
   */
  getPreferences(userId: string): NotificationPreferences {
    return (
      this.preferences.get(userId) || {
        userId,
        channels: { in_app: true, email: true, push: true, sms: false },
        disabledTypes: [],
        emailDigest: 'none',
      }
    );
  }

  /**
   * Set notification preferences for a user.
   */
  setPreferences(userId: string, prefs: NotificationPreferences): void {
    this.preferences.set(userId, { ...prefs, userId });
  }

  /**
   * Get a notification by ID.
   */
  getById(notificationId: string): Notification | undefined {
    return this.notifications.get(notificationId);
  }

  /**
   * Get all notifications for a user.
   */
  getAll(userId: string): Notification[] {
    const notifIds = this.userNotifications.get(userId) || [];
    return notifIds
      .map((id) => this.notifications.get(id))
      .filter((n): n is Notification => n !== undefined);
  }

  private isQuietHours(quietHours: { start: string; end: string }): boolean {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = quietHours.start.split(':').map(Number);
    const [endH, endM] = quietHours.end.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } else {
      // Overnight quiet hours (e.g. 22:00 - 07:00)
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
  }
}
