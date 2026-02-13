'use client';

import { useState, useMemo } from 'react';
import { Search, Briefcase, MapPin, Clock, Users, Eye, ChevronDown, ChevronRight } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  status: 'open' | 'closed' | 'on-hold' | 'draft';
  salary: string;
  postedDate: string;
  closingDate: string;
  applicants: number;
  hiringManager: string;
  description: string;
  requirements: string[];
}

const jobs: Job[] = [
  { id: '1', title: 'Senior Quality Engineer', department: 'Quality', location: 'Manchester, UK', type: 'full-time', status: 'open', salary: '£55,000 - £65,000', postedDate: '2026-01-20', closingDate: '2026-03-01', applicants: 18, hiringManager: 'Dr. Sarah Chen', description: 'Lead quality initiatives including CAPA management, process validation, and ISO 13485 compliance for medical device manufacturing.', requirements: ['BSc in Engineering or related field', '5+ years quality experience in medical devices', 'ISO 13485 / FDA 21 CFR 820 knowledge', 'Lead Auditor qualification preferred'] },
  { id: '2', title: 'EHS Coordinator', department: 'Health & Safety', location: 'London, UK', type: 'full-time', status: 'open', salary: '£40,000 - £48,000', postedDate: '2026-02-01', closingDate: '2026-03-15', applicants: 12, hiringManager: 'James Wilson', description: 'Coordinate environmental, health, and safety programs across multiple sites. Support ISO 14001 and ISO 45001 management systems.', requirements: ['NEBOSH Certificate', '3+ years EHS experience', 'ISO 14001/45001 knowledge', 'Strong communication skills'] },
  { id: '3', title: 'Software Developer — IMS Platform', department: 'IT', location: 'Remote, UK', type: 'full-time', status: 'open', salary: '£60,000 - £75,000', postedDate: '2026-02-05', closingDate: '2026-03-20', applicants: 34, hiringManager: 'Michael Zhang', description: 'Develop and maintain the Integrated Management System platform. Full-stack role with React/Next.js frontend and Node.js backend.', requirements: ['5+ years full-stack development', 'React/Next.js proficiency', 'Node.js/Express experience', 'PostgreSQL/Prisma ORM'] },
  { id: '4', title: 'Information Security Analyst', department: 'InfoSec', location: 'Manchester, UK', type: 'full-time', status: 'on-hold', salary: '£45,000 - £55,000', postedDate: '2026-01-15', closingDate: '2026-02-28', applicants: 22, hiringManager: 'CISO', description: 'Support the ISO 27001 ISMS programme. Conduct risk assessments, manage vulnerability scanning, and support incident response.', requirements: ['CompTIA Security+ or CISSP', '3+ years infosec experience', 'ISO 27001 framework knowledge', 'SIEM and vulnerability management tools'] },
  { id: '5', title: 'Supply Chain Intern', department: 'Operations', location: 'London, UK', type: 'internship', status: 'open', salary: '£22,000 pro rata', postedDate: '2026-02-10', closingDate: '2026-04-01', applicants: 8, hiringManager: 'Lisa Park', description: '6-month internship supporting supply chain operations, supplier quality management, and inventory control.', requirements: ['Studying Supply Chain, Engineering, or Business', 'Strong analytical skills', 'Proficiency in Excel', 'Interest in manufacturing'] },
  { id: '6', title: 'Regulatory Affairs Manager', department: 'Regulatory', location: 'London, UK', type: 'full-time', status: 'closed', salary: '£70,000 - £85,000', postedDate: '2025-12-01', closingDate: '2026-01-31', applicants: 15, hiringManager: 'Dr. Sarah Chen', description: 'Lead regulatory submissions for medical devices. Manage CE marking, FDA 510(k), and international registrations.', requirements: ['MSc in Regulatory Science or related', '8+ years regulatory affairs', 'MDR/IVDR experience', 'FDA submission experience'] },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: 'Open', color: 'bg-emerald-100 text-emerald-700' },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-600' },
  'on-hold': { label: 'On Hold', color: 'bg-amber-100 text-amber-700' },
  draft: { label: 'Draft', color: 'bg-blue-100 text-blue-700' },
};

const typeConfig: Record<string, { label: string; color: string }> = {
  'full-time': { label: 'Full-time', color: 'bg-blue-50 text-blue-600' },
  'part-time': { label: 'Part-time', color: 'bg-purple-50 text-purple-600' },
  contract: { label: 'Contract', color: 'bg-orange-50 text-orange-600' },
  internship: { label: 'Internship', color: 'bg-teal-50 text-teal-600' },
};

export default function JobPostingsClient() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const openJobs = jobs.filter((j) => j.status === 'open').length;
  const totalApplicants = jobs.reduce((s, j) => s + j.applicants, 0);

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      const matchesSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.department.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'all' || j.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [search, filterStatus]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
        <p className="text-sm text-gray-500 mt-1">Active vacancies and recruitment pipeline</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase font-medium">Total Postings</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{jobs.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase font-medium">Open Positions</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{openJobs}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase font-medium">Total Applicants</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{totalApplicants}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase font-medium">Avg per Posting</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{Math.round(totalApplicants / jobs.length)}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="all">All Statuses</option>
          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((job) => {
          const sc = statusConfig[job.status];
          const tc = typeConfig[job.type];
          const isExpanded = expandedId === job.id;
          return (
            <div key={job.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setExpandedId(isExpanded ? null : job.id)} className="w-full text-left px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                    <Briefcase className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{job.title}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                        <span>{job.department}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${tc.color}`}>{tc.label}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-gray-500"><Users className="h-3 w-3" />{job.applicants}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>{sc.label}</span>
                  </div>
                </div>
              </button>
              {isExpanded && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 ml-12 space-y-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div><span className="text-gray-500">Salary:</span> <span className="font-medium">{job.salary}</span></div>
                    <div><span className="text-gray-500">Posted:</span> <span className="font-medium">{job.postedDate}</span></div>
                    <div><span className="text-gray-500">Closing:</span> <span className="font-medium">{job.closingDate}</span></div>
                    <div><span className="text-gray-500">Hiring Mgr:</span> <span className="font-medium">{job.hiringManager}</span></div>
                  </div>
                  <p className="text-xs text-gray-700">{job.description}</p>
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Requirements:</p>
                    <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
                      {job.requirements.map((r) => <li key={r}>{r}</li>)}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
