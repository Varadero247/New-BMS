import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HardHat,
  AlertTriangle,
  FileText,
  Target,
  ClipboardCheck,
  TrendingUp,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { api } from '../lib/api';

interface HSStats {
  risks: { active: number; highCritical: number };
  incidents: { total: number; open: number; closureRate: number };
  actions: { total: number; open: number; overdue: number };
  legal: { total: number; compliant: number; complianceRate: number };
  safetyMetrics: {
    ltifr: number;
    trir: number;
    severityRate: number;
  };
}

interface RecentIncident {
  id: string;
  referenceNumber: string;
  title: string;
  severity: string;
  status: string;
  dateOccurred: string;
}

export default function HSScreen() {
  const [stats, setStats] = useState<HSStats | null>(null);
  const [recentIncidents, setRecentIncidents] = useState<RecentIncident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [summaryRes, metricsRes] = await Promise.all([
        api.get('/dashboard/summary/ISO_45001'),
        api.get('/metrics/safety/summary'),
      ]);

      const summary = summaryRes.data.data;
      setStats({
        risks: summary.summary.risks,
        incidents: summary.summary.incidents,
        actions: summary.summary.actions,
        legal: summary.summary.legal,
        safetyMetrics: metricsRes.data.data?.ytd || { ltifr: 0, trir: 0, severityRate: 0 },
      });
      setRecentIncidents(summary.recentIncidents || []);
    } catch (error) {
      console.error('Failed to fetch H&S data:', error);
      // Mock data
      setStats({
        risks: { active: 24, highCritical: 6 },
        incidents: { total: 89, open: 8, closureRate: 91 },
        actions: { total: 45, open: 12, overdue: 3 },
        legal: { total: 28, compliant: 26, complianceRate: 93 },
        safetyMetrics: { ltifr: 2.4, trir: 4.8, severityRate: 12.5 },
      });
      setRecentIncidents([
        { id: '1', referenceNumber: 'INC-2024-001', title: 'Slip and fall in warehouse', severity: 'MODERATE', status: 'OPEN', dateOccurred: '2024-01-15' },
        { id: '2', referenceNumber: 'INC-2024-002', title: 'Near miss - forklift', severity: 'MAJOR', status: 'UNDER_INVESTIGATION', dateOccurred: '2024-01-14' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
      case 'CATASTROPHIC':
        return 'bg-red-100 text-red-700';
      case 'MAJOR':
        return 'bg-orange-100 text-orange-700';
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const quickLinks = [
    { label: 'Risks', icon: AlertTriangle, count: stats?.risks.active, color: 'text-orange-500' },
    { label: 'Incidents', icon: FileText, count: stats?.incidents.open, color: 'text-red-500' },
    { label: 'Legal', icon: FileText, count: stats?.legal.total, color: 'text-blue-500' },
    { label: 'Objectives', icon: Target, count: 0, color: 'text-purple-500' },
    { label: 'Actions', icon: ClipboardCheck, count: stats?.actions.open, color: 'text-green-500' },
    { label: 'Metrics', icon: TrendingUp, count: null, color: 'text-cyan-500' },
  ];

  return (
    <div className="safe-top">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 pt-4 pb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <HardHat className="w-6 h-6" />
            <span className="font-bold text-lg">Health & Safety</span>
          </div>
          <Link
            to="/hs/report"
            className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1.5 text-sm"
          >
            <Plus className="w-4 h-4" />
            Report
          </Link>
        </div>
        <p className="text-white/80 text-sm">ISO 45001 Management System</p>
      </div>

      <div className="bg-white rounded-t-3xl -mt-4 px-4 pt-6">
        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {quickLinks.map((link) => (
            <div
              key={link.label}
              className="bg-gray-50 rounded-xl p-3 flex flex-col items-center"
            >
              <link.icon className={`w-5 h-5 ${link.color} mb-1`} />
              <span className="text-xs font-medium">{link.label}</span>
              {link.count !== null && (
                <span className="text-lg font-bold">{link.count}</span>
              )}
            </div>
          ))}
        </div>

        {/* Safety Metrics */}
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Safety Rates (YTD)</h2>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {stats?.safetyMetrics.ltifr.toFixed(2)}
            </p>
            <p className="text-xs text-red-700">LTIFR</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {stats?.safetyMetrics.trir.toFixed(2)}
            </p>
            <p className="text-xs text-red-700">TRIR</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {stats?.safetyMetrics.severityRate.toFixed(1)}
            </p>
            <p className="text-xs text-red-700">Severity Rate</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Legal Compliance</p>
            <p className="text-2xl font-bold text-red-500">{stats?.legal.complianceRate}%</p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div
                className="bg-red-500 h-1.5 rounded-full"
                style={{ width: `${stats?.legal.complianceRate}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Incident Closure</p>
            <p className="text-2xl font-bold">{stats?.incidents.closureRate}%</p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div
                className="bg-green-500 h-1.5 rounded-full"
                style={{ width: `${stats?.incidents.closureRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Recent Incidents</h2>
          <button className="text-xs text-red-500 flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2 pb-4">
          {recentIncidents.length > 0 ? (
            recentIncidents.map((incident) => (
              <div
                key={incident.id}
                className="bg-gray-50 rounded-xl p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{incident.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {incident.referenceNumber} • {new Date(incident.dateOccurred).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                    {incident.severity}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No recent incidents</p>
          )}
        </div>
      </div>
    </div>
  );
}
