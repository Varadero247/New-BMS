'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@ims/ui';
import { Plus, FileWarning, Search } from 'lucide-react';
import { api } from '@/lib/api';

interface Incident {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  incidentType: string;
  severity: string;
  status: string;
  occurredAt: string;
  createdAt: string;
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadIncidents();
  }, []);

  async function loadIncidents() {
    try {
      const response = await api.get('/incidents');
      setIncidents(response.data.data || []);
    } catch (error) {
      console.error('Failed to load incidents:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredIncidents = statusFilter === 'all'
    ? incidents
    : incidents.filter(i => i.status === statusFilter);

  const statusCounts = {
    all: incidents.length,
    OPEN: incidents.filter(i => i.status === 'OPEN').length,
    INVESTIGATING: incidents.filter(i => i.status === 'INVESTIGATING').length,
    CLOSED: incidents.filter(i => i.status === 'CLOSED').length,
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Incident Register</h1>
            <p className="text-gray-500 mt-1">Track and manage workplace incidents</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Report Incident
          </Button>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 mb-6">
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

        {/* Incidents List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Incidents ({filteredIncidents.length})</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search incidents..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
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
            ) : filteredIncidents.length > 0 ? (
              <div className="space-y-4">
                {filteredIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-yellow-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">{incident.referenceNumber}</span>
                          <Badge variant={
                            incident.status === 'OPEN' ? 'destructive' :
                            incident.status === 'INVESTIGATING' ? 'warning' : 'secondary'
                          }>
                            {incident.status}
                          </Badge>
                          <Badge variant="outline">{incident.incidentType}</Badge>
                          {incident.severity && (
                            <Badge variant={
                              incident.severity === 'CRITICAL' ? 'destructive' :
                              incident.severity === 'MAJOR' ? 'warning' : 'default'
                            }>
                              {incident.severity}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900">{incident.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{incident.description}</p>
                      </div>
                      <div className="text-sm text-gray-400 text-right">
                        <div>{new Date(incident.occurredAt).toLocaleDateString()}</div>
                        <div className="text-xs">Occurred</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileWarning className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No incidents found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
