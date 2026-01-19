import { Building, Cpu, Bell, Zap, TrendingUp, TrendingDown } from 'lucide-react';

const stats = [
  { label: 'Buildings', value: '12', icon: Building, color: 'bg-blue-500' },
  { label: 'Devices', value: '847', icon: Cpu, color: 'bg-green-500' },
  { label: 'Active Alerts', value: '23', icon: Bell, color: 'bg-red-500' },
  { label: 'Energy Today', value: '2.8k', icon: Zap, color: 'bg-yellow-500' },
];

const recentAlerts = [
  { id: 1, title: 'High Temperature', building: 'Server Room', severity: 'critical', time: '5m' },
  { id: 2, title: 'HVAC Warning', building: 'Main Office', severity: 'warning', time: '12m' },
  { id: 3, title: 'Motion Detected', building: 'Warehouse B', severity: 'info', time: '23m' },
];

export default function DashboardScreen() {
  return (
    <div className="px-4 pt-4 safe-top">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back!</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Energy Overview</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Today's Usage</p>
            <p className="text-xl font-bold text-gray-900">2,847 kWh</p>
          </div>
          <div className="flex items-center text-green-600">
            <TrendingDown className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">-12%</span>
          </div>
        </div>
        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-primary-500 rounded-full" />
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Alerts</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentAlerts.map((alert) => (
            <div key={alert.id} className="px-4 py-3 flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  alert.severity === 'critical'
                    ? 'bg-red-500'
                    : alert.severity === 'warning'
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{alert.title}</p>
                <p className="text-xs text-gray-500">{alert.building}</p>
              </div>
              <span className="text-xs text-gray-400">{alert.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
