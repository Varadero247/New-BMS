'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { ComplianceGauge } from '@ims/charts';
import { Leaf, AlertCircle, Clock, Target, Droplets, Zap, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface DashboardStats {
  compliance: number;
  aspects: { total: number; significant: number };
  events: { total: number; open: number };
  actions: { overdue: number; dueThisWeek: number };
  indicators: {
    waterUsage: number;
    energyUsage: number;
    wasteGenerated: number;
    carbonEmissions: number;
  };
  topAspects: any[];
  recentEvents: any[];
}

export default function EnvironmentalDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [aspectsRes, eventsRes] = await Promise.all([
        api.get('/aspects'),
        api.get('/events'),
      ]);

      const aspects = aspectsRes.data.data || [];
      const events = eventsRes.data.data || [];

      setStats({
        compliance: 82,
        aspects: {
          total: aspects.length,
          significant: aspects.filter((a: any) => a.isSignificant).length,
        },
        events: {
          total: events.length,
          open: events.filter((e: any) => e.status === 'REPORTED' || e.status === 'UNDER_INVESTIGATION' || e.status === 'CONTAINED').length,
        },
        actions: { overdue: 2, dueThisWeek: 4 },
        indicators: {
          waterUsage: 15420,
          energyUsage: 89500,
          wasteGenerated: 2340,
          carbonEmissions: 156,
        },
        topAspects: aspects.filter((a: any) => a.isSignificant).slice(0, 5),
        recentEvents: events.slice(0, 5),
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      setError('Unable to load data. Please check your connection and try again.');
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
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Environmental Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">ISO 14001 Environmental Management System</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button onClick={() => { setError(''); setLoading(true); loadStats(); }} className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline ml-4 shrink-0">Retry</button>
          </div>
        )}

        {/* Compliance & Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6 flex justify-center">
              <ComplianceGauge
                value={stats?.compliance || 0}
                label="ISO 14001"
                color="#10B981"
                size="md"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Water Usage</p>
                  <p className="text-2xl font-bold">{stats?.indicators.waterUsage.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">kL / month</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Droplets className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Energy Usage</p>
                  <p className="text-2xl font-bold">{stats?.indicators.energyUsage.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">kWh / month</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                  <Zap className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Waste Generated</p>
                  <p className="text-2xl font-bold">{stats?.indicators.wasteGenerated.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">kg / month</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                  <Trash2 className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">CO2 Emissions</p>
                  <p className="text-2xl font-bold">{stats?.indicators.carbonEmissions}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">tonnes / month</p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <Leaf className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Environmental Aspects</p>
                  <p className="text-2xl font-bold">{stats?.aspects.total || 0}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-red-600 font-medium">{stats?.aspects.significant || 0} significant</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Open Events</p>
                  <p className="text-2xl font-bold">{stats?.events.open || 0}</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {stats?.events.total || 0} total events
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Overdue Actions</p>
                  <p className="text-2xl font-bold text-red-600">{stats?.actions.overdue || 0}</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {stats?.actions.dueThisWeek || 0} due this week
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Objectives</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Significant Aspects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-500" />
                Significant Environmental Aspects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.topAspects && stats.topAspects.length > 0 ? (
                <div className="space-y-3">
                  {stats.topAspects.map((aspect: any) => (
                    <div key={aspect.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{aspect.activityProcess}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{aspect.aspect} — {aspect.impact}</p>
                      </div>
                      <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">{aspect.significanceScore}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No significant aspects identified</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Recent Environmental Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.recentEvents && stats.recentEvents.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentEvents.map((event: any) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{event.description?.slice(0, 80)}{event.description?.length > 80 ? '...' : ''}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{event.referenceNumber}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            event.status === 'REPORTED' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
                            event.status === 'UNDER_INVESTIGATION' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                            event.status === 'CLOSED' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                            'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          }`}>
                            {event.status?.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(event.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No environmental events recorded</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
