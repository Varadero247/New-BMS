'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp,
  Calendar,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendChart } from '@/components/charts';
import api from '@/lib/api';

interface TrendData {
  period: string;
  incidents: number;
  risks: number;
  actions: number;
  ncs: number;
}

interface MonthlyTrend {
  month: number;
  year: number;
  incidentCount: number;
  riskCount: number;
  actionCount: number;
  ncCount: number;
}

export default function TrendsPage() {
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedStandard, setSelectedStandard] = useState('ALL');

  useEffect(() => {
    fetchTrends();
  }, [selectedYear, selectedStandard]);

  async function fetchTrends() {
    setLoading(true);
    try {
      const res = await api.get('/analytics/trends', {
        params: {
          year: selectedYear,
          standard: selectedStandard !== 'ALL' ? selectedStandard : undefined,
        },
      });
      setTrends(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch trends:', error);
      // Set mock data for demo
      const mockData: MonthlyTrend[] = [];
      for (let m = 1; m <= 12; m++) {
        mockData.push({
          month: m,
          year: selectedYear,
          incidentCount: Math.floor(Math.random() * 15) + 5,
          riskCount: Math.floor(Math.random() * 10) + 2,
          actionCount: Math.floor(Math.random() * 20) + 10,
          ncCount: Math.floor(Math.random() * 8) + 2,
        });
      }
      setTrends(mockData);
    } finally {
      setLoading(false);
    }
  }

  const incidentTrendData = trends.map((t) => ({ month: t.month, value: t.incidentCount }));
  const riskTrendData = trends.map((t) => ({ month: t.month, value: t.riskCount }));
  const actionTrendData = trends.map((t) => ({ month: t.month, value: t.actionCount }));
  const ncTrendData = trends.map((t) => ({ month: t.month, value: t.ncCount }));

  // Calculate totals and averages
  const totals = trends.reduce(
    (acc, t) => ({
      incidents: acc.incidents + t.incidentCount,
      risks: acc.risks + t.riskCount,
      actions: acc.actions + t.actionCount,
      ncs: acc.ncs + t.ncCount,
    }),
    { incidents: 0, risks: 0, actions: 0, ncs: 0 }
  );

  const monthsWithData = trends.length || 1;
  const averages = {
    incidents: (totals.incidents / monthsWithData).toFixed(1),
    risks: (totals.risks / monthsWithData).toFixed(1),
    actions: (totals.actions / monthsWithData).toFixed(1),
    ncs: (totals.ncs / monthsWithData).toFixed(1),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Monthly Trends</h1>
            <p className="text-muted-foreground">Track IMS metrics over time</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchTrends}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="p-2 border rounded-lg bg-background"
              >
                {[2024, 2025, 2026].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={selectedStandard}
                onChange={(e) => setSelectedStandard(e.target.value)}
                className="p-2 border rounded-lg bg-background"
              >
                <option value="ALL">All Standards</option>
                <option value="ISO_45001">ISO 45001 (H&S)</option>
                <option value="ISO_14001">ISO 14001 (Environment)</option>
                <option value="ISO_9001">ISO 9001 (Quality)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Incidents</p>
          <p className="text-2xl font-bold text-red-500">{totals.incidents}</p>
          <p className="text-xs text-muted-foreground">Avg: {averages.incidents}/month</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Active Risks</p>
          <p className="text-2xl font-bold text-orange-500">{totals.risks}</p>
          <p className="text-xs text-muted-foreground">Avg: {averages.risks}/month</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Actions Created</p>
          <p className="text-2xl font-bold text-blue-500">{totals.actions}</p>
          <p className="text-xs text-muted-foreground">Avg: {averages.actions}/month</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Non-Conformances</p>
          <p className="text-2xl font-bold text-purple-500">{totals.ncs}</p>
          <p className="text-xs text-muted-foreground">Avg: {averages.ncs}/month</p>
        </Card>
      </div>

      {/* Trend Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base">Incidents Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TrendChart
              data={incidentTrendData}
              label="Incidents"
              color="#ef4444"
            />
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base">Risks Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TrendChart
              data={riskTrendData}
              label="Risks"
              color="#f97316"
            />
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base">Actions Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TrendChart
              data={actionTrendData}
              label="Actions"
              color="#3b82f6"
            />
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base">Non-Conformances Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TrendChart
              data={ncTrendData}
              label="NCs"
              color="#8b5cf6"
            />
          </CardContent>
        </Card>
      </div>

      {/* Combined Comparison */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle>Monthly Data Table</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Month</th>
                  <th className="text-right p-2 font-medium text-red-500">Incidents</th>
                  <th className="text-right p-2 font-medium text-orange-500">Risks</th>
                  <th className="text-right p-2 font-medium text-blue-500">Actions</th>
                  <th className="text-right p-2 font-medium text-purple-500">NCs</th>
                  <th className="text-right p-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {trends.map((t) => {
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const total = t.incidentCount + t.riskCount + t.actionCount + t.ncCount;
                  return (
                    <tr key={t.month} className="border-b hover:bg-muted/50">
                      <td className="p-2">{months[t.month - 1]} {t.year}</td>
                      <td className="text-right p-2">{t.incidentCount}</td>
                      <td className="text-right p-2">{t.riskCount}</td>
                      <td className="text-right p-2">{t.actionCount}</td>
                      <td className="text-right p-2">{t.ncCount}</td>
                      <td className="text-right p-2 font-medium">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-muted/50 font-medium">
                  <td className="p-2">Total</td>
                  <td className="text-right p-2 text-red-500">{totals.incidents}</td>
                  <td className="text-right p-2 text-orange-500">{totals.risks}</td>
                  <td className="text-right p-2 text-blue-500">{totals.actions}</td>
                  <td className="text-right p-2 text-purple-500">{totals.ncs}</td>
                  <td className="text-right p-2">
                    {totals.incidents + totals.risks + totals.actions + totals.ncs}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
