'use client';

import * as React from 'react';
import { cn } from './utils';

export interface HumanReviewGateProps {
  /** The AI-generated content to gate */
  children: React.ReactNode;
  /** Current review status */
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  /** Who needs to review */
  reviewer?: string;
  /** When the review was completed */
  reviewedAt?: Date | string;
  /** The AI system that generated the content */
  aiSystem?: string;
  /** Risk level of the decision */
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  /** Callback when approved */
  onApprove?: () => void;
  /** Callback when rejected */
  onReject?: (reason: string) => void;
  /** Whether to blur content until approved */
  blurUntilReview?: boolean;
  className?: string;
}

const riskDotColors: Record<string, string> = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

const riskLabels: Record<string, string> = {
  low: 'Low risk',
  medium: 'Medium risk',
  high: 'High risk',
  critical: 'Critical risk',
};

// ISO 42001 § 6.1.4 — Human oversight control gate
export function HumanReviewGate({
  children,
  status,
  reviewer,
  reviewedAt,
  aiSystem,
  riskLevel,
  onApprove,
  onReject,
  blurUntilReview = false,
  className,
}: HumanReviewGateProps) {
  const [showRejectForm, setShowRejectForm] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState('');

  const formattedDate = reviewedAt
    ? new Date(reviewedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  const handleRejectSubmit = () => {
    const trimmed = rejectReason.trim();
    if (trimmed && onReject) {
      onReject(trimmed);
      setShowRejectForm(false);
      setRejectReason('');
    }
  };

  const handleRejectCancel = () => {
    setShowRejectForm(false);
    setRejectReason('');
  };

  // ── Banner config per status ──────────────────────────────────────────────
  const bannerConfig = {
    pending: {
      wrapper: 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/15 dark:border-yellow-700/50',
      text: 'text-yellow-800 dark:text-yellow-200',
      icon: (
        <svg
          className="h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      ),
      message: 'Human review required before acting on this AI output',
    },
    approved: {
      wrapper: 'bg-green-50 border-green-300 dark:bg-green-900/15 dark:border-green-700/50',
      text: 'text-green-800 dark:text-green-200',
      icon: (
        <svg
          className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
            clipRule="evenodd"
          />
        </svg>
      ),
      message:
        reviewer && formattedDate
          ? `Reviewed and approved by ${reviewer} on ${formattedDate}`
          : reviewer
          ? `Reviewed and approved by ${reviewer}`
          : 'Reviewed and approved',
    },
    rejected: {
      wrapper: 'bg-red-50 border-red-300 dark:bg-red-900/15 dark:border-red-700/50',
      text: 'text-red-800 dark:text-red-200',
      icon: (
        <svg
          className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
            clipRule="evenodd"
          />
        </svg>
      ),
      message:
        reviewer
          ? `Rejected by ${reviewer}`
          : 'Rejected',
    },
    expired: {
      wrapper: 'bg-gray-100 border-gray-300 dark:bg-gray-800/40 dark:border-gray-600/50',
      text: 'text-gray-700 dark:text-gray-300',
      icon: (
        <svg
          className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
            clipRule="evenodd"
          />
        </svg>
      ),
      message: 'Review period expired — re-review required',
    },
  };

  const cfg = bannerConfig[status];

  // ── Content visibility ────────────────────────────────────────────────────
  const shouldBlur =
    blurUntilReview && (status === 'pending' || status === 'expired');

  const contentStyle: React.CSSProperties = shouldBlur
    ? { filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none' }
    : status === 'rejected'
    ? { opacity: 0.5 }
    : {};

  return (
    <div
      className={cn(
        'rounded-xl border overflow-hidden bg-card text-foreground',
        className
      )}
      role="region"
      aria-label={`AI output — review status: ${status}`}
    >
      {/* ── Banner ─────────────────────────────────────────────────────────── */}
      <div
        className={cn(
          'px-4 py-3 flex items-center gap-3 border-b',
          cfg.wrapper,
          status === 'rejected' && 'border-b-red-300 dark:border-b-red-700/50'
        )}
      >
        {/* Status icon */}
        {cfg.icon}

        {/* Message */}
        <span
          className={cn(
            'text-sm font-medium flex-1 min-w-0',
            cfg.text,
            status === 'rejected' && 'line-through'
          )}
        >
          {cfg.message}
          {aiSystem && status === 'pending' && (
            <span className="font-normal opacity-70"> &middot; {aiSystem}</span>
          )}
        </span>

        {/* Risk level indicator */}
        {riskLevel && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={cn(
                'h-2.5 w-2.5 rounded-full shrink-0',
                riskDotColors[riskLevel]
              )}
              aria-hidden="true"
            />
            <span className={cn('text-xs font-medium', cfg.text)}>
              {riskLabels[riskLevel]}
            </span>
          </div>
        )}

        {/* Critical badge */}
        {riskLevel === 'critical' && (
          <span className="text-xs font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-md shrink-0">
            CRITICAL: Senior approval required
          </span>
        )}

        {/* Action buttons for pending */}
        {status === 'pending' && (onApprove || onReject) && !showRejectForm && (
          <div className="flex items-center gap-2 shrink-0">
            {onApprove && (
              <button
                type="button"
                onClick={onApprove}
                className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
              >
                Approve
              </button>
            )}
            {onReject && (
              <button
                type="button"
                onClick={() => setShowRejectForm(true)}
                className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
              >
                Reject
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Reject reason form ──────────────────────────────────────────────── */}
      {showRejectForm && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/10 border-b border-red-200 dark:border-red-800/40 space-y-2">
          <label
            htmlFor="hrg-reject-reason"
            className="block text-sm font-medium text-red-800 dark:text-red-200"
          >
            Reason for rejection
          </label>
          <textarea
            id="hrg-reject-reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Provide a reason for rejection..."
            rows={3}
            className="w-full rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-y focus:outline-none focus:ring-2 focus:ring-red-400 dark:focus:ring-red-600"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleRejectCancel}
              className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRejectSubmit}
              disabled={!rejectReason.trim()}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      )}

      {/* ── Content area ───────────────────────────────────────────────────── */}
      <div className="relative">
        {/* Blurred overlay for pending / expired */}
        {shouldBlur && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center"
            aria-hidden="true"
          >
            <div className="rounded-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-5 py-3 shadow-md border border-border">
              <p className="text-sm font-semibold text-foreground text-center">
                {status === 'expired' ? 'Review Expired' : 'Pending Review'}
              </p>
              <p className="text-xs text-muted-foreground text-center mt-0.5">
                {status === 'expired'
                  ? 'Content locked until re-reviewed'
                  : 'Content locked until approved'}
              </p>
            </div>
          </div>
        )}

        {/* Children */}
        <div style={contentStyle}>{children}</div>
      </div>
    </div>
  );
}
