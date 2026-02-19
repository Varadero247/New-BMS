'use client';

import { useState } from 'react';
import { FileText, Check } from 'lucide-react';

const DOCUMENT_TEMPLATES: Record<string, { name: string; docs: string[] }> = {
  iso9001: {
    name: 'ISO 9001',
    docs: [
      'Quality Manual',
      'Quality Policy',
      'Quality Objectives',
      'Document Control Procedure',
      'Internal Audit Procedure',
      'Management Review Minutes Template',
      'CAPA Log',
      'NCR Template',
    ],
  },
  iso14001: {
    name: 'ISO 14001',
    docs: [
      'Environmental Policy',
      'Aspects & Impacts Register',
      'Environmental Objectives',
      'Legal Register',
      'Emergency Preparedness Plan',
      'Waste Management Procedure',
    ],
  },
  iso45001: {
    name: 'ISO 45001',
    docs: [
      'H&S Policy',
      'Risk Assessment Template',
      'Hazard Register',
      'Incident Report Form',
      'Safety Objectives',
      'Emergency Procedure',
      'PPE Register',
    ],
  },
  iso27001: {
    name: 'ISO 27001',
    docs: [
      'ISMS Policy',
      'Risk Treatment Plan',
      'Statement of Applicability',
      'Access Control Policy',
      'Incident Response Plan',
      'Asset Register',
    ],
  },
  iso22000: {
    name: 'ISO 22000',
    docs: [
      'HACCP Plan',
      'PRP Programme',
      'Food Safety Policy',
      'Hazard Analysis Worksheet',
      'Traceability Procedure',
      'Recall Procedure',
    ],
  },
  iso50001: {
    name: 'ISO 50001',
    docs: [
      'Energy Policy',
      'Energy Review',
      'Energy Baseline',
      'EnPI Register',
      'Energy Objectives',
      'Monitoring Plan',
    ],
  },
  iso42001: {
    name: 'ISO 42001',
    docs: [
      'AI Policy',
      'AI Risk Assessment',
      'AI Impact Assessment',
      'Model Inventory',
      'Data Governance Plan',
    ],
  },
  iso37001: {
    name: 'ISO 37001',
    docs: [
      'Anti-Bribery Policy',
      'Risk Assessment',
      'Due Diligence Procedure',
      'Gift Register',
      'Whistleblowing Procedure',
    ],
  },
  iso13485: {
    name: 'ISO 13485',
    docs: [
      'Quality Manual',
      'Design Control Procedure',
      'Risk Management File',
      'Complaint Handling Procedure',
      'CAPA Procedure',
    ],
  },
  as9100: {
    name: 'AS9100',
    docs: [
      'Quality Manual',
      'Configuration Management Plan',
      'Product Safety Plan',
      'FOD Prevention Plan',
      'Counterfeit Parts Prevention',
    ],
  },
  iatf16949: {
    name: 'IATF 16949',
    docs: [
      'Quality Manual',
      'APQP Procedure',
      'PPAP Procedure',
      'Control Plan Template',
      'FMEA Template',
    ],
  },
  esg: {
    name: 'ESG',
    docs: [
      'ESG Policy',
      'Carbon Footprint Report Template',
      'Sustainability Report Template',
      'Social Impact Assessment',
      'Governance Charter',
    ],
  },
};

interface Step2Props {
  data: { selectedStandards?: string[]; seedDocuments?: Record<string, string[]> };
  onUpdate: (data: { seedDocuments: Record<string, string[]> }) => void;
}

export default function Step2DocumentSeed({ data, onUpdate }: Step2Props) {
  const standards = data.selectedStandards || [];
  const [seedDocs, setSeedDocs] = useState<Record<string, string[]>>(
    data.seedDocuments ||
      Object.fromEntries(standards.map((s) => [s, DOCUMENT_TEMPLATES[s]?.docs || []]))
  );

  const _toggleDoc = (stdId: string, doc: string) => {
    const current = seedDocs[stdId] || [];
    const next = current.includes(doc) ? current.filter((d) => d !== doc) : [...current, doc];
    const updated = { ...seedDocs, [stdId]: next };
    setSeedDocs(updated);
    onUpdate({ seedDocuments: updated });
  };

  const toggleAll = (stdId: string) => {
    const allDocs = DOCUMENT_TEMPLATES[stdId]?.docs || [];
    const current = seedDocs[stdId] || [];
    const allSelected = allDocs.length === current.length;
    const updated = { ...seedDocs, [stdId]: allSelected ? [] : [...allDocs] };
    setSeedDocs(updated);
    onUpdate({ seedDocuments: updated });
  };

  if (standards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No standards selected. Go back to Step 1.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Seed Document Templates
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        We'll create starter templates for each standard. Deselect any you don't need.
      </p>

      <div className="space-y-6">
        {standards.map((stdId) => {
          const template = DOCUMENT_TEMPLATES[stdId];
          if (!template) return null;
          const selected = seedDocs[stdId] || [];
          return (
            <div key={stdId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{template.name}</h3>
                <button
                  onClick={() => toggleAll(stdId)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  {selected.length === template.docs.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {template.docs.map((doc) => {
                  const isChecked = selected.includes(doc);
                  return (
                    <label
                      key={doc}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div
                        className={`h-4 w-4 rounded border flex items-center justify-center ${
                          isChecked
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {isChecked && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="text-sm">{doc}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
