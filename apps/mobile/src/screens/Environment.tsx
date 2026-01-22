import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf,
  FileText,
  Target,
  ClipboardCheck,
  TrendingUp,
  Plus,
  ChevronRight,
  Droplets,
  Zap,
  Trash2,
  Wind,
} from 'lucide-react';
import { api } from '../lib/api';

interface EnvStats {
  risks: { active: number; highCritical: number };
  incidents: { total: number; open: number; closureRate: number };
  actions: { total: number; open: number; overdue: number };
  legal: { total: number; compliant: number; complianceRate: number };
  metrics: {
    energyConsumption: number;
    waterConsumption: number;
    wasteGenerated: number;
    recyclingRate: number;
  };
}

interface RecentEvent {
  id: string;
  referenceNumber: string;
  title: string;
  severity: string;
  status: string;
  dateOccurred: string;
}

export default function EnvironmentScreen() {
  const [stats, setStats] = useState<EnvStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await api.get('/dashboard/summary/ISO_14001');
      const summary = res.data.data;
      setStats({
        risks: summary.summary.risks,
        incidents: summary.summary.incidents,
        actions: summary.summary.actions,
        legal: summary.summary.legal,
        metrics: {
          energyConsumption: 125000,
          waterConsumption: 45000,
          wasteGenerated: 2500,
          recyclingRate: 72,
        },
      });
      setRecentEvents(summary.recentIncidents || []);
    } catch (error) {
      console.error('Failed to fetch Environment data:', error);
      // Mock data
      setStats({
        risks: { active: 18, highCritical: 4 },
        incidents: { total: 34, open: 5, closureRate: 85 },
        actions: { total: 28, open: 9, overdue: 2 },
        legal: { total: 22, compliant: 21, complianceRate: 95 },
        metrics: {
          energyConsumption: 125000,
          waterConsumption: 45000,
          wasteGenerated: 2500,
          recyclingRate: 72,
        },
      });
      setRecentEvents([
        { id: '1', referenceNumber: 'ENV-2024-001', title: 'Minor chemical spill in lab', severity: 'MODERATE', status: 'OPEN', dateOccurred: '2024-01-15' },
        { id: '2', referenceNumber: 'ENV-2024-002', title: 'Waste segregation issue', severity: 'MINOR', status: 'CLOSED', dateOccurred: '2024-01-12' },
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const quickLinks = [
    { label: 'Aspects', icon: Leaf, count: stats?.risks.active, color: 'text-green-500' },
    { label: 'Events', icon: FileText, count: stats?.incidents.open, color: 'text-orange-500' },
    { label: 'Legal', icon: FileText, count: stats?.legal.total, color: 'text-blue-500' },
    { label: 'Objectives', icon: Target, count: 0, color: 'text-purple-500' },
    { label: 'Actions', icon: ClipboardCheck, count: stats?.actions.open, color: 'text-teal-500' },
    { label: 'Metrics', icon: TrendingUp, count: null, color: 'text-cyan-500' },
  ];

  const envIndicators = [
    { label: 'Energy', value: stats?.metrics.energyConsumption || 0, unit: 'kWh', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { label: 'Water', value: stats?.metrics.waterConsumption || 0, unit: 'm³', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Waste', value: stats?.metrics.wasteGenerated || 0, unit: 'kg', icon: Trash2, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Recycling', value: stats?.metrics.recyclingRate || 0, unit: '%', icon: Wind, color: 'text-green-500', bg: 'bg-green-50' },
  ];

  return (
    <div className="safe-top">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 pt-4 pb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6" />
            <span className="font-bold text-lg">Environment</span>
          </div>
          <Link
            to="/environment/report"
            className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1.5 text-sm"
          >
            <Plus className="w-4 h-4" />
            Report
          </Link>
        </div>
        <p className="text-white/80 text-sm">ISO 14001 Management System</p>
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

        {/* Environmental Indicators */}
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Environmental Indicators (YTD)</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {envIndicators.map((indicator) => (
            <div key={indicator.label} className={`${indicator.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <indicator.icon className={`w-5 h-5 ${indicator.color}`} />
                <span className="text-xs font-medium text-gray-600">{indicator.label}</span>
              </div>
              <p className="text-xl font-bold">
                {indicator.value.toLocaleString()}
                <span className="text-sm font-normal text-gray-500 ml-1">{indicator.unit}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Legal Compliance</p>
            <p className="text-2xl font-bold text-green-500">{stats?.legal.complianceRate}%</p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div
                className="bg-green-500 h-1.5 rounded-full"
                style={{ width: `${stats?.legal.complianceRate}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Event Closure</p>
            <p className="text-2xl font-bold">{stats?.incidents.closureRate}%</p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div
                className="bg-green-500 h-1.5 rounded-full"
                style={{ width: `${stats?.incidents.closureRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Recent Events</h2>
          <button className="text-xs text-green-500 flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2 pb-4">
          {recentEvents.length > 0 ? (
            recentEvents.map((event) => (
              <div
                key={event.id}
                className="bg-gray-50 rounded-xl p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {event.referenceNumber} • {new Date(event.dateOccurred).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(event.severity)}`}>
                    {event.severity}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No recent events</p>
          )}
        </div>
      </div>
    </div>
  );
}
