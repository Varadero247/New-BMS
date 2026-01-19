'use client';

import {
  Building,
  Cpu,
  Bell,
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  Thermometer,
  Droplets,
  Wind,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const stats = [
  {
    title: 'Total Buildings',
    value: '12',
    change: '+2 this month',
    trend: 'up',
    icon: Building,
  },
  {
    title: 'Active Devices',
    value: '847',
    change: '98.2% online',
    trend: 'up',
    icon: Cpu,
  },
  {
    title: 'Active Alerts',
    value: '23',
    change: '5 critical',
    trend: 'down',
    icon: Bell,
  },
  {
    title: 'Energy Today',
    value: '2,847 kWh',
    change: '-12% vs avg',
    trend: 'up',
    icon: Zap,
  },
];

const recentAlerts = [
  {
    id: 1,
    title: 'HVAC System Warning',
    building: 'Main Office',
    severity: 'warning',
    time: '5 min ago',
  },
  {
    id: 2,
    title: 'High Temperature Alert',
    building: 'Server Room',
    severity: 'critical',
    time: '12 min ago',
  },
  {
    id: 3,
    title: 'Motion Detected',
    building: 'Warehouse B',
    severity: 'info',
    time: '23 min ago',
  },
  {
    id: 4,
    title: 'Energy Spike Detected',
    building: 'Data Center',
    severity: 'warning',
    time: '1 hour ago',
  },
];

const environmentalData = [
  { label: 'Avg Temperature', value: '72°F', icon: Thermometer, color: 'text-orange-500' },
  { label: 'Avg Humidity', value: '45%', icon: Droplets, color: 'text-blue-500' },
  { label: 'Air Quality', value: 'Good', icon: Wind, color: 'text-green-500' },
  { label: 'Occupancy', value: '234', icon: Activity, color: 'text-purple-500' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s an overview of your buildings.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {stat.trend === 'up' ? (
                  <TrendingUp className="w-3 h-3 text-green-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Environmental Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Environmental Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {environmentalData.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg"
                >
                  <div className={`p-2 rounded-lg bg-background ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-semibold">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div
                    className={`w-2 h-2 mt-2 rounded-full ${
                      alert.severity === 'critical'
                        ? 'bg-red-500'
                        : alert.severity === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.building}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {alert.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
