// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';
import React, { useState } from 'react';
import type { RegionConfig } from '@ims/regional-data';
import { calculateCorporateTax, calculateGST } from '@ims/regional-data';
// Note: calculateCorporateTax and calculateGST are the rich versions from tax-calculator.ts

export interface TaxSummaryPanelProps {
  config: RegionConfig;
  revenue?: number;
  className?: string;
  defaultOpen?: boolean;
}

export function TaxSummaryPanel({ config, revenue, className = '', defaultOpen = false }: TaxSummaryPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [incomeInput, setIncomeInput] = useState(revenue?.toString() ?? '');
  const income = parseFloat(incomeInput.replace(/,/g, '')) || 0;
  const corpTax = income > 0 ? calculateCorporateTax(income, config) : null;
  const gst100k = calculateGST(100000, config);
  const { finance } = config;

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">🧾</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
            {config.countryName} — Tax Summary
          </span>
        </div>
        <span className="text-gray-400 text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
          {/* Key rates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Corporate Tax</div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {(finance.corporateTaxRate * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">{finance.gstVatName}</div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {finance.gstVatRate > 0 ? `${(finance.gstVatRate * 100).toFixed(1)}%` : 'N/A'}
              </div>
            </div>
            {finance.payrollTax && (
              <>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">{finance.payrollTax.name} (Employee)</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {(finance.payrollTax.employeeRate * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">{finance.payrollTax.name} (Employer)</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {(finance.payrollTax.employerRate * 100).toFixed(1)}%
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Tax calculator */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Corporate Tax Calculator
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={incomeInput}
                onChange={(e) => setIncomeInput(e.target.value)}
                placeholder="Enter taxable income..."
                className="flex-1 text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-500 self-center">{config.currency.code}</span>
            </div>
            {corpTax && (
              <div className="mt-2 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax payable:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {config.currency.symbol}{corpTax.taxAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Effective rate:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {(corpTax.effectiveRate * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* GST example (only if GST/VAT applies) */}
          {finance.gstVatRate > 0 && (
            <div className="text-xs text-gray-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <div className="font-medium text-blue-700 dark:text-blue-300 mb-1">{finance.gstVatName} on {config.currency.symbol}100,000</div>
              <div>Tax: {config.currency.symbol}{gst100k.gstAmount.toLocaleString()} Total: {config.currency.symbol}{gst100k.totalAmount.toLocaleString()}</div>
            </div>
          )}

          {/* Filing deadlines */}
          <div>
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Filing Deadlines</div>
            <div className="space-y-1">
              {Object.entries(finance.filingDeadlines).map(([type, deadline]) => (
                <div key={type} className="flex justify-between text-xs">
                  <span className="text-gray-500 capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span className="text-gray-700 dark:text-gray-300">{deadline}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
