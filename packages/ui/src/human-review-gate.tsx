'use client';

import * as React from 'react';
import { cn } from './utils';

export interface HumanReviewGateProps {
  /** Title / subject of the review */
  title: string;
  /** AI decision being reviewed */
  aiDecision: string;
  /** AI confidence 0-1 */
  aiConfidence?: number;
  /** AI reasoning explanation */
  aiReasoning?: string;
  /** Current status */
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'EXPIRED';
  /** Reviewer name (if decided) */
  reviewerName?: string;
  /** Review decision justification */
  justification?: string;
  /** When the review was decided */
  reviewedAt?: Date | string;
  /** When the review expires */
  expiresAt?: Date | string;
  /** Called when reviewer submits a decision */
  onDecide?: (decision: 'APPROVED' | 'REJECTED' | 'ESCALATED', justification: string) => void;
  /** Whether submission is in progress */
  loading?: boolean;
  className?: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pending Review', color: 'text-warning-700', bg: 'bg-warning-100' },
  APPROVED: { label: 'Approved', color: 'text-success-700', bg: 'bg-success-100' },
  REJECTED: { label: 'Rejected', color: 'text-danger-700', bg: 'bg-danger-100' },
  ESCALATED: { label: 'Escalated', color: 'text-info-700', bg: 'bg-info-100' },
  EXPIRED: { label: 'Expired', color: 'text-gray-700', bg: 'bg-gray-100' },
};

export function HumanReviewGate({
  title,
  aiDecision,
  aiConfidence,
  aiReasoning,
  status,
  reviewerName,
  justification,
  reviewedAt,
  expiresAt,
  onDecide,
  loading,
  className,
}: HumanReviewGateProps) {
  const [selectedDecision, setSelectedDecision] = React.useState<'APPROVED' | 'REJECTED' | 'ESCALATED' | null>(null);
  const [reason, setReason] = React.useState('');

  const statusCfg = statusConfig[status] || statusConfig.PENDING;
  const confidencePct = aiConfidence != null ? Math.round(aiConfidence * 100) : null;

  const handleSubmit = () => {
    if (selectedDecision && reason.trim() && onDecide) {
      onDecide(selectedDecision, reason.trim());
    }
  };

  return (
    <div className={cn('rounded-lg border border-border bg-card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-1', statusCfg.bg, statusCfg.color)}>
            {statusCfg.label}
          </span>
        </div>
        {expiresAt && status === 'PENDING' && (
          <p className="text-xs text-muted-foreground">
            Expires: {new Date(expiresAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* AI Decision */}
      <div className="px-5 py-4 space-y-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">AI Decision</p>
          <p className="text-sm text-foreground">{aiDecision}</p>
        </div>

        {confidencePct != null && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Confidence</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    confidencePct >= 80 ? 'bg-success-500' : confidencePct >= 50 ? 'bg-warning-500' : 'bg-danger-500'
                  )}
                  style={{ width: `${confidencePct}%` }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{confidencePct}%</span>
            </div>
          </div>
        )}

        {aiReasoning && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">AI Reasoning</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{aiReasoning}</p>
          </div>
        )}

        {/* Decision outcome (if already decided) */}
        {status !== 'PENDING' && justification && (
          <div className="border-t border-border pt-3 mt-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Reviewer: {reviewerName || 'Unknown'}
              {reviewedAt && <span className="font-normal"> on {new Date(reviewedAt).toLocaleDateString()}</span>}
            </p>
            <p className="text-sm text-foreground">{justification}</p>
          </div>
        )}

        {/* Decision form (if pending and onDecide provided) */}
        {status === 'PENDING' && onDecide && (
          <div className="border-t border-border pt-4 mt-3 space-y-3">
            <div className="flex gap-2">
              {(['APPROVED', 'REJECTED', 'ESCALATED'] as const).map((d) => {
                const labels: Record<string, string> = { APPROVED: 'Approve', REJECTED: 'Reject', ESCALATED: 'Escalate' };
                const colors: Record<string, string> = {
                  APPROVED: selectedDecision === d ? 'bg-success-600 text-white border-success-600' : 'border-success-300 text-success-700 hover:bg-success-50',
                  REJECTED: selectedDecision === d ? 'bg-danger-600 text-white border-danger-600' : 'border-danger-300 text-danger-700 hover:bg-danger-50',
                  ESCALATED: selectedDecision === d ? 'bg-info-600 text-white border-info-600' : 'border-info-300 text-info-700 hover:bg-info-50',
                };
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDecision(d)}
                    className={cn('flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors', colors[d])}
                  >
                    {labels[d]}
                  </button>
                );
              })}
            </div>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide justification for your decision..."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px] resize-y"
            />

            <button
              onClick={handleSubmit}
              disabled={!selectedDecision || !reason.trim() || loading}
              className="w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Decision'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
