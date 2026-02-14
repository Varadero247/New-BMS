'use client';

import { useState, useEffect } from 'react';
import { cn } from './utils';

export interface NpsSurveyProps {
  onSubmit: (score: number, comment?: string) => void;
  onDismiss: () => void;
  className?: string;
}

const scoreColors: Record<number, string> = {
  0: 'bg-red-500 hover:bg-red-600',
  1: 'bg-red-500 hover:bg-red-600',
  2: 'bg-red-400 hover:bg-red-500',
  3: 'bg-orange-400 hover:bg-orange-500',
  4: 'bg-orange-400 hover:bg-orange-500',
  5: 'bg-amber-400 hover:bg-amber-500',
  6: 'bg-amber-400 hover:bg-amber-500',
  7: 'bg-yellow-400 hover:bg-yellow-500',
  8: 'bg-lime-400 hover:bg-lime-500',
  9: 'bg-green-400 hover:bg-green-500',
  10: 'bg-green-500 hover:bg-green-600',
};

export function NpsSurvey({ onSubmit, onDismiss, className }: NpsSurveyProps) {
  const [step, setStep] = useState<'score' | 'comment' | 'thanks'>('score');
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');

  // Auto-dismiss after thank you
  useEffect(() => {
    if (step !== 'thanks') return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 3000);
    return () => clearTimeout(timer);
  }, [step, onDismiss]);

  const handleScoreClick = (score: number) => {
    setSelectedScore(score);
    setStep('comment');
  };

  const handleSubmit = () => {
    if (selectedScore === null) return;
    onSubmit(selectedScore, comment.trim() || undefined);
    setStep('thanks');
  };

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-40 w-96 bg-card border border-border rounded-xl shadow-2xl overflow-hidden',
        'animate-in slide-in-from-bottom-4 fade-in duration-300',
        className
      )}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gray-50 dark:bg-gray-800/50">
        <span className="text-sm font-semibold text-foreground">Quick Feedback</span>
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded"
          aria-label="Dismiss survey"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        {/* Step 1: Score selection */}
        {step === 'score' && (
          <div>
            <p className="text-sm text-foreground font-medium mb-3">
              How likely are you to recommend Resolvex to a colleague?
            </p>
            <div className="flex gap-1 justify-between mb-2">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleScoreClick(i)}
                  className={cn(
                    'h-8 w-8 rounded-md text-xs font-bold text-white transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    scoreColors[i]
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Not likely</span>
              <span>Extremely likely</span>
            </div>
          </div>
        )}

        {/* Step 2: Comment */}
        {step === 'comment' && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className={cn(
                'inline-flex items-center justify-center h-8 w-8 rounded-md text-xs font-bold text-white',
                selectedScore !== null ? scoreColors[selectedScore] : ''
              )}>
                {selectedScore}
              </span>
              <p className="text-sm text-foreground font-medium">
                What is the main reason for your score?
              </p>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional — tell us more..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={() => setStep('score')}
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-1.5 text-xs font-medium rounded-md bg-brand-600 text-white hover:bg-brand-700 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Thank you */}
        {step === 'thanks' && (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-3">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-foreground">Thank you for your feedback!</p>
            <p className="text-xs text-muted-foreground mt-1">Your response helps us improve Resolvex.</p>
          </div>
        )}
      </div>
    </div>
  );
}
