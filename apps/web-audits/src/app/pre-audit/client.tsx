'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Input,
  Label,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@ims/ui';
import { FileSearch, Loader2, Search, FileText } from 'lucide-react';
import { api } from '@/lib/api';

interface Audit {
  id: string;
  referenceNumber: string;
  title: string;
  standard: string;
  scope: string;
  status: string;
  scheduledDate: string;
}

interface PreAuditReport {
  auditRef: string;
  title: string;
  scope: string;
  standard: string;
  preparedDate: string;
  recommendations: string[];
  aiNote: string;
}

export default function PreAuditClient() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [generating, setGenerating] = useState<string | null>(null);
  const [report, setReport] = useState<PreAuditReport | null>(null);

  const loadAudits = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      const response = await api.get('/audits', { params });
      setAudits(response.data.data || []);
    } catch (err) {
      console.error('Failed to load audits:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    loadAudits();
  }, [loadAudits]);

  async function generateReport(auditId: string) {
    setGenerating(auditId);
    setReport(null);
    try {
      const response = await api.post(`/pre-audit/${auditId}/generate`);
      setReport(response.data.data);
    } catch (err) {
      console.error('Failed to generate pre-audit report:', err);
    } finally {
      setGenerating(null);
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Pre-Audit Report Generator
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Generate AI-assisted pre-audit preparation reports
            </p>
          </div>
        </div>

        {report && (
          <Card className="mb-8 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                  <FileText className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Pre-Audit Report: {report.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ref: {report.auditRef} | Prepared:{' '}
                    {new Date(report.preparedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
                    Standard
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {report.standard || 'Not specified'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
                    Scope
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {report.scope || 'Not specified'}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Recommendations
                </h3>
                <ul className="space-y-2">
                  {report.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {report.aiNote && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">
                    AI Note
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">{report.aiNote}</p>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => setReport(null)}>
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search audits"
              placeholder="Search audits to generate report..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="animate-pulse space-y-4 p-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                ))}
              </div>
            ) : audits.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Standard</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audits.map((audit) => (
                      <TableRow key={audit.id}>
                        <TableCell className="font-mono text-xs">{audit.referenceNumber}</TableCell>
                        <TableCell className="font-medium">{audit.title}</TableCell>
                        <TableCell className="text-sm">{audit.standard || '-'}</TableCell>
                        <TableCell className="text-sm">
                          {audit.scheduledDate
                            ? new Date(audit.scheduledDate).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{audit.status?.replace(/_/g, ' ')}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateReport(audit.id)}
                            disabled={generating === audit.id}
                            className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          >
                            {generating === audit.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <FileSearch className="h-4 w-4 mr-1" />
                                Generate Report
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileSearch className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No audits available for pre-audit report generation
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Create an audit first, then generate a pre-audit report.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
