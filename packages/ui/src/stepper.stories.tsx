import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Stepper } from './stepper';
import { Button } from './button';

const meta: Meta<typeof Stepper> = {
  title: 'Components/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  argTypes: {
    currentStep: {
      control: { type: 'number', min: 0, max: 5 },
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Stepper>;

const basicSteps = [
  { label: 'Step 1' },
  { label: 'Step 2' },
  { label: 'Step 3' },
  { label: 'Step 4' },
];

const stepsWithDescription = [
  { label: 'Account', description: 'Create your account' },
  { label: 'Profile', description: 'Add profile information' },
  { label: 'Verify', description: 'Verify email address' },
  { label: 'Complete', description: 'Setup complete' },
];

export const Default: Story = {
  args: {
    steps: basicSteps,
    currentStep: 0,
    orientation: 'horizontal',
    size: 'md',
  },
};

export const HorizontalStep0: Story = {
  args: {
    steps: basicSteps,
    currentStep: 0,
    orientation: 'horizontal',
    size: 'md',
  },
};

export const HorizontalStep1: Story = {
  args: {
    steps: basicSteps,
    currentStep: 1,
    orientation: 'horizontal',
    size: 'md',
  },
};

export const HorizontalStep2: Story = {
  args: {
    steps: basicSteps,
    currentStep: 2,
    orientation: 'horizontal',
    size: 'md',
  },
};

export const HorizontalStep3: Story = {
  args: {
    steps: basicSteps,
    currentStep: 3,
    orientation: 'horizontal',
    size: 'md',
  },
};

export const HorizontalCompleted: Story = {
  args: {
    steps: basicSteps,
    currentStep: 4,
    orientation: 'horizontal',
    size: 'md',
  },
};

export const VerticalStep0: Story = {
  args: {
    steps: stepsWithDescription,
    currentStep: 0,
    orientation: 'vertical',
    size: 'md',
  },
};

export const VerticalStep1: Story = {
  args: {
    steps: stepsWithDescription,
    currentStep: 1,
    orientation: 'vertical',
    size: 'md',
  },
};

export const VerticalStep2: Story = {
  args: {
    steps: stepsWithDescription,
    currentStep: 2,
    orientation: 'vertical',
    size: 'md',
  },
};

export const VerticalCompleted: Story = {
  args: {
    steps: stepsWithDescription,
    currentStep: 4,
    orientation: 'vertical',
    size: 'md',
  },
};

export const SmallSize: Story = {
  args: {
    steps: basicSteps,
    currentStep: 1,
    orientation: 'horizontal',
    size: 'sm',
  },
};

export const MediumSize: Story = {
  args: {
    steps: basicSteps,
    currentStep: 1,
    orientation: 'horizontal',
    size: 'md',
  },
};

export const WithDescriptions: Story = {
  args: {
    steps: stepsWithDescription,
    currentStep: 1,
    orientation: 'vertical',
    size: 'md',
  },
};

export const ManySteps: Story = {
  args: {
    steps: [
      { label: 'Step 1' },
      { label: 'Step 2' },
      { label: 'Step 3' },
      { label: 'Step 4' },
      { label: 'Step 5' },
      { label: 'Step 6' },
    ],
    currentStep: 2,
    orientation: 'horizontal',
    size: 'md',
  },
};

export const Interactive: Story = {
  render: () => {
    const [current, setCurrent] = useState(0);
    const steps = [
      { label: 'Account', description: 'Create your account' },
      { label: 'Profile', description: 'Add profile information' },
      { label: 'Verify', description: 'Verify email address' },
      { label: 'Complete', description: 'Setup complete' },
    ];

    return (
      <div className="space-y-4">
        <Stepper
          steps={steps}
          currentStep={current}
          orientation="vertical"
          onStepClick={setCurrent}
        />
        <div className="flex gap-2">
          <Button
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
            variant="outline"
          >
            Previous
          </Button>
          <Button
            onClick={() => setCurrent(Math.min(steps.length - 1, current + 1))}
            disabled={current === steps.length - 1}
            variant="default"
          >
            Next
          </Button>
        </div>
        <p className="text-sm text-gray-500">Current step: {current + 1}</p>
      </div>
    );
  },
};

export const HorizontalInteractive: Story = {
  render: () => {
    const [current, setCurrent] = useState(0);
    const steps = [
      { label: 'Personal' },
      { label: 'Address' },
      { label: 'Payment' },
      { label: 'Review' },
    ];

    return (
      <div className="space-y-6">
        <Stepper
          steps={steps}
          currentStep={current}
          orientation="horizontal"
          onStepClick={setCurrent}
        />
        <div className="flex gap-2">
          <Button
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
            variant="outline"
          >
            Previous
          </Button>
          <Button
            onClick={() => setCurrent(Math.min(steps.length - 1, current + 1))}
            disabled={current === steps.length - 1}
            variant="default"
          >
            Next
          </Button>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-semibold">{steps[current].label}</p>
          <p className="text-xs text-gray-500 mt-1">Step {current + 1} of {steps.length}</p>
        </div>
      </div>
    );
  },
};

export const FormFlow: Story = {
  render: () => {
    const [current, setCurrent] = useState(0);
    const steps = [
      { label: 'Personal Info', description: 'Name, email, phone' },
      { label: 'Address', description: 'Your location details' },
      { label: 'Payment', description: 'Payment method' },
      { label: 'Review', description: 'Confirm your information' },
    ];

    const formContent = [
      'Enter your name, email, and phone number.',
      'Provide your street address and postal code.',
      'Select and configure your payment method.',
      'Review all information before submitting.',
    ];

    return (
      <div className="max-w-2xl space-y-6">
        <Stepper
          steps={steps}
          currentStep={current}
          orientation="horizontal"
          onStepClick={setCurrent}
        />
        <div className="p-6 border rounded-lg bg-white">
          <h3 className="font-semibold text-lg">{steps[current].label}</h3>
          <p className="text-sm text-gray-500 mt-1">{steps[current].description}</p>
          <div className="mt-4 p-4 bg-gray-50 rounded text-sm">
            {formContent[current]}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
            variant="outline"
          >
            Back
          </Button>
          <Button
            onClick={() => setCurrent(Math.min(steps.length - 1, current + 1))}
            variant="default"
          >
            {current === steps.length - 1 ? 'Submit' : 'Next'}
          </Button>
        </div>
      </div>
    );
  },
};

export const NonClickable: Story = {
  args: {
    steps: stepsWithDescription,
    currentStep: 2,
    orientation: 'vertical',
    size: 'md',
    onStepClick: undefined,
  },
};

export const ComplexForm: Story = {
  render: () => {
    const [current, setCurrent] = useState(0);
    const steps = [
      { label: 'Business Type', description: 'Select your business type' },
      { label: 'Company Details', description: 'Enter company information' },
      { label: 'Owner Info', description: 'Provide owner details' },
      { label: 'Verification', description: 'Verify your identity' },
      { label: 'Final Review', description: 'Review and confirm' },
    ];

    return (
      <div className="max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Stepper
              steps={steps}
              currentStep={current}
              orientation="vertical"
              onStepClick={setCurrent}
              size="sm"
            />
          </div>
          <div className="md:col-span-2 p-6 border rounded-lg bg-white">
            <h3 className="font-semibold text-lg">{steps[current].label}</h3>
            <p className="text-sm text-gray-500 mt-1">{steps[current].description}</p>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sample Input</label>
                <input
                  type="text"
                  placeholder="Enter information"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <Button
                onClick={() => setCurrent(Math.max(0, current - 1))}
                disabled={current === 0}
                variant="outline"
              >
                Back
              </Button>
              <Button
                onClick={() => setCurrent(Math.min(steps.length - 1, current + 1))}
                variant="default"
              >
                {current === steps.length - 1 ? 'Complete' : 'Continue'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
