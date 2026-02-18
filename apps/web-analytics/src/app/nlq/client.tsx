'use client';

import { useState } from 'react';
import {
  MessageSquare,
  Send,
  BarChart3,
  Table,
  PieChart,
  TrendingUp,
  Clock,
  Sparkles,
  Lightbulb,
} from 'lucide-react';

interface QueryResult {
  id: string;
  query: string;
  timestamp: string;
  resultType: 'table' | 'chart' | 'metric' | 'text';
  data: Record<string, unknown>;
  sql?: string;
  duration: number;
}

const sampleResults: QueryResult[] = [
  {
    id: 'q1',
    query: 'What were total incidents by severity last quarter?',
    timestamp: '2026-02-13 09:15:00',
    resultType: 'table',
    duration: 1.2,
    sql: "SELECT severity, COUNT(*) as count FROM hs_incidents WHERE date_occurred >= '2025-10-01' GROUP BY severity ORDER BY count DESC",
    data: {
      columns: ['Severity', 'Count', 'Percentage'],
      rows: [
        ['MINOR', 45, '52.3%'],
        ['MODERATE', 28, '32.6%'],
        ['MAJOR', 10, '11.6%'],
        ['CRITICAL', 3, '3.5%'],
      ],
    },
  },
  {
    id: 'q2',
    query: 'Show me revenue trend by month for 2025',
    timestamp: '2026-02-13 09:12:00',
    resultType: 'chart',
    duration: 0.8,
    sql: "SELECT DATE_TRUNC('month', invoice_date) as month, SUM(total) as revenue FROM fin_invoices WHERE invoice_date >= '2025-01-01' GROUP BY month ORDER BY month",
    data: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      values: [420, 385, 510, 475, 520, 490, 560, 530, 580, 610, 595, 640],
    },
  },
  {
    id: 'q3',
    query: 'How many open CAPAs are overdue?',
    timestamp: '2026-02-13 09:10:00',
    resultType: 'metric',
    duration: 0.5,
    sql: "SELECT COUNT(*) FROM quality_capa WHERE status = 'OPEN' AND due_date < CURRENT_DATE",
    data: { value: 7, label: 'Overdue CAPAs', trend: 'down', previousValue: 12 },
  },
  {
    id: 'q4',
    query: 'Which departments have the highest employee turnover?',
    timestamp: '2026-02-13 09:05:00',
    resultType: 'table',
    duration: 1.5,
    sql: "SELECT d.name, COUNT(t.id) as terminations, ROUND(COUNT(t.id)::numeric / d.headcount * 100, 1) as turnover_pct FROM hr_departments d LEFT JOIN hr_terminations t ON t.department_id = d.id WHERE t.date >= '2025-01-01' GROUP BY d.name, d.headcount ORDER BY turnover_pct DESC LIMIT 5",
    data: {
      columns: ['Department', 'Terminations', 'Turnover %'],
      rows: [
        ['Sales', 8, '18.2%'],
        ['Customer Service', 6, '15.0%'],
        ['Warehouse', 5, '12.5%'],
        ['Production', 4, '8.0%'],
        ['Engineering', 2, '4.5%'],
      ],
    },
  },
];

const suggestedQueries = [
  'What is our current OTD rate?',
  'Show total emissions by scope for 2025',
  'List all open non-conformances by module',
  'What is the average time to close a CAPA?',
  'Show supplier performance rankings',
  'How many training certificates expire this month?',
  'What is our energy consumption trend?',
  'Show me the top 10 customers by revenue',
];

export default function NlqClient() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<QueryResult[]>(sampleResults);
  const [showSql, setShowSql] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (q: string) => {
    if (!q.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      const newResult: QueryResult = {
        id: `q${Date.now()}`,
        query: q,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        resultType: 'text',
        duration: Math.random() * 2 + 0.3,
        data: {
          text: `Query processed successfully. In production, this would return real data from across all 25 IMS modules using the @ims/nlq natural language query engine.`,
        },
      };
      setResults([newResult, ...results]);
      setQuery('');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-600" />
          Natural Language Query
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Ask questions about your data in plain English — powered by @ims/nlq
        </p>
      </div>

      {/* Query Input */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-purple-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit(query)}
              placeholder="Ask a question about your data..."
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <button
            onClick={() => handleSubmit(query)}
            disabled={isLoading || !query.trim()}
            className="px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Query
          </button>
        </div>

        {/* Suggestions */}
        <div className="mt-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
            <Lightbulb className="h-3.5 w-3.5" /> Suggested queries:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((sq) => (
              <button
                key={sq}
                onClick={() => {
                  setQuery(sq);
                  handleSubmit(sq);
                }}
                className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs hover:bg-purple-100 transition-colors"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600">Analysing your question and querying data...</p>
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {results.map((r) => (
          <div
            key={r.id}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{r.query}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-2">
                    <Clock className="h-3 w-3" /> {r.timestamp} · {r.duration.toFixed(1)}s
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {r.resultType === 'table' && <Table className="h-4 w-4 text-blue-500" />}
                  {r.resultType === 'chart' && <BarChart3 className="h-4 w-4 text-green-500" />}
                  {r.resultType === 'metric' && <TrendingUp className="h-4 w-4 text-purple-500" />}
                  {r.sql && (
                    <button
                      onClick={() =>
                        setShowSql((prev) => {
                          const n = new Set(prev);
                          n.has(r.id) ? n.delete(r.id) : n.add(r.id);
                          return n;
                        })
                      }
                      className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 font-mono"
                    >
                      SQL
                    </button>
                  )}
                </div>
              </div>
              {showSql.has(r.id) && r.sql && (
                <pre className="mt-2 p-2 bg-gray-900 text-green-400 rounded-lg text-xs overflow-x-auto font-mono">
                  {r.sql}
                </pre>
              )}
            </div>

            <div className="p-4">
              {r.resultType === 'table' && (
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      {(r.data.columns as string[]).map((col) => (
                        <th
                          key={col}
                          className="text-left px-3 py-2 font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(r.data.rows as (string | number)[][]).map((row, i) => (
                      <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                        {row.map((cell, j) => (
                          <td key={j} className="px-3 py-2 text-gray-700 dark:text-gray-300">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {r.resultType === 'chart' && (
                <div>
                  <div className="flex items-end gap-1 h-40">
                    {(r.data.values as number[]).map((val, i) => {
                      const max = Math.max(...(r.data.values as number[]));
                      const height = (val / max) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{val}k</span>
                          <div
                            className="w-full bg-purple-400 rounded-t transition-all hover:bg-purple-500"
                            style={{ height: `${height}%` }}
                          />
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {(r.data.months as string[])[i]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {r.resultType === 'metric' && (
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-4xl font-bold text-purple-700">
                      {(r.data as Record<string, unknown>).value as number}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(r.data as Record<string, unknown>).label as string}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp
                      className={`h-4 w-4 ${(r.data as Record<string, unknown>).trend === 'down' ? 'text-green-600 rotate-180' : 'text-red-600'}`}
                    />
                    <span className="text-gray-500 dark:text-gray-400">
                      was {(r.data as Record<string, unknown>).previousValue as number} last period
                    </span>
                  </div>
                </div>
              )}

              {r.resultType === 'text' && (
                <p className="text-sm text-gray-600">
                  {(r.data as Record<string, unknown>).text as string}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
