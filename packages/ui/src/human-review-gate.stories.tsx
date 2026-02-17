import type { Meta, StoryObj } from '@storybook/react';
import { HumanReviewGate } from './human-review-gate';

const meta: Meta<typeof HumanReviewGate> = {
  title: 'Components/HumanReviewGate',
  component: HumanReviewGate,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['pending', 'approved', 'rejected', 'expired'],
    },
    riskLevel: {
      control: 'select',
      options: ['low', 'medium', 'high', 'critical'],
    },
    blurUntilReview: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof HumanReviewGate>;

export const Pending: Story = {
  args: {
    status: 'pending',
    aiSystem: 'Risk Scorer v2.1',
    riskLevel: 'high',
    reviewer: 'Jane Doe',
    onApprove: () => console.log('Approved'),
    onReject: (reason) => console.log('Rejected:', reason),
    children: (
      <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>AI Recommendation:</p>
        <p>Classify as HIGH risk based on 3x increase in near-miss events over the past quarter.</p>
      </div>
    ),
  },
};

export const Approved: Story = {
  args: {
    status: 'approved',
    aiSystem: 'Document Classifier',
    riskLevel: 'low',
    reviewer: 'Admin User',
    reviewedAt: new Date().toISOString(),
    children: (
      <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '8px' }}>
        <p>This document has been classified as compliant with ISO 9001:2015 Clause 7.5.</p>
      </div>
    ),
  },
};

export const Rejected: Story = {
  args: {
    status: 'rejected',
    aiSystem: 'Risk Analyser',
    riskLevel: 'medium',
    reviewer: 'John Smith',
    reviewedAt: new Date().toISOString(),
    children: (
      <div style={{ padding: '16px', background: '#fef2f2', borderRadius: '8px' }}>
        <p>AI suggested closing this risk, but it was rejected by the reviewer.</p>
      </div>
    ),
  },
};

export const BlurredContent: Story = {
  args: {
    status: 'pending',
    aiSystem: 'Compliance AI',
    riskLevel: 'critical',
    blurUntilReview: true,
    onApprove: () => console.log('Approved'),
    onReject: (reason) => console.log('Rejected:', reason),
    children: (
      <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
        <p>This content is blurred until human review is completed.</p>
        <p>Critical risk level content requires additional oversight.</p>
      </div>
    ),
  },
};
