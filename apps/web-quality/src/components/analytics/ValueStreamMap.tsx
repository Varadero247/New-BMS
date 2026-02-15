'use client';

import { useMemo } from 'react';

interface ProcessStep {
  id: string;
  name: string;
  cycleTime: number; // in minutes
  changeoverTime?: number;
  uptime?: number; // percentage
  operators?: number;
  inventory?: number; // units before this step
  waitTime?: number; // wait time before processing
  isValueAdded?: boolean;
}

interface ValueStreamMapProps {
  steps: ProcessStep[];
  title?: string;
  customerDemand?: number; // units per day
  availableTime?: number; // minutes per day
}

export function ValueStreamMap({
  steps,
  title = 'Value Stream Map',
  customerDemand = 100,
  availableTime = 480, // 8 hours
}: ValueStreamMapProps) {
  const metrics = useMemo(() => {
    const totalCycleTime = steps.reduce((sum, s) => sum + s.cycleTime, 0);
    const totalWaitTime = steps.reduce((sum, s) => sum + (s.waitTime || 0), 0);
    const totalInventory = steps.reduce((sum, s) => sum + (s.inventory || 0), 0);
    const leadTime = totalCycleTime + totalWaitTime;
    const valueAddedTime = steps
      .filter(s => s.isValueAdded !== false)
      .reduce((sum, s) => sum + s.cycleTime, 0);
    const processEfficiency = (valueAddedTime / leadTime) * 100;
    const taktTime = availableTime / customerDemand;

    // Identify bottleneck
    const bottleneck = steps.reduce((max, step) =>
      step.cycleTime > max.cycleTime ? step : max
    , steps[0]);

    return {
      totalCycleTime,
      totalWaitTime,
      totalInventory,
      leadTime,
      valueAddedTime,
      processEfficiency,
      taktTime,
      bottleneck,
    };
  }, [steps, availableTime, customerDemand]);

  if (steps.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No process steps defined
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">{title}</h3>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{metrics.leadTime.toFixed(1)}m</p>
          <p className="text-xs text-gray-600">Total Lead Time</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{metrics.valueAddedTime.toFixed(1)}m</p>
          <p className="text-xs text-gray-600">Value-Added Time</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-700">{metrics.processEfficiency.toFixed(1)}%</p>
          <p className="text-xs text-gray-600">Process Efficiency</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-orange-700">{metrics.taktTime.toFixed(1)}m</p>
          <p className="text-xs text-gray-600">Takt Time</p>
        </div>
      </div>

      {/* Process Flow */}
      <div className="overflow-x-auto">
        <div className="flex items-start gap-4 min-w-max p-4">
          {/* Supplier */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
                <span className="text-xs text-gray-600 font-medium">Supplier</span>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center self-center">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 12h14m-4-4l4 4-4 4" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Process Steps */}
          {steps.map((step, index) => {
            const isBottleneck = step.id === metrics.bottleneck?.id;
            const exceedsTakt = step.cycleTime > metrics.taktTime;

            return (
              <div key={step.id} className="flex items-start gap-4">
                {/* Inventory triangle (before step) */}
                {step.inventory !== undefined && step.inventory > 0 && (
                  <div className="flex flex-col items-center self-center">
                    <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-b-[25px] border-l-transparent border-r-transparent border-b-yellow-400" />
                    <span className="text-xs font-medium text-yellow-700 mt-1">{step.inventory}</span>
                  </div>
                )}

                {/* Wait time indicator */}
                {step.waitTime && step.waitTime > 0 && (
                  <div className="flex flex-col items-center self-center text-center">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs text-red-600">{step.waitTime}m wait</span>
                  </div>
                )}

                {/* Process box */}
                <div className={`w-36 rounded-lg border-2 ${
                  isBottleneck
                    ? 'border-red-500 bg-red-50'
                    : exceedsTakt
                      ? 'border-orange-400 bg-orange-50'
                      : step.isValueAdded === false
                        ? 'border-gray-300 bg-gray-50'
                        : 'border-blue-400 bg-blue-50'
                }`}>
                  {/* Step name */}
                  <div className={`px-3 py-2 text-center font-medium text-sm rounded-t-md ${
                    isBottleneck ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    {step.name}
                    {isBottleneck && <span className="ml-1 text-xs">(Bottleneck)</span>}
                  </div>

                  {/* Step metrics */}
                  <div className="p-2 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">C/T:</span>
                      <span className={`font-medium ${exceedsTakt ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}`}>
                        {step.cycleTime}m
                      </span>
                    </div>
                    {step.changeoverTime !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">C/O:</span>
                        <span className="font-medium">{step.changeoverTime}m</span>
                      </div>
                    )}
                    {step.uptime !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Uptime:</span>
                        <span className={`font-medium ${step.uptime < 90 ? 'text-orange-600' : 'text-green-600'}`}>
                          {step.uptime}%
                        </span>
                      </div>
                    )}
                    {step.operators !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Operators:</span>
                        <span className="font-medium">{step.operators}</span>
                      </div>
                    )}
                  </div>

                  {/* Value-added indicator */}
                  <div className={`text-center text-xs py-1 ${
                    step.isValueAdded === false ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'
                  }`}>
                    {step.isValueAdded === false ? 'NVA' : 'VA'}
                  </div>
                </div>

                {/* Arrow to next */}
                {index < steps.length - 1 && (
                  <div className="flex items-center self-center">
                    <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 12h14m-4-4l4 4-4 4" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            );
          })}

          {/* Arrow to customer */}
          <div className="flex items-center self-center">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 12h14m-4-4l4 4-4 4" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Customer */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-20 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs text-green-700 font-medium">Customer</span>
              </div>
            </div>
            <div className="text-xs text-gray-600 mt-1 text-center">
              <div>Demand: {customerDemand}/day</div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Timeline Analysis</h4>
        <div className="space-y-2">
          {/* Value-added time bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 w-24">Value Added</span>
            <div className="flex-1 h-6 bg-gray-200 rounded overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: `${(metrics.valueAddedTime / metrics.leadTime) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium w-16 text-right">{metrics.valueAddedTime.toFixed(1)}m</span>
          </div>
          {/* Non-value-added time bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 w-24">Non-Value Add</span>
            <div className="flex-1 h-6 bg-gray-200 rounded overflow-hidden">
              <div
                className="h-full bg-red-400"
                style={{ width: `${((metrics.leadTime - metrics.valueAddedTime) / metrics.leadTime) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium w-16 text-right">{(metrics.leadTime - metrics.valueAddedTime).toFixed(1)}m</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-blue-500" />
          <span>Process Step</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-red-500" />
          <span>Bottleneck</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-yellow-400" />
          <span>Inventory</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-green-100 border border-green-400" />
          <span>VA (Value Added)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-800 border border-gray-400" />
          <span>NVA (Non-Value Added)</span>
        </div>
      </div>
    </div>
  );
}
