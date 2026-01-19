'use client';

import { useState } from 'react';
import {
  Cpu,
  Search,
  Filter,
  Thermometer,
  Lightbulb,
  Wind,
  Shield,
  Zap,
  MoreVertical,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const devices = [
  {
    id: '1',
    name: 'Main HVAC Unit',
    type: 'HVAC',
    building: 'Main Office',
    zone: 'Floor 2',
    status: 'online',
    lastReading: '72°F',
    icon: Wind,
  },
  {
    id: '2',
    name: 'Lobby Thermostat',
    type: 'Thermostat',
    building: 'Main Office',
    zone: 'Lobby',
    status: 'online',
    lastReading: '71°F',
    icon: Thermometer,
  },
  {
    id: '3',
    name: 'Conference Room Lights',
    type: 'Lighting',
    building: 'Main Office',
    zone: 'Conference A',
    status: 'online',
    lastReading: '80%',
    icon: Lightbulb,
  },
  {
    id: '4',
    name: 'Server Room AC',
    type: 'HVAC',
    building: 'Data Center',
    zone: 'Server Room',
    status: 'warning',
    lastReading: '68°F',
    icon: Wind,
  },
  {
    id: '5',
    name: 'Main Entry Access',
    type: 'Access Control',
    building: 'Main Office',
    zone: 'Lobby',
    status: 'online',
    lastReading: 'Locked',
    icon: Shield,
  },
  {
    id: '6',
    name: 'Energy Meter',
    type: 'Energy',
    building: 'Main Office',
    zone: 'Utility',
    status: 'online',
    lastReading: '45 kW',
    icon: Zap,
  },
];

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

export default function DevicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.building.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || device.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Devices</h1>
          <p className="text-muted-foreground">Monitor and control all connected devices</p>
        </div>
        <Button>
          <Cpu className="w-4 h-4 mr-2" />
          Add Device
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">847</div>
            <p className="text-sm text-muted-foreground">Total Devices</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">831</div>
            <p className="text-sm text-muted-foreground">Online</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">12</div>
            <p className="text-sm text-muted-foreground">Warning</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">4</div>
            <p className="text-sm text-muted-foreground">Offline</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search devices..."
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
            variant={filterStatus === 'online' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('online')}
          >
            Online
          </Button>
          <Button
            variant={filterStatus === 'warning' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('warning')}
          >
            Warning
          </Button>
          <Button
            variant={filterStatus === 'offline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('offline')}
          >
            Offline
          </Button>
        </div>
      </div>

      {/* Device List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredDevices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between p-4 hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <device.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{device.name}</h3>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          statusColors[device.status as keyof typeof statusColors]
                        }`}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {device.building} • {device.zone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">{device.lastReading}</p>
                    <p className="text-xs text-muted-foreground">{device.type}</p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
