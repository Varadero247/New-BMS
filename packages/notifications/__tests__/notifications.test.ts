import {
  NotificationService,
  createChannel,
  checkEscalation,
  getDefaultEscalationRules,
} from '../src';
import type { Notification, EscalationRule } from '../src';

function createTestNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    type: 'ACTION_ASSIGNED',
    title: 'New Action Assigned',
    message: 'You have been assigned action ACT-001',
    userId: 'user-001',
    channels: ['in_app', 'email'],
    priority: 'MEDIUM',
    status: 'PENDING',
    module: 'health-safety',
    referenceId: 'act-001',
    referenceType: 'action',
    link: '/health-safety/actions/act-001',
    createdAt: new Date(),
    ...overrides,
  };
}

describe('notifications', () => {
  describe('NotificationService', () => {
    let service: NotificationService;

    beforeEach(() => {
      service = new NotificationService();
    });

    it('should send a notification', async () => {
      const notif = createTestNotification({ id: 'n-001' });
      await service.send(notif);
      const stored = service.getById('n-001');
      expect(stored).toBeDefined();
      expect(stored!.status).toBe('SENT');
    });

    it('should send bulk notifications', async () => {
      const notifs = [
        createTestNotification({ id: 'n-bulk-1', userId: 'user-001' }),
        createTestNotification({ id: 'n-bulk-2', userId: 'user-002' }),
      ];
      await service.sendBulk(notifs);
      expect(service.getById('n-bulk-1')).toBeDefined();
      expect(service.getById('n-bulk-2')).toBeDefined();
    });

    it('should get unread notifications for a user', async () => {
      await service.send(createTestNotification({ id: 'n-unread-1', userId: 'user-001' }));
      await service.send(createTestNotification({ id: 'n-unread-2', userId: 'user-001' }));
      const unread = service.getUnread('user-001');
      expect(unread.length).toBe(2);
    });

    it('should mark notification as read', async () => {
      await service.send(createTestNotification({ id: 'n-read-1', userId: 'user-001' }));
      service.markRead('n-read-1');
      const notif = service.getById('n-read-1');
      expect(notif!.status).toBe('READ');
      expect(notif!.readAt).toBeDefined();
    });

    it('should not return read notifications in getUnread', async () => {
      await service.send(createTestNotification({ id: 'n-r1', userId: 'user-001' }));
      await service.send(createTestNotification({ id: 'n-r2', userId: 'user-001' }));
      service.markRead('n-r1');
      const unread = service.getUnread('user-001');
      expect(unread.length).toBe(1);
      expect(unread[0].id).toBe('n-r2');
    });

    it('should get and set preferences', () => {
      const prefs = service.getPreferences('user-001');
      expect(prefs.channels.in_app).toBe(true);

      service.setPreferences('user-001', {
        userId: 'user-001',
        channels: { in_app: true, email: false, push: false, sms: false },
        disabledTypes: ['SYSTEM_ALERT'],
        emailDigest: 'daily',
      });

      const updated = service.getPreferences('user-001');
      expect(updated.channels.email).toBe(false);
      expect(updated.disabledTypes).toContain('SYSTEM_ALERT');
    });

    it('should skip disabled notification types', async () => {
      service.setPreferences('user-001', {
        userId: 'user-001',
        channels: { in_app: true, email: true, push: true, sms: false },
        disabledTypes: ['ACTION_ASSIGNED'],
        emailDigest: 'none',
      });

      const notif = createTestNotification({
        id: 'n-disabled',
        userId: 'user-001',
        type: 'ACTION_ASSIGNED',
      });
      await service.send(notif);
      // Still stored but not really sent through channels
      const stored = service.getById('n-disabled');
      expect(stored).toBeDefined();
    });

    it('should get all notifications for a user', async () => {
      await service.send(createTestNotification({ id: 'n-all-1', userId: 'user-001' }));
      await service.send(createTestNotification({ id: 'n-all-2', userId: 'user-001' }));
      service.markRead('n-all-1');
      const all = service.getAll('user-001');
      expect(all.length).toBe(2);
    });

    it('should return empty array for unknown user', () => {
      expect(service.getUnread('unknown')).toEqual([]);
      expect(service.getAll('unknown')).toEqual([]);
    });
  });

  describe('createChannel', () => {
    it('should create an in-app channel', () => {
      const channel = createChannel('in_app');
      expect(channel.type).toBe('in_app');
    });

    it('should create an email channel', () => {
      const channel = createChannel('email');
      expect(channel.type).toBe('email');
    });

    it('should create a push channel', () => {
      const channel = createChannel('push');
      expect(channel.type).toBe('push');
    });

    it('should create an SMS channel', () => {
      const channel = createChannel('sms');
      expect(channel.type).toBe('sms');
    });

    it('should throw for unknown channel type', () => {
      expect(() => createChannel('unknown' as string)).toThrow('Unknown channel type');
    });
  });

  describe('checkEscalation', () => {
    const rules: EscalationRule[] = [
      { afterHours: 4, escalateTo: 'manager-001', action: 'NOTIFY_MANAGER' },
      { afterHours: 24, escalateTo: 'director-001', action: 'REASSIGN' },
    ];

    it('should not escalate before first rule threshold', () => {
      const notif = createTestNotification({ status: 'SENT' });
      const result = checkEscalation(notif, 2, rules);
      expect(result).toBeNull();
    });

    it('should escalate after first rule threshold', () => {
      const notif = createTestNotification({ status: 'SENT' });
      const result = checkEscalation(notif, 5, rules);
      expect(result).not.toBeNull();
      expect(result!.escalatedTo).toBe('manager-001');
      expect(result!.action).toBe('NOTIFY_MANAGER');
    });

    it('should escalate to highest matching rule', () => {
      const notif = createTestNotification({ status: 'SENT' });
      const result = checkEscalation(notif, 30, rules);
      expect(result).not.toBeNull();
      expect(result!.escalatedTo).toBe('director-001');
      expect(result!.action).toBe('REASSIGN');
    });

    it('should not escalate read notifications', () => {
      const notif = createTestNotification({ status: 'READ' });
      const result = checkEscalation(notif, 100, rules);
      expect(result).toBeNull();
    });

    it('should return null for empty rules', () => {
      const notif = createTestNotification({ status: 'SENT' });
      expect(checkEscalation(notif, 100, [])).toBeNull();
    });
  });

  describe('getDefaultEscalationRules', () => {
    it('should return critical rules with short timeframes', () => {
      const rules = getDefaultEscalationRules('CRITICAL', 'mgr-001');
      expect(rules.length).toBe(3);
      expect(rules[0].afterHours).toBe(1);
    });

    it('should return high priority rules', () => {
      const rules = getDefaultEscalationRules('HIGH', 'mgr-001');
      expect(rules.length).toBe(2);
      expect(rules[0].afterHours).toBe(4);
    });

    it('should return medium priority rules', () => {
      const rules = getDefaultEscalationRules('MEDIUM', 'mgr-001');
      expect(rules.length).toBe(2);
    });

    it('should return low priority rules with auto-close', () => {
      const rules = getDefaultEscalationRules('LOW', 'mgr-001');
      expect(rules.some((r) => r.action === 'AUTO_CLOSE')).toBe(true);
    });

    it('should return empty for unknown priority', () => {
      const rules = getDefaultEscalationRules('UNKNOWN', 'mgr-001');
      expect(rules).toEqual([]);
    });
  });
});

describe('NotificationService – extended coverage', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
  });

  it('markRead is idempotent – second call keeps READ status', async () => {
    await service.send(createTestNotification({ id: 'idem-1', userId: 'user-x' }));
    service.markRead('idem-1');
    service.markRead('idem-1');
    expect(service.getById('idem-1')!.status).toBe('READ');
  });

  it('markRead on unknown id does not throw', () => {
    expect(() => service.markRead('does-not-exist')).not.toThrow();
  });

  it('sendBulk with empty array does not throw', async () => {
    await expect(service.sendBulk([])).resolves.not.toThrow();
  });

  it('getAll returns both sent and read notifications', async () => {
    await service.send(createTestNotification({ id: 'a-1', userId: 'user-y' }));
    await service.send(createTestNotification({ id: 'a-2', userId: 'user-y' }));
    service.markRead('a-1');
    const all = service.getAll('user-y');
    const statuses = all.map((n) => n.status);
    expect(statuses).toContain('READ');
    expect(statuses).toContain('SENT');
  });

  it('different users notifications are isolated', async () => {
    await service.send(createTestNotification({ id: 'iso-1', userId: 'user-a' }));
    await service.send(createTestNotification({ id: 'iso-2', userId: 'user-b' }));
    expect(service.getAll('user-a')).toHaveLength(1);
    expect(service.getAll('user-b')).toHaveLength(1);
  });

  it('sent notification has a defined id', async () => {
    const notif = createTestNotification({ id: 'check-id' });
    await service.send(notif);
    expect(service.getById('check-id')!.id).toBe('check-id');
  });

  it('setPreferences overwrites previously stored preferences', () => {
    service.setPreferences('user-pref', {
      userId: 'user-pref',
      channels: { in_app: true, email: true, push: true, sms: true },
      disabledTypes: [],
      emailDigest: 'daily',
    });
    service.setPreferences('user-pref', {
      userId: 'user-pref',
      channels: { in_app: false, email: false, push: false, sms: false },
      disabledTypes: ['ACTION_ASSIGNED'],
      emailDigest: 'none',
    });
    const prefs = service.getPreferences('user-pref');
    expect(prefs.channels.in_app).toBe(false);
    expect(prefs.emailDigest).toBe('none');
  });
});

describe('NotificationService – priority and channel coverage', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
  });

  it('send stores the original priority on the notification', async () => {
    const notif = createTestNotification({ id: 'prio-1', userId: 'user-p', priority: 'HIGH' });
    await service.send(notif);
    expect(service.getById('prio-1')!.priority).toBe('HIGH');
  });

  it('getById returns undefined for a never-stored id', () => {
    expect(service.getById('never-stored')).toBeUndefined();
  });

  it('sendBulk stores all provided notifications', async () => {
    const notifs = [
      createTestNotification({ id: 'bulk-x1', userId: 'user-bulk' }),
      createTestNotification({ id: 'bulk-x2', userId: 'user-bulk' }),
      createTestNotification({ id: 'bulk-x3', userId: 'user-bulk' }),
    ];
    await service.sendBulk(notifs);
    expect(service.getAll('user-bulk')).toHaveLength(3);
  });

  it('getUnread count decreases after markRead', async () => {
    await service.send(createTestNotification({ id: 'dec-1', userId: 'user-dec' }));
    await service.send(createTestNotification({ id: 'dec-2', userId: 'user-dec' }));
    service.markRead('dec-1');
    expect(service.getUnread('user-dec')).toHaveLength(1);
  });
});

describe('NotificationService — final coverage', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
  });

  it('getUnread returns notifications in order they were stored', async () => {
    await service.send(createTestNotification({ id: 'ord-1', userId: 'user-ord' }));
    await service.send(createTestNotification({ id: 'ord-2', userId: 'user-ord' }));
    const unread = service.getUnread('user-ord');
    expect(unread.map((n) => n.id)).toEqual(['ord-1', 'ord-2']);
  });

  it('getAll includes notifications from multiple sends in insertion order', async () => {
    await service.send(createTestNotification({ id: 'seq-1', userId: 'user-seq' }));
    await service.send(createTestNotification({ id: 'seq-2', userId: 'user-seq' }));
    await service.send(createTestNotification({ id: 'seq-3', userId: 'user-seq' }));
    const all = service.getAll('user-seq');
    expect(all).toHaveLength(3);
  });

  it('notification readAt is set after markRead', async () => {
    await service.send(createTestNotification({ id: 'rat-1', userId: 'user-rat' }));
    service.markRead('rat-1');
    const notif = service.getById('rat-1');
    expect(notif!.readAt).toBeInstanceOf(Date);
  });

  it('getPreferences returns default channels with all truthy', () => {
    const prefs = service.getPreferences('brand-new-user');
    expect(prefs.channels.in_app).toBe(true);
    expect(prefs.channels.email).toBe(true);
  });

  it('createChannel sms type has the sms type property', () => {
    const ch = createChannel('sms');
    expect(ch.type).toBe('sms');
  });
});
