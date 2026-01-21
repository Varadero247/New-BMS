'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@ims/ui';
import { Plus, AlertCircle, Search } from 'lucide-react';
import { api } from '@/lib/api';

interface EnvironmentalEvent {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  eventType: string;
  severity: string;
  status: string;
  occurredAt: string;
  createdAt: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EnvironmentalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const response = await api.get('/events');
      setEvents(response.data.data || []);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredEvents = statusFilter === 'all'
    ? events
    : events.filter(e => e.status === statusFilter);

  const statusCounts = {
    all: events.length,
    OPEN: events.filter(e => e.status === 'OPEN').length,
    INVESTIGATING: events.filter(e => e.status === 'INVESTIGATING').length,
    CLOSED: events.filter(e => e.status === 'CLOSED').length,
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Environmental Events</h1>
            <p className="text-gray-500 mt-1">Track and manage environmental incidents and spills</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Report Event
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

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Events ({filteredEvents.length})</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
            ) : filteredEvents.length > 0 ? (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">{event.referenceNumber}</span>
                          <Badge variant={
                            event.status === 'OPEN' ? 'destructive' :
                            event.status === 'INVESTIGATING' ? 'warning' : 'secondary'
                          }>
                            {event.status}
                          </Badge>
                          <Badge variant="outline">{event.eventType}</Badge>
                          {event.severity && (
                            <Badge variant={
                              event.severity === 'MAJOR' ? 'destructive' :
                              event.severity === 'MODERATE' ? 'warning' : 'default'
                            }>
                              {event.severity}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{event.description}</p>
                      </div>
                      <div className="text-sm text-gray-400 text-right">
                        <div>{new Date(event.occurredAt).toLocaleDateString()}</div>
                        <div className="text-xs">Occurred</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No environmental events found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
