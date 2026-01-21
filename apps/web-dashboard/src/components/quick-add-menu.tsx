'use client';

import { useState } from 'react';
import { Plus, X, AlertTriangle, FileWarning, ClipboardList, Target } from 'lucide-react';

const quickAddItems = [
  {
    name: 'Risk',
    icon: AlertTriangle,
    href: 'http://localhost:3001/risks/new',
    color: 'bg-red-500 hover:bg-red-600',
  },
  {
    name: 'Incident',
    icon: FileWarning,
    href: 'http://localhost:3001/incidents/new',
    color: 'bg-yellow-500 hover:bg-yellow-600',
  },
  {
    name: 'Action',
    icon: ClipboardList,
    href: 'http://localhost:3001/actions/new',
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    name: 'Objective',
    icon: Target,
    href: 'http://localhost:3002/objectives/new',
    color: 'bg-green-500 hover:bg-green-600',
  },
];

export function QuickAddMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Menu items */}
      <div
        className={`flex flex-col-reverse gap-3 mb-4 transition-all duration-200 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {quickAddItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-white shadow-lg ${item.color} transition-transform hover:scale-105`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{item.name}</span>
            </a>
          );
        })}
      </div>

      {/* FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200 ${
          isOpen ? 'bg-gray-800 rotate-45' : 'bg-purple-600 hover:bg-purple-700'
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Plus className="h-6 w-6 text-white" />
        )}
      </button>
    </div>
  );
}
