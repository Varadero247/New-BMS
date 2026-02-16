'use client';

import { Check, FileText, Users, ClipboardList } from 'lucide-react';

interface Step4Props {
  data: {
    selectedStandards?: string[];
    seedDocuments?: Record<string, string[]>;
    teamMembers?: { email: string; role: string }[];
  };
}

const STANDARD_LABELS: Record<string, string> = {
  iso9001: 'ISO 9001 — Quality Management',
  iso14001: 'ISO 14001 — Environmental',
  iso45001: 'ISO 45001 — Health & Safety',
  iso27001: 'ISO 27001 — Information Security',
  iso22000: 'ISO 22000 — Food Safety',
  iso50001: 'ISO 50001 — Energy Management',
  iso42001: 'ISO 42001 — AI Management',
  iso37001: 'ISO 37001 — Anti-Bribery',
  iso13485: 'ISO 13485 — Medical Devices',
  as9100: 'AS9100 — Aerospace',
  iatf16949: 'IATF 16949 — Automotive',
  esg: 'ESG — Sustainability Reporting',
};

export default function Step4PreAudit({ data }: Step4Props) {
  const standards = data.selectedStandards || [];
  const seedDocs = data.seedDocuments || {};
  const team = (data.teamMembers || []).filter((m) => m.email.trim());
  const totalDocs = Object.values(seedDocs).reduce((sum, docs) => sum + docs.length, 0);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Pre-Audit Summary
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Review your setup before finishing. Everything can be changed later.
      </p>

      <div className="space-y-6">
        {/* Standards */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ClipboardList className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">ISO Standards</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{standards.length} selected</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {standards.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm"
              >
                <Check className="h-3.5 w-3.5" />
                {STANDARD_LABELS[s] || s}
              </span>
            ))}
            {standards.length === 0 && (
              <span className="text-sm text-gray-400">No standards selected</span>
            )}
          </div>
        </div>

        {/* Documents */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Document Templates</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{totalDocs} documents to seed</p>
            </div>
          </div>
          {standards.map((s) => {
            const docs = seedDocs[s] || [];
            if (docs.length === 0) return null;
            return (
              <div key={s} className="mb-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{STANDARD_LABELS[s] || s}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{docs.join(', ')}</p>
              </div>
            );
          })}
        </div>

        {/* Team */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Team Invitations</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {team.length > 0 ? `${team.length} invite${team.length > 1 ? 's' : ''} pending` : 'No invites (can add later)'}
              </p>
            </div>
          </div>
          {team.length > 0 && (
            <div className="space-y-1">
              {team.map((m, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{m.email}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{m.role.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
