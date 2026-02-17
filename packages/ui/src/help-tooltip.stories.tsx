import type { Meta, StoryObj } from '@storybook/react';
import { HelpTooltip } from './help-tooltip';

const meta: Meta<typeof HelpTooltip> = {
  title: 'Components/HelpTooltip',
  component: HelpTooltip,
  tags: ['autodocs'],
  argTypes: {
    content: { control: 'text' },
    isoRef: { control: 'text' },
    videoUrl: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof HelpTooltip>;

export const Default: Story = {
  args: {
    content: 'A risk assessment evaluates the likelihood and impact of identified hazards.',
  },
};

export const WithISOReference: Story = {
  args: {
    content: 'Document control ensures all documents are reviewed, approved, and distributed correctly.',
    isoRef: 'ISO 9001:2015 Clause 7.5',
  },
};

export const WithVideoLink: Story = {
  args: {
    content: 'Learn how to create and manage corrective actions.',
    videoUrl: 'https://example.com/tutorial',
  },
};

export const WithAll: Story = {
  args: {
    content: 'Internal audits verify that the management system conforms to planned arrangements.',
    isoRef: 'ISO 9001:2015 Clause 9.2',
    videoUrl: 'https://example.com/audit-tutorial',
  },
};

export const InContext: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
      <span>Risk Likelihood</span>
      <HelpTooltip
        content="Rate the probability of this risk occurring on a scale of 1-5."
        isoRef="ISO 31000:2018 Clause 6.4"
      />
    </div>
  ),
};
