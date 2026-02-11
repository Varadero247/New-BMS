'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Modal, ModalFooter } from '@ims/ui';
import {
  Plus, Users, UserPlus, Search, Briefcase, Mail, Phone, MapPin,
  Clock, Star, Edit2, ExternalLink, Building2,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Job {
  id: string;
  title: string;
  jobCode: string;
  status: string;
}

interface Applicant {
  id: string;
  applicantNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  coverLetter?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  source: string;
  referredBy?: string;
  currentCompany?: string;
  currentTitle?: string;
  yearsExperience?: number;
  noticePeriod?: number;
  expectedSalary?: number;
  status: string;
  stage: string;
  createdAt: string;
  jobPosting: {
    title: string;
    jobCode: string;
  };
  _count?: {
    interviews: number;
    evaluations: number;
  };
}

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  SCREENING: 'bg-purple-100 text-purple-700',
  SHORTLISTED: 'bg-indigo-100 text-indigo-700',
  INTERVIEWING: 'bg-yellow-100 text-yellow-700',
  OFFER: 'bg-emerald-100 text-emerald-700',
  HIRED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-gray-100 text-gray-700',
};

const statusLabels: Record<string, string> = {
  NEW: 'New',
  SCREENING: 'Screening',
  SHORTLISTED: 'Shortlisted',
  INTERVIEWING: 'Interviewing',
  OFFER: 'Offered',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

const sourceLabels: Record<string, string> = {
  WEBSITE: 'Website',
  LINKEDIN: 'LinkedIn',
  INDEED: 'Indeed',
  GLASSDOOR: 'Glassdoor',
  REFERRAL: 'Referral',
  AGENCY: 'Agency',
  CAMPUS: 'Campus',
  INTERNAL: 'Internal',
  OTHER: 'Other',
};

const sourceColors: Record<string, string> = {
  WEBSITE: 'bg-blue-100 text-blue-700',
  LINKEDIN: 'bg-sky-100 text-sky-700',
  INDEED: 'bg-purple-100 text-purple-700',
  GLASSDOOR: 'bg-green-100 text-green-700',
  REFERRAL: 'bg-orange-100 text-orange-700',
  AGENCY: 'bg-pink-100 text-pink-700',
  CAMPUS: 'bg-teal-100 text-teal-700',
  INTERNAL: 'bg-emerald-100 text-emerald-700',
  OTHER: 'bg-gray-100 text-gray-700',
};

const APPLICANT_STATUSES = ['NEW', 'SCREENING', 'SHORTLISTED', 'INTERVIEWING', 'OFFER', 'HIRED', 'REJECTED', 'WITHDRAWN'];

const APPLICANT_STAGES = [
  'APPLICATION', 'SCREENING', 'PHONE_INTERVIEW', 'TECHNICAL_ROUND',
  'HR_ROUND', 'FINAL_ROUND', 'OFFER', 'BACKGROUND_CHECK', 'ONBOARDING',
];

const SOURCES = ['WEBSITE', 'LINKEDIN', 'INDEED', 'GLASSDOOR', 'REFERRAL', 'AGENCY', 'CAMPUS', 'INTERNAL', 'OTHER'];

function formatStage(stage: string): string {
  return stage.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Create modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formJobPostingId, setFormJobPostingId] = useState('');
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formResumeUrl, setFormResumeUrl] = useState('');
  const [formLinkedinUrl, setFormLinkedinUrl] = useState('');
  const [formCoverLetter, setFormCoverLetter] = useState('');
  const [formSource, setFormSource] = useState('');
  const [formReferredBy, setFormReferredBy] = useState('');
  const [formCurrentCompany, setFormCurrentCompany] = useState('');
  const [formCurrentTitle, setFormCurrentTitle] = useState('');
  const [formYearsExperience, setFormYearsExperience] = useState('');
  const [formExpectedSalary, setFormExpectedSalary] = useState('');
  const [formNoticePeriod, setFormNoticePeriod] = useState('');

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editApplicant, setEditApplicant] = useState<Applicant | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editStage, setEditStage] = useState('');
  const [editRejectionReason, setEditRejectionReason] = useState('');

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  async function loadData() {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const [applicantsRes, jobsRes] = await Promise.all([
        api.get(`/recruitment/applicants?${params.toString()}`),
        api.get('/recruitment/jobs'),
      ]);
      setApplicants(applicantsRes.data.data || []);
      setJobs(jobsRes.data.data || []);
    } catch (error) {
      console.error('Error loading applicants:', error);
    } finally {
      setLoading(false);
    }
  }

  function resetCreateForm() {
    setFormJobPostingId('');
    setFormFirstName('');
    setFormLastName('');
    setFormEmail('');
    setFormPhone('');
    setFormResumeUrl('');
    setFormLinkedinUrl('');
    setFormCoverLetter('');
    setFormSource('');
    setFormReferredBy('');
    setFormCurrentCompany('');
    setFormCurrentTitle('');
    setFormYearsExperience('');
    setFormExpectedSalary('');
    setFormNoticePeriod('');
  }

  async function handleCreate() {
    if (!formJobPostingId || !formFirstName || !formLastName || !formEmail || !formSource) return;
    setCreating(true);
    try {
      const payload: Record<string, unknown> = {
        jobPostingId: formJobPostingId,
        firstName: formFirstName,
        lastName: formLastName,
        email: formEmail,
        source: formSource,
      };
      if (formPhone) payload.phone = formPhone;
      if (formResumeUrl) payload.resumeUrl = formResumeUrl;
      if (formLinkedinUrl) payload.linkedinUrl = formLinkedinUrl;
      if (formCoverLetter) payload.coverLetter = formCoverLetter;
      if (formReferredBy) payload.referredBy = formReferredBy;
      if (formCurrentCompany) payload.currentCompany = formCurrentCompany;
      if (formCurrentTitle) payload.currentTitle = formCurrentTitle;
      if (formYearsExperience) payload.yearsExperience = parseFloat(formYearsExperience);
      if (formExpectedSalary) payload.expectedSalary = parseFloat(formExpectedSalary);
      if (formNoticePeriod) payload.noticePeriod = parseInt(formNoticePeriod, 10);

      await api.post('/recruitment/applicants', payload);
      setCreateModalOpen(false);
      resetCreateForm();
      setLoading(true);
      await loadData();
    } catch (error) {
      console.error('Error creating applicant:', error);
    } finally {
      setCreating(false);
    }
  }

  function openEditModal(applicant: Applicant) {
    setEditApplicant(applicant);
    setEditStatus(applicant.status);
    setEditStage(applicant.stage);
    setEditRejectionReason('');
    setEditModalOpen(true);
  }

  async function handleEdit() {
    if (!editApplicant) return;
    setEditing(true);
    try {
      const payload: Record<string, unknown> = {
        status: editStatus,
      };
      if (editStage) payload.stage = editStage;
      if (editStatus === 'REJECTED' && editRejectionReason) {
        payload.rejectionReason = editRejectionReason;
      }

      await api.put(`/recruitment/applicants/${editApplicant.id}/status`, payload);
      setEditModalOpen(false);
      setEditApplicant(null);
      setLoading(true);
      await loadData();
    } catch (error) {
      console.error('Error updating applicant:', error);
    } finally {
      setEditing(false);
    }
  }

  // Filter by search
  const filteredApplicants = applicants.filter((app) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      app.firstName.toLowerCase().includes(term) ||
      app.lastName.toLowerCase().includes(term) ||
      app.email.toLowerCase().includes(term) ||
      app.applicantNumber.toLowerCase().includes(term) ||
      app.jobPosting.title.toLowerCase().includes(term) ||
      (app.currentCompany && app.currentCompany.toLowerCase().includes(term))
    );
  });

  // Pipeline counts
  const pipelineCounts: Record<string, number> = {};
  APPLICANT_STATUSES.forEach((s) => {
    pipelineCounts[s] = applicants.filter((a) => a.status === s).length;
  });

  // Stats
  const totalApplicants = applicants.length;
  const newApplicants = pipelineCounts['NEW'] || 0;
  const shortlistedApplicants = pipelineCounts['SHORTLISTED'] || 0;
  const interviewingApplicants = pipelineCounts['INTERVIEWING'] || 0;

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Applicants</h1>
            <p className="text-gray-500 mt-1">Manage job applicants and recruitment pipeline</p>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4" /> Add Applicant
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Applicants</p>
                  <p className="text-2xl font-bold">{totalApplicants}</p>
                </div>
                <Users className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">New</p>
                  <p className="text-2xl font-bold text-blue-600">{newApplicants}</p>
                </div>
                <UserPlus className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Shortlisted</p>
                  <p className="text-2xl font-bold text-indigo-600">{shortlistedApplicants}</p>
                </div>
                <Star className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Interviewing</p>
                  <p className="text-2xl font-bold text-yellow-600">{interviewingApplicants}</p>
                </div>
                <Briefcase className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Status Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Recruitment Pipeline</h3>
            <div className="flex flex-wrap gap-3">
              {APPLICANT_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    statusFilter === s
                      ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    statusColors[s]?.split(' ')[0] || 'bg-gray-300'
                  }`} />
                  <span>{statusLabels[s] || s}</span>
                  <span className="font-bold">{pipelineCounts[s] || 0}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search applicants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                {APPLICANT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s] || s}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Applicants List */}
        <Card>
          <CardHeader>
            <CardTitle>Applicants ({filteredApplicants.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredApplicants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredApplicants.map((applicant) => (
                  <div
                    key={applicant.id}
                    className="p-4 border rounded-lg transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-emerald-700">
                            {applicant.firstName[0]}{applicant.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {applicant.firstName} {applicant.lastName}
                          </h3>
                          <p className="text-xs text-gray-500">{applicant.applicantNumber}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => openEditModal(applicant)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Update status"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-2 text-sm mb-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{applicant.email}</span>
                      </div>
                      {applicant.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{applicant.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Briefcase className="h-4 w-4" />
                        <span className="truncate">{applicant.jobPosting.title}</span>
                        <span className="text-gray-400">({applicant.jobPosting.jobCode})</span>
                      </div>
                      {applicant.currentCompany && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Building2 className="h-4 w-4" />
                          <span>
                            {applicant.currentTitle && `${applicant.currentTitle} at `}
                            {applicant.currentCompany}
                          </span>
                        </div>
                      )}
                      {applicant.yearsExperience !== undefined && applicant.yearsExperience !== null && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{applicant.yearsExperience} years experience</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>Applied {new Date(applicant.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={statusColors[applicant.status] || 'bg-gray-100 text-gray-700'}>
                        {statusLabels[applicant.status] || applicant.status}
                      </Badge>
                      <Badge className={sourceColors[applicant.source] || 'bg-gray-100 text-gray-700'}>
                        {sourceLabels[applicant.source] || applicant.source}
                      </Badge>
                      {applicant.resumeUrl && (
                        <a
                          href={applicant.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-xs"
                        >
                          <ExternalLink className="h-3 w-3" /> Resume
                        </a>
                      )}
                    </div>

                    {applicant._count && (applicant._count.interviews > 0 || applicant._count.evaluations > 0) && (
                      <div className="mt-3 pt-3 border-t text-xs text-gray-500 flex gap-4">
                        {applicant._count.interviews > 0 && (
                          <span>{applicant._count.interviews} interview(s)</span>
                        )}
                        {applicant._count.evaluations > 0 && (
                          <span>{applicant._count.evaluations} evaluation(s)</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No applicants found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Applicant Modal */}
        <Modal
          isOpen={createModalOpen}
          onClose={() => {
            setCreateModalOpen(false);
            resetCreateForm();
          }}
          title="Add Applicant"
          size="lg"
        >
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Position *</label>
              <select
                value={formJobPostingId}
                onChange={(e) => setFormJobPostingId(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select job position...</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} ({job.jobCode})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  value={formFirstName}
                  onChange={(e) => setFormFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={formLastName}
                  onChange={(e) => setFormLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source *</label>
              <select
                value={formSource}
                onChange={(e) => setFormSource(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select source...</option>
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {sourceLabels[s] || s}
                  </option>
                ))}
              </select>
            </div>
            {formSource === 'REFERRAL' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referred By</label>
                <input
                  type="text"
                  value={formReferredBy}
                  onChange={(e) => setFormReferredBy(e.target.value)}
                  placeholder="Name of referrer"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resume URL</label>
                <input
                  type="text"
                  value={formResumeUrl}
                  onChange={(e) => setFormResumeUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  value={formLinkedinUrl}
                  onChange={(e) => setFormLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
              <textarea
                value={formCoverLetter}
                onChange={(e) => setFormCoverLetter(e.target.value)}
                placeholder="Cover letter or introduction..."
                rows={3}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Company</label>
                <input
                  type="text"
                  value={formCurrentCompany}
                  onChange={(e) => setFormCurrentCompany(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Position</label>
                <input
                  type="text"
                  value={formCurrentTitle}
                  onChange={(e) => setFormCurrentTitle(e.target.value)}
                  placeholder="e.g. Senior Developer"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                <input
                  type="number"
                  value={formYearsExperience}
                  onChange={(e) => setFormYearsExperience(e.target.value)}
                  placeholder="e.g. 5"
                  min="0"
                  step="0.5"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Salary</label>
                <input
                  type="number"
                  value={formExpectedSalary}
                  onChange={(e) => setFormExpectedSalary(e.target.value)}
                  placeholder="e.g. 75000"
                  min="0"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notice Period (days)</label>
                <input
                  type="number"
                  value={formNoticePeriod}
                  onChange={(e) => setFormNoticePeriod(e.target.value)}
                  placeholder="e.g. 30"
                  min="0"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateModalOpen(false);
                resetCreateForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !formJobPostingId || !formFirstName || !formLastName || !formEmail || !formSource}
            >
              {creating ? 'Creating...' : 'Add Applicant'}
            </Button>
          </ModalFooter>
        </Modal>

        {/* Edit Applicant Status Modal */}
        <Modal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditApplicant(null);
          }}
          title="Update Applicant Status"
          size="md"
        >
          {editApplicant && (
            <>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">
                    {editApplicant.firstName} {editApplicant.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {editApplicant.applicantNumber} - {editApplicant.jobPosting.title}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {APPLICANT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {statusLabels[s] || s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                  <select
                    value={editStage}
                    onChange={(e) => setEditStage(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {APPLICANT_STAGES.map((s) => (
                      <option key={s} value={s}>
                        {formatStage(s)}
                      </option>
                    ))}
                  </select>
                </div>
                {editStatus === 'REJECTED' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
                    <textarea
                      value={editRejectionReason}
                      onChange={(e) => setEditRejectionReason(e.target.value)}
                      placeholder="Reason for rejection..."
                      rows={3}
                      className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>
              <ModalFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditApplicant(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleEdit} disabled={editing}>
                  {editing ? 'Saving...' : 'Update Status'}
                </Button>
              </ModalFooter>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
}
