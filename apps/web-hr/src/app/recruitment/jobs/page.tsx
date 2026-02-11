'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Modal, ModalFooter, Label, Input, Textarea } from '@ims/ui';
import { Plus, Briefcase, MapPin, Users, Clock, DollarSign, Sparkles } from 'lucide-react';
import { api, aiApi } from '@/lib/api';
import Link from 'next/link';

interface JobPosting {
  id: string;
  jobCode: string;
  title: string;
  location: string;
  isRemote: boolean;
  employmentType: string;
  status: string;
  openings: number;
  filled: number;
  publishDate?: string;
  closeDate?: string;
  salaryMin?: number;
  salaryMax?: number;
  showSalary: boolean;
  department?: { name: string };
  _count?: { applicants: number };
}

interface Department {
  id: string;
  code: string;
  name: string;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  ON_HOLD: 'bg-yellow-100 text-yellow-700',
  CLOSED: 'bg-red-100 text-red-700',
  FILLED: 'bg-blue-100 text-blue-700',
};

const typeColors: Record<string, string> = {
  FULL_TIME: 'bg-emerald-100 text-emerald-700',
  PART_TIME: 'bg-blue-100 text-blue-700',
  CONTRACT: 'bg-purple-100 text-purple-700',
  INTERN: 'bg-pink-100 text-pink-700',
};

const EMPLOYMENT_TYPES = [
  'FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'TEMPORARY',
];

export default function JobPostingsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Create modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Create form fields
  const [formTitle, setFormTitle] = useState('');
  const [formDepartmentId, setFormDepartmentId] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formRequirements, setFormRequirements] = useState('');
  const [formResponsibilities, setFormResponsibilities] = useState('');
  const [formQualifications, setFormQualifications] = useState('');
  const [formEmploymentType, setFormEmploymentType] = useState('FULL_TIME');
  const [formLocation, setFormLocation] = useState('');
  const [formIsRemote, setFormIsRemote] = useState(false);
  const [formSalaryMin, setFormSalaryMin] = useState('');
  const [formSalaryMax, setFormSalaryMax] = useState('');
  const [formSalaryCurrency, setFormSalaryCurrency] = useState('USD');
  const [formShowSalary, setFormShowSalary] = useState(false);
  const [formOpenings, setFormOpenings] = useState('1');
  const [formPublishDate, setFormPublishDate] = useState('');
  const [formCloseDate, setFormCloseDate] = useState('');

  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  useEffect(() => {
    loadJobs();
  }, [statusFilter]);

  async function loadJobs() {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/recruitment/jobs?${params.toString()}`);
      setJobs(res.data.data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function openCreateModal() {
    setCreateError('');
    setFormTitle('');
    setFormDepartmentId('');
    setFormDescription('');
    setFormRequirements('');
    setFormResponsibilities('');
    setFormQualifications('');
    setFormEmploymentType('FULL_TIME');
    setFormLocation('');
    setFormIsRemote(false);
    setFormSalaryMin('');
    setFormSalaryMax('');
    setFormSalaryCurrency('USD');
    setFormShowSalary(false);
    setFormOpenings('1');
    setFormPublishDate('');
    setFormCloseDate('');
    setCreateModalOpen(true);

    try {
      const res = await api.get('/departments');
      setDepartments(res.data.data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
      setCreateError('Failed to load departments. Please try again.');
    }
  }

  async function aiEnhanceJob() {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await aiApi.post('/analyze', {
        type: 'HR_JOB_DESCRIPTION',
        context: {
          title: formTitle,
          department: departments.find(d => d.id === formDepartmentId)?.name,
          employmentType: formEmploymentType,
          location: formLocation,
          description: formDescription,
          requirements: formRequirements,
        },
      });
      setAiResult(res.data.data.result);
    } catch (error: any) {
      const msg = error.response?.data?.error?.message;
      setCreateError(typeof msg === 'string' ? msg : 'AI enhancement failed. Please try again.');
    } finally {
      setAiLoading(false);
    }
  }

  async function handleCreate() {
    if (!formTitle || !formDepartmentId || !formDescription || !formRequirements || !formResponsibilities || !formLocation) {
      setCreateError('Please fill in all required fields.');
      return;
    }

    setCreating(true);
    setCreateError('');

    try {
      const payload: Record<string, unknown> = {
        title: formTitle,
        departmentId: formDepartmentId,
        description: formDescription,
        requirements: formRequirements,
        responsibilities: formResponsibilities,
        employmentType: formEmploymentType,
        location: formLocation,
        isRemote: formIsRemote,
        showSalary: formShowSalary,
        openings: parseInt(formOpenings) || 1,
      };

      if (formQualifications) {
        payload.preferredSkills = formQualifications;
      }
      if (formSalaryMin) {
        payload.salaryMin = parseFloat(formSalaryMin);
      }
      if (formSalaryMax) {
        payload.salaryMax = parseFloat(formSalaryMax);
      }
      if (formCloseDate) {
        payload.closeDate = formCloseDate;
      }

      await api.post('/recruitment/jobs', payload);
      setCreateModalOpen(false);
      loadJobs();
    } catch (error: any) {
      const msg = error.response?.data?.error?.message;
      setCreateError(typeof msg === 'string' ? msg : 'Failed to create job posting.');
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    total: jobs.length,
    published: jobs.filter(j => j.status === 'PUBLISHED').length,
    totalOpenings: jobs.reduce((sum, j) => sum + j.openings, 0),
    totalApplicants: jobs.reduce((sum, j) => sum + (j._count?.applicants || 0), 0),
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
            <p className="text-gray-500 mt-1">Manage open positions</p>
          </div>
          <Button className="flex items-center gap-2" onClick={openCreateModal}>
            <Plus className="h-4 w-4" /> Post New Job
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Postings</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Published</p>
                  <p className="text-2xl font-bold text-green-600">{stats.published}</p>
                </div>
                <Briefcase className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Open Positions</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalOpenings}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Applicants</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalApplicants}</p>
                </div>
                <Users className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="CLOSED">Closed</option>
                <option value="FILLED">Filled</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        <Card>
          <CardHeader>
            <CardTitle>Job Postings</CardTitle>
          </CardHeader>
          <CardContent>
            {jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job) => (
                  <Link key={job.id} href={`/recruitment/jobs/${job.id}`}>
                    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-lg">{job.title}</h3>
                          <p className="text-sm text-gray-500">{job.jobCode}</p>
                        </div>
                        <Badge className={statusColors[job.status] || 'bg-gray-100'}>
                          {job.status}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        {job.department && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Briefcase className="h-4 w-4" />
                            {job.department.name}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                          {job.isRemote && <Badge className="bg-purple-100 text-purple-700 ml-2">Remote</Badge>}
                        </div>
                        {job.showSalary && job.salaryMin && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign className="h-4 w-4" />
                            ${job.salaryMin.toLocaleString()} - ${job.salaryMax?.toLocaleString()}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Badge className={typeColors[job.employmentType] || 'bg-gray-100'}>
                            {job.employmentType.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">
                            {job.filled}/{job.openings} filled
                          </span>
                          <span className="text-blue-600 font-medium">
                            {job._count?.applicants || 0} applicants
                          </span>
                        </div>
                      </div>

                      {job.closeDate && (
                        <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          Closes: {new Date(job.closeDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No job postings found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Job Posting Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Post New Job" size="xl">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {createError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {createError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input
                id="jobTitle"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g., Senior Software Engineer"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="jobDepartment">Department *</Label>
              <select
                id="jobDepartment"
                value={formDepartmentId}
                onChange={(e) => setFormDepartmentId(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm mt-1"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="jobDescription">Description *</Label>
            <Textarea
              id="jobDescription"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Job description..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={aiEnhanceJob}
              disabled={aiLoading || !formTitle}
            >
              <Sparkles className="h-4 w-4" />
              {aiLoading ? 'Enhancing...' : 'AI Enhance'}
            </Button>
            {!formTitle && (
              <span className="text-xs text-gray-400">Enter a job title first</span>
            )}
          </div>

          {aiResult && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-blue-900">AI Suggestions</h4>
                <Button variant="ghost" size="sm" onClick={() => {
                  if (aiResult.description) setFormDescription(aiResult.description);
                  if (aiResult.requirements) setFormRequirements(aiResult.requirements.join('\n• '));
                  if (aiResult.responsibilities) setFormResponsibilities(aiResult.responsibilities.join('\n• '));
                  if (aiResult.qualifications) setFormQualifications(aiResult.qualifications.join('\n• '));
                  setAiResult(null);
                }}>Apply All</Button>
              </div>
              {aiResult.description && (
                <div>
                  <p className="text-sm font-medium text-blue-800">Enhanced Description:</p>
                  <p className="text-sm text-blue-700 mt-1">{aiResult.description.substring(0, 200)}...</p>
                </div>
              )}
              {aiResult.skills?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-blue-800">Suggested Skills:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {aiResult.skills.map((s: string, i: number) => (
                      <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="jobRequirements">Requirements *</Label>
            <Textarea
              id="jobRequirements"
              value={formRequirements}
              onChange={(e) => setFormRequirements(e.target.value)}
              placeholder="Job requirements..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="jobResponsibilities">Responsibilities *</Label>
            <Textarea
              id="jobResponsibilities"
              value={formResponsibilities}
              onChange={(e) => setFormResponsibilities(e.target.value)}
              placeholder="Job responsibilities..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="jobQualifications">Preferred Qualifications</Label>
            <Textarea
              id="jobQualifications"
              value={formQualifications}
              onChange={(e) => setFormQualifications(e.target.value)}
              placeholder="Preferred qualifications and skills..."
              rows={2}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jobEmploymentType">Employment Type *</Label>
              <select
                id="jobEmploymentType"
                value={formEmploymentType}
                onChange={(e) => setFormEmploymentType(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm mt-1"
              >
                {EMPLOYMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="jobLocation">Location *</Label>
              <Input
                id="jobLocation"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="e.g., New York, NY"
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="jobIsRemote"
                checked={formIsRemote}
                onChange={(e) => setFormIsRemote(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="jobIsRemote">Remote Position</Label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="jobShowSalary"
                checked={formShowSalary}
                onChange={(e) => setFormShowSalary(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="jobShowSalary">Show Salary</Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="jobSalaryMin">Salary Min</Label>
              <Input
                id="jobSalaryMin"
                type="number"
                value={formSalaryMin}
                onChange={(e) => setFormSalaryMin(e.target.value)}
                placeholder="e.g., 50000"
                min="0"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="jobSalaryMax">Salary Max</Label>
              <Input
                id="jobSalaryMax"
                type="number"
                value={formSalaryMax}
                onChange={(e) => setFormSalaryMax(e.target.value)}
                placeholder="e.g., 80000"
                min="0"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="jobSalaryCurrency">Currency</Label>
              <Input
                id="jobSalaryCurrency"
                value={formSalaryCurrency}
                onChange={(e) => setFormSalaryCurrency(e.target.value)}
                placeholder="USD"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="jobOpenings">Number of Openings</Label>
              <Input
                id="jobOpenings"
                type="number"
                value={formOpenings}
                onChange={(e) => setFormOpenings(e.target.value)}
                min="1"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="jobPublishDate">Publish Date</Label>
              <Input
                id="jobPublishDate"
                type="date"
                value={formPublishDate}
                onChange={(e) => setFormPublishDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="jobCloseDate">Close Date</Label>
              <Input
                id="jobCloseDate"
                type="date"
                value={formCloseDate}
                onChange={(e) => setFormCloseDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? 'Creating...' : 'Create Job Posting'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
