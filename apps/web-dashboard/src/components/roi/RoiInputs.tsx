'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Label } from '@ims/ui';
import { SliderInput } from './SliderInput';
import type { RoiInputs as RoiInputsType } from './types';

interface Props {
  inputs: RoiInputsType;
  onChange: (inputs: RoiInputsType) => void;
}

const formatGBP = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value);

export function RoiInputs({ inputs, onChange }: Props) {
  const [dailyRateManual, setDailyRateManual] = useState(false);
  const calculatedDailyRate = Math.round(inputs.annualSalary / 230);
  const effectiveDailyRate = inputs.dailyRateOverride ?? calculatedDailyRate;

  const update = (partial: Partial<RoiInputsType>) => onChange({ ...inputs, ...partial });

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-display">Your Organisation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <SliderInput
          id="employees"
          label="Number of employees"
          value={inputs.employees}
          min={25}
          max={5000}
          step={25}
          onChange={(v) => update({ employees: v })}
        />

        <SliderInput
          id="adminHours"
          label="Hours per week your quality/compliance team spends on admin"
          value={inputs.adminHoursPerWeek}
          min={2}
          max={40}
          step={1}
          onChange={(v) => update({ adminHoursPerWeek: v })}
        />

        <SliderInput
          id="salary"
          label="Average annual salary of your compliance team (£)"
          value={inputs.annualSalary}
          min={25000}
          max={90000}
          step={1000}
          onChange={(v) => update({ annualSalary: v })}
          format={formatGBP}
        />

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            How many ISO audits does your organisation undergo per year?
          </Label>
          <div className="flex gap-2" role="radiogroup" aria-label="Number of ISO audits per year">
            {([1, 2, 3, 4] as const).map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={inputs.numberOfAudits === n}
                onClick={() => update({ numberOfAudits: n })}
                className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors
                  ${inputs.numberOfAudits === n
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-foreground hover:border-primary/50'
                  }`}
              >
                {n === 4 ? '4+' : n}
              </button>
            ))}
          </div>
        </div>

        <SliderInput
          id="auditPrep"
          label="Days your team currently spends preparing for each audit"
          value={inputs.auditPrepDays}
          min={1}
          max={20}
          step={1}
          onChange={(v) => update({ auditPrepDays: v })}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="dailyRate" className="text-sm font-medium text-foreground">
              Daily rate for compliance time
            </Label>
            <button
              type="button"
              onClick={() => {
                setDailyRateManual(!dailyRateManual);
                if (dailyRateManual) update({ dailyRateOverride: undefined });
              }}
              className="text-xs text-primary hover:underline"
            >
              {dailyRateManual ? 'Auto-calculate' : 'Override'}
            </button>
          </div>
          {dailyRateManual ? (
            <input
              id="dailyRate"
              type="number"
              min={50}
              max={1000}
              value={effectiveDailyRate}
              onChange={(e) => update({ dailyRateOverride: Number(e.target.value) })}
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground
                focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Daily rate override"
            />
          ) : (
            <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              {formatGBP(calculatedDailyRate)}/day (auto-calculated from salary ÷ 230 days)
            </div>
          )}
        </div>

        <SliderInput
          id="suppliers"
          label="Number of active suppliers requiring compliance documents"
          value={inputs.activeSuppliers}
          min={0}
          max={500}
          step={5}
          onChange={(v) => update({ activeSuppliers: v })}
        />

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            Are you actively pursuing enterprise contracts that require ISO compliance?
          </Label>
          <div className="flex gap-2">
            {[true, false].map((val) => (
              <button
                key={String(val)}
                type="button"
                role="radio"
                aria-checked={inputs.enterpriseContractPursuit === val}
                onClick={() => update({ enterpriseContractPursuit: val })}
                className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors
                  ${inputs.enterpriseContractPursuit === val
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-foreground hover:border-primary/50'
                  }`}
              >
                {val ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
