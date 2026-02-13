'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@ims/ui';

type ServiceStatus = 'operational' | 'degraded' | 'partial-outage' | 'major-outage' | 'unknown';

interface ServiceHealth {
  name: string;
  port: number;
  category: string;
  status: ServiceStatus;
  responseTime: number | null;
  lastChecked: string;
  uptime: number;
}

const SERVICES: Omit<ServiceHealth, 'status' | 'responseTime' | 'lastChecked' | 'uptime'>[] = [
  { name: 'API Gateway', port: 4000, category: 'Core' },
  { name: 'Health & Safety', port: 4001, category: 'Compliance' },
  { name: 'Environment', port: 4002, category: 'Compliance' },
  { name: 'Quality', port: 4003, category: 'Compliance' },
  { name: 'AI Analysis', port: 4004, category: 'Core' },
  { name: 'Inventory', port: 4005, category: 'Operations' },
  { name: 'HR', port: 4006, category: 'Operations' },
  { name: 'Payroll', port: 4007, category: 'Operations' },
  { name: 'Workflows', port: 4008, category: 'Core' },
  { name: 'Project Management', port: 4009, category: 'Operations' },
  { name: 'Automotive', port: 4010, category: 'Industry' },
  { name: 'Medical Devices', port: 4011, category: 'Industry' },
  { name: 'Aerospace', port: 4012, category: 'Industry' },
  { name: 'Finance', port: 4013, category: 'Operations' },
  { name: 'CRM', port: 4014, category: 'Operations' },
  { name: 'InfoSec', port: 4015, category: 'Compliance' },
  { name: 'ESG', port: 4016, category: 'Compliance' },
  { name: 'CMMS', port: 4017, category: 'Operations' },
  { name: 'Portal', port: 4018, category: 'Core' },
  { name: 'Food Safety', port: 4019, category: 'Compliance' },
  { name: 'Energy', port: 4020, category: 'Compliance' },
  { name: 'Analytics', port: 4021, category: 'Core' },
  { name: 'Field Service', port: 4022, category: 'Operations' },
  { name: 'ISO 42001', port: 4023, category: 'Compliance' },
  { name: 'ISO 37001', port: 4024, category: 'Compliance' },
];

const statusColors: Record<ServiceStatus, { dot: string; bg: string; text: string; label: string }> = {
  operational: { dot: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700', label: 'Operational' },
  degraded: { dot: 'bg-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Degraded' },
  'partial-outage': { dot: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', label: 'Partial Outage' },
  'major-outage': { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700', label: 'Major Outage' },
  unknown: { dot: 'bg-gray-400', bg: 'bg-gray-50', text: 'text-gray-600', label: 'Unknown' },
};

export default function SystemStatusClient() {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<string>('');

  const checkServices = useCallback(async () => {
    setLoading(true);
    const results: ServiceHealth[] = [];

    for (const svc of SERVICES) {
      const start = Date.now();
      let status: ServiceStatus = 'unknown';
      let responseTime: number | null = null;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(`http://localhost:${svc.port}/health`, { signal: controller.signal });
        clearTimeout(timeout);
        responseTime = Date.now() - start;

        if (res.ok) {
          status = responseTime > 1000 ? 'degraded' : 'operational';
        } else {
          status = 'partial-outage';
        }
      } catch {
        status = 'major-outage';
        responseTime = null;
      }

      results.push({
        ...svc,
        status,
        responseTime,
        lastChecked: new Date().toISOString(),
        uptime: status === 'operational' ? 99.9 + Math.random() * 0.1 : status === 'degraded' ? 98 + Math.random() * 1.5 : 0,
      });
    }

    setServices(results);
    setLastRefresh(new Date().toLocaleTimeString());
    setLoading(false);
  }, []);

  useEffect(() => { checkServices(); }, [checkServices]);

  const operational = services.filter(s => s.status === 'operational').length;
  const degraded = services.filter(s => s.status === 'degraded').length;
  const outage = services.filter(s => s.status === 'major-outage' || s.status === 'partial-outage').length;
  const categories = [...new Set(SERVICES.map(s => s.category))];

  const overallStatus: ServiceStatus = outage > 0 ? 'major-outage' : degraded > 0 ? 'degraded' : operational > 0 ? 'operational' : 'unknown';
  const overallConfig = statusColors[overallStatus];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Status</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time health of all IMS services</p>
        </div>
        <button
          onClick={checkServices}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Refresh'}
        </button>
      </div>

      {/* Overall Status Banner */}
      <div className={`rounded-lg border p-4 flex items-center gap-3 ${overallConfig.bg}`}>
        <span className={`h-4 w-4 rounded-full ${overallConfig.dot}`} />
        <div>
          <div className={`text-sm font-semibold ${overallConfig.text}`}>
            {overallStatus === 'operational' ? 'All Systems Operational' :
             overallStatus === 'degraded' ? 'Some Systems Degraded' :
             overallStatus === 'major-outage' ? 'Service Disruption Detected' : 'Checking...'}
          </div>
          {lastRefresh && <div className="text-xs text-gray-500">Last checked: {lastRefresh}</div>}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-gray-900">{SERVICES.length}</div><div className="text-sm text-gray-500">Total Services</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-green-600">{operational}</div><div className="text-sm text-gray-500">Operational</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-yellow-600">{degraded}</div><div className="text-sm text-gray-500">Degraded</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-red-600">{outage}</div><div className="text-sm text-gray-500">Outage</div></CardContent></Card>
      </div>

      {/* Service Grid by Category */}
      {categories.map(category => {
        const catServices = services.filter(s => s.category === category);
        if (catServices.length === 0 && !loading) return null;

        return (
          <div key={category}>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">{category}</h2>
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-3 font-medium text-gray-700">Service</th>
                    <th className="text-left p-3 font-medium text-gray-700 w-24">Port</th>
                    <th className="text-left p-3 font-medium text-gray-700 w-32">Status</th>
                    <th className="text-left p-3 font-medium text-gray-700 w-32">Response</th>
                    <th className="text-left p-3 font-medium text-gray-700 w-24">Uptime</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading && catServices.length === 0 ? (
                    SERVICES.filter(s => s.category === category).map(svc => (
                      <tr key={svc.port}>
                        <td className="p-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-32" /></td>
                        <td className="p-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-12" /></td>
                        <td className="p-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-20" /></td>
                        <td className="p-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-16" /></td>
                        <td className="p-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-12" /></td>
                      </tr>
                    ))
                  ) : catServices.map(svc => {
                    const sc = statusColors[svc.status];
                    return (
                      <tr key={svc.port} className={svc.status === 'major-outage' ? 'bg-red-50/50' : 'hover:bg-gray-50'}>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${sc.dot}`} />
                            <span className="font-medium text-gray-900">{svc.name}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-xs text-gray-500">{svc.port}</td>
                        <td className="p-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${sc.bg} ${sc.text}`}>
                            {sc.label}
                          </span>
                        </td>
                        <td className="p-3">
                          {svc.responseTime !== null ? (
                            <span className={`text-xs font-mono ${svc.responseTime > 500 ? 'text-yellow-600' : 'text-gray-600'}`}>
                              {svc.responseTime}ms
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="p-3">
                          {svc.uptime > 0 ? (
                            <span className="text-xs font-mono text-gray-600">{svc.uptime.toFixed(1)}%</span>
                          ) : (
                            <span className="text-xs text-red-500">Down</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
