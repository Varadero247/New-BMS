import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TourManager } from './tour-manager';
import { Button } from './button';

const meta: Meta<typeof TourManager> = {
  title: 'Components/TourManager',
  component: TourManager,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TourManager>;

export const Default: Story = {
  render: () => {
    const [active, setActive] = useState(true);
    const [step, setStep] = useState(0);
    const totalSteps = 3;

    return (
      <div style={{ padding: '24px' }}>
        {!active && (
          <Button
            onClick={() => {
              setActive(true);
              setStep(0);
            }}
          >
            Restart Tour
          </Button>
        )}
        <TourManager
          tourId="demo-tour"
          isActive={active}
          currentStep={step}
          onNext={() => (step < totalSteps - 1 ? setStep(step + 1) : setActive(false))}
          onBack={() => step > 0 && setStep(step - 1)}
          onSkip={() => setActive(false)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '32px' }}>
            <div
              id="tour-target-0"
              style={{
                padding: '16px',
                border: step === 0 ? '2px solid #3B78F5' : '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: step === 0 ? '#f0f7ff' : 'transparent',
              }}
            >
              <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Dashboard</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>
                View your key metrics and compliance status here.
              </p>
            </div>

            <div
              id="tour-target-1"
              style={{
                padding: '16px',
                border: step === 1 ? '2px solid #3B78F5' : '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: step === 1 ? '#f0f7ff' : 'transparent',
              }}
            >
              <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Risk Register</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Manage and track all identified risks.
              </p>
            </div>

            <div
              id="tour-target-2"
              style={{
                padding: '16px',
                border: step === 2 ? '2px solid #3B78F5' : '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: step === 2 ? '#f0f7ff' : 'transparent',
              }}
            >
              <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Reports</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Generate compliance reports and analytics.
              </p>
            </div>
          </div>
        </TourManager>

        {active && (
          <div
            style={{
              marginTop: '24px',
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          >
            <p>
              Step {step + 1} of {totalSteps}
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
              >
                Back
              </Button>
              <Button
                size="sm"
                onClick={() => (step < totalSteps - 1 ? setStep(step + 1) : setActive(false))}
              >
                {step < totalSteps - 1 ? 'Next' : 'Finish'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setActive(false)}>
                Skip
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  },
};
