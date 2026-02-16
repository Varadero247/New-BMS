'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface DashboardData {
  totalAISystems: number;
  activeRisks: number;
  openIncidents: number;
  controlImplementation: number;
  recentIncidents: Array<{
    id: string;
    title: string;
    system: string;
    severity: string;
    status: string;
    incidentDate: string;
  }>;
  riskDistribution: Record<string, number>;
}

const severityColors: Record<string, string> = {
  CRITICAL: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
  HIGH: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
  MEDIUM: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
  LOW: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
};

const statusColors: Record<string, string> = {
  OPEN: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
  IN_PROGRESS: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
  INVESTIGATING: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
  RESOLVED: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  CLOSED: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    totalAISystems: 0,
    activeRisks: 0,
    openIncidents: 0,
    controlImplementation: 0,
    recentIncidents: [],
    riskDistribution: {},
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
        totalAISystems: d?.totalAISystems || 0,
        activeRisks: d?.activeRisks || 0,
        openIncidents: d?.openIncidents || 0,
        controlImplementation: d?.controlImplementation || 0,
        recentIncidents: d?.recentIncidents || [],
        riskDistribution: d?.riskDistribution || {},
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
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const kpiCards = [
    { label: 'Total AI Systems', value: data.totalAISystems, color: 'indigo', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { label: 'Active Risks', value: data.activeRisks, color: 'amber', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { label: 'Open Incidents', value: data.openIncidents, color: 'red', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Control Implementation', value: `${data.controlImplementation}%`, color: 'green', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">ISO 42001 Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">AI Management System Overview</p>
        </div>

        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiCards.map((card) => (
            <div key={card.label} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${card.color}-100 dark:bg-${card.color}-900`}>
                  <svg className={`w-6 h-6 text-${card.color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Incidents</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">System</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Severity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {data.recentIncidents.length > 0 ? (
                    data.recentIncidents.map((incident) => (
                      <tr key={incident.id} className="hover:bg-gray-50 dark:bg-gray-800">
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{incident.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{incident.system}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${severityColors[incident.severity] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>
                            {incident.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[incident.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>
                            {incident.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(incident.incidentDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No recent incidents
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Risk Distribution</h2>
            {Object.keys(data.riskDistribution).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(data.riskDistribution).map(([category, count]) => (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{category}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-indigo-500 rounded-full h-2"
                        style={{ width: `${Math.min((count as number / Math.max(...Object.values(data.riskDistribution) as number[])) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>No risk data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
