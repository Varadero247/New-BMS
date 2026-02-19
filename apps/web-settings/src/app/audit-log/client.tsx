'use client';

import { useState } from 'react';
import {
  Shield,
  Search,
  Filter,
  User,
  FileText,
  Edit3,
  Trash2,
  Plus,
  Eye,
  LogIn,
  LogOut,
  Key } from 'lucide-react';

type ActionType =
  | 'create'
  | 'update'
  | 'delete'
  | 'read'
  | 'login'
  | 'logout'
  | 'export'
  | 'permission-change';

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: ActionType;
  module: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'denied' | 'error';
}

const entries: AuditEntry[] = [
  {
    id: 'al-1',
    timestamp: '2026-02-13 14:32:15',
    user: 'admin@ims.local',
    role: 'ORG_ADMIN',
    action: 'update',
    module: 'Quality',
    resource: 'NCR',
    resourceId: 'NCR-2602-0045',
    details: 'Updated status from OPEN to IN_INVESTIGATION',
    ipAddress: '192.168.1.45',
    userAgent: 'Chrome 121 / Windows',
    status: 'success' },
  {
    id: 'al-2',
    timestamp: '2026-02-13 14:30:08',
    user: 'sarah.chen@ims.local',
    role: 'QUALITY_MANAGER',
    action: 'create',
    module: 'Quality',
    resource: 'CAPA',
    resourceId: 'CAPA-2602-0012',
    details: 'Created corrective action linked to NCR-2602-0045',
    ipAddress: '192.168.1.52',
    userAgent: 'Chrome 121 / macOS',
    status: 'success' },
  {
    id: 'al-3',
    timestamp: '2026-02-13 14:28:55',
    user: 'tom.parker@ims.local',
    role: 'HSE_OFFICER',
    action: 'create',
    module: 'Health & Safety',
    resource: 'Incident',
    resourceId: 'INC-2602-0078',
    details: 'Reported near-miss incident in Warehouse B',
    ipAddress: '192.168.1.78',
    userAgent: 'Safari / iPhone',
    status: 'success' },
  {
    id: 'al-4',
    timestamp: '2026-02-13 14:25:12',
    user: 'emma.clarke@ims.local',
    role: 'FINANCE_MANAGER',
    action: 'export',
    module: 'Finance',
    resource: 'Report',
    resourceId: 'RPT-PL-2026-01',
    details: 'Exported P&L report January 2026 as PDF',
    ipAddress: '192.168.1.30',
    userAgent: 'Chrome 121 / Windows',
    status: 'success' },
  {
    id: 'al-5',
    timestamp: '2026-02-13 14:22:00',
    user: 'mike.johnson@ims.local',
    role: 'SALES_REPRESENTATIVE',
    action: 'read',
    module: 'Finance',
    resource: 'Invoice',
    resourceId: 'INV-2602-0234',
    details: 'Attempted to view invoice — access denied (no Finance permission)',
    ipAddress: '192.168.1.90',
    userAgent: 'Chrome 121 / Windows',
    status: 'denied' },
  {
    id: 'al-6',
    timestamp: '2026-02-13 14:18:30',
    user: 'admin@ims.local',
    role: 'ORG_ADMIN',
    action: 'permission-change',
    module: 'Settings',
    resource: 'User',
    resourceId: 'USR-045',
    details: 'Granted AUDITOR role to lisa.chang@ims.local',
    ipAddress: '192.168.1.45',
    userAgent: 'Chrome 121 / Windows',
    status: 'success' },
  {
    id: 'al-7',
    timestamp: '2026-02-13 14:15:00',
    user: 'alex.kim@ims.local',
    role: 'INFOSEC_MANAGER',
    action: 'update',
    module: 'InfoSec',
    resource: 'Risk Assessment',
    resourceId: 'RA-2602-0015',
    details: 'Updated risk score from MEDIUM to HIGH for supply chain risk',
    ipAddress: '192.168.1.55',
    userAgent: 'Firefox 122 / Linux',
    status: 'success' },
  {
    id: 'al-8',
    timestamp: '2026-02-13 14:10:22',
    user: 'priya.patel@ims.local',
    role: 'HR_MANAGER',
    action: 'delete',
    module: 'HR',
    resource: 'Leave Request',
    resourceId: 'LR-2602-0089',
    details: 'Cancelled approved leave request (employee request)',
    ipAddress: '192.168.1.40',
    userAgent: 'Chrome 121 / macOS',
    status: 'success' },
  {
    id: 'al-9',
    timestamp: '2026-02-13 14:05:00',
    user: 'system@ims.local',
    role: 'SYSTEM',
    action: 'create',
    module: 'Workflows',
    resource: 'Automation',
    resourceId: 'AUTO-NCR-ESC',
    details: 'Auto-escalated NCR-2602-0042 (overdue 48hrs)',
    ipAddress: '127.0.0.1',
    userAgent: 'IMS Automation Engine',
    status: 'success' },
  {
    id: 'al-10',
    timestamp: '2026-02-13 14:00:00',
    user: 'david.hughes@ims.local',
    role: 'EXECUTIVE',
    action: 'login',
    module: 'Auth',
    resource: 'Session',
    resourceId: 'SES-20260213-DH',
    details: 'Logged in from new device',
    ipAddress: '82.45.120.5',
    userAgent: 'Chrome 121 / iPad',
    status: 'success' },
  {
    id: 'al-11',
    timestamp: '2026-02-13 13:55:00',
    user: 'unknown',
    role: '-',
    action: 'login',
    module: 'Auth',
    resource: 'Session',
    resourceId: '-',
    details: 'Failed login attempt — invalid credentials (admin@ims.local)',
    ipAddress: '203.0.113.45',
    userAgent: 'Python-requests/2.31',
    status: 'error' },
  {
    id: 'al-12',
    timestamp: '2026-02-13 13:50:30',
    user: 'james.park@ims.local',
    role: 'QUALITY_ENGINEER',
    action: 'update',
    module: 'Medical',
    resource: 'Design Control',
    resourceId: 'DC-2602-0008',
    details: 'Uploaded design verification test report',
    ipAddress: '192.168.1.67',
    userAgent: 'Chrome 121 / Windows',
    status: 'success' },
];

const actionConfig: Record<ActionType, { label: string; color: string; icon: React.ReactNode }> = {
  create: {
    label: 'Create',
    color: 'bg-green-100 text-green-700',
    icon: <Plus className="h-3.5 w-3.5" /> },
  update: {
    label: 'Update',
    color: 'bg-blue-100 text-blue-700',
    icon: <Edit3 className="h-3.5 w-3.5" /> },
  delete: {
    label: 'Delete',
    color: 'bg-red-100 text-red-700',
    icon: <Trash2 className="h-3.5 w-3.5" /> },
  read: {
    label: 'Read',
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
    icon: <Eye className="h-3.5 w-3.5" /> },
  login: {
    label: 'Login',
    color: 'bg-indigo-100 text-indigo-700',
    icon: <LogIn className="h-3.5 w-3.5" /> },
  logout: {
    label: 'Logout',
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
    icon: <LogOut className="h-3.5 w-3.5" /> },
  export: {
    label: 'Export',
    color: 'bg-purple-100 text-purple-700',
    icon: <FileText className="h-3.5 w-3.5" /> },
  'permission-change': {
    label: 'Permission',
    color: 'bg-amber-100 text-amber-700',
    icon: <Key className="h-3.5 w-3.5" /> } };

const statusColors = {
  success: 'bg-green-500',
  denied: 'bg-red-500',
  error: 'bg-amber-500' };

export default function AuditLogClient() {
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  const modules = [...new Set(entries.map((e) => e.module))];

  const filtered = entries.filter((e) => {
    const matchesAction = actionFilter === 'all' || e.action === actionFilter;
    const matchesModule = moduleFilter === 'all' || e.module === moduleFilter;
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchesSearch =
      !searchTerm ||
      e.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.resourceId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAction && matchesModule && matchesStatus && matchesSearch;
  });

  const deniedCount = entries.filter((e) => e.status === 'denied').length;
  const errorCount = entries.filter((e) => e.status === 'error').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Shield className="h-6 w-6 text-indigo-600" />
          Platform Audit Log
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Complete audit trail of all actions across the IMS platform
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Total Events
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {entries.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Unique Users
          </p>
          <p className="text-3xl font-bold text-indigo-700 mt-1">
            {new Set(entries.map((e) => e.user)).size}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Access Denied
          </p>
          <p className="text-3xl font-bold text-red-700 mt-1">{deniedCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Errors</p>
          <p className="text-3xl font-bold text-amber-700 mt-1">{errorCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            aria-label="Search users, details, resources..."
            placeholder="Search users, details, resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          aria-label="Filter by module"
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Modules</option>
          {modules.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by action"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Actions</option>
          {Object.entries(actionConfig).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          {['all', 'success', 'denied', 'error'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusFilter === s ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'}`}
            >
              {s === 'all' ? 'All' : s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-12"></th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-36">
                  Timestamp
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                  User
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-24">
                  Action
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-24">
                  Module
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => {
                const aCfg = actionConfig[entry.action];
                return (
                  <tr
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className={`border-t border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-indigo-50 transition-colors ${selectedEntry?.id === entry.id ? 'bg-indigo-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${statusColors[entry.status]}`} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                      {entry.timestamp}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 text-xs">{entry.user}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{entry.role}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${aCfg.color}`}
                      >
                        {aCfg.icon}
                        {aCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{entry.module}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 line-clamp-1 max-w-xs">
                      {entry.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {selectedEntry && (
          <div className="w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4 self-start sticky top-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Event Details</h3>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600"
              >
                x
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Timestamp</p>
                <p className="font-mono text-xs">{selectedEntry.timestamp}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">User</p>
                <p className="font-medium">{selectedEntry.user}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
                <p>{selectedEntry.role}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Action</p>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${actionConfig[selectedEntry.action].color}`}
                >
                  {actionConfig[selectedEntry.action].icon}
                  {actionConfig[selectedEntry.action].label}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Module</p>
                <p>{selectedEntry.module}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Resource</p>
                <p>
                  {selectedEntry.resource} ({selectedEntry.resourceId})
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${statusColors[selectedEntry.status]}`} />
                  <span className="capitalize">{selectedEntry.status}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Details</p>
                <p className="text-gray-700 dark:text-gray-300">{selectedEntry.details}</p>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">IP Address</p>
                <p className="font-mono text-xs">{selectedEntry.ipAddress}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">User Agent</p>
                <p className="text-xs text-gray-600">{selectedEntry.userAgent}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
