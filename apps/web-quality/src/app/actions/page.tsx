'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@ims/ui';
import { Plus, ClipboardList, Clock, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface Action {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  actionType: string;
  priority: string;
  status: string;
  dueDate: string;
  assignee?: { name: string };
}

export default function ActionsPage() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadActions();
  }, []);

  async function loadActions() {
    try {
      const response = await api.get('/actions').catch(() => ({ data: { data: [] } }));
      setActions(response.data.data || []);
    } catch (error) {
      console.error('Failed to load actions:', error);
    } finally {
      setLoading(false);
    }
  }

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  const filteredActions = filter === 'all'
    ? actions
    : filter === 'overdue'
    ? actions.filter(a => isOverdue(a.dueDate) && a.status !== 'COMPLETED')
    : actions.filter(a => a.status === filter);

  const counts = {
    all: actions.length,
    OPEN: actions.filter(a => a.status === 'OPEN').length,
    IN_PROGRESS: actions.filter(a => a.status === 'IN_PROGRESS').length,
    COMPLETED: actions.filter(a => a.status === 'COMPLETED').length,
    overdue: actions.filter(a => isOverdue(a.dueDate) && a.status !== 'COMPLETED').length,
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quality Actions</h1>
            <p className="text-gray-500 mt-1">Corrective and preventive actions</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Action
          </Button>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'all', label: 'All' },
            { key: 'overdue', label: 'Overdue' },
            { key: 'OPEN', label: 'Open' },
            { key: 'IN_PROGRESS', label: 'In Progress' },
            { key: 'COMPLETED', label: 'Completed' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === item.key
                  ? item.key === 'overdue' ? 'bg-red-600 text-white' :
                    item.key === 'COMPLETED' ? 'bg-green-600 text-white' :
                    'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {item.label} ({counts[item.key as keyof typeof counts]})
            </button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-500" />
              Actions ({filteredActions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded" />
                ))}
              </div>
            ) : filteredActions.length > 0 ? (
              <div className="space-y-4">
                {filteredActions.map((action) => {
                  const overdue = isOverdue(action.dueDate) && action.status !== 'COMPLETED';
                  return (
                    <div
                      key={action.id}
                      className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                        overdue ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-500">{action.referenceNumber}</span>
                            <Badge variant={
                              action.status === 'COMPLETED' ? 'secondary' :
                              action.status === 'IN_PROGRESS' ? 'default' : 'outline'
                            }>
                              {action.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant={
                              action.priority === 'CRITICAL' ? 'destructive' :
                              action.priority === 'HIGH' ? 'warning' : 'outline'
                            }>
                              {action.priority}
                            </Badge>
                            {overdue && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                OVERDUE
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-medium text-gray-900">{action.title}</h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{action.description}</p>
                        </div>
                        <div className={`text-sm text-right ${overdue ? 'text-red-600' : 'text-gray-400'}`}>
                          <Clock className="h-4 w-4 inline mr-1" />
                          {new Date(action.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No actions found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
