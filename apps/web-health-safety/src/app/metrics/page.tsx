'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { SafetyTrendChart } from '@ims/charts';
import { Activity, TrendingUp, TrendingDown, Users, Clock, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

interface SafetyMetrics {
  ltifr: number;
  trir: number;
  severityRate: number;
  ltifrTrend: number;
  trirTrend: number;
  totalIncidents: number;
  lostTimeIncidents: number;
  nearMisses: number;
  hoursWorked: number;
  daysLost: number;
  monthlyData: {
    month: string;
    ltifr: number;
    trir: number;
    incidents: number;
  }[];
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<SafetyMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    try {
      const response = await api.get('/metrics');
      setMetrics(response.data.data || {
        ltifr: 2.5,
        trir: 4.2,
        severityRate: 15.3,
        ltifrTrend: -0.3,
        trirTrend: -0.5,
        totalIncidents: 23,
        lostTimeIncidents: 3,
        nearMisses: 45,
        hoursWorked: 125000,
        daysLost: 12,
        monthlyData: [
          { month: 'Jul', ltifr: 3.2, trir: 5.1, incidents: 5 },
          { month: 'Aug', ltifr: 2.8, trir: 4.8, incidents: 4 },
          { month: 'Sep', ltifr: 2.9, trir: 4.5, incidents: 3 },
          { month: 'Oct', ltifr: 2.6, trir: 4.3, incidents: 4 },
          { month: 'Nov', ltifr: 2.4, trir: 4.1, incidents: 3 },
          { month: 'Dec', ltifr: 2.5, trir: 4.2, incidents: 4 },
        ],
      });
    } catch (error) {
      console.error('Failed to load metrics:', error);
      // Use mock data on error
      setMetrics({
        ltifr: 2.5,
        trir: 4.2,
        severityRate: 15.3,
        ltifrTrend: -0.3,
        trirTrend: -0.5,
        totalIncidents: 23,
        lostTimeIncidents: 3,
        nearMisses: 45,
        hoursWorked: 125000,
        daysLost: 12,
        monthlyData: [
          { month: 'Jul', ltifr: 3.2, trir: 5.1, incidents: 5 },
          { month: 'Aug', ltifr: 2.8, trir: 4.8, incidents: 4 },
          { month: 'Sep', ltifr: 2.9, trir: 4.5, incidents: 3 },
          { month: 'Oct', ltifr: 2.6, trir: 4.3, incidents: 4 },
          { month: 'Nov', ltifr: 2.4, trir: 4.1, incidents: 3 },
          { month: 'Dec', ltifr: 2.5, trir: 4.2, incidents: 4 },
        ],
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
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
          <h1 className="text-3xl font-bold text-gray-900">Safety Metrics</h1>
          <p className="text-gray-500 mt-1">Key performance indicators for occupational health and safety</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">LTIFR</p>
                  <p className="text-3xl font-bold">{metrics?.ltifr.toFixed(2)}</p>
                  <div className="flex items-center mt-1">
                    {(metrics?.ltifrTrend || 0) < 0 ? (
                      <>
                        <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">{Math.abs(metrics?.ltifrTrend || 0).toFixed(1)}% improvement</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-sm text-red-600">{(metrics?.ltifrTrend || 0).toFixed(1)}% increase</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-red-100 rounded-full">
                  <Activity className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4">Lost Time Injury Frequency Rate (per million hours)</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">TRIR</p>
                  <p className="text-3xl font-bold">{metrics?.trir.toFixed(2)}</p>
                  <div className="flex items-center mt-1">
                    {(metrics?.trirTrend || 0) < 0 ? (
                      <>
                        <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">{Math.abs(metrics?.trirTrend || 0).toFixed(1)}% improvement</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-sm text-red-600">{(metrics?.trirTrend || 0).toFixed(1)}% increase</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-orange-100 rounded-full">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4">Total Recordable Incident Rate (per 200,000 hours)</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Severity Rate</p>
                  <p className="text-3xl font-bold">{metrics?.severityRate.toFixed(1)}</p>
                </div>
                <div className="p-4 bg-yellow-100 rounded-full">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4">Average days lost per recordable incident</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold">{metrics?.totalIncidents}</p>
              <p className="text-sm text-gray-500">Total Incidents</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold text-red-600">{metrics?.lostTimeIncidents}</p>
              <p className="text-sm text-gray-500">Lost Time Incidents</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold text-yellow-600">{metrics?.nearMisses}</p>
              <p className="text-sm text-gray-500">Near Misses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold">{(metrics?.hoursWorked || 0).toLocaleString()}</p>
              <p className="text-sm text-gray-500">Hours Worked</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold text-orange-600">{metrics?.daysLost}</p>
              <p className="text-sm text-gray-500">Days Lost</p>
            </CardContent>
          </Card>
        </div>

        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Safety Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics?.monthlyData && (
              <SafetyTrendChart
                data={metrics.monthlyData}
                height={350}
              />
            )}
          </CardContent>
        </Card>

        {/* Definitions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-500" />
              Metric Definitions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900">LTIFR</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Lost Time Injury Frequency Rate = (Lost Time Injuries × 1,000,000) ÷ Total Hours Worked
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">TRIR</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Total Recordable Incident Rate = (Total Recordable Injuries × 200,000) ÷ Total Hours Worked
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Severity Rate</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Severity Rate = Total Days Lost ÷ Number of Recordable Incidents
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
