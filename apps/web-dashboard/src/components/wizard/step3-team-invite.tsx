'use client';

import { useState } from 'react';
import { Plus, Trash2, Mail } from 'lucide-react';

interface TeamMember {
  email: string;
  role: string;
}

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'quality_manager', label: 'Quality Manager' },
  { value: 'hs_manager', label: 'H&S Manager' },
  { value: 'env_manager', label: 'Environmental Manager' },
  { value: 'auditor', label: 'Internal Auditor' },
  { value: 'viewer', label: 'Viewer' },
];

interface Step3Props {
  data: { teamMembers?: TeamMember[] };
  onUpdate: (data: { teamMembers: TeamMember[] }) => void;
}

export default function Step3TeamInvite({ data, onUpdate }: Step3Props) {
  const [members, setMembers] = useState<TeamMember[]>(
    data.teamMembers && data.teamMembers.length > 0
      ? data.teamMembers
      : [{ email: '', role: 'viewer' }]
  );

  const updateMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = members.map((m, i) => (i === index ? { ...m, [field]: value } : m));
    setMembers(updated);
    onUpdate({ teamMembers: updated.filter((m) => m.email.trim()) });
  };

  const addRow = () => {
    setMembers([...members, { email: '', role: 'viewer' }]);
  };

  const removeRow = (index: number) => {
    if (members.length <= 1) return;
    const updated = members.filter((_, i) => i !== index);
    setMembers(updated);
    onUpdate({ teamMembers: updated.filter((m) => m.email.trim()) });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Invite Your Team
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Add team members who'll use the system. You can always invite more later.
      </p>

      <div className="space-y-3">
        {members.map((member, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                placeholder="colleague@company.com"
                value={member.email}
                onChange={(e) => updateMember(i, 'email', e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={member.role}
              onChange={(e) => updateMember(i, 'role', e.target.value)}
              className="w-48 px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => removeRow(i)}
              disabled={members.length <= 1}
              className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addRow}
        className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Another
      </button>

      <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
        Invitations will be sent when you complete the wizard. This step is optional.
      </p>
    </div>
  );
}
