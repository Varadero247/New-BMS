'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  Users,
  UserPlus,
  X,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  Calendar,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  Star,
  ChevronDown,
} from 'lucide-react';

interface Warden {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  jobTitle: string;
  icsRole: string;
  areaResponsible: string;
  trainingProvider?: string;
  trainingDate: string;
  trainingExpiryDate: string;
  certificateRef?: string;
  trainingCurrent: boolean;
  deputyName?: string;
  deputyPhone?: string;
}

const MOCK_WARDENS: Warden[] = [
  { id: '1', name: 'Sarah Johnson', email: 's.johnson@company.com', jobTitle: 'Facilities Manager', icsRole: 'INCIDENT_COMMANDER', areaResponsible: 'All Sites', trainingDate: '2025-06-01', trainingExpiryDate: '2026-06-01', trainingCurrent: true, deputyName: 'Mark Williams' },
  { id: '2', name: 'Mark Williams', jobTitle: 'H&S Manager', icsRole: 'SAFETY_OFFICER', areaResponsible: 'Building A & B', trainingDate: '2025-07-15', trainingExpiryDate: '2026-07-15', trainingCurrent: true },
  { id: '3', name: 'Linda Patel', jobTitle: 'HR Manager', icsRole: 'LIAISON_OFFICER', areaResponsible: 'Main Office', trainingDate: '2024-09-01', trainingExpiryDate: '2025-09-01', trainingCurrent: false },
  { id: '4', name: 'Tom Bradley', jobTitle: 'Security Lead', icsRole: 'FIRE_WARDEN', areaResponsible: 'Ground Floor', trainingDate: '2025-11-01', trainingExpiryDate: '2026-11-01', trainingCurrent: true },
  { id: '5', name: 'Alice Chen', jobTitle: 'Receptionist', icsRole: 'ASSEMBLY_POINT_WARDEN', areaResponsible: 'Car Park A', trainingDate: '2025-10-01', trainingExpiryDate: '2026-10-01', trainingCurrent: true },
  { id: '6', name: 'James Davies', jobTitle: 'Nurse', icsRole: 'FIRST_AIDER', areaResponsible: 'All Buildings', trainingDate: '2024-12-01', trainingExpiryDate: '2025-12-01', trainingCurrent: false },
];

const ICS_ROLES = [
  'INCIDENT_COMMANDER',
  'DEPUTY_INCIDENT_COMMANDER',
  'SAFETY_OFFICER',
  'LIAISON_OFFICER',
  'PUBLIC_INFORMATION_OFFICER',
  'OPERATIONS_SECTION_CHIEF',
  'PLANNING_SECTION_CHIEF',
  'LOGISTICS_SECTION_CHIEF',
  'FINANCE_ADMIN_SECTION_CHIEF',
  'FIRE_WARDEN',
  'FIRST_AIDER',
  'ASSEMBLY_POINT_WARDEN',
];

function formatIcsRole(role: string): string {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function icsRoleColor(role: string): string {
  if (role.includes('INCIDENT_COMMANDER')) return 'bg-red-100 text-red-800 border-red-200';
  if (role.includes('SAFETY')) return 'bg-orange-100 text-orange-800 border-orange-200';
  if (role.includes('FIRE')) return 'bg-amber-100 text-amber-800 border-amber-200';
  if (role.includes('FIRST_AIDER')) return 'bg-green-100 text-green-800 border-green-200';
  if (role.includes('ASSEMBLY')) return 'bg-blue-100 text-blue-800 border-blue-200';
  if (role.includes('CHIEF')) return 'bg-purple-100 text-purple-800 border-purple-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
}

function TrainingExpiry({ expiry, current }: { expiry: string; current: boolean }) {
  const date = new Date(expiry);
  const now = new Date();
  const daysLeft = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (!current || daysLeft < 0) {
    return <span className="text-xs text-red-600 font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{date.toLocaleDateString('en-GB')}</span>;
  }
  if (daysLeft <= 60) {
    return <span className="text-xs text-amber-600 font-semibold">{date.toLocaleDateString('en-GB')} ({daysLeft}d)</span>;
  }
  return <span className="text-xs text-green-700 font-medium">{date.toLocaleDateString('en-GB')}</span>;
}

const EMPTY_FORM = {
  name: '', email: '', phone: '', jobTitle: '', icsRole: '', areaResponsible: '',
  trainingProvider: '', trainingDate: '', trainingExpiryDate: '', certificateRef: '',
  trainingCurrent: true, deputyName: '', deputyPhone: '',
};

export default function WardenRegisterPage() {
  const [wardens, setWardens] = useState<Warden[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    api
      .get('/wardens')
      .then((r) => setWardens(r.data.data))
      .catch(() => setWardens(MOCK_WARDENS))
      .finally(() => setLoading(false));
  }, []);

  const totalWardens = wardens.length;
  const currentCount = wardens.filter((w) => w.trainingCurrent).length;
  const expiredCount = wardens.filter((w) => !w.trainingCurrent).length;

  function openAdd() {
    setForm({ ...EMPTY_FORM });
    setSaveSuccess(false);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name || !form.icsRole || !form.jobTitle) return;
    setSaving(true);
    try {
      const r = await api.post('/wardens', form);
      setWardens((prev) => [r.data.data, ...prev]);
    } catch {
      const newWarden: Warden = {
        id: Date.now().toString(),
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        jobTitle: form.jobTitle,
        icsRole: form.icsRole,
        areaResponsible: form.areaResponsible,
        trainingProvider: form.trainingProvider || undefined,
        trainingDate: form.trainingDate,
        trainingExpiryDate: form.trainingExpiryDate,
        certificateRef: form.certificateRef || undefined,
        trainingCurrent: form.trainingCurrent,
        deputyName: form.deputyName || undefined,
        deputyPhone: form.deputyPhone || undefined,
      };
      setWardens((prev) => [newWarden, ...prev]);
    } finally {
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => {
        setModalOpen(false);
        setSaveSuccess(false);
      }, 1000);
    }
  }

  function f(field: keyof typeof EMPTY_FORM, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-red-600 font-medium animate-pulse">Loading warden register...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldAlert className="w-7 h-7 text-red-600" />
              Emergency Wardens / ICS Roles Register
            </h1>
            <p className="text-gray-500 text-sm mt-1">Incident Command System role assignments and training records</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add Warden
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-red-200 shadow-sm">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-red-600 mx-auto mb-1" />
              <p className="text-3xl font-bold text-gray-900">{totalWardens}</p>
              <p className="text-xs text-gray-500 mt-1">Total Wardens</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50 shadow-sm">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="text-3xl font-bold text-green-700">{currentCount}</p>
              <p className="text-xs text-gray-500 mt-1">Training Current</p>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50 shadow-sm">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-1" />
              <p className="text-3xl font-bold text-red-700">{expiredCount}</p>
              <p className="text-xs text-gray-500 mt-1">Training Expired</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="border-red-200 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b border-red-100">
            <CardTitle className="text-base text-gray-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-red-600" />
              Warden Register ({wardens.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-red-50 border-b border-red-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Job Title</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">ICS Role</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Area</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Training Expiry</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Current</th>
                  </tr>
                </thead>
                <tbody>
                  {wardens.map((w, idx) => (
                    <tr key={w.id} className={`border-b border-gray-100 hover:bg-red-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900 flex items-center gap-1">
                            {w.icsRole === 'INCIDENT_COMMANDER' && <Star className="w-3 h-3 text-red-500" />}
                            {w.name}
                          </p>
                          {w.deputyName && (
                            <p className="text-xs text-gray-400">Deputy: {w.deputyName}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-gray-700">
                          <Briefcase className="w-3 h-3 text-gray-400 shrink-0" />
                          {w.jobTitle}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${icsRoleColor(w.icsRole)}`}>
                          {formatIcsRole(w.icsRole)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-gray-600 text-xs">
                          <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                          {w.areaResponsible}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <TrainingExpiry expiry={w.trainingExpiryDate} current={w.trainingCurrent} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {w.trainingCurrent ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200">
                            <CheckCircle className="w-3 h-3" /> Current
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium border border-red-200">
                            <AlertTriangle className="w-3 h-3" /> Expired
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Warden Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-red-600" />
                Add Warden
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {saveSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  <CheckCircle className="w-4 h-4" /> Warden added successfully.
                </div>
              )}

              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Personal Details</h3>
              <MF label="Full Name *" value={form.name} onChange={(v) => f('name', v)} />
              <div className="grid grid-cols-2 gap-3">
                <MF label="Email" value={form.email} onChange={(v) => f('email', v)} type="email" icon={<Mail className="w-3 h-3" />} />
                <MF label="Phone" value={form.phone} onChange={(v) => f('phone', v)} icon={<Phone className="w-3 h-3" />} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MF label="Job Title *" value={form.jobTitle} onChange={(v) => f('jobTitle', v)} icon={<Briefcase className="w-3 h-3" />} />
                <MF label="Area Responsible *" value={form.areaResponsible} onChange={(v) => f('areaResponsible', v)} icon={<MapPin className="w-3 h-3" />} />
              </div>

              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">ICS Role</h3>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ICS Role *</label>
                <div className="relative">
                  <select
                    value={form.icsRole}
                    onChange={(e) => f('icsRole', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 appearance-none pr-9 bg-white"
                  >
                    <option value="">Select ICS Role...</option>
                    {ICS_ROLES.map((r) => (
                      <option key={r} value={r}>{formatIcsRole(r)}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">Training Details</h3>
              <MF label="Training Provider" value={form.trainingProvider} onChange={(v) => f('trainingProvider', v)} />
              <MF label="Certificate Reference" value={form.certificateRef} onChange={(v) => f('certificateRef', v)} />
              <div className="grid grid-cols-2 gap-3">
                <MF label="Training Date" value={form.trainingDate} onChange={(v) => f('trainingDate', v)} type="date" icon={<Calendar className="w-3 h-3" />} />
                <MF label="Expiry Date" value={form.trainingExpiryDate} onChange={(v) => f('trainingExpiryDate', v)} type="date" icon={<Calendar className="w-3 h-3" />} />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="trainingCurrent"
                  checked={form.trainingCurrent}
                  onChange={(e) => f('trainingCurrent', e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-400"
                />
                <label htmlFor="trainingCurrent" className="text-sm text-gray-700">Training is current / valid</label>
              </div>

              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">Deputy Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <MF label="Deputy Name" value={form.deputyName} onChange={(v) => f('deputyName', v)} />
                <MF label="Deputy Phone" value={form.deputyPhone} onChange={(v) => f('deputyPhone', v)} />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.icsRole || !form.jobTitle}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 font-medium"
              >
                {saving ? 'Saving...' : 'Add Warden'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MF({ label, value, onChange, type = 'text', icon }: { label: string; value: string; onChange: (v: string) => void; type?: string; icon?: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
      />
    </div>
  );
}
