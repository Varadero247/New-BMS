'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  Building,
  MapPin,
  Calendar,
  Layers,
  Cpu,
  Bell,
  Zap,
  Thermometer,
  Droplets,
  Wind,
  ArrowLeft,
  Edit,
  Settings,
  MoreVertical,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const buildingData = {
  id: '1',
  name: 'Main Office Building',
  address: '123 Business Ave',
  city: 'New York',
  state: 'NY',
  zipCode: '10001',
  floors: 12,
  totalArea: 150000,
  yearBuilt: 2015,
  devices: 156,
  activeAlerts: 3,
  zones: [
    { id: '1', name: 'Lobby', floor: 1, type: 'LOBBY', devices: 8 },
    { id: '2', name: 'Office Floor 2', floor: 2, type: 'OFFICE', devices: 24 },
    { id: '3', name: 'Office Floor 3', floor: 3, type: 'OFFICE', devices: 24 },
    { id: '4', name: 'Conference Center', floor: 4, type: 'CONFERENCE', devices: 16 },
    { id: '5', name: 'Server Room', floor: 5, type: 'SERVER_ROOM', devices: 32 },
  ],
};

const environmentalData = [
  { label: 'Temperature', value: '72°F', icon: Thermometer, color: 'text-orange-500', status: 'normal' },
  { label: 'Humidity', value: '45%', icon: Droplets, color: 'text-blue-500', status: 'normal' },
  { label: 'Air Quality', value: 'Good', icon: Wind, color: 'text-green-500', status: 'normal' },
  { label: 'Energy Usage', value: '847 kWh', icon: Zap, color: 'text-yellow-500', status: 'high' },
];

const recentAlerts = [
  { id: 1, title: 'HVAC Filter Replacement Due', severity: 'warning', time: '2 hours ago' },
  { id: 2, title: 'Server Room Temperature High', severity: 'critical', time: '4 hours ago' },
  { id: 3, title: 'Elevator Maintenance Required', severity: 'info', time: '1 day ago' },
];

export default function BuildingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/buildings"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{buildingData.name}</h1>
            <p className="text-muted-foreground flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {buildingData.address}, {buildingData.city}, {buildingData.state} {buildingData.zipCode}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
          <Button size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Layers className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{buildingData.floors}</p>
                <p className="text-sm text-muted-foreground">Floors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Cpu className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{buildingData.devices}</p>
                <p className="text-sm text-muted-foreground">Devices</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Bell className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{buildingData.activeAlerts}</p>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{buildingData.yearBuilt}</p>
                <p className="text-sm text-muted-foreground">Year Built</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Environmental Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Environmental Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {environmentalData.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 p-4 rounded-lg ${
                    item.status === 'high' ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-muted/50'
                  }`}
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Alerts</CardTitle>
            <Link href="/alerts" className="text-sm text-primary hover:underline">
              View All
            </Link>
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
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zones */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Zones</CardTitle>
          <Button size="sm">Add Zone</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Zone</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Floor</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Devices</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {buildingData.zones.map((zone) => (
                  <tr key={zone.id} className="border-b hover:bg-muted/50">
                    <td className="py-4 px-4 font-medium">{zone.name}</td>
                    <td className="py-4 px-4">Floor {zone.floor}</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-muted rounded-full text-xs">
                        {zone.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4">{zone.devices} devices</td>
                    <td className="py-4 px-4 text-right">
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </td>
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
