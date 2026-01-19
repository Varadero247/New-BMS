'use client';

import { useState } from 'react';
import { Bell, Search, Check, X, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const alerts = [
  {
    id: '1',
    title: 'High Temperature Alert',
    message: 'Server room temperature exceeded 80°F threshold',
    building: 'Data Center',
    device: 'Server Room Sensor',
    severity: 'critical',
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    title: 'HVAC System Warning',
    message: 'Main HVAC unit showing reduced efficiency',
    building: 'Main Office',
    device: 'HVAC Unit 1',
    severity: 'warning',
    status: 'active',
    createdAt: '2024-01-15T09:15:00Z',
  },
  {
    id: '3',
    title: 'Motion Detected After Hours',
    message: 'Motion detected in restricted area at 11:45 PM',
    building: 'Warehouse',
    device: 'Motion Sensor A',
    severity: 'warning',
    status: 'acknowledged',
    createdAt: '2024-01-14T23:45:00Z',
  },
  {
    id: '4',
    title: 'Energy Usage Spike',
    message: 'Unusual energy consumption pattern detected',
    building: 'Main Office',
    device: 'Energy Meter',
    severity: 'info',
    status: 'resolved',
    createdAt: '2024-01-14T14:20:00Z',
  },
  {
    id: '5',
    title: 'Device Offline',
    message: 'Air quality sensor has been offline for 2 hours',
    building: 'Research Facility',
    device: 'AQ Sensor 3',
    severity: 'warning',
    status: 'active',
    createdAt: '2024-01-15T08:00:00Z',
  },
];

const severityIcons = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const severityColors = {
  critical: 'text-red-500 bg-red-50',
  warning: 'text-yellow-500 bg-yellow-50',
  info: 'text-blue-500 bg-blue-50',
};

export default function AlertsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alerts</h1>
          <p className="text-muted-foreground">Monitor and manage system alerts</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-sm text-muted-foreground">Total Alerts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {alerts.filter((a) => a.severity === 'critical' && a.status === 'active').length}
            </div>
            <p className="text-sm text-muted-foreground">Critical Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {alerts.filter((a) => a.severity === 'warning' && a.status === 'active').length}
            </div>
            <p className="text-sm text-muted-foreground">Warnings Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {alerts.filter((a) => a.status === 'resolved').length}
            </div>
            <p className="text-sm text-muted-foreground">Resolved Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            All
          </Button>
          <Button
            variant={filterStatus === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('active')}
          >
            Active
          </Button>
          <Button
            variant={filterStatus === 'acknowledged' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('acknowledged')}
          >
            Acknowledged
          </Button>
          <Button
            variant={filterStatus === 'resolved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('resolved')}
          >
            Resolved
          </Button>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          const SeverityIcon = severityIcons[alert.severity as keyof typeof severityIcons];
          const colorClasses = severityColors[alert.severity as keyof typeof severityColors];

          return (
            <Card key={alert.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${colorClasses}`}>
                    <SeverityIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{alert.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{alert.building}</span>
                          <span>•</span>
                          <span>{alert.device}</span>
                          <span>•</span>
                          <span>{new Date(alert.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
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
                    {alert.status === 'active' && (
                      <div className="flex items-center gap-2 mt-4">
                        <Button size="sm" variant="outline">
                          <Check className="w-4 h-4 mr-1" />
                          Acknowledge
                        </Button>
                        <Button size="sm" variant="outline">
                          <X className="w-4 h-4 mr-1" />
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
