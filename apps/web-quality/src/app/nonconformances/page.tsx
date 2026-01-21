'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@ims/ui';
import { Plus, AlertOctagon, Search } from 'lucide-react';
import { api } from '@/lib/api';

interface Nonconformance {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  ncType: string;
  severity: string;
  status: string;
  detectedDate: string;
  createdAt: string;
}

export default function NonconformancesPage() {
  const [ncs, setNcs] = useState<Nonconformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadNCs();
  }, []);

  async function loadNCs() {
    try {
      const response = await api.get('/nonconformances');
      setNcs(response.data.data || []);
    } catch (error) {
      console.error('Failed to load nonconformances:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredNCs = ncs
    .filter(nc => statusFilter === 'all' || nc.status === statusFilter)
    .filter(nc => typeFilter === 'all' || nc.ncType === typeFilter);

  const statusCounts = {
    all: ncs.length,
    OPEN: ncs.filter(nc => nc.status === 'OPEN').length,
    INVESTIGATING: ncs.filter(nc => nc.status === 'INVESTIGATING').length,
    CLOSED: ncs.filter(nc => nc.status === 'CLOSED').length,
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nonconformance Register</h1>
            <p className="text-gray-500 mt-1">Track and manage nonconformances and deviations</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Report NC
          </Button>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 mb-4">
          {(['all', 'OPEN', 'INVESTIGATING', 'CLOSED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? status === 'OPEN' ? 'bg-red-600 text-white' :
                    status === 'INVESTIGATING' ? 'bg-yellow-500 text-white' :
                    status === 'CLOSED' ? 'bg-green-500 text-white' :
                    'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : status} ({statusCounts[status]})
            </button>
          ))}
        </div>

        {/* Type Filters */}
        <div className="flex gap-2 mb-6">
          {['all', 'CUSTOMER_COMPLAINT', 'INTERNAL_AUDIT', 'SUPPLIER_NC', 'PROCESS_DEVIATION'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                typeFilter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? 'All Types' : type.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* NCs List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Nonconformances ({filteredNCs.length})</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search NCs..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded" />
                ))}
              </div>
            ) : filteredNCs.length > 0 ? (
              <div className="space-y-4">
                {filteredNCs.map((nc) => (
                  <div
                    key={nc.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">{nc.referenceNumber}</span>
                          <Badge variant={
                            nc.status === 'OPEN' ? 'destructive' :
                            nc.status === 'INVESTIGATING' ? 'warning' : 'secondary'
                          }>
                            {nc.status}
                          </Badge>
                          <Badge variant="outline">
                            {nc.ncType?.replace(/_/g, ' ')}
                          </Badge>
                          {nc.severity && (
                            <Badge variant={
                              nc.severity === 'CRITICAL' ? 'destructive' :
                              nc.severity === 'MAJOR' ? 'warning' : 'default'
                            }>
                              {nc.severity}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900">{nc.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{nc.description}</p>
                      </div>
                      <div className="text-sm text-gray-400 text-right">
                        <div>{new Date(nc.detectedDate || nc.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs">Detected</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertOctagon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No nonconformances found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
