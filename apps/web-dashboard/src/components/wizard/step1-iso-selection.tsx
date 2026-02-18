'use client';

import { useState } from 'react';
import {
  Shield,
  Leaf,
  Award,
  TreePine,
  UtensilsCrossed,
  Zap,
  Brain,
  Scale,
  ShieldCheck,
  Plane,
  Stethoscope,
  Car,
} from 'lucide-react';

const ISO_STANDARDS = [
  { id: 'iso9001', label: 'ISO 9001', subtitle: 'Quality Management', icon: Award, color: 'blue' },
  { id: 'iso14001', label: 'ISO 14001', subtitle: 'Environmental', icon: Leaf, color: 'green' },
  { id: 'iso45001', label: 'ISO 45001', subtitle: 'Health & Safety', icon: Shield, color: 'red' },
  {
    id: 'iso27001',
    label: 'ISO 27001',
    subtitle: 'Information Security',
    icon: ShieldCheck,
    color: 'cyan',
  },
  {
    id: 'iso22000',
    label: 'ISO 22000',
    subtitle: 'Food Safety',
    icon: UtensilsCrossed,
    color: 'amber',
  },
  { id: 'iso50001', label: 'ISO 50001', subtitle: 'Energy Management', icon: Zap, color: 'yellow' },
  { id: 'iso42001', label: 'ISO 42001', subtitle: 'AI Management', icon: Brain, color: 'fuchsia' },
  { id: 'iso37001', label: 'ISO 37001', subtitle: 'Anti-Bribery', icon: Scale, color: 'rose' },
  {
    id: 'iso13485',
    label: 'ISO 13485',
    subtitle: 'Medical Devices',
    icon: Stethoscope,
    color: 'red',
  },
  { id: 'as9100', label: 'AS9100', subtitle: 'Aerospace', icon: Plane, color: 'slate' },
  { id: 'iatf16949', label: 'IATF 16949', subtitle: 'Automotive', icon: Car, color: 'gray' },
  { id: 'esg', label: 'ESG', subtitle: 'Sustainability Reporting', icon: TreePine, color: 'teal' },
];

interface Step1Props {
  data: { selectedStandards?: string[] };
  onUpdate: (data: { selectedStandards: string[] }) => void;
}

export default function Step1ISOSelection({ data, onUpdate }: Step1Props) {
  const [selected, setSelected] = useState<string[]>(data.selectedStandards || []);

  const toggle = (id: string) => {
    const next = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
    setSelected(next);
    onUpdate({ selectedStandards: next });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Select Your ISO Standards
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Choose the standards your organisation needs. We'll pre-configure modules and seed document
        templates for each.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {ISO_STANDARDS.map((std) => {
          const Icon = std.icon;
          const isSelected = selected.includes(std.id);
          return (
            <button
              key={std.id}
              onClick={() => toggle(std.id)}
              className={`relative flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all text-center ${
                isSelected
                  ? `border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800`
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {isSelected && (
                <span className="absolute top-2 right-2 h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
              <Icon className={`h-8 w-8 text-${std.color}-500`} />
              <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                {std.label}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{std.subtitle}</span>
            </button>
          );
        })}
      </div>

      {selected.length === 0 && (
        <p className="text-sm text-amber-600 mt-4">Select at least one standard to continue.</p>
      )}
    </div>
  );
}
