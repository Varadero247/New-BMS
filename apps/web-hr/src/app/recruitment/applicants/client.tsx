'use client';

import { useState, useMemo } from 'react';
import { Search, User, Star, Mail, Phone, Calendar, ChevronDown, ChevronRight, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  stage: 'applied' | 'screening' | 'interview-1' | 'interview-2' | 'offer' | 'hired' | 'rejected';
  rating: number;
  appliedDate: string;
  source: string;
  experience: string;
  notes: string;
}

const applicants: Applicant[] = [
  { id: '1', name: 'Alex Thompson', email: 'alex.t@email.com', phone: '+44 7700 900001', position: 'Senior Quality Engineer', stage: 'interview-2', rating: 4, appliedDate: '2026-01-22', source: 'LinkedIn', experience: '7 years in medical device quality, ISO 13485 Lead Auditor', notes: 'Strong technical background. Second interview scheduled with Dr. Chen.' },
  { id: '2', name: 'Priya Sharma', email: 'priya.s@email.com', phone: '+44 7700 900002', position: 'Senior Quality Engineer', stage: 'offer', rating: 5, appliedDate: '2026-01-25', source: 'Referral', experience: '9 years quality engineering, CAPA expertise, Six Sigma Black Belt', notes: 'Excellent candidate. Verbal offer accepted, written offer pending.' },
  { id: '3', name: 'Marcus Johnson', email: 'marcus.j@email.com', phone: '+44 7700 900003', position: 'Software Developer — IMS Platform', stage: 'interview-1', rating: 4, appliedDate: '2026-02-06', source: 'Indeed', experience: '6 years full-stack, React/Next.js specialist, PostgreSQL', notes: 'Portfolio review impressive. Technical test scores: 92%.' },
  { id: '4', name: 'Emma O\'Brien', email: 'emma.ob@email.com', phone: '+44 7700 900004', position: 'EHS Coordinator', stage: 'screening', rating: 3, appliedDate: '2026-02-03', source: 'Website', experience: '4 years EHS, NEBOSH General Certificate, ISO 14001 experience', notes: 'Meets minimum requirements. Phone screen scheduled.' },
  { id: '5', name: 'David Lee', email: 'david.l@email.com', phone: '+44 7700 900005', position: 'Software Developer — IMS Platform', stage: 'rejected', rating: 2, appliedDate: '2026-02-07', source: 'LinkedIn', experience: '3 years frontend only, no backend experience', notes: 'Insufficient backend experience for the role.' },
  { id: '6', name: 'Fatima Al-Hassan', email: 'fatima.ah@email.com', phone: '+44 7700 900006', position: 'Information Security Analyst', stage: 'applied', rating: 0, appliedDate: '2026-02-11', source: 'Website', experience: 'CISSP certified, 5 years SOC analyst, ISO 27001 experience', notes: 'New application — awaiting initial review.' },
  { id: '7', name: 'Tom Roberts', email: 'tom.r@email.com', phone: '+44 7700 900007', position: 'Software Developer — IMS Platform', stage: 'interview-2', rating: 5, appliedDate: '2026-02-06', source: 'GitHub', experience: '8 years full-stack, contributed to open-source IMS tools, TypeScript expert', notes: 'Outstanding technical skills. Culture fit interview with team lead.' },
  { id: '8', name: 'Sarah Mitchell', email: 'sarah.m@email.com', phone: '+44 7700 900008', position: 'Supply Chain Intern', stage: 'hired', rating: 4, appliedDate: '2026-02-10', source: 'University', experience: 'Final year Supply Chain BSc, placement at Medtronic', notes: 'Start date: 2026-03-03. Induction scheduled.' },
];

const stageConfig: Record<string, { label: string; color: string; step: number }> = {
  applied: { label: 'Applied', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600', step: 1 },
  screening: { label: 'Screening', color: 'bg-blue-100 text-blue-700', step: 2 },
  'interview-1': { label: 'Interview 1', color: 'bg-indigo-100 text-indigo-700', step: 3 },
  'interview-2': { label: 'Interview 2', color: 'bg-purple-100 text-purple-700', step: 4 },
  offer: { label: 'Offer', color: 'bg-amber-100 text-amber-700', step: 5 },
  hired: { label: 'Hired', color: 'bg-emerald-100 text-emerald-700', step: 6 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-600', step: 0 },
};

const stages = ['Applied', 'Screening', 'Interview 1', 'Interview 2', 'Offer', 'Hired'];

export default function ApplicantsClient() {
  const [search, setSearch] = useState('');
  const [filterPosition, setFilterPosition] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const positions = [...new Set(applicants.map((a) => a.position))];
  const activeApplicants = applicants.filter((a) => a.stage !== 'rejected' && a.stage !== 'hired').length;

  const filtered = useMemo(() => {
    return applicants.filter((a) => {
      const matchesSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.position.toLowerCase().includes(search.toLowerCase());
      const matchesPosition = filterPosition === 'all' || a.position === filterPosition;
      const matchesStage = filterStage === 'all' || a.stage === filterStage;
      return matchesSearch && matchesPosition && matchesStage;
    });
  }, [search, filterPosition, filterStage]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Applicant Tracking</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Recruitment pipeline and candidate management</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Total Applicants</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{applicants.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Active Pipeline</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{activeApplicants}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Hired</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{applicants.filter((a) => a.stage === 'hired').length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Positions</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{positions.length}</p>
        </div>
      </div>

      {/* Pipeline funnel */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Pipeline Stages</p>
        <div className="flex items-center gap-1">
          {stages.map((stage, i) => {
            const stageKey = Object.keys(stageConfig).find((k) => stageConfig[k].label === stage) || '';
            const count = applicants.filter((a) => a.stage === stageKey).length;
            return (
              <div key={stage} className="flex-1 text-center">
                <div className={`h-8 rounded flex items-center justify-center text-xs font-bold text-white ${count > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  {count}
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{stage}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input type="text" placeholder="Search applicants..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <select value={filterPosition} onChange={(e) => setFilterPosition(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="all">All Positions</option>
          {positions.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="all">All Stages</option>
          {Object.entries(stageConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map((applicant) => {
          const sc = stageConfig[applicant.stage];
          const isExpanded = expandedId === applicant.id;
          return (
            <div key={applicant.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <button onClick={() => setExpandedId(isExpanded ? null : applicant.id)} className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{applicant.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{applicant.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-3 w-3 ${s <= applicant.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>{sc.label}</span>
                  </div>
                </div>
              </button>
              {isExpanded && (
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 ml-12 space-y-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="flex items-center gap-1"><Mail className="h-3 w-3 text-gray-400 dark:text-gray-500" />{applicant.email}</div>
                    <div className="flex items-center gap-1"><Phone className="h-3 w-3 text-gray-400 dark:text-gray-500" />{applicant.phone}</div>
                    <div className="flex items-center gap-1"><Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500" />Applied: {applicant.appliedDate}</div>
                    <div><span className="text-gray-500 dark:text-gray-400">Source:</span> <span className="font-medium">{applicant.source}</span></div>
                  </div>
                  <div className="text-xs"><span className="text-gray-500 dark:text-gray-400">Experience:</span> <span className="text-gray-700 dark:text-gray-300">{applicant.experience}</span></div>
                  <div className="text-xs"><span className="text-gray-500 dark:text-gray-400">Notes:</span> <span className="text-gray-700 dark:text-gray-300">{applicant.notes}</span></div>
                  {/* Pipeline progress */}
                  {applicant.stage !== 'rejected' && (
                    <div className="flex items-center gap-0.5 mt-1">
                      {stages.map((s, i) => (
                        <div key={s} className="flex-1">
                          <div className={`h-1.5 rounded-full ${i + 1 <= sc.step ? 'bg-blue-500' : 'bg-gray-200'}`} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
