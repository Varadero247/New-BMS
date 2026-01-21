import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  HardHat,
  Leaf,
  Award,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { api } from '../lib/api';

interface DashboardStats {
  compliance: {
    iso45001: number;
    iso14001: number;
    iso9001: number;
    overall: number;
  };
  risks: {
    total: number;
    high: number;
    critical: number;
  };
  incidents: {
    total: number;
    open: number;
    thisMonth: number;
  };
  actions: {
    total: number;
    open: number;
    overdue: number;
  };
}

function ComplianceRing({ value, label, color }: { value: number; label: string; color: string }) {
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="#e5e7eb"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{value}%</span>
        </div>
      </div>
      <span className="text-xs text-gray-500 mt-1 text-center">{label}</span>
    </div>
  );
}

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Set mock data for demo
      setStats({
        compliance: { iso45001: 87, iso14001: 92, iso9001: 78, overall: 86 },
        risks: { total: 24, high: 8, critical: 2 },
        incidents: { total: 156, open: 12, thisMonth: 5 },
        actions: { total: 89, open: 34, overdue: 7 },
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="safe-top">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 pt-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6" />
            <span className="font-bold text-lg">IMS Dashboard</span>
          </div>
          <Link
            to="/profile"
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
          >
            <span className="text-sm font-medium">JD</span>
          </Link>
        </div>
        <p className="text-white/80 text-sm">Integrated Management System</p>
      </div>

      {/* Compliance Rings */}
      <div className="bg-white rounded-t-3xl -mt-4 px-4 pt-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Compliance Overview</h2>
        <div className="grid grid-cols-4 gap-2 mb-6">
          <ComplianceRing value={stats?.compliance.iso45001 || 0} label="H&S" color="#ef4444" />
          <ComplianceRing value={stats?.compliance.iso14001 || 0} label="Env" color="#22c55e" />
          <ComplianceRing value={stats?.compliance.iso9001 || 0} label="Quality" color="#3b82f6" />
          <ComplianceRing value={stats?.compliance.overall || 0} label="Overall" color="#8b5cf6" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span className="text-xs text-gray-500">Active Risks</span>
            </div>
            <p className="text-2xl font-bold">{stats?.risks.total}</p>
            <div className="flex gap-2 text-xs mt-1">
              <span className="text-orange-500">{stats?.risks.high} High</span>
              <span className="text-red-500">{stats?.risks.critical} Critical</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-xs text-gray-500">Open Incidents</span>
            </div>
            <p className="text-2xl font-bold">{stats?.incidents.open}</p>
            <p className="text-xs text-gray-500 mt-1">{stats?.incidents.thisMonth} this month</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-xs text-gray-500">Open Actions</span>
            </div>
            <p className="text-2xl font-bold">{stats?.actions.open}</p>
            <p className="text-xs text-red-500 mt-1">{stats?.actions.overdue} overdue</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <ShieldCheck className="w-5 h-5 text-purple-500" />
              <span className="text-xs text-gray-500">Total Incidents</span>
            </div>
            <p className="text-2xl font-bold">{stats?.incidents.total}</p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Report</h2>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Link
            to="/hs/report"
            className="bg-red-50 rounded-xl p-4 flex flex-col items-center"
          >
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-2">
              <HardHat className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-xs font-medium text-red-700">H&S Incident</span>
          </Link>

          <Link
            to="/environment/report"
            className="bg-green-50 rounded-xl p-4 flex flex-col items-center"
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <Leaf className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-700">Env Event</span>
          </Link>

          <Link
            to="/quality/report"
            className="bg-blue-50 rounded-xl p-4 flex flex-col items-center"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-blue-700">Quality NC</span>
          </Link>
        </div>

        {/* Module Links */}
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Modules</h2>
        <div className="space-y-2 pb-4">
          <Link
            to="/hs"
            className="flex items-center justify-between p-4 bg-white border rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <HardHat className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium">Health & Safety</p>
                <p className="text-xs text-gray-500">ISO 45001</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </Link>

          <Link
            to="/environment"
            className="flex items-center justify-between p-4 bg-white border rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Environment</p>
                <p className="text-xs text-gray-500">ISO 14001</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </Link>

          <Link
            to="/quality"
            className="flex items-center justify-between p-4 bg-white border rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Quality</p>
                <p className="text-xs text-gray-500">ISO 9001</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
