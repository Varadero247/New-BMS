'use client';

import { Zap, TrendingUp, TrendingDown, DollarSign, Leaf } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const energyStats = [
  {
    title: 'Today\'s Usage',
    value: '2,847 kWh',
    change: '-12%',
    trend: 'down',
    icon: Zap,
  },
  {
    title: 'Monthly Usage',
    value: '84,521 kWh',
    change: '+3%',
    trend: 'up',
    icon: Zap,
  },
  {
    title: 'Monthly Cost',
    value: '$12,456',
    change: '-8%',
    trend: 'down',
    icon: DollarSign,
  },
  {
    title: 'Carbon Offset',
    value: '2.4 tons',
    change: '+15%',
    trend: 'up',
    icon: Leaf,
  },
];

const buildingUsage = [
  { name: 'Main Office', usage: 1245, percentage: 35 },
  { name: 'Data Center', usage: 892, percentage: 25 },
  { name: 'Warehouse', usage: 567, percentage: 16 },
  { name: 'Research Facility', usage: 489, percentage: 14 },
  { name: 'Other', usage: 354, percentage: 10 },
];

export default function EnergyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Energy Management</h1>
          <p className="text-muted-foreground">Monitor and optimize energy consumption</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Today</Button>
          <Button variant="outline">Week</Button>
          <Button variant="outline">Month</Button>
          <Button variant="outline">Year</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {energyStats.map((stat) => (
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
                {stat.trend === 'down' ? (
                  <TrendingDown className="w-3 h-3 text-green-500" />
                ) : (
                  <TrendingUp className="w-3 h-3 text-green-500" />
                )}
                <span className={stat.trend === 'down' ? 'text-green-500' : ''}>
                  {stat.change}
                </span>{' '}
                vs last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Usage by Building */}
        <Card>
          <CardHeader>
            <CardTitle>Usage by Building</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {buildingUsage.map((building) => (
                <div key={building.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{building.name}</span>
                    <span className="font-medium">{building.usage} kWh</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${building.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Usage Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-1">
                {Array.from({ length: 24 }).map((_, i) => {
                  const height = Math.random() * 100;
                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div
                        className={`w-full rounded-sm ${
                          height > 70
                            ? 'bg-red-500'
                            : height > 40
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ height: `${height}px` }}
                      />
                      {i % 4 === 0 && (
                        <span className="text-xs text-muted-foreground mt-1">
                          {i.toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span className="text-muted-foreground">Low</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded" />
                  <span className="text-muted-foreground">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded" />
                  <span className="text-muted-foreground">High</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Energy Saving Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800">Optimize HVAC Schedule</h4>
              <p className="text-sm text-green-600 mt-1">
                Adjust heating start time by 30 minutes later on Mondays
              </p>
              <p className="text-sm font-medium text-green-800 mt-2">
                Potential savings: $120/month
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800">LED Lighting Upgrade</h4>
              <p className="text-sm text-blue-600 mt-1">
                Replace fluorescent lights in Warehouse B
              </p>
              <p className="text-sm font-medium text-blue-800 mt-2">
                Potential savings: $340/month
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-800">Motion Sensors</h4>
              <p className="text-sm text-purple-600 mt-1">
                Install motion sensors in conference rooms
              </p>
              <p className="text-sm font-medium text-purple-800 mt-2">
                Potential savings: $85/month
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
