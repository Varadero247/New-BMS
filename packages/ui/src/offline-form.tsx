'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from './utils';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface InspectionQuestion {
  id: string;
  type: 'text' | 'number' | 'checkbox' | 'select' | 'photo' | 'signature' | 'datetime';
  label: string;
  required: boolean;
  options?: string[];
}

export interface InspectionSection {
  title: string;
  questions: InspectionQuestion[];
}

export interface OfflineInspectionFormProps {
  /** Unique template identifier (used for draft storage key) */
  templateId: string;
  /** Form title */
  templateTitle: string;
  /** Sections of questions */
  sections: InspectionSection[];
  /** Submit handler - will be queued if offline */
  onSubmit: (responses: Record<string, unknown>) => Promise<void>;
  className?: string;
}

type SyncStatus = 'saved' | 'saving' | 'offline';

const QUEUE_KEY = 'inspection-queue';

function getDraftKey(templateId: string): string {
  return `inspection-draft:${templateId}`;
}

function loadDraft(templateId: string): Record<string, unknown> {
  try {
    const raw = localStorage.getItem(getDraftKey(templateId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDraft(templateId: string, data: Record<string, unknown>): void {
  try {
    localStorage.setItem(getDraftKey(templateId), JSON.stringify(data));
  } catch {
    // storage full, silently fail
  }
}

function clearDraft(templateId: string): void {
  try {
    localStorage.removeItem(getDraftKey(templateId));
  } catch {
    // ignore
  }
}

function addToQueue(templateId: string, data: Record<string, unknown>): void {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    const queue: Array<{ templateId: string; data: Record<string, unknown>; queuedAt: string }> = raw
      ? JSON.parse(raw)
      : [];
    queue.push({ templateId, data, queuedAt: new Date().toISOString() });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // storage full
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function OfflineInspectionForm({
  templateId,
  templateTitle,
  sections,
  onSubmit,
  className,
}: OfflineInspectionFormProps) {
  const [responses, setResponses] = useState<Record<string, unknown>>(() => loadDraft(templateId));
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('saved');
  const [isOnline, setIsOnline] = useState(true);
  const [activeSection, setActiveSection] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track online status
  useEffect(() => {
    setIsOnline(navigator.onLine);

    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Auto-submit queued inspections when back online
  useEffect(() => {
    if (!isOnline) return;

    const processQueue = async () => {
      try {
        const raw = localStorage.getItem(QUEUE_KEY);
        if (!raw) return;
        const queue = JSON.parse(raw) as Array<{ templateId: string; data: Record<string, unknown>; queuedAt: string }>;
        if (queue.length === 0) return;

        const remaining: typeof queue = [];
        for (const item of queue) {
          try {
            await onSubmit(item.data);
          } catch {
            remaining.push(item);
          }
        }

        if (remaining.length === 0) {
          localStorage.removeItem(QUEUE_KEY);
        } else {
          localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
        }
      } catch {
        // ignore queue processing errors
      }
    };

    processQueue();
  }, [isOnline, onSubmit]);

  // Save draft on changes (debounced)
  const handleFieldChange = useCallback(
    (questionId: string, value: unknown) => {
      setResponses((prev) => {
        const updated = { ...prev, [questionId]: value };

        // Debounced save to localStorage
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        setSyncStatus('saving');
        saveTimerRef.current = setTimeout(() => {
          saveDraft(templateId, updated);
          setSyncStatus(isOnline ? 'saved' : 'offline');
        }, 300);

        return updated;
      });
    },
    [templateId, isOnline]
  );

  // Update sync status when online state changes
  useEffect(() => {
    if (!isOnline) {
      setSyncStatus('offline');
    } else if (syncStatus === 'offline') {
      setSyncStatus('saved');
    }
  }, [isOnline, syncStatus]);

  // ── Stats ─────────────────────────────────────────────────────────────────

  const allQuestions = sections.flatMap((s) => s.questions);
  const totalQuestions = allQuestions.length;
  const answeredQuestions = allQuestions.filter((q) => {
    const val = responses[q.id];
    if (val === undefined || val === null || val === '') return false;
    if (q.type === 'checkbox') return val === true;
    return true;
  }).length;
  const progressPct = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  const requiredQuestions = allQuestions.filter((q) => q.required);
  const allRequiredAnswered = requiredQuestions.every((q) => {
    const val = responses[q.id];
    if (val === undefined || val === null || val === '') return false;
    if (q.type === 'checkbox') return val === true;
    return true;
  });

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!allRequiredAnswered) return;

      setSubmitting(true);
      setSubmitError(null);

      try {
        if (!navigator.onLine) {
          throw new Error('offline');
        }
        await onSubmit(responses);
        clearDraft(templateId);
        setSubmitSuccess(true);
        setResponses({});
      } catch (err) {
        if (!navigator.onLine || (err instanceof Error && err.message === 'offline')) {
          // Queue for later
          addToQueue(templateId, responses);
          clearDraft(templateId);
          setSyncStatus('offline');
          setSubmitSuccess(true);
          setResponses({});
        } else {
          setSubmitError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
        }
      } finally {
        setSubmitting(false);
      }
    },
    [allRequiredAnswered, onSubmit, responses, templateId]
  );

  // ── Render ────────────────────────────────────────────────────────────────

  if (submitSuccess) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
        <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
          <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Inspection Submitted</h3>
        <p className="text-sm text-muted-foreground">
          {isOnline
            ? 'Your inspection has been submitted successfully.'
            : 'Your inspection has been saved and will be submitted when back online.'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{templateTitle}</h2>

        {/* Sync status indicator */}
        <div className="flex items-center gap-1.5">
          {syncStatus === 'saved' && (
            <>
              <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">Saved</span>
            </>
          )}
          {syncStatus === 'saving' && (
            <>
              <svg className="h-4 w-4 text-yellow-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Saving...</span>
            </>
          )}
          {syncStatus === 'offline' && (
            <>
              <svg className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
              </svg>
              <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Saved locally</span>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{answeredQuestions} of {totalQuestions} questions answered</span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-600 dark:bg-brand-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Section navigation */}
      {sections.length > 1 && (
        <div className="flex gap-1 overflow-x-auto pb-1">
          {sections.map((section, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveSection(idx)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                idx === activeSection
                  ? 'bg-brand-600 text-white dark:bg-brand-500'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {section.title}
            </button>
          ))}
        </div>
      )}

      {/* Active section questions */}
      {sections[activeSection] && (
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-foreground mb-2">
            {sections[activeSection].title}
          </legend>

          {sections[activeSection].questions.map((question) => (
            <div key={question.id} className="space-y-1.5">
              <label
                htmlFor={`q-${question.id}`}
                className="block text-sm font-medium text-foreground"
              >
                {question.label}
                {question.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>

              {question.type === 'text' && (
                <input
                  id={`q-${question.id}`}
                  type="text"
                  value={(responses[question.id] as string) || ''}
                  onChange={(e) => handleFieldChange(question.id, e.target.value)}
                  className={cn(
                    'w-full rounded-lg border border-border bg-card px-3 py-2',
                    'text-sm text-foreground placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-brand-500'
                  )}
                />
              )}

              {question.type === 'number' && (
                <input
                  id={`q-${question.id}`}
                  type="number"
                  value={(responses[question.id] as string) || ''}
                  onChange={(e) => handleFieldChange(question.id, e.target.value)}
                  className={cn(
                    'w-full rounded-lg border border-border bg-card px-3 py-2',
                    'text-sm text-foreground placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-brand-500'
                  )}
                />
              )}

              {question.type === 'checkbox' && (
                <div className="flex items-center gap-2">
                  <input
                    id={`q-${question.id}`}
                    type="checkbox"
                    checked={!!responses[question.id]}
                    onChange={(e) => handleFieldChange(question.id, e.target.checked)}
                    className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm text-muted-foreground">Yes</span>
                </div>
              )}

              {question.type === 'select' && (
                <select
                  id={`q-${question.id}`}
                  value={(responses[question.id] as string) || ''}
                  onChange={(e) => handleFieldChange(question.id, e.target.value)}
                  className={cn(
                    'w-full rounded-lg border border-border bg-card px-3 py-2',
                    'text-sm text-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-brand-500'
                  )}
                >
                  <option value="">Select...</option>
                  {question.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {question.type === 'datetime' && (
                <input
                  id={`q-${question.id}`}
                  type="datetime-local"
                  value={(responses[question.id] as string) || ''}
                  onChange={(e) => handleFieldChange(question.id, e.target.value)}
                  className={cn(
                    'w-full rounded-lg border border-border bg-card px-3 py-2',
                    'text-sm text-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-brand-500'
                  )}
                />
              )}

              {question.type === 'photo' && (
                <div className="text-xs text-muted-foreground p-3 border border-dashed border-border rounded-lg text-center">
                  <input
                    id={`q-${question.id}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => handleFieldChange(question.id, reader.result);
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor={`q-${question.id}`}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer',
                      'border border-border bg-card text-foreground hover:bg-muted transition-colors'
                    )}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Attach Photo
                  </label>
                  {responses[question.id] ? (
                    <p className="mt-1 text-green-600 dark:text-green-400">Photo attached</p>
                  ) : null}
                </div>
              )}

              {question.type === 'signature' && (
                <div className="text-xs text-muted-foreground p-3 border border-dashed border-border rounded-lg text-center">
                  {responses[question.id] ? (
                    <div className="space-y-1">
                      <p className="text-green-600 dark:text-green-400">Signature captured</p>
                      <button
                        type="button"
                        onClick={() => handleFieldChange(question.id, '')}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  ) : (
                    <p>Use the Signature Capture component for this field</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </fieldset>
      )}

      {/* Submit error */}
      {submitError && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/50 px-4 py-3">
          <p className="text-sm text-red-700 dark:text-red-300">{submitError}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={!allRequiredAnswered || submitting}
        className={cn(
          'w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium',
          'bg-brand-600 text-white hover:bg-brand-700 transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
          'dark:bg-brand-500 dark:hover:bg-brand-400'
        )}
      >
        {submitting ? (
          <>
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Submitting...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {isOnline ? 'Submit Inspection' : 'Save for Later'}
          </>
        )}
      </button>
    </form>
  );
}
