'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface DashboardData {
  activePolicies: number;
  dueDiligenceCount: number;
  giftsPending: number;
  trainingCompletion: number;
  openInvestigations: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    date: string;
    user: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    activePolicies: 0,
    dueDiligenceCount: 0,
    giftsPending: 0,
    trainingCompletion: 0,
    openInvestigations: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setError(null);
      const res = await api.get('/dashboard');
      const d = res.data.data;
      setData({
        activePolicies: d?.activePolicies || 0,
        dueDiligenceCount: d?.dueDiligenceCount || 0,
        giftsPending: d?.giftsPending || 0,
        trainingCompletion: d?.trainingCompletion || 0,
        openInvestigations: d?.openInvestigations || 0,
        recentActivity: d?.recentActivity || [],
      });
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Failed to load dashboard data. The API may not be running.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      label: 'Active Policies',
      value: data.activePolicies,
      color: 'bg-rose-100 dark:bg-rose-900',
      textColor: 'text-rose-600',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      label: 'Due Diligence',
      value: data.dueDiligenceCount,
      color: 'bg-blue-100 dark:bg-blue-900',
      textColor: 'text-blue-600',
      icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    },
    {
      label: 'Gifts Pending',
      value: data.giftsPending,
      color: 'bg-amber-100 dark:bg-amber-900',
      textColor: 'text-amber-600',
      icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7',
    },
    {
      label: 'Training Completion',
      value: `${data.trainingCompletion}%`,
      color: 'bg-green-100 dark:bg-green-900',
      textColor: 'text-green-600',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    },
    {
      label: 'Open Investigations',
      value: data.openInvestigations,
      color: 'bg-red-100 dark:bg-red-900',
      textColor: 'text-red-600',
      icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    },
  ];

  const activityTypeColors: Record<string, string> = {
    POLICY: 'bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300',
    DUE_DILIGENCE: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
    GIFT: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300',
    TRAINING: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
    INVESTIGATION: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            ISO 37001 Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Anti-Bribery Management System Overview
          </p>
        </div>

        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          {kpiCards.map((card) => (
            <div
              key={card.label}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <svg
                    className={`w-5 h-5 ${card.textColor}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={card.icon}
                    />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{card.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Activity
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.recentActivity.length > 0 ? (
              data.recentActivity.map((activity) => (
                <div key={activity.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${activityTypeColors[activity.type] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                    >
                      {activity.type}
                    </span>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{activity.user}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(activity.date).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
