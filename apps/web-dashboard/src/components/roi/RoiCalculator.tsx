'use client';

import { useState, useMemo } from 'react';
import { Calculator } from 'lucide-react';
import { calculateRoi } from '@/lib/roi/calculations';
import { RoiInputs } from './RoiInputs';
import { RoiResults } from './RoiResults';
import { RoiBreakdownTable } from './RoiBreakdownTable';
import { RoiCta } from './RoiCta';
import { DEFAULT_INPUTS } from './types';
import type { RoiInputs as RoiInputsType } from './types';

export function RoiCalculator() {
  const [inputs, setInputs] = useState<RoiInputsType>(DEFAULT_INPUTS);
  const results = useMemo(() => calculateRoi(inputs), [inputs]);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Calculator className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          ROI Calculator
        </h1>
        <p className="mt-2 text-muted-foreground">
          See how much time and money Nexara can save your organisation.
          Adjust the inputs below — results update instantly.
        </p>
      </div>

      {/* Inputs */}
      <RoiInputs inputs={inputs} onChange={setInputs} />

      {/* Results */}
      <div className="space-y-6 print:break-before-page" id="roi-results">
        <h2 className="font-display text-xl font-bold text-foreground">Your Results</h2>
        <RoiResults results={results} />
        <RoiBreakdownTable results={results} />
      </div>

      {/* CTA */}
      <div className="print:hidden">
        <RoiCta />
      </div>
    </div>
  );
}
