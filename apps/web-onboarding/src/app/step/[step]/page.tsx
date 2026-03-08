// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { OnboardingShell } from '@/components/onboarding-shell';

interface StepPageProps {
  params: Promise<{ step: string }>;
}

export default async function StepPage({ params }: StepPageProps) {
  const { step } = await params;
  const stepNum = parseInt(step, 10);
  if (isNaN(stepNum) || stepNum < 1 || stepNum > 5) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Step not found</h1>
          <a href="/step/1" className="text-blue-600 hover:underline">Start from the beginning</a>
        </div>
      </div>
    );
  }
  return <OnboardingShell currentStep={stepNum} />;
}
