'use client';

import { useEffect, useState, type ElementType } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from '@ims/ui';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Download } from 'lucide-react';
import { api } from '@/lib/api';

interface ReportRow {
  account: string;
  code?: string;
  amount: number;
  previousAmount?: number;
  category?: string;
}

interface ReportData {
  rows: ReportRow[];
  total: number;
  previousTotal?: number;
  period: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'pnl' | 'balance' | 'cashflow'>('pnl');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [pnlData, setPnlData] = useState<{
    revenue: ReportData;
    expenses: ReportData;
    netIncome: number;
  } | null>(null);
  const [balanceData, setBalanceData] = useState<{
    assets: ReportData;
    liabilities: ReportData;
    equity: ReportData;
  } | null>(null);
  const [cashflowData, setCashflowData] = useState<{
    operating: ReportData;
    investing: ReportData;
    financing: ReportData;
    netChange: number;
  } | null>(null);

  useEffect(() => {
    loadReport();
  }, [activeTab, startDate, endDate]);

  async function loadReport() {
    setLoading(true);
    setError(null);
    try {
      const params = `startDate=${startDate}&endDate=${endDate}`;
      if (activeTab === 'pnl') {
        const res = await api.get(`/reports/profit-loss?${params}`);
        setPnlData(res.data.data);
      } else if (activeTab === 'balance') {
        const res = await api.get(`/reports/balance-sheet?${params}`);
        setBalanceData(res.data.data);
      } else {
        const res = await api.get(`/reports/cash-flow?${params}`);
        setCashflowData(res.data.data);
      }
    } catch (err) {
      console.error('Error loading report:', err);
      // Set defaults so the UI still renders
      if (activeTab === 'pnl')
        setPnlData({
          revenue: { rows: [], total: 0, period: '' },
          expenses: { rows: [], total: 0, period: '' },
          netIncome: 0,
        });
      if (activeTab === 'balance')
        setBalanceData({
          assets: { rows: [], total: 0, period: '' },
          liabilities: { rows: [], total: 0, period: '' },
          equity: { rows: [], total: 0, period: '' },
        });
      if (activeTab === 'cashflow')
        setCashflowData({
          operating: { rows: [], total: 0, period: '' },
          investing: { rows: [], total: 0, period: '' },
          financing: { rows: [], total: 0, period: '' },
          netChange: 0,
        });
    } finally {
      setLoading(false);
    }
  }

  function ReportSection({
    title,
    data,
    icon: Icon,
    iconColor,
  }: {
    title: string;
    data: ReportData | null;
    icon: ElementType;
    iconColor: string;
  }) {
    if (!data) return null;
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className={`h-5 w-5 ${iconColor}`} />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Account
                    </th>
                    {data.rows[0]?.code !== undefined && (
                      <th className="text-left py-2 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Code
                      </th>
                    )}
                    <th className="text-right py-2 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Amount
                    </th>
                    {data.rows[0]?.previousAmount !== undefined && (
                      <th className="text-right py-2 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Previous
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                      <td className="py-2 px-4 text-gray-900 dark:text-gray-100">{row.account}</td>
                      {row.code !== undefined && (
                        <td className="py-2 px-4 font-mono text-gray-500 dark:text-gray-400 text-xs">
                          {row.code}
                        </td>
                      )}
                      <td className="py-2 px-4 text-right font-medium">
                        {formatCurrency(row.amount)}
                      </td>
                      {row.previousAmount !== undefined && (
                        <td className="py-2 px-4 text-right text-gray-500 dark:text-gray-400">
                          {formatCurrency(row.previousAmount)}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 dark:bg-gray-800 font-bold">
                    <td className="py-2 px-4" colSpan={data.rows[0]?.code !== undefined ? 2 : 1}>
                      Total {title}
                    </td>
                    <td className="py-2 px-4 text-right">{formatCurrency(data.total)}</td>
                    {data.previousTotal !== undefined && (
                      <td className="py-2 px-4 text-right">{formatCurrency(data.previousTotal)}</td>
                    )}
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="text-center py-4 text-gray-500 dark:text-gray-400">
              No data for this period
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  const tabs = [
    { id: 'pnl' as const, label: 'Profit & Loss', icon: TrendingUp },
    { id: 'balance' as const, label: 'Balance Sheet', icon: DollarSign },
    { id: 'cashflow' as const, label: 'Cash Flow', icon: BarChart3 },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Financial Reports
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Generate and review financial statements
            </p>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>

        {/* Date Range */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <Button onClick={loadReport}>Generate Report</Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-gray-200 rounded" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        ) : (
          <>
            {/* P&L */}
            {activeTab === 'pnl' && pnlData && (
              <>
                <ReportSection
                  title="Revenue"
                  data={pnlData.revenue}
                  icon={TrendingUp}
                  iconColor="text-green-600"
                />
                <ReportSection
                  title="Expenses"
                  data={pnlData.expenses}
                  icon={TrendingDown}
                  iconColor="text-red-600"
                />
                <Card className="bg-indigo-50 border-indigo-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-indigo-600 font-medium">Net Income</p>
                        <p
                          className={`text-3xl font-bold ${pnlData.netIncome >= 0 ? 'text-green-700' : 'text-red-700'}`}
                        >
                          {formatCurrency(pnlData.netIncome)}
                        </p>
                      </div>
                      <DollarSign className="h-10 w-10 text-indigo-400" />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Balance Sheet */}
            {activeTab === 'balance' && balanceData && (
              <>
                <ReportSection
                  title="Assets"
                  data={balanceData.assets}
                  icon={TrendingUp}
                  iconColor="text-blue-600"
                />
                <ReportSection
                  title="Liabilities"
                  data={balanceData.liabilities}
                  icon={TrendingDown}
                  iconColor="text-red-600"
                />
                <ReportSection
                  title="Equity"
                  data={balanceData.equity}
                  icon={DollarSign}
                  iconColor="text-purple-600"
                />
              </>
            )}

            {/* Cash Flow */}
            {activeTab === 'cashflow' && cashflowData && (
              <>
                <ReportSection
                  title="Operating Activities"
                  data={cashflowData.operating}
                  icon={BarChart3}
                  iconColor="text-blue-600"
                />
                <ReportSection
                  title="Investing Activities"
                  data={cashflowData.investing}
                  icon={TrendingDown}
                  iconColor="text-orange-600"
                />
                <ReportSection
                  title="Financing Activities"
                  data={cashflowData.financing}
                  icon={DollarSign}
                  iconColor="text-purple-600"
                />
                <Card className="bg-indigo-50 border-indigo-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-indigo-600 font-medium">Net Change in Cash</p>
                        <p
                          className={`text-3xl font-bold ${cashflowData.netChange >= 0 ? 'text-green-700' : 'text-red-700'}`}
                        >
                          {formatCurrency(cashflowData.netChange)}
                        </p>
                      </div>
                      <BarChart3 className="h-10 w-10 text-indigo-400" />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
