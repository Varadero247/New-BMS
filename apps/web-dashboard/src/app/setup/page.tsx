'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, ChevronLeft, Rocket, X } from 'lucide-react';
import { api } from '@/lib/api';
import Step1ISOSelection from '@/components/wizard/step1-iso-selection';
import Step2DocumentSeed from '@/components/wizard/step2-document-seed';
import Step3TeamInvite from '@/components/wizard/step3-team-invite';
import Step4PreAudit from '@/components/wizard/step4-pre-audit';

const STEPS = [
  { title: 'ISO Standards', description: 'Choose your standards' },
  { title: 'Documents', description: 'Seed templates' },
  { title: 'Team', description: 'Invite colleagues' },
  { title: 'Review', description: 'Pre-audit summary' },
];

export default function SetupWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wizardId, setWizardId] = useState<string | null>(null);

  useEffect(() => {
    checkWizardStatus();
  }, []);

  async function checkWizardStatus() {
    try {
      const res = await api.get('/wizard/status');
      const data = res.data.data;
      if (data.exists && data.status === 'COMPLETED') {
        router.replace('/');
        return;
      }
      if (data.exists && data.status === 'SKIPPED') {
        router.replace('/');
        return;
      }
      if (data.exists) {
        setWizardId(data.id);
        setCurrentStep(data.currentStep || 0);
        // Restore step data
        const restored: Record<string, any> = {};
        for (const step of data.steps || []) {
          if (step.data && typeof step.data === 'object') {
            Object.assign(restored, step.data);
          }
        }
        setStepData(restored);
      } else {
        // Initialize wizard
        const initRes = await api.post('/wizard/init');
        setWizardId(initRes.data.data.id);
      }
    } catch {
      // If wizard service is unavailable, allow proceeding anyway
    } finally {
      setLoading(false);
    }
  }

  const updateStepData = (data: Record<string, any>) => {
    setStepData((prev) => ({ ...prev, ...data }));
  };

  const saveStep = async (stepIndex: number) => {
    try {
      await api.patch(`/wizard/step/${stepIndex}`, { data: stepData });
    } catch {
      // Non-critical — continue anyway
    }
  };

  const goNext = async () => {
    setSaving(true);
    await saveStep(currentStep);
    setSaving(false);
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await saveStep(3);
      await api.post('/wizard/complete');
    } catch {
      // Non-critical
    }
    setSaving(false);
    router.replace('/');
  };

  const handleSkip = async () => {
    try {
      await api.post('/wizard/skip');
    } catch {
      // Non-critical
    }
    router.replace('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const canProceed =
    currentStep === 0 ? (stepData.selectedStandards?.length > 0) :
    true;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Rocket className="h-6 w-6 text-blue-600" />
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Setup Wizard</h1>
        </div>
        <button
          onClick={handleSkip}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="h-4 w-4" />
          Skip Setup
        </button>
      </header>

      {/* Stepper */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                i < currentStep
                  ? 'bg-green-500 text-white'
                  : i === currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {i < currentStep ? <Check className="h-5 w-5" /> : i + 1}
              </div>
              <div className="hidden md:block">
                <p className={`text-sm font-medium ${i === currentStep ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{step.description}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${i < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto py-8 px-6">
          {currentStep === 0 && (
            <Step1ISOSelection data={stepData} onUpdate={updateStepData} />
          )}
          {currentStep === 1 && (
            <Step2DocumentSeed data={stepData} onUpdate={updateStepData} />
          )}
          {currentStep === 2 && (
            <Step3TeamInvite data={stepData} onUpdate={updateStepData} />
          )}
          {currentStep === 3 && (
            <Step4PreAudit data={stepData} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {currentStep < 3 ? (
            <button
              onClick={goNext}
              disabled={!canProceed || saving}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Continue'}
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Finishing...' : 'Complete Setup'}
              <Rocket className="h-4 w-4" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
