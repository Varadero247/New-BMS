'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building, Plus, Search, MapPin, Layers, Cpu } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const buildings = [
  {
    id: '1',
    name: 'Main Office Building',
    address: '123 Main Street, San Francisco, CA',
    floors: 5,
    devices: 124,
    status: 'online',
    image: null,
  },
  {
    id: '2',
    name: 'Downtown Data Center',
    address: '456 Tech Ave, San Francisco, CA',
    floors: 3,
    devices: 312,
    status: 'online',
    image: null,
  },
  {
    id: '3',
    name: 'Warehouse Complex',
    address: '789 Industrial Blvd, Oakland, CA',
    floors: 2,
    devices: 67,
    status: 'warning',
    image: null,
  },
  {
    id: '4',
    name: 'Research Facility',
    address: '321 Innovation Dr, Palo Alto, CA',
    floors: 4,
    devices: 189,
    status: 'online',
    image: null,
  },
];

export default function BuildingsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBuildings = buildings.filter(
    (building) =>
      building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      building.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Buildings</h1>
          <p className="text-muted-foreground">Manage and monitor your buildings</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Building
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search buildings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredBuildings.map((building) => (
          <Link key={building.id} href={`/buildings/${building.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Building className="w-12 h-12 text-primary/50" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{building.name}</h3>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        building.status === 'online'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {building.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3" />
                    {building.address}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Layers className="w-4 h-4" />
                      {building.floors} floors
                    </span>
                    <span className="flex items-center gap-1">
                      <Cpu className="w-4 h-4" />
                      {building.devices} devices
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
