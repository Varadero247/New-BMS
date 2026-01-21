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
          significant: aspects.filter((a: any) => a.significanceLevel === 'SIGNIFICANT').length,
        },
        events: {
          total: events.length,
          open: events.filter((e: any) => e.status === 'OPEN' || e.status === 'INVESTIGATING').length,
        },
        actions: { overdue: 2, dueThisWeek: 4 },
        indicators: {
          waterUsage: 15420,
          energyUsage: 89500,
          wasteGenerated: 2340,
          carbonEmissions: 156,
        },
        topAspects: aspects.filter((a: any) => a.significanceLevel === 'SIGNIFICANT').slice(0, 5),
        recentEvents: events.slice(0, 5),
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
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
          <h1 className="text-3xl font-bold text-gray-900">Environmental Dashboard</h1>
          <p className="text-gray-500 mt-1">ISO 14001 Environmental Management System</p>
        </div>

        {/* Compliance & Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6 flex justify-center">
              <ComplianceGauge
                value={stats?.compliance || 0}
                label="ISO 14001"
                color="#22c55e"
                size="md"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Water Usage</p>
                  <p className="text-2xl font-bold">{stats?.indicators.waterUsage.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">kL / month</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Droplets className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Energy Usage</p>
                  <p className="text-2xl font-bold">{stats?.indicators.energyUsage.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">kWh / month</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Zap className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Waste Generated</p>
                  <p className="text-2xl font-bold">{stats?.indicators.wasteGenerated.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">kg / month</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Trash2 className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">CO2 Emissions</p>
                  <p className="text-2xl font-bold">{stats?.indicators.carbonEmissions}</p>
                  <p className="text-xs text-gray-400">tonnes / month</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-full">
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
                  <p className="text-sm text-gray-500">Environmental Aspects</p>
                  <p className="text-2xl font-bold">{stats?.aspects.total || 0}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
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
                  <p className="text-sm text-gray-500">Open Events</p>
                  <p className="text-2xl font-bold">{stats?.events.open || 0}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {stats?.events.total || 0} total events
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Overdue Actions</p>
                  <p className="text-2xl font-bold text-red-600">{stats?.actions.overdue || 0}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {stats?.actions.dueThisWeek || 0} due this week
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Objectives</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
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
                    <div key={aspect.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{aspect.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{aspect.impact}</p>
                      </div>
                      <div className="text-2xl font-bold text-gray-400">{aspect.significanceScore}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No significant aspects identified</p>
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
                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{event.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{event.referenceNumber}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            event.status === 'OPEN' ? 'bg-red-100 text-red-700' :
                            event.status === 'INVESTIGATING' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {event.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(event.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No environmental events recorded</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
