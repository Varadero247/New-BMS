import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  BarChart3,
  XCircle,
  FileText,
  Target,
  ClipboardCheck,
  TrendingUp,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { api } from '../lib/api';

interface QualityStats {
  risks: { active: number; highCritical: number };
  incidents: { total: number; open: number; closureRate: number };
  actions: { total: number; open: number; overdue: number };
  legal: { total: number; compliant: number; complianceRate: number };
  metrics: {
    dpmo: number;
    firstPassYield: number;
    processSigma: number;
    copqTotal: number;
  };
}

interface RecentNC {
  id: string;
  referenceNumber: string;
  title: string;
  severity: string;
  status: string;
  dateOccurred: string;
}

export default function QualityScreen() {
  const [stats, setStats] = useState<QualityStats | null>(null);
  const [recentNCs, setRecentNCs] = useState<RecentNC[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [summaryRes, metricsRes] = await Promise.all([
        api.get('/dashboard/summary/ISO_9001'),
        api.get('/metrics/quality/summary'),
      ]);

      const summary = summaryRes.data.data;
      const metricsData = metricsRes.data.data?.ytd;
      setStats({
        risks: summary.summary.risks,
        incidents: summary.summary.incidents,
        actions: summary.summary.actions,
        legal: summary.summary.legal,
        metrics: {
          dpmo: metricsData?.dpmo || 3400,
          firstPassYield: metricsData?.firstPassYield || 94.5,
          processSigma: metricsData?.processSigma || 4.2,
          copqTotal: metricsData?.copq?.total || 120000,
        },
      });
      setRecentNCs(summary.recentIncidents || []);
    } catch (error) {
      console.error('Failed to fetch Quality data:', error);
      // Mock data
      setStats({
        risks: { active: 15, highCritical: 3 },
        incidents: { total: 67, open: 9, closureRate: 87 },
        actions: { total: 52, open: 18, overdue: 4 },
        legal: { total: 18, compliant: 16, complianceRate: 89 },
        metrics: {
          dpmo: 3400,
          firstPassYield: 94.5,
          processSigma: 4.2,
          copqTotal: 120000,
        },
      });
      setRecentNCs([
        { id: '1', referenceNumber: 'NC-2024-001', title: 'Product defect - batch 4521', severity: 'MAJOR', status: 'OPEN', dateOccurred: '2024-01-15' },
        { id: '2', referenceNumber: 'NC-2024-002', title: 'Process deviation', severity: 'MINOR', status: 'CLOSED', dateOccurred: '2024-01-13' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
      case 'MAJOR':
        return 'bg-red-100 text-red-700';
      case 'MINOR':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  const getSigmaRating = (sigma: number) => {
    if (sigma >= 6) return { label: 'World Class', color: 'text-green-600' };
    if (sigma >= 5) return { label: 'Excellent', color: 'text-green-500' };
    if (sigma >= 4) return { label: 'Good', color: 'text-blue-500' };
    if (sigma >= 3) return { label: 'Average', color: 'text-yellow-500' };
    return { label: 'Needs Work', color: 'text-red-500' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const sigmaRating = getSigmaRating(stats?.metrics.processSigma || 0);

  const quickLinks = [
    { label: 'Processes', icon: BarChart3, count: stats?.risks.active, color: 'text-blue-500' },
    { label: 'NCs', icon: XCircle, count: stats?.incidents.open, color: 'text-red-500' },
    { label: 'Legal', icon: FileText, count: stats?.legal.total, color: 'text-purple-500' },
    { label: 'Objectives', icon: Target, count: 0, color: 'text-orange-500' },
    { label: 'Actions', icon: ClipboardCheck, count: stats?.actions.open, color: 'text-green-500' },
    { label: 'Metrics', icon: TrendingUp, count: null, color: 'text-cyan-500' },
  ];

  return (
    <div className="safe-top">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 pt-4 pb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6" />
            <span className="font-bold text-lg">Quality</span>
          </div>
          <Link
            to="/quality/report"
            className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1.5 text-sm"
          >
            <Plus className="w-4 h-4" />
            Report NC
          </Link>
        </div>
        <p className="text-white/80 text-sm">ISO 9001 Management System</p>
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

        {/* Quality Metrics */}
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Quality Metrics (YTD)</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-xs text-blue-600 mb-1">Process Sigma</p>
            <p className="text-2xl font-bold text-blue-700">
              {stats?.metrics.processSigma.toFixed(1)}σ
            </p>
            <p className={`text-xs mt-1 ${sigmaRating.color}`}>{sigmaRating.label}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-xs text-blue-600 mb-1">First Pass Yield</p>
            <p className="text-2xl font-bold text-blue-700">
              {stats?.metrics.firstPassYield.toFixed(1)}%
            </p>
            <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2">
              <div
                className="bg-blue-600 h-1.5 rounded-full"
                style={{ width: `${stats?.metrics.firstPassYield}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">DPMO</p>
            <p className="text-2xl font-bold">{stats?.metrics.dpmo.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Defects/Million</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">COPQ (YTD)</p>
            <p className="text-2xl font-bold">${(stats?.metrics.copqTotal || 0 / 1000).toFixed(0)}k</p>
            <p className="text-xs text-gray-500">Cost of Poor Quality</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Legal Compliance</p>
            <p className="text-2xl font-bold text-blue-500">{stats?.legal.complianceRate}%</p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div
                className="bg-blue-500 h-1.5 rounded-full"
                style={{ width: `${stats?.legal.complianceRate}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">NC Closure</p>
            <p className="text-2xl font-bold">{stats?.incidents.closureRate}%</p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div
                className="bg-green-500 h-1.5 rounded-full"
                style={{ width: `${stats?.incidents.closureRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Recent NCs */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Recent Non-Conformances</h2>
          <button className="text-xs text-blue-500 flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2 pb-4">
          {recentNCs.length > 0 ? (
            recentNCs.map((nc) => (
              <div
                key={nc.id}
                className="bg-gray-50 rounded-xl p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{nc.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {nc.referenceNumber} • {new Date(nc.dateOccurred).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(nc.severity)}`}>
                    {nc.severity}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No recent non-conformances</p>
          )}
        </div>
      </div>
    </div>
  );
}
