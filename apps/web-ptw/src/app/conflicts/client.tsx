'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, Badge } from '@ims/ui';
import { AlertTriangle, CheckCircle, MapPin } from 'lucide-react';
import { api } from '@/lib/api';

interface PermitSummary {
  id: string;
  title: string;
  location: string;
  area: string;
  startDate: string;
  endDate: string;
  type: string;
}

interface Conflict {
  permit1: PermitSummary;
  permit2: PermitSummary;
  reason: string;
}

export default function ConflictsClient() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadConflicts = useCallback(async () => {
    try {
      const response = await api.get('/conflicts');
      setConflicts(response.data.data || []);
    } catch (err) {
      setError(
        (err as any).response?.status === 401
          ? 'Session expired. Please log in again.'
          : 'Failed to load conflicts.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConflicts();
  }, [loadConflicts]);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Permit Conflicts
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Active permits with overlapping locations and areas
            </p>
          </div>
          <div className="flex items-center gap-2">
            {conflicts.length > 0 ? (
              <Badge variant="destructive" className="text-sm px-3 py-1">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} detected
              </Badge>
            ) : (
              !loading && (
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  No conflicts
                </Badge>
              )
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        ) : conflicts.length > 0 ? (
          <div className="space-y-4">
            {conflicts.map((conflict, index) => (
              <Card
                key={index}
                className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 mt-1">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">
                          {conflict.reason}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              Permit 1
                            </Badge>
                            {conflict.permit1.type && (
                              <Badge variant="secondary" className="text-xs">
                                {conflict.permit1.type.replace(/_/g, ' ')}
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {conflict.permit1.title}
                          </p>
                          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                            <MapPin className="h-3 w-3" />
                            {conflict.permit1.location}
                            {conflict.permit1.area ? ` - ${conflict.permit1.area}` : ''}
                          </div>
                          {(conflict.permit1.startDate || conflict.permit1.endDate) && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {conflict.permit1.startDate
                                ? new Date(conflict.permit1.startDate).toLocaleDateString()
                                : '?'}
                              {' - '}
                              {conflict.permit1.endDate
                                ? new Date(conflict.permit1.endDate).toLocaleDateString()
                                : '?'}
                            </p>
                          )}
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              Permit 2
                            </Badge>
                            {conflict.permit2.type && (
                              <Badge variant="secondary" className="text-xs">
                                {conflict.permit2.type.replace(/_/g, ' ')}
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {conflict.permit2.title}
                          </p>
                          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                            <MapPin className="h-3 w-3" />
                            {conflict.permit2.location}
                            {conflict.permit2.area ? ` - ${conflict.permit2.area}` : ''}
                          </div>
                          {(conflict.permit2.startDate || conflict.permit2.endDate) && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {conflict.permit2.startDate
                                ? new Date(conflict.permit2.startDate).toLocaleDateString()
                                : '?'}
                              {' - '}
                              {conflict.permit2.endDate
                                ? new Date(conflict.permit2.endDate).toLocaleDateString()
                                : '?'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <CheckCircle className="h-16 w-16 text-green-300 dark:text-green-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Conflicts Detected
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                All active permits have unique location and area combinations. No overlapping work
                activities have been identified.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
