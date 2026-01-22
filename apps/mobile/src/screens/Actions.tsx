import { useEffect, useState } from 'react';
import {
  ClipboardCheck,
  AlertTriangle,
  HardHat,
  Leaf,
  Award,
} from 'lucide-react';
import { api } from '../lib/api';

interface Action {
  id: string;
  referenceNumber: string;
  title: string;
  type: 'CORRECTIVE' | 'PREVENTIVE' | 'IMPROVEMENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_VERIFICATION' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  standard: string;
  dueDate: string;
  owner: {
    firstName: string;
    lastName: string;
  };
}

interface ActionStats {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

export default function ActionsScreen() {
  const [actions, setActions] = useState<Action[]>([]);
  const [stats, setStats] = useState<ActionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'OVERDUE' | 'COMPLETED'>('ALL');

  useEffect(() => {
    fetchActions();
  }, []);

  async function fetchActions() {
    try {
      const [actionsRes, statsRes] = await Promise.all([
        api.get('/actions'),
        api.get('/actions/stats'),
      ]);

      setActions(actionsRes.data.data || []);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch actions:', error);
      // Mock data
      setStats({
        total: 89,
        open: 24,
        inProgress: 18,
        completed: 42,
        overdue: 7,
      });
      setActions([
        {
          id: '1',
          referenceNumber: 'ACT-2024-001',
          title: 'Implement safety guard on machinery',
          type: 'CORRECTIVE',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          standard: 'ISO_45001',
          dueDate: '2024-01-20',
          owner: { firstName: 'John', lastName: 'Doe' },
        },
        {
          id: '2',
          referenceNumber: 'ACT-2024-002',
          title: 'Update waste disposal procedure',
          type: 'PREVENTIVE',
          status: 'OPEN',
          priority: 'MEDIUM',
          standard: 'ISO_14001',
          dueDate: '2024-01-25',
          owner: { firstName: 'Jane', lastName: 'Smith' },
        },
        {
          id: '3',
          referenceNumber: 'ACT-2024-003',
          title: 'Calibrate testing equipment',
          type: 'CORRECTIVE',
          status: 'PENDING_VERIFICATION',
          priority: 'HIGH',
          standard: 'ISO_9001',
          dueDate: '2024-01-18',
          owner: { firstName: 'Bob', lastName: 'Wilson' },
        },
        {
          id: '4',
          referenceNumber: 'ACT-2024-004',
          title: 'Review training records',
          type: 'IMPROVEMENT',
          status: 'COMPLETED',
          priority: 'LOW',
          standard: 'ISO_45001',
          dueDate: '2024-01-15',
          owner: { firstName: 'Alice', lastName: 'Brown' },
        },
      ]);
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

  const filteredActions = actions.filter((action) => {
    if (filter === 'ALL') return true;
    if (filter === 'OPEN') return action.status === 'OPEN' || action.status === 'IN_PROGRESS';
    if (filter === 'OVERDUE') return isOverdue(action.dueDate, action.status);
    if (filter === 'COMPLETED') return action.status === 'COMPLETED';
    return true;
  });

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
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 pt-4 pb-8">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardCheck className="w-6 h-6" />
          <span className="font-bold text-lg">CAPA Tracker</span>
        </div>
        <p className="text-white/80 text-sm">Corrective & Preventive Actions</p>
      </div>

      <div className="bg-white rounded-t-3xl -mt-4 px-4 pt-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold">{stats?.total}</p>
            <p className="text-[10px] text-gray-500">Total</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-blue-600">{stats?.open}</p>
            <p className="text-[10px] text-blue-600">Open</p>
          </div>
          <div className="bg-red-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-red-600">{stats?.overdue}</p>
            <p className="text-[10px] text-red-600">Overdue</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-green-600">{stats?.completed}</p>
            <p className="text-[10px] text-green-600">Done</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {(['ALL', 'OPEN', 'OVERDUE', 'COMPLETED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Actions List */}
        <div className="space-y-3 pb-4">
          {filteredActions.length > 0 ? (
            filteredActions.map((action) => {
              const overdue = isOverdue(action.dueDate, action.status);
              return (
                <div
                  key={action.id}
                  className={`bg-gray-50 rounded-xl p-4 ${overdue ? 'border border-red-200' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {getStandardIcon(action.standard)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm">{action.title}</p>
                        {overdue && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {action.referenceNumber} • {action.type}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-xs font-medium ${getPriorityColor(action.priority)}`}>
                          {action.priority}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(action.status)}`}>
                          {action.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>{action.owner.firstName} {action.owner.lastName}</span>
                        <span className={overdue ? 'text-red-500 font-medium' : ''}>
                          Due: {new Date(action.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ClipboardCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No actions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
