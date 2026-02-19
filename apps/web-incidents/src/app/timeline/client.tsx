'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, Button, Badge, Label, Select } from '@ims/ui';
import { Clock, Search, AlertOctagon, ChevronRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Incident {
  id: string;
  referenceNumber: string;
  title: string;
  severity: string;
  status: string;
  dateOccurred: string;
  type: string;
  location: string;
}

interface TimelineEvent {
  date: string;
  event: string;
}

export default function TimelineClient() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  const loadIncidents = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      const response = await api.get('/incidents', { params });
      setIncidents(response.data.data || []);
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  async function loadTimeline(incident: Incident) {
    setSelectedIncident(incident);
    setTimelineLoading(true);
    try {
      const response = await api.get(`/timeline/${incident.id}`);
      setTimeline(response.data.data || []);
    } catch (err) {
      console.error('Failed to load timeline:', err);
      setTimeline([]);
    } finally {
      setTimelineLoading(false);
    }
  }

  function getSeverityColor(severity: string): string {
    switch (severity) {
      case 'CATASTROPHIC':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'CRITICAL':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'MAJOR':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Incident Timeline</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            View the chronological progression of incidents
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel: Incident list */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  aria-label="Search incidents for timeline"
                  placeholder="Search incidents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="animate-pulse space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  ))}
                </div>
              ) : incidents.length > 0 ? (
                incidents.map((incident) => (
                  <Card
                    key={incident.id}
                    className={`cursor-pointer hover:shadow-md transition-shadow ${selectedIncident?.id === incident.id ? 'ring-2 ring-red-500 dark:ring-red-400' : ''}`}
                    onClick={() => loadTimeline(incident)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
                            {incident.referenceNumber}
                          </p>
                          <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                            {incident.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}
                            >
                              {incident.severity || '-'}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {incident.dateOccurred
                                ? new Date(incident.dateOccurred).toLocaleDateString()
                                : '-'}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 shrink-0 ml-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <AlertOctagon className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No incidents found</p>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Timeline */}
          <div className="lg:col-span-2">
            {selectedIncident ? (
              <Card>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-mono text-sm text-gray-500 dark:text-gray-400">
                          {selectedIncident.referenceNumber}
                        </p>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {selectedIncident.title}
                        </h2>
                      </div>
                      <Badge variant="outline">
                        {(selectedIncident.status || '').replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>Type: {(selectedIncident.type || 'OTHER').replace(/_/g, ' ')}</span>
                      <span>Location: {selectedIncident.location || '-'}</span>
                    </div>
                  </div>

                  {timelineLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                    </div>
                  ) : timeline.length > 0 ? (
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                      <div className="space-y-6">
                        {timeline
                          .filter((e) => e.date)
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .map((event, idx) => (
                            <div key={idx} className="relative pl-10">
                              <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-red-500 dark:bg-red-400 ring-4 ring-white dark:ring-gray-900" />
                              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {event.event}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {new Date(event.date).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Clock className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No timeline events available
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-16">
                    <Clock className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Select an Incident
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Choose an incident from the list to view its timeline
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
