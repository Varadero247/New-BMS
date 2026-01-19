import { Search, Building, MapPin, Layers } from 'lucide-react';
import { useState } from 'react';

const buildings = [
  { id: '1', name: 'Main Office', address: '123 Main St', floors: 5, devices: 124, status: 'online' },
  { id: '2', name: 'Data Center', address: '456 Tech Ave', floors: 3, devices: 312, status: 'online' },
  { id: '3', name: 'Warehouse', address: '789 Industrial', floors: 2, devices: 67, status: 'warning' },
  { id: '4', name: 'Research Lab', address: '321 Innovation Dr', floors: 4, devices: 189, status: 'online' },
];

export default function BuildingsScreen() {
  const [search, setSearch] = useState('');

  const filtered = buildings.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 pt-4 safe-top">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Buildings</h1>
        <p className="text-gray-500">Manage your properties</p>
      </header>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search buildings..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
        />
      </div>

      {/* Building List */}
      <div className="space-y-3">
        {filtered.map((building) => (
          <div key={building.id} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{building.name}</h3>
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
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {building.address}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    {building.floors} floors
                  </span>
                  <span>{building.devices} devices</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
