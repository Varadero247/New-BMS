import type { Meta, StoryObj } from '@storybook/react';
import { HumanReviewGate } from './human-review-gate';

const meta: Meta<typeof HumanReviewGate> = {
  title: 'Components/HumanReviewGate',
  component: HumanReviewGate,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HumanReviewGate>;

export const Pending: Story = {
  args: {
    title: 'Risk Classification Decision',
    aiDecision: 'Classify as HIGH risk based on incident frequency',
    aiConfidence: 0.87,
    aiReasoning: 'Analysis shows 3x increase in near-miss events over the past quarter.',
    status: 'pending',
    onDecide: (decision: string, justification: string) => console.log(decision, justification),
  },
};

export const Approved: Story = {
  args: {
    title: 'Document Approval',
    aiDecision: 'Approve for publication',
    aiConfidence: 0.95,
    status: 'approved',
  },
};
