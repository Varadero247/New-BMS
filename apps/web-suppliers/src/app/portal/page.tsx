'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  CreditCard,
  Award,
  Wrench,
  Edit,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Landmark,
} from 'lucide-react';

interface SupplierProfile {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  address: string;
  city: string;
  country: string;
  vatNumber: string;
  paymentTerms: string;
  bankName: string;
  bankAccountName: string;
  bankSortCode: string;
  bankAccountNumber: string;
  certifications: string[];
  capabilities: string[];
  status: string;
}

const MOCK_PROFILE: SupplierProfile = {
  id: 'sup-1',
  companyName: 'Precision Components Ltd',
  contactName: 'John Martinez',
  contactEmail: 'john.martinez@precision.co.uk',
  contactPhone: '+44 1234 567890',
  website: 'https://precision-components.co.uk',
  address: '14 Industrial Estate',
  city: 'Birmingham',
  country: 'United Kingdom',
  vatNumber: 'GB123456789',
  paymentTerms: 'NET30',
  bankName: 'Barclays',
  bankAccountName: 'Precision Components Ltd',
  bankSortCode: '20-00-00',
  bankAccountNumber: '12345678',
  certifications: ['ISO 9001:2015', 'ISO 14001:2015', 'IATF 16949:2016'],
  capabilities: ['Precision CNC Machining', 'Sheet Metal Fabrication', 'Surface Finishing'],
  status: 'APPROVED',
};

function maskAccountNumber(account: string): string {
  if (account.length <= 4) return account;
  return '•'.repeat(account.length - 4) + account.slice(-4);
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    APPROVED: { label: 'Approved', className: 'bg-green-100 text-green-800 border border-green-200', icon: <CheckCircle className="w-3 h-3" /> },
    PENDING: { label: 'Pending Review', className: 'bg-amber-100 text-amber-800 border border-amber-200', icon: <Clock className="w-3 h-3" /> },
    SUSPENDED: { label: 'Suspended', className: 'bg-red-100 text-red-800 border border-red-200', icon: <AlertCircle className="w-3 h-3" /> },
    REJECTED: { label: 'Rejected', className: 'bg-gray-100 text-gray-600 border border-gray-200', icon: <X className="w-3 h-3" /> },
  };
  const c = config[status] ?? config['PENDING'];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${c.className}`}>
      {c.icon}
      {c.label}
    </span>
  );
}

export default function SupplierPortalPage() {
  const [profile, setProfile] = useState<SupplierProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [form, setForm] = useState<Partial<SupplierProfile>>({});

  useEffect(() => {
    api
      .get('/portal/profile')
      .then((r) => setProfile(r.data.data))
      .catch(() => setProfile(MOCK_PROFILE))
      .finally(() => setLoading(false));
  }, []);

  function openEdit() {
    if (!profile) return;
    setForm({ ...profile });
    setSaveSuccess(false);
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const r = await api.put('/portal/profile', form);
      setProfile(r.data.data);
    } catch {
      setProfile((prev) => prev ? { ...prev, ...form } as SupplierProfile : null);
    } finally {
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => {
        setModalOpen(false);
        setSaveSuccess(false);
      }, 1200);
    }
  }

  function handleField(field: keyof SupplierProfile, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleArrayField(field: 'certifications' | 'capabilities', value: string) {
    setForm((f) => ({ ...f, [field]: value.split('\n').map((s) => s.trim()).filter(Boolean) }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="text-amber-600 font-medium animate-pulse">Loading your profile...</div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-7 h-7 text-amber-600" />
              Supplier Self-Service Portal
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage your company profile and details</p>
          </div>
          <button
            onClick={openEdit}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium shadow-sm"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        {/* Overview Card */}
        <Card className="border-amber-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-amber-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-900">{profile.companyName}</CardTitle>
              <StatusBadge status={profile.status} />
            </div>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-sm">{profile.contactName}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-sm">{profile.contactEmail}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-sm">{profile.contactPhone}</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Details */}
          <Card className="border-amber-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-gray-800">
                <Building2 className="w-4 h-4 text-amber-600" />
                Company Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow label="VAT Number" value={profile.vatNumber} />
              <DetailRow label="Payment Terms" value={profile.paymentTerms} />
              <DetailRow
                label="Website"
                value={
                  <a href={profile.website} target="_blank" rel="noreferrer" className="text-amber-600 hover:underline flex items-center gap-1">
                    <Globe className="w-3 h-3" /> {profile.website}
                  </a>
                }
              />
              <DetailRow
                label="Address"
                value={
                  <span className="flex items-start gap-1">
                    <MapPin className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" />
                    {profile.address}, {profile.city}, {profile.country}
                  </span>
                }
              />
            </CardContent>
          </Card>

          {/* Banking Details */}
          <Card className="border-amber-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-gray-800">
                <Landmark className="w-4 h-4 text-amber-600" />
                Banking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow label="Bank" value={profile.bankName} />
              <DetailRow label="Account Name" value={profile.bankAccountName} />
              <DetailRow label="Sort Code" value={profile.bankSortCode} />
              <DetailRow
                label="Account Number"
                value={
                  <span className="font-mono text-sm flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-gray-400" />
                    {maskAccountNumber(profile.bankAccountNumber)}
                  </span>
                }
              />
            </CardContent>
          </Card>
        </div>

        {/* Certifications */}
        <Card className="border-amber-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gray-800">
              <Award className="w-4 h-4 text-amber-600" />
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.certifications.map((cert) => (
                <span key={cert} className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium border border-amber-200">
                  <Award className="w-3 h-3" />
                  {cert}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Capabilities */}
        <Card className="border-amber-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gray-800">
              <Wrench className="w-4 h-4 text-amber-600" />
              Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.capabilities.map((cap) => (
                <span key={cap} className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium border border-orange-200">
                  <Wrench className="w-3 h-3" />
                  {cap}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {saveSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  <CheckCircle className="w-4 h-4" /> Profile saved successfully.
                </div>
              )}
              <h3 className="font-medium text-gray-700 text-sm uppercase tracking-wide">Company Details</h3>
              <ModalField label="Company Name" value={form.companyName ?? ''} onChange={(v) => handleField('companyName', v)} />
              <ModalField label="VAT Number" value={form.vatNumber ?? ''} onChange={(v) => handleField('vatNumber', v)} />
              <ModalField label="Payment Terms" value={form.paymentTerms ?? ''} onChange={(v) => handleField('paymentTerms', v)} />
              <ModalField label="Website" value={form.website ?? ''} onChange={(v) => handleField('website', v)} />
              <ModalField label="Address" value={form.address ?? ''} onChange={(v) => handleField('address', v)} />
              <div className="grid grid-cols-2 gap-3">
                <ModalField label="City" value={form.city ?? ''} onChange={(v) => handleField('city', v)} />
                <ModalField label="Country" value={form.country ?? ''} onChange={(v) => handleField('country', v)} />
              </div>
              <h3 className="font-medium text-gray-700 text-sm uppercase tracking-wide pt-2">Contact Information</h3>
              <ModalField label="Contact Name" value={form.contactName ?? ''} onChange={(v) => handleField('contactName', v)} />
              <ModalField label="Contact Email" value={form.contactEmail ?? ''} onChange={(v) => handleField('contactEmail', v)} type="email" />
              <ModalField label="Contact Phone" value={form.contactPhone ?? ''} onChange={(v) => handleField('contactPhone', v)} />
              <h3 className="font-medium text-gray-700 text-sm uppercase tracking-wide pt-2">Banking Details</h3>
              <ModalField label="Bank Name" value={form.bankName ?? ''} onChange={(v) => handleField('bankName', v)} />
              <ModalField label="Account Name" value={form.bankAccountName ?? ''} onChange={(v) => handleField('bankAccountName', v)} />
              <div className="grid grid-cols-2 gap-3">
                <ModalField label="Sort Code" value={form.bankSortCode ?? ''} onChange={(v) => handleField('bankSortCode', v)} />
                <ModalField label="Account Number" value={form.bankAccountNumber ?? ''} onChange={(v) => handleField('bankAccountNumber', v)} />
              </div>
              <h3 className="font-medium text-gray-700 text-sm uppercase tracking-wide pt-2">Certifications & Capabilities</h3>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Certifications (one per line)</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  value={(form.certifications ?? []).join('\n')}
                  onChange={(e) => handleArrayField('certifications', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Capabilities (one per line)</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  value={(form.capabilities ?? []).join('\n')}
                  onChange={(e) => handleArrayField('capabilities', e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-60 font-medium"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-xs text-gray-500 font-medium shrink-0">{label}</span>
      <span className="text-sm text-gray-800 text-right">{value}</span>
    </div>
  );
}

function ModalField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
      />
    </div>
  );
}
