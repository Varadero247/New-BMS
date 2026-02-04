'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@ims/ui';
import { Plus, Briefcase, MapPin, Users, Clock, DollarSign } from 'lucide-react';
import { api } from '@/lib/api';
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

export default function JobPostingsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

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
          <Link href="/recruitment/jobs/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Post New Job
            </Button>
          </Link>
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
    </div>
  );
}
