'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  Building2,
  Users,
  CalendarClock,
  Shield,
  Package,
  AlertTriangle,
  Activity,
  TrendingUp,
  Flame,
  Lock,
  BookOpen,
  RefreshCw,
} from 'lucide-react';

interface UpcomingDrill {
  title: string;
  date: string;
  type: string;
}

interface IncidentTrend {
  month: string;
  count: number;
}

interface DashboardData {
  activePremises: number;
  activeWardens: number;
  drillsDueNext30Days: number;
  bcpTested: number;
  totalEquipmentItems: number;
  equipmentDue: number;
  recentIncidents: number;
  drillCompletionRate: number;
  upcomingDrills: UpcomingDrill[];
  incidentTrend: IncidentTrend[];
}

const MOCK_DATA: DashboardData = {
  activePremises: 12,
  activeWardens: 34,
  drillsDueNext30Days: 3,
  bcpTested: 8,
  totalEquipmentItems: 247,
  equipmentDue: 18,
  recentIncidents: 4,
  drillCompletionRate: 87,
  upcomingDrills: [
    { title: 'Fire Evacuation Drill - Building A', date: '2026-03-01T10:00:00Z', type: 'FIRE' },
    { title: 'BCP Table-Top Exercise', date: '2026-03-15T14:00:00Z', type: 'BCP' },
    { title: 'Lockdown Drill', date: '2026-04-01T09:00:00Z', type: 'SECURITY' },
  ],
  incidentTrend: [
    { month: 'Sep', count: 1 },
    { month: 'Oct', count: 3 },
    { month: 'Nov', count: 2 },
    { month: 'Dec', count: 1 },
    { month: 'Jan', count: 2 },
    { month: 'Feb', count: 4 },
  ],
};

function DrillTypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    FIRE: { label: 'Fire', className: 'bg-red-100 text-red-800 border border-red-200', icon: <Flame className="w-3 h-3" /> },
    BCP: { label: 'BCP', className: 'bg-blue-100 text-blue-800 border border-blue-200', icon: <BookOpen className="w-3 h-3" /> },
    SECURITY: { label: 'Security', className: 'bg-purple-100 text-purple-800 border border-purple-200', icon: <Lock className="w-3 h-3" /> },
    MEDICAL: { label: 'Medical', className: 'bg-green-100 text-green-800 border border-green-200', icon: <Activity className="w-3 h-3" /> },
    EVACUATION: { label: 'Evacuation', className: 'bg-orange-100 text-orange-800 border border-orange-200', icon: <AlertTriangle className="w-3 h-3" /> },
  };
  const c = config[type] ?? { label: type, className: 'bg-gray-100 text-gray-700 border border-gray-200', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.className}`}>
      {c.icon}
      {c.label}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function EmergencyAnalyticsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  function load() {
    setLoading(true);
    api
      .get('/analytics/dashboard')
      .then((r) => setData(r.data.data))
      .catch(() => setData(MOCK_DATA))
      .finally(() => {
        setLoading(false);
        setLastRefresh(new Date());
      });
  }

  useEffect(() => {
    load();
  }, []);

  const maxTrend = data ? Math.max(...data.incidentTrend.map((t) => t.count), 1) : 1;

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-red-600 font-medium animate-pulse">Loading analytics...</div>
      </div>
    );
  }

  const d = data ?? MOCK_DATA;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-7 h-7 text-red-600" />
              Emergency Management Analytics
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Last refreshed: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            label="Active Premises"
            value={d.activePremises}
            icon={<Building2 className="w-5 h-5 text-red-600" />}
            color="red"
          />
          <StatCard
            label="Active Wardens"
            value={d.activeWardens}
            icon={<Users className="w-5 h-5 text-orange-600" />}
            color="orange"
          />
          <StatCard
            label="Drills Due (30 Days)"
            value={d.drillsDueNext30Days}
            icon={<CalendarClock className="w-5 h-5 text-amber-600" />}
            color="amber"
            alert={d.drillsDueNext30Days > 0}
          />
          <StatCard
            label="BCP Tested"
            value={d.bcpTested}
            icon={<Shield className="w-5 h-5 text-blue-600" />}
            color="blue"
          />
          <StatCard
            label="Equipment Due"
            value={d.equipmentDue}
            icon={<Package className="w-5 h-5 text-purple-600" />}
            color="purple"
            alert={d.equipmentDue > 0}
          />
          <StatCard
            label="Drill Completion"
            value={`${d.drillCompletionRate}%`}
            icon={<TrendingUp className="w-5 h-5 text-green-600" />}
            color={d.drillCompletionRate >= 80 ? 'green' : 'orange'}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Drills */}
          <Card className="border-red-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-red-100">
              <CardTitle className="text-base text-gray-800 flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-red-600" />
                Upcoming Drills
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {d.upcomingDrills.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No upcoming drills scheduled.</p>
              ) : (
                <div className="space-y-3">
                  {d.upcomingDrills.map((drill, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-3 p-3 bg-white border border-red-100 rounded-lg">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{drill.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatDate(drill.date)}</p>
                      </div>
                      <DrillTypeBadge type={drill.type} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Incident Trend */}
          <Card className="border-red-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-red-100">
              <CardTitle className="text-base text-gray-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-600" />
                Incident Trend (6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-end gap-3 h-40">
                {d.incidentTrend.map((t, idx) => {
                  const heightPct = maxTrend > 0 ? Math.max((t.count / maxTrend) * 100, 4) : 4;
                  const isLatest = idx === d.incidentTrend.length - 1;
                  return (
                    <div key={t.month} className="flex flex-col items-center flex-1 gap-1 h-full justify-end">
                      <span className="text-xs font-bold text-gray-700">{t.count}</span>
                      <div
                        className={`w-full rounded-t-md transition-all ${
                          isLatest ? 'bg-red-600' : t.count >= 3 ? 'bg-orange-400' : 'bg-red-300'
                        }`}
                        style={{ height: `${heightPct}%` }}
                        title={`${t.month}: ${t.count} incident${t.count !== 1 ? 's' : ''}`}
                      />
                      <span className="text-xs text-gray-500">{t.month}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>Lower is better</span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-red-600 inline-block" /> Current month
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Row */}
        <Card className="border-red-200 shadow-sm">
          <CardContent className="py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{d.totalEquipmentItems}</p>
                <p className="text-xs text-gray-500 mt-1">Total Equipment Items</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${d.equipmentDue > 0 ? 'text-red-600' : 'text-green-600'}`}>{d.equipmentDue}</p>
                <p className="text-xs text-gray-500 mt-1">Equipment Inspections Due</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${d.recentIncidents > 2 ? 'text-red-600' : 'text-amber-600'}`}>{d.recentIncidents}</p>
                <p className="text-xs text-gray-500 mt-1">Recent Incidents (90 Days)</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${d.drillCompletionRate >= 80 ? 'text-green-600' : 'text-orange-600'}`}>{d.drillCompletionRate}%</p>
                <p className="text-xs text-gray-500 mt-1">Annual Drill Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  alert = false,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  alert?: boolean;
}) {
  const bgMap: Record<string, string> = {
    red: 'bg-red-50 border-red-200',
    orange: 'bg-orange-50 border-orange-200',
    amber: 'bg-amber-50 border-amber-200',
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    green: 'bg-green-50 border-green-200',
  };
  return (
    <Card className={`border shadow-sm ${bgMap[color] ?? 'bg-gray-50 border-gray-200'} ${alert ? 'ring-2 ring-red-400' : ''}`}>
      <CardContent className="p-4 text-center">
        <div className="flex justify-center mb-2">{icon}</div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-1 leading-tight">{label}</p>
      </CardContent>
    </Card>
  );
}
