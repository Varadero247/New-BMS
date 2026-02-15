'use client';

import { useState, useEffect } from 'react';
import { cn } from './utils';

export interface CookieChoices {
  essential: boolean;
  analytics: boolean;
  functional: boolean;
  timestamp: string;
}

export interface CookieConsentProps {
  onConsent?: (choices: CookieChoices) => void;
  className?: string;
}

const STORAGE_KEY = 'nexara:consent';
const TWELVE_MONTHS_MS = 365 * 24 * 60 * 60 * 1000;

function getStoredConsent(): CookieChoices | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieChoices;
    // Check if consent is older than 12 months
    if (parsed.timestamp) {
      const age = Date.now() - new Date(parsed.timestamp).getTime();
      if (age > TWELVE_MONTHS_MS) return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function storeConsent(choices: CookieChoices): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(choices));
  } catch {
    // localStorage unavailable
  }
}

export function CookieConsent({ onConsent, className }: CookieConsentProps) {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [functional, setFunctional] = useState(true);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      setVisible(true);
    }
  }, []);

  const saveChoices = (choices: CookieChoices) => {
    storeConsent(choices);
    onConsent?.(choices);
    setVisible(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => {
    saveChoices({
      essential: true,
      analytics: true,
      functional: true,
      timestamp: new Date().toISOString(),
    });
  };

  const handleRejectNonEssential = () => {
    saveChoices({
      essential: true,
      analytics: false,
      functional: false,
      timestamp: new Date().toISOString(),
    });
  };

  const handleSavePreferences = () => {
    saveChoices({
      essential: true,
      analytics,
      functional,
      timestamp: new Date().toISOString(),
    });
  };

  if (!visible) return null;

  return (
    <>
      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl mx-4">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">Cookie Preferences</h3>
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded"
                aria-label="Close preferences"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Options */}
            <div className="p-5 space-y-4">
              {/* Essential */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked
                  disabled
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 cursor-not-allowed opacity-60"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">Essential</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Required for the platform to function. Includes session management and security tokens.
                  </p>
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 cursor-pointer"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">Analytics</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Help us understand usage patterns to improve the platform. Anonymised data only.
                  </p>
                </div>
              </div>

              {/* Functional */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={functional}
                  onChange={(e) => setFunctional(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 cursor-pointer"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">Functional</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Remembers your preferences such as dark mode, language, and display settings.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border">
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom banner */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-xl',
          'animate-in slide-in-from-bottom duration-300',
          className
        )}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">
              We use cookies to provide our service and improve your experience.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRejectNonEssential}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
            >
              Reject Non-Essential
            </button>
            <button
              type="button"
              onClick={() => setShowPreferences(true)}
              className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Manage Preferences
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
