import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AIDisclosure } from './ai-disclosure';

const meta: Meta<typeof AIDisclosure> = {
  title: 'Components/AIDisclosure',
  component: AIDisclosure,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['inline', 'banner', 'compact'] },
    provider: { control: 'select', options: ['claude', 'openai', 'grok'] },
    confidence: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
    pendingReview: { control: 'boolean' },
    analysisType: { control: 'text' },
    model: { control: 'text' },
    reasoning: { control: 'text' },
    requestId: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof AIDisclosure>;

export const Inline: Story = {
  args: {
    variant: 'inline',
    provider: 'claude',
    model: 'claude-sonnet-4-5',
    analysisType: 'Risk Assessment',
    confidence: 0.92,
    generatedAt: new Date().toISOString(),
    requestId: 'req-abc-123',
    reasoning: 'Based on historical incident data and trend analysis.',
  },
};

export const Banner: Story = {
  args: {
    variant: 'banner',
    provider: 'claude',
    model: 'claude-opus-4-6',
    analysisType: 'Document Classification',
    confidence: 0.78,
    generatedAt: new Date().toISOString(),
    requestId: 'req-def-456',
  },
};

export const Compact: Story = {
  args: {
    variant: 'compact',
    provider: 'claude',
    confidence: 0.95,
  },
};

export const PendingReview: Story = {
  args: {
    variant: 'banner',
    provider: 'claude',
    model: 'claude-sonnet-4-5',
    analysisType: 'Compliance Gap Analysis',
    confidence: 0.65,
    pendingReview: true,
    generatedAt: new Date().toISOString(),
    reasoning: 'Cross-referenced against ISO 9001:2015 requirements matrix.',
  },
};

export const WithFeedback: Story = {
  render: () => {
    const [feedback, setFeedback] = useState<boolean | null>(null);
    return (
      <div>
        <AIDisclosure
          variant="banner"
          provider="claude"
          model="claude-opus-4-6"
          analysisType="Predictive Risk Scoring"
          confidence={0.88}
          generatedAt={new Date().toISOString()}
          onFeedback={(helpful) => setFeedback(helpful)}
        />
        {feedback !== null && (
          <p style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
            Feedback: {feedback ? 'Helpful' : 'Not helpful'}
          </p>
        )}
      </div>
    );
  },
};

export const LegacySystemName: Story = {
  args: {
    variant: 'inline',
    systemName: 'Risk Scorer v2.1',
    modelVersion: 'claude-3-opus',
    confidence: 0.92,
    generatedAt: new Date().toISOString(),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <AIDisclosure variant="compact" provider="claude" confidence={0.95} />
      <AIDisclosure
        variant="inline"
        provider="claude"
        model="claude-sonnet-4-5"
        analysisType="Risk Assessment"
        confidence={0.88}
        generatedAt={new Date().toISOString()}
      />
      <AIDisclosure
        variant="banner"
        provider="claude"
        model="claude-opus-4-6"
        analysisType="Gap Analysis"
        confidence={0.72}
        generatedAt={new Date().toISOString()}
        requestId="req-xyz-789"
        reasoning="Analysed 45 control requirements against current documentation."
        pendingReview
      />
    </div>
  ),
};
