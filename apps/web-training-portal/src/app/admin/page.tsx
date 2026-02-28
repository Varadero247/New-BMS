'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, Award, BarChart2, CheckSquare } from 'lucide-react';

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

export default function AdminPage() {
  const [cohort] = useState('NEXARA-2026-02-28');

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
    </main>
  );
}
