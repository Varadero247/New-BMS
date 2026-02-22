'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@ims/ui';
import { Bell, AlertTriangle, CheckCircle, XCircle, Check } from 'lucide-react';
import { api } from '@/lib/api';

interface PortalNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

const MOCK_NOTIFICATIONS: PortalNotification[] = [
  {
    id: '1',
    title: 'Approval Request: Engineering Change Order',
    message: 'A new engineering change order (PTL-APR-2026-001) requires your sign-off by 26 Feb.',
    type: 'WARNING',
    isRead: false,
    createdAt: '2026-02-20T10:05:00Z',
    link: '/approvals',
  },
  {
    id: '2',
    title: 'Quality Certificate Renewed',
    message: 'Your ISO 9001:2015 certificate has been renewed and is now available in Quality Reports.',
    type: 'SUCCESS',
    isRead: false,
    createdAt: '2026-02-19T14:20:00Z',
    link: '/quality-reports',
  },
  {
    id: '3',
    title: 'Invoice #INV-2026-048 Issued',
    message: 'A new invoice for £12,450.00 has been issued and is due on 15 March 2026.',
    type: 'INFO',
    isRead: false,
    createdAt: '2026-02-17T09:00:00Z',
    link: '/invoices',
  },
  {
    id: '4',
    title: 'Support Ticket Closed — TKT-2026-019',
    message:
      'Your support ticket regarding the delivery discrepancy has been resolved and closed.',
    type: 'SUCCESS',
    isRead: true,
    createdAt: '2026-02-12T16:45:00Z',
  },
  {
    id: '5',
    title: 'Order Shipment Delayed',
    message:
      'Order PTL-ORD-2026-003 has experienced a shipping delay. Revised delivery date: 28 Feb 2026.',
    type: 'ERROR',
    isRead: true,
    createdAt: '2026-02-11T11:30:00Z',
    link: '/orders',
  },
];

const TYPE_ICON: Record<string, React.ReactNode> = {
  INFO: <Bell className="h-5 w-5 text-blue-500" />,
  WARNING: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  SUCCESS: <CheckCircle className="h-5 w-5 text-green-500" />,
  ERROR: <XCircle className="h-5 w-5 text-red-500" />,
};

const TYPE_BORDER: Record<string, string> = {
  INFO: 'border-l-blue-400',
  WARNING: 'border-l-amber-400',
  SUCCESS: 'border-l-green-400',
  ERROR: 'border-l-red-400',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const [marking, setMarking] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await api.get('/portal/notifications');
      setNotifications(res.data.data || []);
    } catch {
      setNotifications(MOCK_NOTIFICATIONS);
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id: string) {
    setMarking(id);
    try {
      await api.patch(`/portal/notifications/${id}/read`);
    } catch {
      // apply optimistically
    } finally {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setMarking(null);
    }
  }

  async function markAllRead() {
    setMarkingAll(true);
    const unread = notifications.filter((n) => !n.isRead);
    try {
      await Promise.all(unread.map((n) => api.patch(`/portal/notifications/${n.id}/read`)));
    } catch {
      // apply optimistically
    } finally {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setMarkingAll(false);
    }
  }

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'READ') return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center h-6 w-6 rounded-full bg-teal-600 text-white text-xs font-bold">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Updates, alerts, and activity from your portal
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={markingAll}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {markingAll ? 'Marking...' : 'Mark All Read'}
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
          {(['ALL', 'UNREAD', 'READ'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {f === 'ALL'
                ? `All (${notifications.length})`
                : f === 'UNREAD'
                  ? `Unread (${unreadCount})`
                  : `Read (${notifications.length - unreadCount})`}
            </button>
          ))}
        </div>

        {/* Notification list */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((n) => (
              <Card
                key={n.id}
                className={`border-l-4 ${TYPE_BORDER[n.type]} border border-gray-200 dark:border-gray-700 transition-opacity ${n.isRead ? 'opacity-70' : ''}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">{TYPE_ICON[n.type]}</div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-snug ${!n.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}
                      >
                        {n.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(n.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {n.link && (
                          <a
                            href={n.link}
                            className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
                          >
                            View &rarr;
                          </a>
                        )}
                      </div>
                    </div>
                    {!n.isRead && (
                      <button
                        onClick={() => markRead(n.id)}
                        disabled={marking === n.id}
                        title="Mark as read"
                        className="flex-shrink-0 p-1.5 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No notifications</p>
            <p className="text-sm mt-1">
              {filter === 'UNREAD' ? 'You have no unread notifications.' : 'Nothing to show here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
