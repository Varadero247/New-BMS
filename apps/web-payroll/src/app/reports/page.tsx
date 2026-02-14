'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@ims/ui';
import { BarChart3, Download, FileText, Calendar, DollarSign, Users } from 'lucide-react';

const reports = [
  { id: 'payroll-summary', name: 'Payroll Summary Report', description: 'Overview of payroll costs by department and period', icon: DollarSign },
  { id: 'tax-report', name: 'Tax Compliance Report', description: 'Tax deductions and employer contributions by jurisdiction', icon: FileText },
  { id: 'headcount-cost', name: 'Headcount & Cost Report', description: 'Employee count and total compensation by department', icon: Users },
  { id: 'year-end', name: 'Year-End Report', description: 'Annual payroll summary for tax filing (P60/W-2/T4)', icon: Calendar },
  { id: 'variance', name: 'Payroll Variance Report', description: 'Month-on-month changes in payroll costs', icon: BarChart3 },
  { id: 'benefits', name: 'Benefits Summary', description: 'Cost of benefits by type and department', icon: DollarSign },
];

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('2026-01');

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payroll Reports</h1>
            <p className="text-gray-500 mt-1">Generate and export payroll reports</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-5 w-5 text-green-600" />
                    {report.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">{report.description}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4" /> View
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <Download className="h-4 w-4" /> Export CSV
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
