'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@ims/ui';
import { BarChart3, Download, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

const reports = [
  { id: 'completion', name: 'Workflow Completion Report', description: 'Completion rates and average duration by workflow type', icon: CheckCircle },
  { id: 'sla', name: 'SLA Performance', description: 'Track task completion against SLA targets', icon: Clock },
  { id: 'bottlenecks', name: 'Bottleneck Analysis', description: 'Identify slow steps and process bottlenecks', icon: AlertTriangle },
  { id: 'volume', name: 'Volume Trends', description: 'Workflow instance volume over time', icon: TrendingUp },
  { id: 'approvals', name: 'Approval Metrics', description: 'Average approval time and rejection rates', icon: BarChart3 },
];

export default function ReportsPage() {
  const [period, setPeriod] = useState('last30');

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Workflow Reports</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Analytics and performance insights for workflows</p>
          </div>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
            <option value="last7">Last 7 days</option>
            <option value="last30">Last 30 days</option>
            <option value="last90">Last 90 days</option>
            <option value="year">This year</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-5 w-5 text-indigo-600" />
                    {report.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{report.description}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4" /> View
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <Download className="h-4 w-4" /> Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
