'use client';

import { useState } from 'react';

interface NotificationChannel {
  id: string;
  label: string;
  description: string;
  email: boolean;
  inApp: boolean;
  webhook: boolean;
}

const defaultChannels: NotificationChannel[] = [
  { id: 'incidents', label: 'Incidents', description: 'New incidents, severity changes, assignments', email: true, inApp: true, webhook: false },
  { id: 'audits', label: 'Audit Reminders', description: 'Upcoming audits, overdue findings', email: true, inApp: true, webhook: false },
  { id: 'capa', label: 'CAPA Actions', description: 'New CAPAs, deadlines, completion alerts', email: true, inApp: true, webhook: false },
  { id: 'documents', label: 'Document Reviews', description: 'Approval requests, expiring documents', email: true, inApp: true, webhook: false },
  { id: 'compliance', label: 'Compliance Alerts', description: 'Regulatory changes, deadline reminders', email: true, inApp: true, webhook: true },
  { id: 'training', label: 'Training', description: 'Training due, certifications expiring', email: true, inApp: true, webhook: false },
  { id: 'system', label: 'System Alerts', description: 'Maintenance windows, downtime, updates', email: false, inApp: true, webhook: true },
  { id: 'reports', label: 'Reports', description: 'Scheduled report delivery, export completions', email: true, inApp: false, webhook: false },
];

export default function NotificationsPage() {
  const [channels, setChannels] = useState<NotificationChannel[]>(defaultChannels);
  const [digestFrequency, setDigestFrequency] = useState('daily');
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('07:00');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [saved, setSaved] = useState(false);

  const toggleChannel = (id: string, field: 'email' | 'inApp' | 'webhook') => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, [field]: !c[field] } : c));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notification Preferences</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure how and when you receive notifications</p>
      </div>

      {/* Channel Matrix */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 dark:bg-gray-800">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Notification Channels</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Event Type</th>
              <th className="text-center p-3 font-medium text-gray-700 dark:text-gray-300 w-24">Email</th>
              <th className="text-center p-3 font-medium text-gray-700 dark:text-gray-300 w-24">In-App</th>
              <th className="text-center p-3 font-medium text-gray-700 dark:text-gray-300 w-24">Webhook</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {channels.map(ch => (
              <tr key={ch.id} className="hover:bg-gray-50 dark:bg-gray-800">
                <td className="p-3">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{ch.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{ch.description}</div>
                </td>
                {(['email', 'inApp', 'webhook'] as const).map(field => (
                  <td key={field} className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => toggleChannel(ch.id, field)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                        ch[field] ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white dark:bg-gray-900 shadow transform transition-transform ${
                        ch[field] ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Digest & Quiet Hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg border p-4 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Digest</h2>
          <div className="space-y-2">
            {[
              { value: 'realtime', label: 'Real-time', desc: 'Receive emails immediately' },
              { value: 'daily', label: 'Daily digest', desc: 'One email per day at 9:00 AM' },
              { value: 'weekly', label: 'Weekly digest', desc: 'One email per week on Monday' },
            ].map(opt => (
              <label key={opt.value} className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-50 dark:bg-gray-800 cursor-pointer">
                <input
                  type="radio"
                  name="digest"
                  value={opt.value}
                  checked={digestFrequency === opt.value}
                  onChange={e => setDigestFrequency(e.target.value)}
                  className="mt-1 h-4 w-4 text-blue-600"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{opt.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quiet Hours</h2>
            <button
              type="button"
              onClick={() => setQuietHoursEnabled(!quietHoursEnabled)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                quietHoursEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white dark:bg-gray-900 shadow transform transition-transform ${
                quietHoursEnabled ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Pause non-critical notifications during these hours</p>
          {quietHoursEnabled && (
            <div className="flex items-center gap-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">From</label>
                <input type="time" value={quietStart} onChange={e => setQuietStart(e.target.value)} className="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm" />
              </div>
              <span className="mt-4 text-gray-400 dark:text-gray-500">—</span>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">To</label>
                <input type="time" value={quietEnd} onChange={e => setQuietEnd(e.target.value)} className="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Webhook */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Webhook URL</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Events with webhook enabled will be POSTed to this URL as JSON</p>
        <input
          type="url"
          value={webhookUrl}
          onChange={e => setWebhookUrl(e.target.value)}
          placeholder="https://your-service.com/webhooks/ims"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          {saved ? 'Saved!' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
