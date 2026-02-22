'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Bell, Megaphone } from 'lucide-react';
import { api } from '@/lib/api';

interface Announcement {
  id: string;
  title: string;
  content: string;
  portalType: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  isActive: boolean;
  publishedAt: string;
  author: string;
}

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: '1',
    title: 'Scheduled Maintenance Window – 1 March 2026',
    content:
      'Our systems will undergo scheduled maintenance on Saturday 1 March between 02:00–06:00 UTC. All portal services will be unavailable during this period. Please plan any document submissions accordingly.',
    portalType: 'CUSTOMER',
    priority: 'HIGH',
    isActive: true,
    publishedAt: '2026-02-18T09:00:00Z',
    author: 'Operations Team',
  },
  {
    id: '2',
    title: 'New Quality Reporting Dashboard Available',
    content:
      'We have launched a new quality-reports section in the portal. You can now view audit results, inspection certificates, and test reports directly from your dashboard. No action is required on your part.',
    portalType: 'CUSTOMER',
    priority: 'MEDIUM',
    isActive: true,
    publishedAt: '2026-02-14T11:30:00Z',
    author: 'Product Team',
  },
  {
    id: '3',
    title: 'Updated Terms of Service – Effective 1 April 2026',
    content:
      'Our terms of service have been updated. The key changes relate to data retention policies and the introduction of portal user role definitions. Please review the updated terms at your earliest convenience.',
    portalType: 'CUSTOMER',
    priority: 'MEDIUM',
    isActive: true,
    publishedAt: '2026-02-10T08:00:00Z',
    author: 'Legal Team',
  },
  {
    id: '4',
    title: 'Holiday Office Hours – March Bank Holiday',
    content:
      'Our offices will operate on reduced hours on the 17 March bank holiday. Support tickets submitted after 12:00 UTC will be processed on 18 March. Emergency escalations remain available 24/7.',
    portalType: 'CUSTOMER',
    priority: 'LOW',
    isActive: true,
    publishedAt: '2026-02-05T14:00:00Z',
    author: 'Customer Success',
  },
];

const PRIORITY_STYLES: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  LOW: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const PRIORITY_ORDER: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await api.get('/portal/announcements');
      setAnnouncements(res.data.data || []);
    } catch {
      setAnnouncements(MOCK_ANNOUNCEMENTS);
    } finally {
      setLoading(false);
    }
  }

  const filtered = announcements
    .filter((a) => a.isActive)
    .filter((a) => priorityFilter === 'ALL' || a.priority === priorityFilter)
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Announcements</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Important notices and updates from your account team
            </p>
          </div>
          <Bell className="h-7 w-7 text-teal-500 mt-1 flex-shrink-0" />
        </div>

        {/* Priority filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                priorityFilter === p
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {p === 'ALL' ? 'All Priorities' : p}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((a) => (
              <Card key={a.id} className="border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-base font-semibold text-gray-900 dark:text-white leading-snug">
                      {a.title}
                    </CardTitle>
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${PRIORITY_STYLES[a.priority]}`}
                    >
                      {a.priority}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                    {a.content}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                    <span>
                      Published {new Date(a.publishedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    <span>By {a.author}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No announcements</p>
            <p className="text-sm mt-1">There are no active announcements matching your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
