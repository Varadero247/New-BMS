'use client';

import { useState } from 'react';
import { Badge } from '@ims/ui';
import { Users, ChevronDown, ChevronRight, Mail, Phone, MapPin } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  avatarInitials: string;
  avatarColor: string;
  directReports: Employee[];
}

const ORG_DATA: Employee = {
  id: 'e1',
  name: 'Sarah Mitchell',
  role: 'Managing Director',
  department: 'Executive',
  email: 's.mitchell@company.com',
  phone: '+44 7700 900001',
  location: 'HQ — London',
  avatarInitials: 'SM',
  avatarColor: 'bg-purple-500',
  directReports: [
    {
      id: 'e2',
      name: 'James Chen',
      role: 'Operations Director',
      department: 'Operations',
      email: 'j.chen@company.com',
      phone: '+44 7700 900002',
      location: 'HQ — London',
      avatarInitials: 'JC',
      avatarColor: 'bg-blue-500',
      directReports: [
        {
          id: 'e5',
          name: 'David Wilson',
          role: 'Production Manager',
          department: 'Production',
          email: 'd.wilson@company.com',
          phone: '+44 7700 900005',
          location: 'Factory — Birmingham',
          avatarInitials: 'DW',
          avatarColor: 'bg-orange-500',
          directReports: [
            {
              id: 'e10',
              name: 'Tom Baker',
              role: 'Shift Supervisor (A)',
              department: 'Production',
              email: 't.baker@company.com',
              phone: '+44 7700 900010',
              location: 'Factory — Birmingham',
              avatarInitials: 'TB',
              avatarColor: 'bg-gray-500',
              directReports: [],
            },
            {
              id: 'e11',
              name: 'Lucy Patel',
              role: 'Shift Supervisor (B)',
              department: 'Production',
              email: 'l.patel@company.com',
              phone: '+44 7700 900011',
              location: 'Factory — Birmingham',
              avatarInitials: 'LP',
              avatarColor: 'bg-pink-500',
              directReports: [],
            },
            {
              id: 'e12',
              name: 'Mark Evans',
              role: 'Maintenance Lead',
              department: 'Maintenance',
              email: 'm.evans@company.com',
              phone: '+44 7700 900012',
              location: 'Factory — Birmingham',
              avatarInitials: 'ME',
              avatarColor: 'bg-amber-500',
              directReports: [],
            },
          ],
        },
        {
          id: 'e6',
          name: 'Priya Sharma',
          role: 'Supply Chain Manager',
          department: 'Supply Chain',
          email: 'p.sharma@company.com',
          phone: '+44 7700 900006',
          location: 'HQ — London',
          avatarInitials: 'PS',
          avatarColor: 'bg-teal-500',
          directReports: [
            {
              id: 'e13',
              name: 'Alex Johnson',
              role: 'Procurement Officer',
              department: 'Supply Chain',
              email: 'a.johnson@company.com',
              phone: '+44 7700 900013',
              location: 'HQ — London',
              avatarInitials: 'AJ',
              avatarColor: 'bg-sky-500',
              directReports: [],
            },
            {
              id: 'e14',
              name: 'Emma Clark',
              role: 'Warehouse Supervisor',
              department: 'Logistics',
              email: 'e.clark@company.com',
              phone: '+44 7700 900014',
              location: 'Warehouse — Slough',
              avatarInitials: 'EC',
              avatarColor: 'bg-lime-500',
              directReports: [],
            },
          ],
        },
      ],
    },
    {
      id: 'e3',
      name: 'Maria Rodriguez',
      role: 'Quality Director',
      department: 'Quality',
      email: 'm.rodriguez@company.com',
      phone: '+44 7700 900003',
      location: 'HQ — London',
      avatarInitials: 'MR',
      avatarColor: 'bg-green-500',
      directReports: [
        {
          id: 'e7',
          name: 'Robert Brown',
          role: 'Quality Manager',
          department: 'Quality',
          email: 'r.brown@company.com',
          phone: '+44 7700 900007',
          location: 'Factory — Birmingham',
          avatarInitials: 'RB',
          avatarColor: 'bg-emerald-500',
          directReports: [
            {
              id: 'e15',
              name: 'Sophie Turner',
              role: 'Quality Engineer',
              department: 'Quality',
              email: 's.turner@company.com',
              phone: '+44 7700 900015',
              location: 'Factory — Birmingham',
              avatarInitials: 'ST',
              avatarColor: 'bg-violet-500',
              directReports: [],
            },
            {
              id: 'e16',
              name: 'Ian Wright',
              role: 'Inspector',
              department: 'Quality Control',
              email: 'i.wright@company.com',
              phone: '+44 7700 900016',
              location: 'Factory — Birmingham',
              avatarInitials: 'IW',
              avatarColor: 'bg-red-400',
              directReports: [],
            },
          ],
        },
        {
          id: 'e8',
          name: 'Helen Kim',
          role: 'EHS Manager',
          department: 'Health & Safety',
          email: 'h.kim@company.com',
          phone: '+44 7700 900008',
          location: 'Factory — Birmingham',
          avatarInitials: 'HK',
          avatarColor: 'bg-yellow-500',
          directReports: [],
        },
      ],
    },
    {
      id: 'e4',
      name: 'Andrew Taylor',
      role: 'Finance Director',
      department: 'Finance',
      email: 'a.taylor@company.com',
      phone: '+44 7700 900004',
      location: 'HQ — London',
      avatarInitials: 'AT',
      avatarColor: 'bg-indigo-500',
      directReports: [
        {
          id: 'e9',
          name: 'Lisa White',
          role: 'Financial Controller',
          department: 'Finance',
          email: 'l.white@company.com',
          phone: '+44 7700 900009',
          location: 'HQ — London',
          avatarInitials: 'LW',
          avatarColor: 'bg-cyan-500',
          directReports: [
            {
              id: 'e17',
              name: 'Chris Martin',
              role: 'Payroll Officer',
              department: 'Finance',
              email: 'c.martin@company.com',
              phone: '+44 7700 900017',
              location: 'HQ — London',
              avatarInitials: 'CM',
              avatarColor: 'bg-rose-500',
              directReports: [],
            },
          ],
        },
      ],
    },
  ],
};

function countAll(emp: Employee): number {
  return 1 + emp.directReports.reduce((s, r) => s + countAll(r), 0);
}

function OrgNode({ employee, depth = 0 }: { employee: Employee; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const [showDetail, setShowDetail] = useState(false);
  const hasReports = employee.directReports.length > 0;
  const reportCount = countAll(employee) - 1;

  return (
    <div
      className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}
    >
      <div className="flex items-start gap-2 mb-2">
        {hasReports && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 flex-shrink-0"
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        )}
        {!hasReports && <div className="w-4 flex-shrink-0" />}

        <div
          onClick={() => setShowDetail(!showDetail)}
          className={`bg-white dark:bg-gray-900 border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md flex-1 max-w-md ${showDetail ? 'ring-2 ring-blue-500 border-blue-300' : 'border-gray-200 dark:border-gray-700'}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-xs font-bold ${employee.avatarColor}`}
            >
              {employee.avatarInitials}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {employee.name}
              </h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">{employee.role}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <Badge variant="secondary" className="text-[9px]">
                {employee.department}
              </Badge>
              {hasReports && (
                <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {reportCount} report{reportCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {showDetail && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-1.5 text-[10px]">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-3 w-3 text-gray-400 dark:text-gray-500" /> {employee.email}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-3 w-3 text-gray-400 dark:text-gray-500" /> {employee.phone}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-3 w-3 text-gray-400 dark:text-gray-500" /> {employee.location}
              </div>
            </div>
          )}
        </div>
      </div>

      {expanded && hasReports && (
        <div className="space-y-0">
          {employee.directReports.map((report) => (
            <OrgNode key={report.id} employee={report} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgChartClient() {
  const totalHeadcount = countAll(ORG_DATA);
  const departments = new Set<string>();
  function collectDepts(emp: Employee) {
    departments.add(emp.department);
    emp.directReports.forEach(collectDepts);
  }
  collectDepts(ORG_DATA);
  const locations = new Set<string>();
  function collectLocs(emp: Employee) {
    locations.add(emp.location);
    emp.directReports.forEach(collectLocs);
  }
  collectLocs(ORG_DATA);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Organisation Chart
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Interactive hierarchy — click to expand/collapse, click cards for detail
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
          <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{totalHeadcount}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Total Headcount</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{departments.size}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Departments</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
          <MapPin className="h-5 w-5 text-green-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{locations.size}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Locations</p>
        </div>
      </div>

      {/* Org tree */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 overflow-x-auto">
        <OrgNode employee={ORG_DATA} />
      </div>
    </div>
  );
}
