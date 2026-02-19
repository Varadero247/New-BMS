'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@ims/ui';
import { MapPin, User, Wrench, Navigation } from 'lucide-react';

type JobStatus = 'Scheduled' | 'En Route' | 'On Site' | 'Completed' | 'Cancelled';
type JobPriority = 'Emergency' | 'High' | 'Medium' | 'Low';

interface Job {
  id: string;
  title: string;
  customer: string;
  site: string;
  status: JobStatus;
  priority: JobPriority;
  technician: string;
  scheduledDate: string;
  estimatedHours: number;
  // Grid positions for visualization (x: 0-100, y: 0-100)
  x: number;
  y: number;
  region: string;
}

interface Technician {
  id: string;
  name: string;
  status: 'Available' | 'On Job' | 'En Route' | 'Off Duty';
  currentJobId?: string;
  x: number;
  y: number;
  jobsCompleted: number;
  hoursWorked: number;
}

const MOCK_JOBS: Job[] = [
  {
    id: 'JOB-001',
    title: 'HVAC Quarterly Service',
    customer: 'ABC Manufacturing',
    site: 'Unit 5, Industrial Park',
    status: 'On Site',
    priority: 'Medium',
    technician: 'T. Harrison',
    scheduledDate: '2026-02-13',
    estimatedHours: 3,
    x: 25,
    y: 30,
    region: 'North',
  },
  {
    id: 'JOB-002',
    title: 'Emergency Generator Repair',
    customer: 'City Hospital',
    site: '100 High Street',
    status: 'En Route',
    priority: 'Emergency',
    technician: 'M. Chen',
    scheduledDate: '2026-02-13',
    estimatedHours: 4,
    x: 55,
    y: 20,
    region: 'Central',
  },
  {
    id: 'JOB-003',
    title: 'Fire Alarm Annual Inspection',
    customer: 'Retail Park Ltd',
    site: 'Retail Park, Zone B',
    status: 'Scheduled',
    priority: 'High',
    technician: 'S. Patel',
    scheduledDate: '2026-02-13',
    estimatedHours: 2,
    x: 70,
    y: 45,
    region: 'East',
  },
  {
    id: 'JOB-004',
    title: 'Lift Maintenance Service',
    customer: 'Central Tower Office',
    site: '25 Queen Street',
    status: 'Completed',
    priority: 'Medium',
    technician: 'T. Harrison',
    scheduledDate: '2026-02-13',
    estimatedHours: 2,
    x: 45,
    y: 55,
    region: 'Central',
  },
  {
    id: 'JOB-005',
    title: 'Plumbing Emergency',
    customer: 'Green Park School',
    site: 'Green Park Road',
    status: 'Scheduled',
    priority: 'Emergency',
    technician: 'A. Williams',
    scheduledDate: '2026-02-13',
    estimatedHours: 2,
    x: 15,
    y: 65,
    region: 'West',
  },
  {
    id: 'JOB-006',
    title: 'Electrical Panel Upgrade',
    customer: 'DataSys Ltd',
    site: 'Tech Campus, Building 3',
    status: 'On Site',
    priority: 'High',
    technician: 'R. Brown',
    scheduledDate: '2026-02-13',
    estimatedHours: 6,
    x: 80,
    y: 25,
    region: 'East',
  },
  {
    id: 'JOB-007',
    title: 'AC Unit Replacement',
    customer: 'Sunset Hotel',
    site: '45 Beach Road',
    status: 'Scheduled',
    priority: 'Medium',
    technician: 'S. Patel',
    scheduledDate: '2026-02-14',
    estimatedHours: 5,
    x: 35,
    y: 80,
    region: 'South',
  },
  {
    id: 'JOB-008',
    title: 'Security System Check',
    customer: 'Metro Bank',
    site: '10 Market Square',
    status: 'Completed',
    priority: 'Low',
    technician: 'M. Chen',
    scheduledDate: '2026-02-12',
    estimatedHours: 1.5,
    x: 50,
    y: 40,
    region: 'Central',
  },
  {
    id: 'JOB-009',
    title: 'Boiler Service',
    customer: 'Riverside Apartments',
    site: 'Riverside Drive',
    status: 'Scheduled',
    priority: 'Medium',
    technician: 'A. Williams',
    scheduledDate: '2026-02-14',
    estimatedHours: 3,
    x: 60,
    y: 70,
    region: 'South',
  },
  {
    id: 'JOB-010',
    title: 'Compressor Rebuild',
    customer: 'Northern Industries',
    site: 'Industrial Estate North',
    status: 'En Route',
    priority: 'High',
    technician: 'R. Brown',
    scheduledDate: '2026-02-13',
    estimatedHours: 8,
    x: 30,
    y: 15,
    region: 'North',
  },
];

const MOCK_TECHS: Technician[] = [
  {
    id: 'T1',
    name: 'T. Harrison',
    status: 'On Job',
    currentJobId: 'JOB-001',
    x: 25,
    y: 30,
    jobsCompleted: 3,
    hoursWorked: 6.5,
  },
  {
    id: 'T2',
    name: 'M. Chen',
    status: 'En Route',
    currentJobId: 'JOB-002',
    x: 48,
    y: 25,
    jobsCompleted: 2,
    hoursWorked: 4.0,
  },
  {
    id: 'T3',
    name: 'S. Patel',
    status: 'Available',
    x: 65,
    y: 50,
    jobsCompleted: 1,
    hoursWorked: 2.0,
  },
  {
    id: 'T4',
    name: 'A. Williams',
    status: 'Available',
    x: 20,
    y: 60,
    jobsCompleted: 2,
    hoursWorked: 5.0,
  },
  {
    id: 'T5',
    name: 'R. Brown',
    status: 'On Job',
    currentJobId: 'JOB-006',
    x: 80,
    y: 25,
    jobsCompleted: 4,
    hoursWorked: 7.5,
  },
];

const statusColors: Record<JobStatus, string> = {
  Scheduled: 'bg-blue-500',
  'En Route': 'bg-yellow-500',
  'On Site': 'bg-purple-500',
  Completed: 'bg-green-500',
  Cancelled: 'bg-gray-400',
};

const statusBadgeColors: Record<JobStatus, string> = {
  Scheduled: 'bg-blue-100 text-blue-700',
  'En Route': 'bg-yellow-100 text-yellow-700',
  'On Site': 'bg-purple-100 text-purple-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
};

const priorityColors: Record<JobPriority, string> = {
  Emergency: 'bg-red-100 text-red-700',
  High: 'bg-orange-100 text-orange-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-green-100 text-green-700',
};

const techStatusColors: Record<string, string> = {
  Available: 'bg-green-500',
  'On Job': 'bg-purple-500',
  'En Route': 'bg-yellow-500',
  'Off Duty': 'bg-gray-400',
};

export default function MapViewClient() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterRegion, setFilterRegion] = useState<string>('');
  const [showTechnicians, setShowTechnicians] = useState(true);

  const filteredJobs = useMemo(() => {
    return MOCK_JOBS.filter((j) => {
      if (filterStatus && j.status !== filterStatus) return false;
      if (filterRegion && j.region !== filterRegion) return false;
      return true;
    });
  }, [filterStatus, filterRegion]);

  // Stats
  const onSite = MOCK_JOBS.filter((j) => j.status === 'On Site').length;
  const enRoute = MOCK_JOBS.filter((j) => j.status === 'En Route').length;
  const scheduled = MOCK_JOBS.filter((j) => j.status === 'Scheduled').length;
  const completed = MOCK_JOBS.filter((j) => j.status === 'Completed').length;
  const emergencies = MOCK_JOBS.filter(
    (j) => j.priority === 'Emergency' && j.status !== 'Completed'
  ).length;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Service Map View</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time job locations and technician positions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={showTechnicians}
              onChange={(e) => setShowTechnicians(e.target.checked)}
              className="rounded"
            />
            Show Technicians
          </label>
          <a
            href="/jobs"
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800"
          >
            Jobs List
          </a>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-purple-700">{onSite}</p>
          <p className="text-[10px] text-purple-500">On Site</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-yellow-700">{enRoute}</p>
          <p className="text-[10px] text-yellow-500">En Route</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-blue-700">{scheduled}</p>
          <p className="text-[10px] text-blue-500">Scheduled</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-green-700">{completed}</p>
          <p className="text-[10px] text-green-500">Completed</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-red-700">{emergencies}</p>
          <p className="text-[10px] text-red-500">Emergencies</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">Status:</span>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-xs border rounded px-2 py-1"
        >
          <option value="">All</option>
          <option value="Scheduled">Scheduled</option>
          <option value="En Route">En Route</option>
          <option value="On Site">On Site</option>
          <option value="Completed">Completed</option>
        </select>
        <span className="text-xs text-gray-500 dark:text-gray-400">Region:</span>
        <select
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          className="text-xs border rounded px-2 py-1"
        >
          <option value="">All</option>
          <option value="North">North</option>
          <option value="Central">Central</option>
          <option value="East">East</option>
          <option value="South">South</option>
          <option value="West">West</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Map area */}
        <div className="col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div
            className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
            style={{ height: 500 }}
          >
            {/* Grid lines */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)',
                backgroundSize: '10% 10%',
              }}
            />

            {/* Region labels */}
            <span
              className="absolute text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase"
              style={{ top: '8%', left: '15%' }}
            >
              North
            </span>
            <span
              className="absolute text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase"
              style={{ top: '35%', left: '42%' }}
            >
              Central
            </span>
            <span
              className="absolute text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase"
              style={{ top: '35%', left: '72%' }}
            >
              East
            </span>
            <span
              className="absolute text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase"
              style={{ top: '70%', left: '42%' }}
            >
              South
            </span>
            <span
              className="absolute text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase"
              style={{ top: '55%', left: '8%' }}
            >
              West
            </span>

            {/* Job markers */}
            {filteredJobs.map((job) => (
              <button
                key={job.id}
                onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${selectedJob?.id === job.id ? 'z-20 scale-125' : 'z-10 hover:scale-110'}`}
                style={{ left: `${job.x}%`, top: `${job.y}%` }}
                title={`${job.id}: ${job.title}`}
              >
                <div
                  className={`relative h-6 w-6 rounded-full ${statusColors[job.status]} flex items-center justify-center shadow-md ${job.priority === 'Emergency' ? 'animate-pulse ring-2 ring-red-400' : ''}`}
                >
                  <MapPin className="h-3.5 w-3.5 text-white" />
                </div>
                {selectedJob?.id === job.id && (
                  <div className="absolute top-7 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 w-48 z-30">
                    <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500">
                      {job.id}
                    </p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {job.title}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{job.customer}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span
                        className={`text-[9px] font-medium rounded-full px-1.5 py-0.5 ${statusBadgeColors[job.status]}`}
                      >
                        {job.status}
                      </span>
                      <span
                        className={`text-[9px] font-medium rounded-full px-1.5 py-0.5 ${priorityColors[job.priority]}`}
                      >
                        {job.priority}
                      </span>
                    </div>
                  </div>
                )}
              </button>
            ))}

            {/* Technician markers */}
            {showTechnicians &&
              MOCK_TECHS.map((tech) => (
                <div
                  key={tech.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-15"
                  style={{ left: `${tech.x}%`, top: `${tech.y}%` }}
                  title={`${tech.name} (${tech.status})`}
                >
                  <div
                    className={`h-5 w-5 rounded-sm ${techStatusColors[tech.status]} flex items-center justify-center shadow border border-white`}
                  >
                    <User className="h-3 w-3 text-white" />
                  </div>
                </div>
              ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Jobs:</span>
            {(['Scheduled', 'En Route', 'On Site', 'Completed'] as JobStatus[]).map((s) => (
              <div key={s} className="flex items-center gap-1">
                <div className={`h-3 w-3 rounded-full ${statusColors[s]}`} />
                <span className="text-[10px] text-gray-500 dark:text-gray-400">{s}</span>
              </div>
            ))}
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium ml-4">
              Techs:
            </span>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm bg-green-500" />
              <span className="text-[10px] text-gray-500 dark:text-gray-400">Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm bg-purple-500" />
              <span className="text-[10px] text-gray-500 dark:text-gray-400">On Job</span>
            </div>
          </div>
        </div>

        {/* Technician panel */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Technicians</h3>
          {MOCK_TECHS.map((tech) => (
            <div
              key={tech.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`h-7 w-7 rounded-full ${techStatusColors[tech.status]} flex items-center justify-center`}
                >
                  <User className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                    {tech.name}
                  </p>
                  <span
                    className={`text-[9px] font-medium rounded-full px-1.5 py-0.5 ${tech.status === 'Available' ? 'bg-green-100 text-green-700' : tech.status === 'On Job' ? 'bg-purple-100 text-purple-700' : tech.status === 'En Route' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}
                  >
                    {tech.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div>
                  <span className="text-gray-400 dark:text-gray-500">Jobs Done:</span>{' '}
                  <span className="font-medium">{tech.jobsCompleted}</span>
                </div>
                <div>
                  <span className="text-gray-400 dark:text-gray-500">Hours:</span>{' '}
                  <span className="font-medium">{tech.hoursWorked}h</span>
                </div>
              </div>
              {tech.currentJobId && (
                <div className="mt-1.5 pt-1.5 border-t border-gray-100 dark:border-gray-700 text-[10px]">
                  <span className="text-gray-400 dark:text-gray-500">Current:</span>{' '}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {MOCK_JOBS.find((j) => j.id === tech.currentJobId)?.title}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
