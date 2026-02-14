'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  CheckCircle, XCircle, AlertTriangle, RefreshCw, Clock, Server, Globe, Database,
  Activity, Cpu, HardDrive, Wifi,
} from 'lucide-react';
import { Sidebar } from '@/components/sidebar';

interface ServiceStatus {
  name: string;
  url: string;
  port: number;
  status: 'healthy' | 'degraded' | 'down' | 'checking';
  latency: number | null;
  lastChecked: Date | null;
  category: string;
}

const SERVICES: Omit<ServiceStatus, 'status' | 'latency' | 'lastChecked'>[] = [
  { name: 'API Gateway', url: 'http://localhost:4000', port: 4000, category: 'Core' },
  { name: 'Dashboard', url: 'http://localhost:3000', port: 3000, category: 'Web' },
  { name: 'Health & Safety API', url: 'http://localhost:4001', port: 4001, category: 'ISO Compliance' },
  { name: 'Environment API', url: 'http://localhost:4002', port: 4002, category: 'ISO Compliance' },
  { name: 'Quality API', url: 'http://localhost:4003', port: 4003, category: 'ISO Compliance' },
  { name: 'InfoSec API', url: 'http://localhost:4015', port: 4015, category: 'ISO Compliance' },
  { name: 'ISO 42001 API', url: 'http://localhost:4023', port: 4023, category: 'ISO Compliance' },
  { name: 'ISO 37001 API', url: 'http://localhost:4024', port: 4024, category: 'ISO Compliance' },
  { name: 'Inventory API', url: 'http://localhost:4005', port: 4005, category: 'Operations' },
  { name: 'HR API', url: 'http://localhost:4006', port: 4006, category: 'Operations' },
  { name: 'Payroll API', url: 'http://localhost:4007', port: 4007, category: 'Operations' },
  { name: 'Workflows API', url: 'http://localhost:4008', port: 4008, category: 'Operations' },
  { name: 'Finance API', url: 'http://localhost:4013', port: 4013, category: 'Operations' },
  { name: 'CRM API', url: 'http://localhost:4014', port: 4014, category: 'Operations' },
  { name: 'CMMS API', url: 'http://localhost:4017', port: 4017, category: 'Operations' },
  { name: 'Analytics API', url: 'http://localhost:4021', port: 4021, category: 'Operations' },
  { name: 'Field Service API', url: 'http://localhost:4022', port: 4022, category: 'Operations' },
  { name: 'ESG API', url: 'http://localhost:4016', port: 4016, category: 'Specialist' },
  { name: 'Food Safety API', url: 'http://localhost:4019', port: 4019, category: 'Specialist' },
  { name: 'Energy API', url: 'http://localhost:4020', port: 4020, category: 'Specialist' },
  { name: 'Medical API', url: 'http://localhost:4011', port: 4011, category: 'Specialist' },
  { name: 'Automotive API', url: 'http://localhost:4010', port: 4010, category: 'Specialist' },
  { name: 'Aerospace API', url: 'http://localhost:4012', port: 4012, category: 'Specialist' },
  { name: 'Customer Portal API', url: 'http://localhost:4018', port: 4018, category: 'Portals' },
];

function StatusBadge({ status }: { status: ServiceStatus['status'] }) {
  if (status === 'healthy') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
      <CheckCircle className="h-3 w-3" /> Healthy
    </span>
  );
  if (status === 'degraded') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
      <AlertTriangle className="h-3 w-3" /> Degraded
    </span>
  );
  if (status === 'down') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
      <XCircle className="h-3 w-3" /> Down
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
      <RefreshCw className="h-3 w-3 animate-spin" /> Checking
    </span>
  );
}

export default function SystemStatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>(
    SERVICES.map(s => ({ ...s, status: 'checking', latency: null, lastChecked: null }))
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  async function checkService(svc: Omit<ServiceStatus, 'status' | 'latency' | 'lastChecked'>): Promise<ServiceStatus> {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      await fetch(`${svc.url}/health`, { signal: controller.signal, mode: 'no-cors' });
      clearTimeout(timeout);
      const latency = Date.now() - start;
      return { ...svc, status: latency > 1000 ? 'degraded' : 'healthy', latency, lastChecked: new Date() };
    } catch {
      return { ...svc, status: 'down', latency: null, lastChecked: new Date() };
    }
  }

  async function checkAll() {
    setIsRefreshing(true);
    setServices(prev => prev.map(s => ({ ...s, status: 'checking' })));
    const results = await Promise.all(SERVICES.map(checkService));
    setServices(results);
    setLastRefresh(new Date());
    setIsRefreshing(false);
  }

  useEffect(() => {
    checkAll();
    const interval = setInterval(checkAll, 60000);
    return () => clearInterval(interval);
  }, []);

  const healthy = services.filter(s => s.status === 'healthy').length;
  const degraded = services.filter(s => s.status === 'degraded').length;
  const down = services.filter(s => s.status === 'down').length;
  const checking = services.filter(s => s.status === 'checking').length;
  const overallHealth = checking > 0 ? 'checking' : down > 0 ? 'degraded' : degraded > 0 ? 'degraded' : 'healthy';

  const categories = [...new Set(SERVICES.map(s => s.category))];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
              <p className="text-gray-500 mt-1">
                Last refreshed: {lastRefresh.toLocaleTimeString()} — auto-refreshes every 60s
              </p>
            </div>
            <button
              onClick={checkAll}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Overall status banner */}
          <div className={`rounded-xl border p-5 mb-8 flex items-center gap-4 ${
            overallHealth === 'healthy' ? 'bg-green-50 border-green-200' :
            overallHealth === 'checking' ? 'bg-gray-50 border-gray-200' :
            'bg-yellow-50 border-yellow-200'
          }`}>
            {overallHealth === 'healthy' ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : overallHealth === 'checking' ? (
              <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            )}
            <div>
              <p className="font-semibold text-gray-900 text-lg">
                {overallHealth === 'healthy' ? 'All Systems Operational' :
                 overallHealth === 'checking' ? 'Checking service health...' :
                 `${down} service${down !== 1 ? 's' : ''} down${degraded > 0 ? `, ${degraded} degraded` : ''}`}
              </p>
              <p className="text-sm text-gray-500">
                {healthy} healthy · {degraded} degraded · {down} down · {checking} checking
              </p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Healthy', count: healthy, icon: CheckCircle, color: 'green' },
              { label: 'Degraded', count: degraded, icon: AlertTriangle, color: 'yellow' },
              { label: 'Down', count: down, icon: XCircle, color: 'red' },
              { label: 'Total Services', count: services.length, icon: Server, color: 'blue' },
            ].map(stat => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                      </div>
                      <div className={`p-2 rounded-full bg-${stat.color}-100`}>
                        <Icon className={`h-5 w-5 text-${stat.color}-600`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Services by category */}
          {categories.map(category => {
            const categoryServices = services.filter(s => s.category === category);
            return (
              <Card key={category} className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Server className="h-4 w-4 text-gray-400" />
                    {category}
                    <span className="ml-auto text-xs font-normal text-gray-400">
                      {categoryServices.filter(s => s.status === 'healthy').length}/{categoryServices.length} healthy
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-2 px-3 text-gray-400 font-medium text-xs uppercase">Service</th>
                          <th className="text-left py-2 px-3 text-gray-400 font-medium text-xs uppercase">Port</th>
                          <th className="text-left py-2 px-3 text-gray-400 font-medium text-xs uppercase">Status</th>
                          <th className="text-right py-2 px-3 text-gray-400 font-medium text-xs uppercase">Latency</th>
                          <th className="text-right py-2 px-3 text-gray-400 font-medium text-xs uppercase">Last Checked</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryServices.map(svc => (
                          <tr key={svc.port} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-2.5 px-3 font-medium text-gray-900">{svc.name}</td>
                            <td className="py-2.5 px-3 text-gray-500 font-mono text-xs">{svc.port}</td>
                            <td className="py-2.5 px-3">
                              <StatusBadge status={svc.status} />
                            </td>
                            <td className="py-2.5 px-3 text-right text-gray-500 font-mono text-xs">
                              {svc.latency !== null ? `${svc.latency}ms` : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right text-gray-400 text-xs">
                              {svc.lastChecked ? svc.lastChecked.toLocaleTimeString() : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
