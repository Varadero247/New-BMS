'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  Cpu,
  ArrowLeft,
  Settings,
  Power,
  Activity,
  Clock,
  MapPin,
  Wifi,
  WifiOff,
  Thermometer,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const deviceData = {
  id: '1',
  name: 'HVAC Unit - Floor 3',
  type: 'HVAC',
  status: 'ONLINE',
  manufacturer: 'Carrier',
  model: 'WeatherExpert XL',
  serialNumber: 'CAR-2024-001234',
  ipAddress: '192.168.1.101',
  macAddress: 'AA:BB:CC:DD:EE:01',
  firmware: 'v2.4.1',
  installDate: '2023-06-15',
  warrantyEnd: '2028-06-15',
  lastSeen: '2 minutes ago',
  building: 'Main Office Building',
  zone: 'Office Floor 3',
};

const readings = [
  { label: 'Current Temperature', value: '72°F', target: '70°F', status: 'normal' },
  { label: 'Humidity', value: '45%', target: '40-50%', status: 'normal' },
  { label: 'Fan Speed', value: '65%', target: 'Auto', status: 'normal' },
  { label: 'Power Consumption', value: '2.4 kW', target: '<3 kW', status: 'normal' },
];

const recentActivity = [
  { id: 1, action: 'Temperature adjusted', value: '72°F → 70°F', time: '10 min ago', user: 'System' },
  { id: 2, action: 'Mode changed', value: 'Cooling', time: '1 hour ago', user: 'John Smith' },
  { id: 3, action: 'Filter status check', value: 'OK', time: '6 hours ago', user: 'System' },
  { id: 4, action: 'Scheduled maintenance', value: 'Completed', time: '2 days ago', user: 'Mike Tech' },
];

const statusColors: Record<string, string> = {
  ONLINE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  OFFLINE: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  WARNING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  ERROR: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  MAINTENANCE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
};

export default function DeviceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/devices"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{deviceData.name}</h1>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[deviceData.status]}`}>
                {deviceData.status}
              </span>
            </div>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4" />
              {deviceData.building} • {deviceData.zone}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
          <Button size="sm" variant="destructive">
            <Power className="w-4 h-4 mr-2" />
            Power Off
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Device Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              Device Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { label: 'Type', value: deviceData.type },
                { label: 'Manufacturer', value: deviceData.manufacturer },
                { label: 'Model', value: deviceData.model },
                { label: 'Serial Number', value: deviceData.serialNumber },
                { label: 'Firmware', value: deviceData.firmware },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-medium text-sm">Network</h4>
              {[
                { label: 'IP Address', value: deviceData.ipAddress },
                { label: 'MAC Address', value: deviceData.macAddress },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-mono text-xs">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-medium text-sm">Dates</h4>
              {[
                { label: 'Installed', value: deviceData.installDate },
                { label: 'Warranty Until', value: deviceData.warrantyEnd },
                { label: 'Last Seen', value: deviceData.lastSeen },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Readings & Controls */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Current Readings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {readings.map((reading) => (
                <div
                  key={reading.label}
                  className="p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{reading.label}</span>
                    {reading.status === 'warning' && (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-2xl font-bold">{reading.value}</p>
                  <p className="text-xs text-muted-foreground">Target: {reading.target}</p>
                </div>
              ))}
            </div>

            {/* Quick Controls */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-4">Quick Controls</h4>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <label className="text-sm font-medium">Temperature</label>
                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="outline" size="sm">-</Button>
                    <span className="text-lg font-bold flex-1 text-center">70°F</span>
                    <Button variant="outline" size="sm">+</Button>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <label className="text-sm font-medium">Mode</label>
                  <select className="w-full mt-2 p-2 border rounded bg-background text-sm">
                    <option>Cooling</option>
                    <option>Heating</option>
                    <option>Fan Only</option>
                    <option>Auto</option>
                  </select>
                </div>
                <div className="p-4 border rounded-lg">
                  <label className="text-sm font-medium">Fan Speed</label>
                  <select className="w-full mt-2 p-2 border rounded bg-background text-sm">
                    <option>Auto</option>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Action</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Value</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((activity) => (
                  <tr key={activity.id} className="border-b hover:bg-muted/50">
                    <td className="py-4 px-4 font-medium">{activity.action}</td>
                    <td className="py-4 px-4 text-muted-foreground">{activity.value}</td>
                    <td className="py-4 px-4">{activity.user}</td>
                    <td className="py-4 px-4 text-muted-foreground">{activity.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
