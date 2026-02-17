import type { Meta, StoryObj } from '@storybook/react';
import { SeverityChip, StatusChip, ISOStatusChip } from './chips';

const severityMeta: Meta<typeof SeverityChip> = {
  title: 'Components/Chips/SeverityChip',
  component: SeverityChip,
  tags: ['autodocs'],
  argTypes: {
    severity: {
      control: 'select',
      options: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    },
  },
};

export default severityMeta;
type SeverityStory = StoryObj<typeof SeverityChip>;

export const Critical: SeverityStory = {
  args: { severity: 'CRITICAL' },
};

export const High: SeverityStory = {
  args: { severity: 'HIGH' },
};

export const Medium: SeverityStory = {
  args: { severity: 'MEDIUM' },
};

export const Low: SeverityStory = {
  args: { severity: 'LOW' },
};

export const AllSeverities: SeverityStory = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <SeverityChip severity="CRITICAL" />
      <SeverityChip severity="HIGH" />
      <SeverityChip severity="MEDIUM" />
      <SeverityChip severity="LOW" />
    </div>
  ),
};

export const AllStatusChips: SeverityStory = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
      <StatusChip status="OPEN" />
      <StatusChip status="IN_PROGRESS" />
      <StatusChip status="UNDER_REVIEW" />
      <StatusChip status="CLOSED" />
      <StatusChip status="RESOLVED" />
      <StatusChip status="DRAFT" />
      <StatusChip status="APPROVED" />
      <StatusChip status="SUPERSEDED" />
      <StatusChip status="CANCELLED" />
    </div>
  ),
};

export const AllISOStatusChips: SeverityStory = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
      <ISOStatusChip status="COMPLIANT" />
      <ISOStatusChip status="PARTIAL" />
      <ISOStatusChip status="NON_COMPLIANT" />
      <ISOStatusChip status="NOT_APPLICABLE" />
      <ISOStatusChip status="OBSERVATION" />
      <ISOStatusChip status="MAJOR_NC" />
      <ISOStatusChip status="MINOR_NC" />
    </div>
  ),
};
