'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, Award, BarChart2, CheckSquare, ShieldCheck, ShieldOff, Copy, Check, AlertTriangle } from 'lucide-react';

// Mock data for facilitator dashboard
const MOCK_PARTICIPANTS = [
  { name: 'James Warren', org: 'Meridian Manufacturing', pre: 14, day1: 12, final: null, status: 'In Progress' },
  { name: 'Priya Patel', org: 'Meridian Manufacturing', pre: 18, day1: 14, final: 48, status: 'Distinction' },
  { name: 'Tom Chen', org: 'Apex Solutions', pre: 10, day1: 9, final: 42, status: 'Pass' },
  { name: 'Sarah Jones', org: 'Apex Solutions', pre: 16, day1: 15, final: null, status: 'In Progress' },
  { name: 'Alex Kim', org: 'Meridian Manufacturing', pre: 8, day1: 7, final: 38, status: 'Fail' },
];

const stats = [
  { label: 'Participants', value: '5', icon: Users, colour: 'text-blue-400' },
  { label: 'Completed', value: '3', icon: CheckSquare, colour: 'text-green-400' },
  { label: 'Pass Rate', value: '67%', icon: BarChart2, colour: 'text-amber-400' },
  { label: 'Distinctions', value: '1', icon: Award, colour: 'text-[#B8860B]' },
];

// Mock activation records — in production these would be fetched from the Nexara admin API
const ACTIVATION_RECORDS = [
  { org: 'Meridian Manufacturing Ltd', key: 'NEXARA-ATP-MERIDIAN-2026', status: 'active', issued: '2026-01-15', cohort: 'NEXARA-2026-02-28', issuedBy: 'T.Hartley (Nexara)' },
  { org: 'Apex Solutions Group', key: 'NEXARA-ATP-APEX-2026', status: 'active', issued: '2026-01-22', cohort: 'NEXARA-2026-02-28', issuedBy: 'T.Hartley (Nexara)' },
  { org: 'Suncroft Industries', key: 'NEXARA-ATP-SUNCROFT-2026', status: 'pending', issued: '—', cohort: '—', issuedBy: '—' },
];

export default function AdminPage() {
  const [cohort] = useState('NEXARA-2026-02-28');
  const [copied, setCopied] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRevoke = (org: string) => {
    setRevoking(org);
    // In production: call Nexara admin API to revoke the key
    setTimeout(() => setRevoking(null), 1500);
  };

  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">← Back to Home</Link>
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Facilitator Dashboard</h1>
            <p className="text-slate-400 text-sm">Cohort: {cohort}</p>
          </div>
          <Link href="/login" className="text-sm border border-[#1E3A5F] text-slate-400 px-3 py-1.5 rounded-lg hover:border-[#B8860B] hover:text-white transition-colors">
            Sign out
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, colour }) => (
          <div key={label} className="bg-[#091628] border border-[#1E3A5F] rounded-xl p-5">
            <Icon className={`w-5 h-5 ${colour} mb-3`} />
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Participant Table */}
      <div className="bg-[#091628] border border-[#1E3A5F] rounded-xl overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-[#1E3A5F]">
          <h2 className="font-semibold text-white">Participant Results</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E3A5F]">
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Participant</th>
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Organisation</th>
                <th className="text-center px-4 py-3 text-slate-400 font-medium">Pre (/20)</th>
                <th className="text-center px-4 py-3 text-slate-400 font-medium">Day 1 (/15)</th>
                <th className="text-center px-4 py-3 text-slate-400 font-medium">Final (/55)</th>
                <th className="text-center px-4 py-3 text-slate-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PARTICIPANTS.map((p) => (
                <tr key={p.name} className="border-b border-[#1E3A5F]/50 hover:bg-[#1E3A5F]/10 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{p.name}</td>
                  <td className="px-6 py-4 text-slate-400">{p.org}</td>
                  <td className="px-4 py-4 text-center text-slate-300">{p.pre}</td>
                  <td className="px-4 py-4 text-center text-slate-300">{p.day1}</td>
                  <td className="px-4 py-4 text-center text-slate-300">{p.final ?? '—'}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      p.status === 'Distinction' ? 'bg-[#B8860B]/20 text-[#B8860B]' :
                      p.status === 'Pass' ? 'bg-green-900/30 text-green-400' :
                      p.status === 'Fail' ? 'bg-red-900/30 text-red-400' :
                      'bg-blue-900/30 text-blue-400'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Link href="/certificate" className="bg-[#1E3A5F]/20 border border-[#1E3A5F] rounded-xl p-5 hover:border-[#B8860B]/50 transition-colors">
          <Award className="w-5 h-5 text-[#B8860B] mb-3" />
          <div className="font-medium text-white text-sm">Issue Certificates</div>
          <div className="text-xs text-slate-400 mt-1">Generate certificates for passing participants</div>
        </Link>
        <button className="bg-[#1E3A5F]/20 border border-[#1E3A5F] rounded-xl p-5 hover:border-[#B8860B]/50 transition-colors text-left">
          <BarChart2 className="w-5 h-5 text-blue-400 mb-3" />
          <div className="font-medium text-white text-sm">Export Results</div>
          <div className="text-xs text-slate-400 mt-1">Download cohort results as CSV</div>
        </button>
        <button className="bg-[#1E3A5F]/20 border border-[#1E3A5F] rounded-xl p-5 hover:border-[#B8860B]/50 transition-colors text-left">
          <CheckSquare className="w-5 h-5 text-green-400 mb-3" />
          <div className="font-medium text-white text-sm">Competency Sign-Off</div>
          <div className="text-xs text-slate-400 mt-1">Record lab competency sign-offs per participant</div>
        </button>
      </div>

      {/* ── Portal Activation Management ─────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Portal Activation Management</h2>
            <p className="text-sm text-slate-400 mt-1">
              Nexara controls which organisations can access this training portal.
              Access is <strong className="text-white">off by default</strong> and must be explicitly
              activated per organisation by Nexara staff.
            </p>
          </div>
          <button className="flex items-center gap-2 bg-[#B8860B] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#D4A017] transition-colors">
            <ShieldCheck className="w-4 h-4" />
            Issue New Key
          </button>
        </div>

        {/* Info banner */}
        <div className="bg-amber-950/10 border border-amber-800/50 rounded-xl p-4 mb-5 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-200/80">
            Activation keys grant full access to the training programme for all participants
            in the named organisation. Only issue keys to organisations with a confirmed
            training enrolment. Revoke immediately if misuse is suspected.
          </p>
        </div>

        <div className="bg-[#091628] border border-[#1E3A5F] rounded-xl overflow-hidden">
          <div className="px-6 py-3 border-b border-[#1E3A5F] bg-[#0d1f38]">
            <div className="grid grid-cols-12 text-xs font-medium text-slate-400 uppercase tracking-wider">
              <span className="col-span-3">Organisation</span>
              <span className="col-span-4">Activation Key</span>
              <span className="col-span-2">Issued</span>
              <span className="col-span-2">Status</span>
              <span className="col-span-1 text-right">Actions</span>
            </div>
          </div>
          <div className="divide-y divide-[#1E3A5F]/50">
            {ACTIVATION_RECORDS.map((rec) => (
              <div key={rec.org} className="px-6 py-4 grid grid-cols-12 items-center text-sm hover:bg-[#1E3A5F]/10 transition-colors">
                <div className="col-span-3">
                  <div className="text-white font-medium">{rec.org}</div>
                  {rec.issuedBy !== '—' && (
                    <div className="text-xs text-slate-500 mt-0.5">by {rec.issuedBy}</div>
                  )}
                </div>
                <div className="col-span-4">
                  {rec.status === 'active' ? (
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-[#B8860B] font-mono bg-[#B8860B]/10 px-2 py-0.5 rounded">
                        {rec.key}
                      </code>
                      <button
                        onClick={() => copyKey(rec.key)}
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                        title="Copy key"
                      >
                        {copied === rec.key ? (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-500 italic text-xs">Pending approval</span>
                  )}
                </div>
                <div className="col-span-2 text-slate-400 text-xs">{rec.issued}</div>
                <div className="col-span-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    rec.status === 'active'
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {rec.status === 'active' ? 'Active' : 'Pending'}
                  </span>
                </div>
                <div className="col-span-1 text-right">
                  {rec.status === 'active' ? (
                    <button
                      onClick={() => handleRevoke(rec.org)}
                      disabled={revoking === rec.org}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors ml-auto disabled:opacity-50"
                      title="Revoke access"
                    >
                      <ShieldOff className="w-3.5 h-3.5" />
                      {revoking === rec.org ? '…' : 'Revoke'}
                    </button>
                  ) : (
                    <button className="text-xs text-[#B8860B] hover:text-[#D4A017] transition-colors">
                      Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-3">
          This portal is a Nexara-managed service. Clients cannot discover or access it
          without a valid activation key issued by Nexara.
        </p>
      </section>
    </main>
  );
}
