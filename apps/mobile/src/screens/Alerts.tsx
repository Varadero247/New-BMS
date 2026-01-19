import { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, Check } from 'lucide-react';

const alerts = [
  {
    id: '1',
    title: 'High Temperature Alert',
    message: 'Server room exceeded 80°F',
    building: 'Data Center',
    severity: 'critical',
    status: 'active',
    time: '5 min ago',
  },
  {
    id: '2',
    title: 'HVAC Warning',
    message: 'Reduced efficiency detected',
    building: 'Main Office',
    severity: 'warning',
    status: 'active',
    time: '12 min ago',
  },
  {
    id: '3',
    title: 'Motion After Hours',
    message: 'Movement in restricted area',
    building: 'Warehouse',
    severity: 'warning',
    status: 'acknowledged',
    time: '1 hour ago',
  },
  {
    id: '4',
    title: 'Energy Spike',
    message: 'Unusual consumption pattern',
    building: 'Main Office',
    severity: 'info',
    status: 'resolved',
    time: '3 hours ago',
  },
];

const severityConfig = {
  critical: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50' },
};

export default function AlertsScreen() {
  const [filter, setFilter] = useState('all');

  const filtered = alerts.filter((a) => filter === 'all' || a.status === filter);

  return (
    <div className="px-4 pt-4 safe-top">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
        <p className="text-gray-500">System notifications</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-600">2</p>
          <p className="text-xs text-red-600">Critical</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-yellow-600">5</p>
          <p className="text-xs text-yellow-600">Warning</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-600">12</p>
          <p className="text-xs text-green-600">Resolved</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {['all', 'active', 'acknowledged', 'resolved'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filtered.map((alert) => {
          const config = severityConfig[alert.severity as keyof typeof severityConfig];
          const Icon = config.icon;

          return (
            <div key={alert.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{alert.title}</h3>
                    <span className="text-xs text-gray-400">{alert.time}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{alert.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">{alert.building}</span>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        alert.status === 'active'
                          ? 'bg-red-100 text-red-700'
                          : alert.status === 'acknowledged'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {alert.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
