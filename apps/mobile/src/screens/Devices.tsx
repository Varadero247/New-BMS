import { useState } from 'react';
import { Search, Thermometer, Wind, Lightbulb, Shield } from 'lucide-react';

const devices = [
  { id: '1', name: 'Main HVAC', type: 'HVAC', location: 'Floor 2', status: 'online', reading: '72°F', icon: Wind },
  { id: '2', name: 'Lobby Thermostat', type: 'Thermostat', location: 'Lobby', status: 'online', reading: '71°F', icon: Thermometer },
  { id: '3', name: 'Conference Lights', type: 'Lighting', location: 'Conf A', status: 'online', reading: '80%', icon: Lightbulb },
  { id: '4', name: 'Server Room AC', type: 'HVAC', location: 'Server Room', status: 'warning', reading: '68°F', icon: Wind },
  { id: '5', name: 'Entry Access', type: 'Access', location: 'Lobby', status: 'online', reading: 'Locked', icon: Shield },
];

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  warning: 'bg-yellow-500',
};

export default function DevicesScreen() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = devices.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || d.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="px-4 pt-4 safe-top">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Devices</h1>
        <p className="text-gray-500">Monitor connected devices</p>
      </header>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search devices..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none"
        />
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {['all', 'online', 'warning', 'offline'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Device List */}
      <div className="space-y-3">
        {filtered.map((device) => (
          <div key={device.id} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <device.icon className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">{device.name}</h3>
                  <span className={`w-2 h-2 rounded-full ${statusColors[device.status as keyof typeof statusColors]}`} />
                </div>
                <p className="text-sm text-gray-500">
                  {device.type} · {device.location}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{device.reading}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
