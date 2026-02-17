'use client';

import { useState } from 'react';
import { Modal } from '@ims/ui';
import { Sparkles, ChevronLeft, ChevronRight, Map } from 'lucide-react';
import { WIZARD_STEPS, WizardStepContent } from './wizard-step-content';
import { WizardAssistant } from './wizard-assistant';

interface WelcomeWizardModalProps {
  isOpen: boolean;
  step: number;
  onStepChange: (step: number) => void;
  onMinimize: () => void;
  onDismiss: () => void;
  onComplete: () => void;
  onStartTour: () => void;
}

export function WelcomeWizardModal({
  isOpen,
  step,
  onStepChange,
  onMinimize,
  onDismiss,
  onComplete,
  onStartTour,
}: WelcomeWizardModalProps) {
  const [showAssistant, setShowAssistant] = useState(false);
  const totalSteps = WIZARD_STEPS.length;
  const isLastStep = step === totalSteps - 1;
  const isFirstStep = step === 0;

  return (
    <Modal isOpen={isOpen} onClose={onMinimize} size="xl">
      <div className="flex h-[520px] bg-[var(--ink,#020617)]">
        {/* Left: Step navigator */}
        <div className="w-52 shrink-0 border-r border-[var(--border,#334155)] p-4 flex flex-col gap-1 bg-[var(--deep,#0f172a)]">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-[var(--blue-mid,#3b82f6)]" />
            <span className="text-sm font-semibold text-[var(--white,#f8fafc)]">Discovery Guide</span>
          </div>
          {WIZARD_STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isVisited = i < step;
            return (
              <button
                key={i}
                onClick={() => onStepChange(i)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-[var(--surface,#1e293b)] border border-[var(--blue-mid,#3b82f6)]'
                    : isVisited
                    ? 'hover:bg-[var(--surface,#1e293b)] opacity-70'
                    : 'hover:bg-[var(--surface,#1e293b)] opacity-50'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[var(--blue-mid,#3b82f6)]' : 'text-[var(--steel,#94a3b8)]'}`} />
                <span className={`text-xs font-medium truncate ${isActive ? 'text-[var(--white,#f8fafc)]' : 'text-[var(--steel,#94a3b8)]'}`}>
                  {s.title}
                </span>
              </button>
            );
          })}
          <div className="mt-auto">
            <button
              onClick={() => setShowAssistant((v) => !v)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium text-[var(--blue-mid,#3b82f6)] hover:bg-[var(--surface,#1e293b)] transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {showAssistant ? 'Hide AI' : 'Ask AI'}
            </button>
          </div>
        </div>

        {/* Center: Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto p-6">
            <WizardStepContent stepIndex={step} />
          </div>

          {/* Bottom nav */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border,#334155)]">
            <button
              onClick={onDismiss}
              className="text-xs text-[var(--steel,#94a3b8)] hover:text-[var(--silver,#cbd5e1)] transition-colors"
            >
              Don&apos;t show again
            </button>

            <div className="flex items-center gap-3">
              {/* Step indicator */}
              <span className="text-xs text-[var(--steel,#94a3b8)]">
                {step + 1} / {totalSteps}
              </span>

              {!isFirstStep && (
                <button
                  onClick={() => onStepChange(step - 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--silver,#cbd5e1)] hover:bg-[var(--surface,#1e293b)] transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              )}

              {isLastStep ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onComplete();
                      onStartTour();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--white,#f8fafc)] bg-[var(--surface,#1e293b)] border border-[var(--border,#334155)] hover:bg-[var(--raised,#1e293b)] transition-colors"
                  >
                    <Map className="h-3.5 w-3.5" />
                    Take Tour
                  </button>
                  <button
                    onClick={onComplete}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium text-white bg-[var(--blue-mid,#3b82f6)] hover:opacity-90 transition-opacity"
                  >
                    Finish & Show Checklist
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onStepChange(step + 1)}
                  className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm font-medium text-white bg-[var(--blue-mid,#3b82f6)] hover:opacity-90 transition-opacity"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: AI Assistant panel */}
        {showAssistant && (
          <div className="w-72 shrink-0">
            <WizardAssistant stepIndex={step} onClose={() => setShowAssistant(false)} />
          </div>
        )}
      </div>
    </Modal>
  );
}
