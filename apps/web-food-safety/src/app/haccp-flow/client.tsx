'use client';

import { useState } from 'react';
import { Badge } from '@ims/ui';
import { AlertTriangle, ThermometerSun, Eye, ArrowDown, Shield } from 'lucide-react';

type StepType =
  | 'receive'
  | 'storage'
  | 'preparation'
  | 'processing'
  | 'cooling'
  | 'packaging'
  | 'dispatch'
  | 'ccp';
type HazardType = 'Biological' | 'Chemical' | 'Physical' | 'Allergen';

interface HaccpStep {
  id: string;
  number: number;
  name: string;
  type: StepType;
  isCCP: boolean;
  ccpNumber?: string;
  description: string;
  hazards: { type: HazardType; name: string; severity: 'High' | 'Medium' | 'Low' }[];
  criticalLimits?: string;
  monitoring?: string;
  frequency?: string;
  correctiveAction?: string;
  verification?: string;
  records?: string;
}

const HACCP_STEPS: HaccpStep[] = [
  {
    id: 's1',
    number: 1,
    name: 'Receiving Raw Materials',
    type: 'receive',
    isCCP: false,
    description: 'Incoming inspection of all raw materials, ingredients, and packaging.',
    hazards: [
      { type: 'Biological', name: 'Pathogen contamination from supplier', severity: 'High' },
      { type: 'Chemical', name: 'Pesticide residues', severity: 'Medium' },
      { type: 'Physical', name: 'Foreign material (metal, glass)', severity: 'Medium' },
    ],
  },
  {
    id: 's2',
    number: 2,
    name: 'Cold Storage (Refrigerated)',
    type: 'storage',
    isCCP: true,
    ccpNumber: 'CCP-1',
    description: 'Refrigerated storage at controlled temperature to prevent microbial growth.',
    hazards: [
      { type: 'Biological', name: 'Microbial growth due to temperature abuse', severity: 'High' },
    ],
    criticalLimits: 'Temperature <= 5°C',
    monitoring: 'Continuous temperature monitoring via data logger',
    frequency: 'Continuous + manual check every 4 hours',
    correctiveAction: 'If > 5°C: investigate cause, assess product safety, adjust/repair equipment',
    verification: 'Daily calibration of data loggers, weekly trend review',
    records: 'Temperature logs, corrective action records, calibration certificates',
  },
  {
    id: 's3',
    number: 3,
    name: 'Ingredient Preparation',
    type: 'preparation',
    isCCP: false,
    description: 'Weighing, measuring, washing, cutting, and preparing ingredients for processing.',
    hazards: [
      { type: 'Physical', name: 'Foreign material introduction', severity: 'Medium' },
      { type: 'Allergen', name: 'Cross-contamination of allergens', severity: 'High' },
    ],
  },
  {
    id: 's4',
    number: 4,
    name: 'Thermal Processing (Cooking)',
    type: 'processing',
    isCCP: true,
    ccpNumber: 'CCP-2',
    description:
      'Cooking/heat treatment to eliminate or reduce biological hazards to acceptable levels.',
    hazards: [
      {
        type: 'Biological',
        name: 'Survival of pathogens (Salmonella, Listeria, E. coli)',
        severity: 'High',
      },
    ],
    criticalLimits: 'Core temperature >= 75°C for 15 seconds (or equivalent time-temperature)',
    monitoring: 'Core temperature probe measurement of each batch',
    frequency: 'Every batch',
    correctiveAction:
      'If < 75°C: continue cooking until achieved, rework or dispose if cannot be corrected',
    verification: 'Daily calibration of probes, monthly microbiological testing',
    records: 'Cooking temperature logs, probe calibration records, micro test results',
  },
  {
    id: 's5',
    number: 5,
    name: 'Rapid Cooling',
    type: 'cooling',
    isCCP: true,
    ccpNumber: 'CCP-3',
    description: 'Rapid cooling to prevent re-growth of surviving organisms and toxin formation.',
    hazards: [
      {
        type: 'Biological',
        name: 'Clostridium perfringens growth in slow-cooled product',
        severity: 'High',
      },
    ],
    criticalLimits: 'Cool from 60°C to 10°C within 4 hours',
    monitoring: 'Temperature measurement at start, 2h, and end of cooling',
    frequency: 'Every batch',
    correctiveAction: 'If target not met: assess risk, extend cooling, dispose if unsafe',
    verification: 'Weekly review of cooling curves, quarterly challenge tests',
    records: 'Cooling time-temperature records, corrective action records',
  },
  {
    id: 's6',
    number: 6,
    name: 'Metal Detection',
    type: 'processing',
    isCCP: true,
    ccpNumber: 'CCP-4',
    description:
      'Inline metal detection to identify and reject product containing metal contaminants.',
    hazards: [{ type: 'Physical', name: 'Metal fragments from equipment wear', severity: 'High' }],
    criticalLimits: 'Fe: 1.5mm, Non-Fe: 2.0mm, SS: 2.5mm',
    monitoring: 'Automatic detection and reject of all packs through detector',
    frequency: 'Continuous (100% of production)',
    correctiveAction:
      'Rejected packs quarantined, investigated, line recheck back to last confirmed pass',
    verification: 'Test piece checks at start, every 1 hour, and end of run. Annual calibration.',
    records: 'Metal detector logs, test piece results, reject investigation records',
  },
  {
    id: 's7',
    number: 7,
    name: 'Packaging & Labelling',
    type: 'packaging',
    isCCP: false,
    description:
      'Product filling, sealing, labelling with correct allergen and nutrition information.',
    hazards: [
      { type: 'Allergen', name: 'Incorrect allergen labelling', severity: 'High' },
      { type: 'Chemical', name: 'Packaging migration', severity: 'Low' },
    ],
  },
  {
    id: 's8',
    number: 8,
    name: 'Cold Storage (Finished Product)',
    type: 'storage',
    isCCP: false,
    description: 'Storage of finished product at controlled temperature until dispatch.',
    hazards: [{ type: 'Biological', name: 'Temperature abuse', severity: 'Medium' }],
  },
  {
    id: 's9',
    number: 9,
    name: 'Dispatch & Distribution',
    type: 'dispatch',
    isCCP: false,
    description: 'Loading, transport, and delivery maintaining cold chain integrity.',
    hazards: [{ type: 'Biological', name: 'Cold chain break during transit', severity: 'Medium' }],
  },
];

const hazardColors: Record<HazardType, string> = {
  Biological: 'bg-red-100 text-red-700',
  Chemical: 'bg-purple-100 text-purple-700',
  Physical: 'bg-orange-100 text-orange-700',
  Allergen: 'bg-pink-100 text-pink-700',
};

const stepTypeColors: Record<StepType, string> = {
  receive: 'border-sky-400 bg-sky-50',
  storage: 'border-blue-400 bg-blue-50',
  preparation: 'border-yellow-400 bg-yellow-50',
  processing: 'border-orange-400 bg-orange-50',
  cooling: 'border-cyan-400 bg-cyan-50',
  packaging: 'border-green-400 bg-green-50',
  dispatch: 'border-gray-400 bg-gray-50',
  ccp: 'border-red-500 bg-red-50',
};

export default function HaccpFlowClient() {
  const [selectedStep, setSelectedStep] = useState<HaccpStep | null>(null);
  const [showCCPsOnly, setShowCCPsOnly] = useState(false);

  const steps = showCCPsOnly ? HACCP_STEPS.filter((s) => s.isCCP) : HACCP_STEPS;
  const ccpCount = HACCP_STEPS.filter((s) => s.isCCP).length;
  const totalHazards = HACCP_STEPS.reduce((s, step) => s + step.hazards.length, 0);
  const highRisk = HACCP_STEPS.reduce(
    (s, step) => s + step.hazards.filter((h) => h.severity === 'High').length,
    0
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            HACCP Flow Diagram
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Process flow with hazard analysis and critical control points (Codex Alimentarius)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={showCCPsOnly}
              onChange={(e) => setShowCCPsOnly(e.target.checked)}
              className="rounded"
            />
            CCPs only
          </label>
          <a
            href="/ccps"
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800"
          >
            CCP Register
          </a>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{HACCP_STEPS.length}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Process Steps</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-red-700">{ccpCount}</p>
          <p className="text-[10px] text-red-500">Critical Control Points</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-orange-700">{totalHazards}</p>
          <p className="text-[10px] text-orange-500">Identified Hazards</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-yellow-700">{highRisk}</p>
          <p className="text-[10px] text-yellow-500">High-Risk Hazards</p>
        </div>
      </div>

      {/* Flow diagram */}
      <div className="flex flex-col items-center space-y-0">
        {steps.map((step, idx) => {
          const isSelected = selectedStep?.id === step.id;
          const borderColor = step.isCCP ? stepTypeColors.ccp : stepTypeColors[step.type];

          return (
            <div key={step.id} className="w-full max-w-3xl">
              {/* Connector arrow */}
              {idx > 0 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                </div>
              )}

              {/* Step card */}
              <div
                onClick={() => setSelectedStep(isSelected ? null : step)}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${borderColor} ${isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-sm'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${step.isCCP ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      {step.number}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {step.name}
                        </h3>
                        {step.isCCP && (
                          <Badge variant="destructive" className="text-[9px]">
                            <Shield className="h-2.5 w-2.5 mr-0.5" />
                            {step.ccpNumber}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Hazard badges */}
                  <div className="flex flex-wrap gap-1 ml-4">
                    {step.hazards.map((h, i) => (
                      <span
                        key={i}
                        className={`text-[9px] font-medium rounded-full px-1.5 py-0.5 ${hazardColors[h.type]}`}
                      >
                        {h.type[0]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Expanded detail for CCP steps */}
                {isSelected && step.isCCP && (
                  <div className="mt-4 pt-4 border-t border-red-200 grid grid-cols-2 gap-3 text-[11px]">
                    <div className="bg-white dark:bg-gray-900 rounded p-2 border border-red-100">
                      <span className="text-red-600 font-semibold block mb-0.5">
                        Critical Limits
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {step.criticalLimits}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded p-2 border border-red-100">
                      <span className="text-blue-600 font-semibold block mb-0.5">Monitoring</span>
                      <span className="text-gray-700 dark:text-gray-300">{step.monitoring}</span>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded p-2 border border-red-100">
                      <span className="text-purple-600 font-semibold block mb-0.5">Frequency</span>
                      <span className="text-gray-700 dark:text-gray-300">{step.frequency}</span>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded p-2 border border-red-100">
                      <span className="text-orange-600 font-semibold block mb-0.5">
                        Corrective Action
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {step.correctiveAction}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded p-2 border border-red-100">
                      <span className="text-green-600 font-semibold block mb-0.5">
                        Verification
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">{step.verification}</span>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded p-2 border border-red-100">
                      <span className="text-gray-600 font-semibold block mb-0.5">Records</span>
                      <span className="text-gray-700 dark:text-gray-300">{step.records}</span>
                    </div>
                  </div>
                )}

                {/* Expanded detail for non-CCP steps */}
                {isSelected && !step.isCCP && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-[10px] font-semibold text-gray-600 mb-2">
                      Hazard Analysis
                    </h4>
                    <div className="space-y-1.5">
                      {step.hazards.map((h, i) => (
                        <div key={i} className="flex items-center gap-3 text-[11px]">
                          <span
                            className={`font-medium rounded-full px-2 py-0.5 ${hazardColors[h.type]}`}
                          >
                            {h.type}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300 flex-1">{h.name}</span>
                          <span
                            className={`font-medium ${h.severity === 'High' ? 'text-red-600' : h.severity === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}
                          >
                            {h.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Legend</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium rounded-full px-2 py-0.5 bg-red-100 text-red-700">
              B
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">Biological</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium rounded-full px-2 py-0.5 bg-purple-100 text-purple-700">
              C
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">Chemical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium rounded-full px-2 py-0.5 bg-orange-100 text-orange-700">
              P
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">Physical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium rounded-full px-2 py-0.5 bg-pink-100 text-pink-700">
              A
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">Allergen</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded-full bg-red-600 flex items-center justify-center text-[8px] text-white font-bold">
              !
            </div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              Critical Control Point
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
