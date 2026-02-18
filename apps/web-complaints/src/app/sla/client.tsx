'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@ims/ui';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface SlaData {
  overdue: number;
  onTrack: number;
}

interface Complaint {
  id: string;
  referenceNumber: string;
  title: string;
  status: string;
  priority: string;
  slaDeadline: string;
  complainantName: string;
  createdAt: string;
}

export default function SlaClient() {
  const [slaStats, setSlaStats] = useState<SlaData>({ overdue: 0, onTrack: 0 });
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [slaRes, complaintsRes] = await Promise.all([
          api.get('/sla'),
          api.get('/complaints', { params: { limit: '100' } }),
        ]);
        setSlaStats(slaRes.data.data || { overdue: 0, onTrack: 0 });
        const allComplaints: Complaint[] = complaintsRes.data.data || [];
        setComplaints(allComplaints.filter((c) => c.slaDeadline));
      } catch (err) {
        console.error('Failed to load SLA data:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function isOverdue(deadline: string, status: string): boolean {
    if (status === 'RESOLVED' || status === 'CLOSED') return false;
    return new Date(deadline) < new Date();
  }

  function getDaysRemaining(deadline: string): number {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  if (loading)
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );

  const overdueComplaints = complaints.filter((c) => isOverdue(c.slaDeadline, c.status));
  const atRiskComplaints = complaints.filter((c) => {
    if (c.status === 'RESOLVED' || c.status === 'CLOSED') return false;
    const days = getDaysRemaining(c.slaDeadline);
    return days > 0 && days <= 3;
  });

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">SLA Tracking</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Monitor complaint resolution deadlines
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">{slaStats.overdue}</p>
                </div>
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">At Risk (3 days)</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">
                    {atRiskComplaints.length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">On Track</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{slaStats.onTrack}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {overdueComplaints.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Overdue Complaints
            </h2>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ref</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>SLA Deadline</TableHead>
                        <TableHead>Days Overdue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overdueComplaints.map((c) => (
                        <TableRow key={c.id} className="bg-red-50/50 dark:bg-red-900/10">
                          <TableCell className="font-mono text-xs">{c.referenceNumber}</TableCell>
                          <TableCell className="font-medium">{c.title}</TableCell>
                          <TableCell>
                            <Badge variant={c.priority === 'CRITICAL' ? 'destructive' : 'outline'}>
                              {c.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{(c.status || '').replace(/_/g, ' ')}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(c.slaDeadline).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <span className="text-red-600 font-semibold">
                              {Math.abs(getDaysRemaining(c.slaDeadline))} days
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            All Complaints with SLA
          </h2>
          <Card>
            <CardContent className="p-0">
              {complaints.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ref</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>SLA Deadline</TableHead>
                        <TableHead>Remaining</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {complaints.map((c) => {
                        const days = getDaysRemaining(c.slaDeadline);
                        const overdue = isOverdue(c.slaDeadline, c.status);
                        const resolved = c.status === 'RESOLVED' || c.status === 'CLOSED';
                        return (
                          <TableRow key={c.id}>
                            <TableCell className="font-mono text-xs">{c.referenceNumber}</TableCell>
                            <TableCell className="font-medium">{c.title}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{c.priority}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={resolved ? 'secondary' : 'default'}>
                                {(c.status || '').replace(/_/g, ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(c.slaDeadline).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {resolved ? (
                                <span className="text-green-600 text-sm font-medium">
                                  Completed
                                </span>
                              ) : overdue ? (
                                <span className="text-red-600 text-sm font-semibold">
                                  {Math.abs(days)} days overdue
                                </span>
                              ) : days <= 3 ? (
                                <span className="text-orange-600 text-sm font-semibold">
                                  {days} days left
                                </span>
                              ) : (
                                <span className="text-green-600 text-sm">{days} days left</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No complaints with SLA deadlines
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
