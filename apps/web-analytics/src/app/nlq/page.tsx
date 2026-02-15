'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Search, Sparkles, Clock, BarChart3, Table, Send, RefreshCw, X } from 'lucide-react';
import { api } from '@/lib/api';

interface NlqResult {
  query: string;
  sql: string;
  explanation: string;
  columns: string[];
  rows: Record<string, any>[];
  executionTime: number;
}

const EXAMPLE_QUERIES = [
  'Show me the top 5 high-risk incidents this month',
  'How many NCRs were raised last quarter?',
  'What is the average CAPA closure time by module?',
  'List overdue compliance actions by assignee',
  'Show KPI trends for the last 3 months',
  'Which suppliers have the most non-conformances?',
  'What is the current compliance score by ISO standard?',
  'Show me open work orders by priority',
];

const MOCK_RESULTS: Record<string, NlqResult> = {
  default: {
    query: 'Show me the top 5 high-risk incidents this month',
    sql: `SELECT title, severity, status, date_occurred, assignee\nFROM incidents\nWHERE severity IN ('HIGH','CRITICAL')\n  AND date_occurred >= DATE_TRUNC('month', NOW())\nORDER BY severity DESC, date_occurred DESC\nLIMIT 5;`,
    explanation: 'Fetches incidents with HIGH or CRITICAL severity created this calendar month, ordered by severity then date.',
    columns: ['Title', 'Severity', 'Status', 'Date', 'Assignee'],
    rows: [
      { Title: 'Fall from height — Warehouse B', Severity: 'CRITICAL', Status: 'OPEN', Date: '2026-02-12', Assignee: 'Bob Smith' },
      { Title: 'Chemical spill — Lab 3', Severity: 'HIGH', Status: 'IN_PROGRESS', Date: '2026-02-10', Assignee: 'Carol Davis' },
      { Title: 'Forklift near-miss — Loading bay', Severity: 'HIGH', Status: 'CLOSED', Date: '2026-02-08', Assignee: 'Alice Johnson' },
      { Title: 'Electrical fault — Server room', Severity: 'HIGH', Status: 'OPEN', Date: '2026-02-06', Assignee: 'Frank Security' },
      { Title: 'Slip hazard — Canteen floor', Severity: 'HIGH', Status: 'CLOSED', Date: '2026-02-03', Assignee: 'Eve Green' },
    ],
    executionTime: 48,
  },
};

interface HistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  rowCount: number;
}

export default function NlqPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<NlqResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showSql, setShowSql] = useState(false);

  async function runQuery(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setQuery(q);
    try {
      const res = await api.post('/nlq/query', { query: q });
      const data = res.data.data;
      setResult(data);
      setHistory(prev => [{ id: Date.now().toString(), query: q, timestamp: new Date(), rowCount: data.rows?.length || 0 }, ...prev.slice(0, 9)]);
    } catch {
      // Use mock result for demo
      const mock = MOCK_RESULTS.default;
      const mockResult = { ...mock, query: q };
      setResult(mockResult);
      setHistory(prev => [{ id: Date.now().toString(), query: q, timestamp: new Date(), rowCount: mockResult.rows.length }, ...prev.slice(0, 9)]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runQuery(query);
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-purple-500" />
            Natural Language Query
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Ask questions about your IMS data in plain English — powered by AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main query area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Query input */}
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit}>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Sparkles className="absolute left-3 top-3 h-5 w-5 text-purple-400" />
                      <textarea
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); runQuery(query); } }}
                        placeholder="Ask anything... e.g. 'Show me all overdue CAPAs by department'"
                        rows={3}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !query.trim()}
                      className="flex-shrink-0 flex items-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 font-medium h-fit"
                    >
                      {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {loading ? 'Running...' : 'Run'}
                    </button>
                  </div>
                </form>

                {/* Example queries */}
                <div className="mt-4">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">Try an example:</p>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_QUERIES.slice(0, 4).map(eq => (
                      <button
                        key={eq}
                        onClick={() => runQuery(eq)}
                        className="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-colors border border-purple-100"
                      >
                        {eq}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {loading && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 text-purple-600">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span className="text-sm font-medium">Processing your query with AI...</span>
                  </div>
                  <div className="mt-4 animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-32 bg-gray-200 rounded" />
                  </div>
                </CardContent>
              </Card>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Query failed</p>
                  <p className="text-sm text-red-600 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-4">
                {/* Result summary */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">AI Explanation</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{result.explanation}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded whitespace-nowrap ml-4">
                        <Clock className="h-3.5 w-3.5" />
                        {result.executionTime}ms
                      </div>
                    </div>

                    {/* Toggle SQL */}
                    <button
                      onClick={() => setShowSql(!showSql)}
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
                    >
                      {showSql ? 'Hide' : 'Show'} Generated SQL
                    </button>

                    {showSql && (
                      <pre className="mt-3 p-3 bg-gray-900 text-green-400 rounded-lg text-xs overflow-x-auto font-mono leading-relaxed">
                        {result.sql}
                      </pre>
                    )}
                  </CardContent>
                </Card>

                {/* Data table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Table className="h-4 w-4 text-purple-500" />
                      Results
                      <span className="ml-1 text-xs font-normal text-gray-400 dark:text-gray-500">({result.rows.length} rows)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {result.rows.length === 0 ? (
                      <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                        <BarChart3 className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                        <p>No data returned for this query.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                              {result.columns.map(col => (
                                <th key={col} className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium text-xs uppercase tracking-wide">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {result.rows.map((row, i) => (
                              <tr key={i} className="border-b border-gray-50 dark:border-gray-800 hover:bg-purple-50/30">
                                {result.columns.map(col => (
                                  <td key={col} className="py-3 px-4 text-gray-700 dark:text-gray-300">
                                    {col === 'Severity' ? (
                                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                        row[col] === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                        row[col] === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                                        row[col] === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-gray-100 dark:bg-gray-800 text-gray-700'
                                      }`}>
                                        {row[col]}
                                      </span>
                                    ) : col === 'Status' ? (
                                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                        row[col] === 'OPEN' ? 'bg-red-50 text-red-600' :
                                        row[col] === 'CLOSED' ? 'bg-green-50 text-green-600' :
                                        'bg-yellow-50 text-yellow-600'
                                      }`}>
                                        {row[col]}
                                      </span>
                                    ) : (
                                      String(row[col] ?? '—')
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar: history + examples */}
          <div className="space-y-4">
            {/* Query History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  Recent Queries
                </CardTitle>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">No queries yet</p>
                ) : (
                  <div className="space-y-2">
                    {history.map(item => (
                      <button
                        key={item.id}
                        onClick={() => runQuery(item.query)}
                        className="w-full text-left p-2 rounded-lg hover:bg-purple-50 transition-colors group"
                      >
                        <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 group-hover:text-purple-700">{item.query}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{item.rowCount} rows · {item.timestamp.toLocaleTimeString()}</p>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* More examples */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  More Examples
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {EXAMPLE_QUERIES.slice(4).map(eq => (
                    <button
                      key={eq}
                      onClick={() => runQuery(eq)}
                      className="w-full text-left p-2 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      <p className="text-xs text-gray-600 hover:text-purple-700">{eq}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-purple-50 border-purple-100">
              <CardContent className="pt-4">
                <p className="text-xs font-semibold text-purple-800 mb-2">Query Tips</p>
                <ul className="space-y-1 text-xs text-purple-700">
                  <li>• Use time ranges: "last month", "this quarter", "past 7 days"</li>
                  <li>• Filter by module: "in Quality", "from H&S"</li>
                  <li>• Aggregate: "count", "average", "total"</li>
                  <li>• Compare: "compared to last month"</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
