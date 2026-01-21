'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ClipboardCheck,
  Plus,
  Filter,
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Calendar,
  User,
  HardHat,
  Leaf,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExportDropdown } from '@/components/ui/export-dropdown';
import { PieChart } from '@/components/charts';
import api from '@/lib/api';
import {
  exportActions,
  exportActionsExcel,
  type ActionExportData,
} from '@/lib/export';

interface Action {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  type: 'CORRECTIVE' | 'PREVENTIVE' | 'IMPROVEMENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_VERIFICATION' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  standard: string;
  dueDate: string;
  completedDate: string | null;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface ActionStats {
  total: number;
  open: number;
  inProgress: number;
  pendingVerification: number;
  completed: number;
  overdue: number;
  dueThisWeek: number;
}

export default function ActionsPage() {
  const [actions, setActions] = useState<Action[]>([]);
  const [stats, setStats] = useState<ActionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [standardFilter, setStandardFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  useEffect(() => {
    fetchActions();
  }, [statusFilter, standardFilter, priorityFilter]);

  async function fetchActions() {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (standardFilter !== 'ALL') params.standard = standardFilter;
      if (priorityFilter !== 'ALL') params.priority = priorityFilter;

      const [actionsRes, statsRes] = await Promise.all([
        api.get('/actions', { params }),
        api.get('/actions/stats'),
      ]);

      setActions(actionsRes.data.data || []);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch actions:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700';
      case 'PENDING_VERIFICATION':
        return 'bg-yellow-100 text-yellow-700';
      case 'OPEN':
        return 'bg-gray-100 text-gray-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-red-500';
      case 'HIGH':
        return 'text-orange-500';
      case 'MEDIUM':
        return 'text-yellow-500';
      default:
        return 'text-green-500';
    }
  };

  const getStandardIcon = (standard: string) => {
    switch (standard) {
      case 'ISO_45001':
        return <HardHat className="w-4 h-4 text-red-500" />;
      case 'ISO_14001':
        return <Leaf className="w-4 h-4 text-green-500" />;
      case 'ISO_9001':
        return <Award className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'COMPLETED' || status === 'CANCELLED') return false;
    return new Date(dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const filteredActions = actions.filter((action) =>
    action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    action.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportPDF = () => {
    if (filteredActions.length) {
      const exportData: ActionExportData[] = filteredActions.map((action) => ({
        referenceNumber: action.referenceNumber,
        title: action.title,
        type: action.type,
        priority: action.priority,
        status: action.status.replace('_', ' '),
        dueDate: new Date(action.dueDate).toLocaleDateString(),
        owner: `${action.owner.firstName} ${action.owner.lastName}`,
        standard: action.standard.replace('_', ' '),
      }));
      exportActions(exportData, 'CAPA Actions Report');
    }
  };

  const handleExportExcel = () => {
    if (filteredActions.length) {
      const exportData: ActionExportData[] = filteredActions.map((action) => ({
        referenceNumber: action.referenceNumber,
        title: action.title,
        type: action.type,
        priority: action.priority,
        status: action.status.replace('_', ' '),
        dueDate: new Date(action.dueDate).toLocaleDateString(),
        owner: `${action.owner.firstName} ${action.owner.lastName}`,
        standard: action.standard.replace('_', ' '),
      }));
      exportActionsExcel(exportData, 'CAPA Actions Report');
    }
  };

  const statusChartData = stats
    ? [
        { label: 'Open', value: stats.open, color: '#94a3b8' },
        { label: 'In Progress', value: stats.inProgress, color: '#3b82f6' },
        { label: 'Pending Verify', value: stats.pendingVerification, color: '#eab308' },
        { label: 'Completed', value: stats.completed, color: '#22c55e' },
      ]
    : [];

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
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <ClipboardCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">CAPA Tracker</h1>
            <p className="text-muted-foreground">Corrective and Preventive Actions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ExportDropdown
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
            disabled={!filteredActions.length}
          />
          <Link
            href="/actions/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Action
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{stats?.total || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Open</p>
          <p className="text-2xl font-bold text-gray-500">{stats?.open || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">In Progress</p>
          <p className="text-2xl font-bold text-blue-500">{stats?.inProgress || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Pending Verify</p>
          <p className="text-2xl font-bold text-yellow-500">{stats?.pendingVerification || 0}</p>
        </Card>
        <Card className="p-4 border-red-200">
          <p className="text-sm text-muted-foreground">Overdue</p>
          <p className="text-2xl font-bold text-red-500">{stats?.overdue || 0}</p>
        </Card>
        <Card className="p-4 border-orange-200">
          <p className="text-sm text-muted-foreground">Due This Week</p>
          <p className="text-2xl font-bold text-orange-500">{stats?.dueThisWeek || 0}</p>
        </Card>
      </div>

      {/* Status Chart */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-1">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <PieChart data={statusChartData} />
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card className="p-6 lg:col-span-2">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search actions..."
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-background"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="PENDING_VERIFICATION">Pending Verification</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Standard</label>
                <select
                  value={standardFilter}
                  onChange={(e) => setStandardFilter(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-background"
                >
                  <option value="ALL">All Standards</option>
                  <option value="ISO_45001">ISO 45001 (H&S)</option>
                  <option value="ISO_14001">ISO 14001 (Environment)</option>
                  <option value="ISO_9001">ISO 9001 (Quality)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-background"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Actions ({filteredActions.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {filteredActions.length > 0 ? (
            <div className="space-y-3">
              {filteredActions.map((action) => {
                const overdue = isOverdue(action.dueDate, action.status);
                const daysUntilDue = getDaysUntilDue(action.dueDate);

                return (
                  <Link
                    key={action.id}
                    href={`/actions/${action.id}`}
                    className={`flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors ${
                      overdue ? 'border-red-200 bg-red-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {getStandardIcon(action.standard)}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{action.title}</p>
                          {overdue && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {action.referenceNumber} • {action.type}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {action.owner.firstName} {action.owner.lastName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Due: {new Date(action.dueDate).toLocaleDateString()}
                            {!overdue && daysUntilDue <= 7 && daysUntilDue > 0 && (
                              <span className="text-orange-500">({daysUntilDue} days)</span>
                            )}
                            {overdue && (
                              <span className="text-red-500">(Overdue)</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium ${getPriorityColor(action.priority)}`}>
                        {action.priority}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(action.status)}`}>
                        {action.status.replace('_', ' ')}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No actions found</p>
              <p className="text-sm">Try adjusting your filters or create a new action</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
