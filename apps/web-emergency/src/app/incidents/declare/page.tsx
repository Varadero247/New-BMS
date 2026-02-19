'use client';
import axios from 'axios';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, Button, Input, Label, Select, Textarea } from '@ims/ui';
import {
  Flame,
  Loader2,
  AlertTriangle,
  Droplets,
  Wind,
  Zap,
  Skull,
  Cpu,
  Biohazard,
  Building,
  Shield,
  HelpCircle,
} from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

const EMERGENCY_TYPES = [
  { value: 'FIRE', label: 'Fire', icon: Flame, color: '#EF4444', bg: '#FEF2F2' },
  { value: 'FLOOD', label: 'Flood', icon: Droplets, color: '#3B82F6', bg: '#EFF6FF' },
  { value: 'GAS_LEAK', label: 'Gas Leak', icon: Wind, color: '#F97316', bg: '#FFF7ED' },
  {
    value: 'CHEMICAL_SPILL',
    label: 'Chemical Spill',
    icon: Biohazard,
    color: '#8B5CF6',
    bg: '#F5F3FF',
  },
  {
    value: 'STRUCTURAL_FAILURE',
    label: 'Structural Failure',
    icon: Building,
    color: '#6B7280',
    bg: '#F9FAFB',
  },
  { value: 'POWER_OUTAGE', label: 'Power Outage', icon: Zap, color: '#EAB308', bg: '#FEFCE8' },
  { value: 'BOMB_THREAT', label: 'Bomb Threat', icon: Skull, color: '#DC2626', bg: '#FEF2F2' },
  {
    value: 'MEDICAL_EMERGENCY',
    label: 'Medical Emergency',
    icon: Shield,
    color: '#10B981',
    bg: '#ECFDF5',
  },
  { value: 'CYBER_ATTACK', label: 'Cyber Attack', icon: Cpu, color: '#6366F1', bg: '#EEF2FF' },
  {
    value: 'PANDEMIC',
    label: 'Pandemic / Disease',
    icon: Biohazard,
    color: '#F59E0B',
    bg: '#FFFBEB',
  },
  {
    value: 'CIVIL_UNREST',
    label: 'Civil Unrest',
    icon: AlertTriangle,
    color: '#EF4444',
    bg: '#FEF2F2',
  },
  { value: 'OTHER', label: 'Other', icon: HelpCircle, color: '#9CA3AF', bg: '#F9FAFB' },
] as const;

const SEVERITY_LEVELS = [
  {
    value: 'LOW',
    label: 'Low',
    description: 'Minor incident, contained, no immediate danger',
    color: '#10B981',
    bg: '#ECFDF5',
  },
  {
    value: 'MEDIUM',
    label: 'Medium',
    description: 'Moderate risk, requires attention, evacuation may be needed',
    color: '#F59E0B',
    bg: '#FFFBEB',
  },
  {
    value: 'HIGH',
    label: 'High',
    description: 'Serious incident, significant risk, evacuation required',
    color: '#F97316',
    bg: '#FFF7ED',
  },
  {
    value: 'CRITICAL',
    label: 'Critical',
    description: 'Life-threatening emergency, immediate action required',
    color: '#DC2626',
    bg: '#FEF2F2',
  },
] as const;

export default function DeclarePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [premises, setPremises] = useState<Array<{ id: string; name: string }>>([]);

  const [selectedType, setSelectedType] = useState('FIRE');
  const [selectedSeverity, setSelectedSeverity] = useState('HIGH');
  const [form, setForm] = useState({
    premisesId: searchParams.get('premisesId') || '',
    title: '',
    description: '',
    commanderName: '',
    location: '',
    peopleAccountedFor: false,
    evacuationRequired: false,
    agenciesNotified: [] as string[],
  });

  useEffect(() => {
    api
      .get('/premises')
      .then((r) => setPremises(r.data.data || []))
      .catch(() => {});
  }, []);

  async function handleDeclare() {
    if (!form.title || !selectedType || !selectedSeverity) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...form,
        type: selectedType,
        severity: selectedSeverity,
        declaredAt: new Date().toISOString(),
      };
      const r = await api.post('/incidents', payload);
      const incidentId = r.data.data?.id;
      if (incidentId) {
        router.push(`/incidents/${incidentId}`);
      } else {
        router.push('/incidents');
      }
    } catch (e) {
      setError(axios.isAxiosError(e) && e.response?.data?.error || 'Failed to declare emergency. Please try again.');
      setSubmitting(false);
    }
  }

  const selectedTypeData = EMERGENCY_TYPES.find((t) => t.value === selectedType);
  const selectedSeverityData = SEVERITY_LEVELS.find((s) => s.value === selectedSeverity);
  const TypeIcon = selectedTypeData?.icon || HelpCircle;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {/* Top Banner */}
        <div className="px-8 py-4 flex items-center gap-4" style={{ backgroundColor: '#F04B5A' }}>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Emergency Declaration</h1>
            <p className="text-white/80 text-sm">Complete quickly — every second counts</p>
          </div>
          <div className="ml-auto">
            <p className="text-white/60 text-xs">Time: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        <div className="p-8 max-w-3xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Step 1: Emergency Type */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              1. What type of emergency?
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {EMERGENCY_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.value;
                return (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:scale-105 active:scale-95"
                    style={{
                      borderColor: isSelected ? type.color : '#E5E7EB',
                      backgroundColor: isSelected ? type.bg : 'white',
                    }}
                  >
                    <Icon
                      className="h-8 w-8"
                      style={{ color: isSelected ? type.color : '#9CA3AF' }}
                    />
                    <span
                      className="text-xs font-semibold text-center leading-tight"
                      style={{ color: isSelected ? type.color : '#6B7280' }}
                    >
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Severity */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              2. Severity level?
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {SEVERITY_LEVELS.map((sev) => {
                const isSelected = selectedSeverity === sev.value;
                return (
                  <button
                    key={sev.value}
                    onClick={() => setSelectedSeverity(sev.value)}
                    className="flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left"
                    style={{
                      borderColor: isSelected ? sev.color : '#E5E7EB',
                      backgroundColor: isSelected ? sev.bg : 'white',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-sm"
                      style={{ backgroundColor: sev.color }}
                    >
                      {sev.label[0]}
                    </div>
                    <div>
                      <p
                        className="font-bold"
                        style={{ color: isSelected ? sev.color : '#374151' }}
                      >
                        {sev.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-tight">
                        {sev.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Incident Details */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              3. Incident details
            </h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label>
                    Brief Title *{' '}
                    <span className="text-xs text-gray-400 font-normal">
                      (keep it short and clear)
                    </span>
                  </Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder={`e.g. ${selectedTypeData?.label || 'Emergency'} at Ground Floor`}
                    className="text-lg font-semibold"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Premises</Label>
                    <Select
                      value={form.premisesId}
                      onChange={(e) => setForm((f) => ({ ...f, premisesId: e.target.value }))}
                    >
                      <option value="">Select premises...</option>
                      {premises.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Specific Location</Label>
                    <Input
                      value={form.location}
                      onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                      placeholder="e.g. 3rd floor east wing"
                    />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    placeholder="Brief description of the situation..."
                  />
                </div>
                <div>
                  <Label>Incident Commander</Label>
                  <Input
                    value={form.commanderName}
                    onChange={(e) => setForm((f) => ({ ...f, commanderName: e.target.value }))}
                    placeholder="Name of person taking command"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.evacuationRequired}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, evacuationRequired: e.target.checked }))
                      }
                      className="h-4 w-4 rounded"
                    />
                    <div>
                      <p className="font-medium text-sm">Evacuation Required</p>
                      <p className="text-xs text-gray-500">Building evacuation in progress</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.peopleAccountedFor}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, peopleAccountedFor: e.target.checked }))
                      }
                      className="h-4 w-4 rounded"
                    />
                    <div>
                      <p className="font-medium text-sm">People Accounted For</p>
                      <p className="text-xs text-gray-500">All occupants accounted for</p>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview & Submit */}
          <div
            className="rounded-xl border-2 p-6 mb-6"
            style={{
              borderColor: selectedSeverityData?.color || '#F04B5A',
              backgroundColor: selectedSeverityData?.bg || '#FEE2E4',
            }}
          >
            <div className="flex items-center gap-4 mb-4">
              <TypeIcon
                className="h-10 w-10"
                style={{ color: selectedTypeData?.color || '#F04B5A' }}
              />
              <div>
                <p className="font-bold text-lg text-gray-900">
                  {form.title || `[${selectedTypeData?.label || 'Emergency'} Incident]`}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedTypeData?.label} · Severity:{' '}
                  <span className="font-bold" style={{ color: selectedSeverityData?.color }}>
                    {selectedSeverityData?.label}
                  </span>
                  {form.evacuationRequired && ' · EVACUATION REQUIRED'}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleDeclare}
            disabled={submitting || !form.title}
            className="w-full py-4 text-lg font-bold text-white shadow-xl hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#F04B5A' }}
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-3" />
                Declaring Emergency...
              </>
            ) : (
              <>
                <Flame className="h-5 w-5 mr-3" />
                DECLARE EMERGENCY NOW
              </>
            )}
          </Button>
          <p className="text-center text-xs text-gray-400 mt-3">
            This will immediately log the incident and alert relevant personnel
          </p>
        </div>
      </main>
    </div>
  );
}
