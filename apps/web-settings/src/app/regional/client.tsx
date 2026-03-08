'use client';
// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import React, { useState, useEffect, useCallback } from 'react';
import { CountrySelector } from '@ims/ui';
import { allCountries, type CountryData } from '@ims/regional-data';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const ORG_ID = 'default-org'; // In production, derive from auth context

interface RegionalSettings {
  primaryCountryCode: string;
  operatingCountries: string[];
  displayCurrency: string;
  preferredLocale: string;
  preferredCurrency: string;
  notifications: {
    legislativeChanges: boolean;
    taxFilingReminders: boolean;
    tradeAgreementUpdates: boolean;
    complianceDeadlines: boolean;
  };
}

const DEFAULT_SETTINGS: RegionalSettings = {
  primaryCountryCode: 'SG',
  operatingCountries: ['SG'],
  displayCurrency: 'SGD',
  preferredLocale: 'en-SG',
  preferredCurrency: 'SGD',
  notifications: {
    legislativeChanges: true,
    taxFilingReminders: true,
    tradeAgreementUpdates: false,
    complianceDeadlines: true,
  },
};

const CURRENCIES = [
  { code: 'SGD', label: 'Singapore Dollar (SGD)' },
  { code: 'AUD', label: 'Australian Dollar (AUD)' },
  { code: 'NZD', label: 'New Zealand Dollar (NZD)' },
  { code: 'MYR', label: 'Malaysian Ringgit (MYR)' },
  { code: 'USD', label: 'US Dollar (USD)' },
  { code: 'GBP', label: 'British Pound (GBP)' },
  { code: 'EUR', label: 'Euro (EUR)' },
  { code: 'JPY', label: 'Japanese Yen (JPY)' },
  { code: 'CNY', label: 'Chinese Yuan (CNY)' },
  { code: 'INR', label: 'Indian Rupee (INR)' },
  { code: 'IDR', label: 'Indonesian Rupiah (IDR)' },
  { code: 'THB', label: 'Thai Baht (THB)' },
  { code: 'PHP', label: 'Philippine Peso (PHP)' },
  { code: 'VND', label: 'Vietnamese Dong (VND)' },
  { code: 'HKD', label: 'Hong Kong Dollar (HKD)' },
  { code: 'TWD', label: 'New Taiwan Dollar (TWD)' },
  { code: 'KRW', label: 'South Korean Won (KRW)' },
  { code: 'AED', label: 'UAE Dirham (AED)' },
  { code: 'SAR', label: 'Saudi Riyal (SAR)' },
];

function getCountry(code: string): CountryData | undefined {
  return allCountries.find((c) => c.code === code);
}

export function RegionalClient() {
  const [settings, setSettings] = useState<RegionalSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const primaryCountry = getCountry(settings.primaryCountryCode);

  const load = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/regional/onboarding/${ORG_ID}`, {
        headers: { Authorization: `Bearer ${token ?? ''}` },
      });
      if (res.ok) {
        const json = await res.json() as { success: boolean; data: { primaryCountryCode: string; operatingCountries: string[]; displayCurrency: string; preferredLocale: string; preferredCurrency: string } };
        if (json.success && json.data) {
          setSettings((prev) => ({
            ...prev,
            primaryCountryCode: json.data.primaryCountryCode,
            operatingCountries: json.data.operatingCountries,
            displayCurrency: json.data.displayCurrency,
            preferredLocale: json.data.preferredLocale,
            preferredCurrency: json.data.preferredCurrency,
          }));
        }
      }
    } catch {
      // Use defaults if not found
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const body = {
        primaryCountryCode: settings.primaryCountryCode,
        operatingCountries: settings.operatingCountries,
        displayCurrency: settings.displayCurrency,
        preferredLocale: settings.preferredLocale,
        preferredCurrency: settings.preferredCurrency,
        selectedRegions: [],
        businessSize: 'MEDIUM' as const,
      };

      // Try PUT first, then POST
      let res = await fetch(`${API_URL}/api/regional/onboarding/${ORG_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 404) {
        res = await fetch(`${API_URL}/api/regional/onboarding/${ORG_ID}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token ?? ''}`,
          },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        throw new Error('Failed to save settings');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateNotification = (key: keyof RegionalSettings['notifications'], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Regional &amp; Compliance
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure your APAC operating regions, display currency, and compliance notification preferences.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Success banner */}
      {saved && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-300">
          Settings saved successfully.
        </div>
      )}

      {/* Primary Country section */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Primary Country
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          The primary jurisdiction for your organisation. This determines default legislation, tax rules, and regulatory notifications.
        </p>

        <div className="max-w-sm">
          <label
            htmlFor="primary-country"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Primary jurisdiction
          </label>
          <CountrySelector
            aria-label="Primary country"
            value={settings.primaryCountryCode}
            onChange={(v) => {
              if (typeof v === 'string') {
                const c = getCountry(v);
                setSettings((prev) => ({
                  ...prev,
                  primaryCountryCode: v,
                  displayCurrency: c?.currency ?? prev.displayCurrency,
                  preferredCurrency: c?.currency ?? prev.preferredCurrency,
                  preferredLocale: c?.locale ?? prev.preferredLocale,
                }));
              }
            }}
            mode="single"
            showFlags
            showRegionGroups
            className="w-full"
          />
        </div>

        {/* Country details card */}
        {primaryCountry && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <div className="text-xs text-gray-400 mb-0.5">Currency</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {primaryCountry.currency} ({primaryCountry.currencySymbol})
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-0.5">Tax system</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {primaryCountry.taxSystem ?? 'None'}
                {primaryCountry.gstRate ? ` (${primaryCountry.gstRate}%)` : ''}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-0.5">Locale</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 font-mono">
                {primaryCountry.locale}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-0.5">Timezone</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 text-xs">
                {primaryCountry.timezone}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Operating Countries section */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Operating Countries
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Select all countries where your organisation operates. Compliance alerts and legislation updates will be provided for these jurisdictions.
        </p>

        <CountrySelector
          aria-label="Operating countries"
          value={settings.operatingCountries}
          onChange={(v) => {
            if (Array.isArray(v)) {
              setSettings((prev) => ({ ...prev, operatingCountries: v }));
            }
          }}
          mode="multi"
          showFlags
          showRegionGroups
          placeholder="Select operating countries..."
          className="w-full max-w-lg"
        />

        {settings.operatingCountries.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {settings.operatingCountries.map((code) => {
              const c = getCountry(code);
              return (
                <span
                  key={code}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-700"
                >
                  {c?.name ?? code}
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        operatingCountries: prev.operatingCountries.filter((x) => x !== code),
                      }))
                    }
                    className="hover:text-blue-900 dark:hover:text-blue-100"
                    aria-label={`Remove ${c?.name ?? code}`}
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </section>

      {/* Display Currency section */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Display Currency
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          All monetary amounts in the IMS platform will be displayed in this currency.
        </p>

        <div className="max-w-sm">
          <label
            htmlFor="display-currency"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Display currency
          </label>
          <select
            id="display-currency"
            value={settings.displayCurrency}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, displayCurrency: e.target.value }))
            }
            className="
              w-full px-3 py-2 text-sm
              border border-gray-300 dark:border-gray-600 rounded-lg
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Regulatory Notifications section */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Regulatory Notifications
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Control which compliance alerts you receive for your operating jurisdictions.
        </p>

        <div className="space-y-4">
          {[
            {
              key: 'legislativeChanges' as const,
              label: 'Legislative change alerts',
              description: 'Notifications when laws or regulations change in your operating countries.',
            },
            {
              key: 'taxFilingReminders' as const,
              label: 'Tax filing reminders',
              description: 'Reminders before VAT, GST, and corporate tax filing deadlines.',
            },
            {
              key: 'tradeAgreementUpdates' as const,
              label: 'Trade agreement updates',
              description: 'Notifications about changes to trade agreements affecting your regions.',
            },
            {
              key: 'complianceDeadlines' as const,
              label: 'Compliance deadlines',
              description: 'Alerts for upcoming regulatory compliance submission deadlines.',
            },
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {description}
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.notifications[key]}
                onClick={() => updateNotification(key, !settings.notifications[key])}
                className={`
                  relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent
                  transition-colors duration-200 ease-in-out cursor-pointer
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${settings.notifications[key] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}
                `}
              >
                <span className="sr-only">{label}</span>
                <span
                  className={`
                    pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow
                    transform transition-transform duration-200 ease-in-out
                    ${settings.notifications[key] ? 'translate-x-4' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Save button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="
            px-6 py-2 text-sm font-medium text-white
            bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
            rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:cursor-not-allowed
          "
        >
          {saving ? 'Saving...' : 'Save settings'}
        </button>
        <button
          type="button"
          onClick={() => setSettings(DEFAULT_SETTINGS)}
          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
}
