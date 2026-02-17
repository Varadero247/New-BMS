import type { Meta, StoryObj } from '@storybook/react';
import { SectorCard } from './sector-card';

const meta: Meta<typeof SectorCard> = {
  title: 'Nexara/SectorCard',
  component: SectorCard,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    standard: { control: 'text' },
    tagline: { control: 'text' },
    color: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof SectorCard>;

export const Automotive: Story = {
  args: {
    name: 'Automotive',
    standard: 'IATF 16949',
    tagline: 'Quality management for the automotive supply chain',
    color: '#3b82f6',
  },
};

export const Aerospace: Story = {
  args: {
    name: 'Aerospace',
    standard: 'AS9100D',
    tagline: 'Quality and safety management for aviation',
    color: '#6366f1',
  },
};

export const Medical: Story = {
  args: {
    name: 'Medical Devices',
    standard: 'ISO 13485',
    tagline: 'Regulatory compliance for medical device manufacturers',
    color: '#ec4899',
  },
};

export const WithIcon: Story = {
  args: {
    name: 'Food Safety',
    standard: 'ISO 22000',
    tagline: 'HACCP-based food safety management',
    color: '#f59e0b',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
};

export const Grid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
      <SectorCard name="Automotive" standard="IATF 16949" color="#3b82f6" tagline="Automotive supply chain" />
      <SectorCard name="Aerospace" standard="AS9100D" color="#6366f1" tagline="Aviation quality" />
      <SectorCard name="Medical" standard="ISO 13485" color="#ec4899" tagline="Medical devices" />
    </div>
  ),
};
