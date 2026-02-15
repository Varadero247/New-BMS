'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from './utils';

// ============================================
// Tour configuration types
// ============================================

export interface TourStepConfig {
  targetSelector: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export interface TourConfig {
  id: string;
  name: string;
  steps: TourStepConfig[];
}

// ============================================
// Built-in tour definitions
// ============================================

export const TOURS: Record<string, TourConfig> = {
  'quality-ncr-create': {
    id: 'quality-ncr-create',
    name: 'Creating a Non-Conformance Report',
    steps: [
      {
        targetSelector: '[data-tour="ncr-create-btn"]',
        title: 'Create New NCR',
        content: 'Click here to raise a new non-conformance report. You can classify it by severity, assign owners, and link to ISO clause references.',
        placement: 'bottom',
      },
      {
        targetSelector: '[data-tour="ncr-filters"]',
        title: 'Filter & Search',
        content: 'Use these filters to narrow down NCRs by status, severity, or assigned department. The search bar supports full-text search across all fields.',
        placement: 'bottom',
      },
      {
        targetSelector: '[data-tour="ncr-list"]',
        title: 'NCR Register',
        content: 'All non-conformances appear here with real-time status updates. Click any row to view details, add root-cause analysis, or attach corrective actions.',
        placement: 'top',
      },
    ],
  },
  'home-dashboard': {
    id: 'home-dashboard',
    name: 'Executive Dashboard Overview',
    steps: [
      {
        targetSelector: '[data-tour="dashboard-stats"]',
        title: 'Key Metrics',
        content: 'These cards show your organisation\'s compliance score, open actions, overdue items, and audit readiness at a glance.',
        placement: 'bottom',
      },
      {
        targetSelector: '[data-tour="dashboard-charts"]',
        title: 'Trend Analysis',
        content: 'Interactive charts show compliance trends over time. Hover for details or click to drill down into specific modules.',
        placement: 'bottom',
      },
      {
        targetSelector: '[data-tour="dashboard-actions"]',
        title: 'Quick Actions',
        content: 'Jump straight to common tasks: raise an NCR, log an incident, schedule an audit, or generate a management review report.',
        placement: 'left',
      },
    ],
  },
  'iso42001-overview': {
    id: 'iso42001-overview',
    name: 'AI Management System (ISO 42001)',
    steps: [
      {
        targetSelector: '[data-tour="ai-systems"]',
        title: 'AI System Register',
        content: 'Register and classify all AI systems in your organisation. Each entry tracks risk level, purpose, data sources, and responsible parties.',
        placement: 'bottom',
      },
      {
        targetSelector: '[data-tour="ai-impact"]',
        title: 'Impact Assessments',
        content: 'Conduct AI impact assessments following ISO 42001 Annex B. Evaluate fairness, transparency, accountability, and societal impact.',
        placement: 'bottom',
      },
      {
        targetSelector: '[data-tour="ai-controls"]',
        title: 'AI Controls',
        content: 'Map and monitor controls specific to AI governance. Track implementation status and link evidence for audit readiness.',
        placement: 'top',
      },
    ],
  },
  'risk-assessment': {
    id: 'risk-assessment',
    name: 'Risk Assessment Guide',
    steps: [
      {
        targetSelector: '[data-tour="risk-register"]',
        title: 'Risk Register',
        content: 'View all identified risks with their likelihood, consequence, and residual risk ratings. Colour-coded by severity for quick triage.',
        placement: 'bottom',
      },
      {
        targetSelector: '[data-tour="risk-matrix"]',
        title: 'Risk Matrix',
        content: 'The 5x5 risk matrix visualises your risk landscape. Click any cell to see risks at that intersection of likelihood and consequence.',
        placement: 'bottom',
      },
      {
        targetSelector: '[data-tour="risk-controls"]',
        title: 'Control Measures',
        content: 'Assign and track control measures for each risk. Link to procedures, training records, and monitoring schedules.',
        placement: 'top',
      },
    ],
  },
};

// ============================================
// useTour hook
// ============================================

const STORAGE_PREFIX = 'nexara:tour:';

export function useTour(tourId: string) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${tourId}`);
      if (stored === 'completed') {
        setIsCompleted(true);
      }
    } catch {
      // localStorage unavailable
    }
  }, [tourId]);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const completeTour = useCallback(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${tourId}`, 'completed');
    } catch {
      // localStorage unavailable
    }
    setIsCompleted(true);
    setIsActive(false);
    setCurrentStep(0);
  }, [tourId]);

  const resetTour = useCallback(() => {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${tourId}`);
    } catch {
      // localStorage unavailable
    }
    setIsCompleted(false);
    setIsActive(false);
    setCurrentStep(0);
  }, [tourId]);

  const nextStep = useCallback(() => {
    const tour = TOURS[tourId];
    if (!tour) return;
    if (currentStep < tour.steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      completeTour();
    }
  }, [tourId, currentStep, completeTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    completeTour();
  }, [completeTour]);

  return {
    startTour,
    isCompleted,
    resetTour,
    isActive,
    currentStep,
    nextStep,
    prevStep,
    skipTour,
  };
}

// ============================================
// TourStep component — highlights target and shows tooltip
// ============================================

export interface TourStepProps {
  step: TourStepConfig;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function TourStep({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onBack,
  onSkip,
}: TourStepProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.querySelector(step.targetSelector);

    if (target) {
      const rect = target.getBoundingClientRect();
      const placement = step.placement || 'bottom';
      const tooltipWidth = 320;
      const gap = 12;

      let top = 0;
      let left = 0;

      switch (placement) {
        case 'top':
          top = rect.top + window.scrollY - gap;
          left = rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'bottom':
          top = rect.bottom + window.scrollY + gap;
          left = rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'left':
          top = rect.top + window.scrollY + rect.height / 2;
          left = rect.left + window.scrollX - tooltipWidth - gap;
          break;
        case 'right':
          top = rect.top + window.scrollY + rect.height / 2;
          left = rect.right + window.scrollX + gap;
          break;
      }

      // Clamp to viewport
      left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
      top = Math.max(16, top);

      setPosition({ top, left });

      // Add highlight ring to target
      (target as HTMLElement).style.position = 'relative';
      (target as HTMLElement).style.zIndex = '60';
      (target as HTMLElement).style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.15)';
      (target as HTMLElement).style.borderRadius = '8px';

      setVisible(true);

      return () => {
        (target as HTMLElement).style.zIndex = '';
        (target as HTMLElement).style.boxShadow = '';
        (target as HTMLElement).style.borderRadius = '';
      };
    }

    // If target not found, still show tooltip centred
    setPosition({
      top: window.innerHeight / 2 - 80,
      left: window.innerWidth / 2 - 160,
    });
    setVisible(true);
  }, [step]);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black/30 z-50" />

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        style={{ top: position.top, left: position.left, width: 320 }}
        className="fixed z-[70] bg-card border border-border rounded-xl shadow-2xl p-4 animate-in fade-in duration-200"
      >
        {/* Step counter */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">
            Step {stepIndex + 1} of {totalSteps}
          </span>
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip tour
          </button>
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold text-foreground mb-1">{step.title}</h4>

        {/* Content */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.content}</p>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            disabled={stepIndex === 0}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              stepIndex === 0
                ? 'text-muted-foreground/40 cursor-not-allowed'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            Back
          </button>

          <button
            type="button"
            onClick={onNext}
            className="px-4 py-1.5 text-xs font-medium rounded-md bg-brand-600 text-white hover:bg-brand-700 transition-colors"
          >
            {stepIndex === totalSteps - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </>
  );
}

// ============================================
// TourManager component — wraps children, manages active tour
// ============================================

export interface TourManagerProps {
  tourId: string;
  isActive: boolean;
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  children: React.ReactNode;
}

export function TourManager({
  tourId,
  isActive,
  currentStep,
  onNext,
  onBack,
  onSkip,
  children,
}: TourManagerProps) {
  const tour = TOURS[tourId];

  return (
    <>
      {children}

      {isActive && tour && currentStep < tour.steps.length && (
        <TourStep
          step={tour.steps[currentStep]}
          stepIndex={currentStep}
          totalSteps={tour.steps.length}
          onNext={onNext}
          onBack={onBack}
          onSkip={onSkip}
        />
      )}
    </>
  );
}
