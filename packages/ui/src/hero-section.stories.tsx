import type { Meta, StoryObj } from '@storybook/react';
import { HeroSection, HeroButton } from './hero-section';

const meta: Meta<typeof HeroSection> = {
  title: 'Nexara/HeroSection',
  component: HeroSection,
  tags: ['autodocs'],
  argTypes: {
    eyebrow: { control: 'text' },
    description: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof HeroSection>;

export const Default: Story = {
  args: {
    eyebrow: 'Integrated Management System',
    title: 'One platform for all your compliance needs',
    description: 'Manage ISO 9001, 14001, 45001 and 30+ standards from a single, unified dashboard.',
    children: (
      <div style={{ display: 'flex', gap: '12px' }}>
        <HeroButton variant="primary">Get Started</HeroButton>
        <HeroButton variant="ghost">Learn More</HeroButton>
      </div>
    ),
  },
};

export const MinimalHero: Story = {
  args: {
    title: 'Welcome to Nexara',
  },
};

export const WithRichTitle: Story = {
  args: {
    eyebrow: 'Now Available',
    title: (
      <>
        Enterprise Risk Management,{' '}
        <span style={{ color: '#14b8a6' }}>Reimagined</span>
      </>
    ),
    description: 'ISO 31000 compliant risk registers, bow-tie analysis, and real-time KRI monitoring.',
    children: <HeroButton variant="primary">Explore Risk Module</HeroButton>,
  },
};
