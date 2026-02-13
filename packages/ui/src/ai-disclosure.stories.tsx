import type { Meta, StoryObj } from '@storybook/react';
import { AIDisclosure } from './ai-disclosure';

const meta: Meta<typeof AIDisclosure> = {
  title: 'Components/AIDisclosure',
  component: AIDisclosure,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['inline', 'banner', 'compact'] },
  },
};

export default meta;
type Story = StoryObj<typeof AIDisclosure>;

export const Inline: Story = {
  args: {
    variant: 'inline',
    systemName: 'Risk Scorer v2.1',
    confidence: 0.92,
    modelVersion: 'claude-3-opus',
    generatedAt: new Date().toISOString(),
    reasoning: 'Based on historical incident data and trend analysis.',
  },
};

export const Banner: Story = {
  args: {
    variant: 'banner',
    systemName: 'Document Classifier',
    confidence: 0.78,
    modelVersion: 'gpt-4',
  },
};

export const Compact: Story = {
  args: {
    variant: 'compact',
    systemName: 'AI Analysis',
    confidence: 0.95,
  },
};
