import type { Meta, StoryObj } from '@storybook/react';
import { LocationDisplay } from './location-display';

const meta: Meta<typeof LocationDisplay> = {
  title: 'Components/LocationDisplay',
  component: LocationDisplay,
  tags: ['autodocs'],
  argTypes: {
    latitude: { control: 'number' },
    longitude: { control: 'number' },
    accuracy: { control: 'number' },
    label: { control: 'text' },
    compact: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof LocationDisplay>;

export const Default: Story = {
  args: {
    latitude: 51.5074,
    longitude: -0.1278,
    accuracy: 15,
    label: 'London, UK',
  },
};

export const Compact: Story = {
  args: {
    latitude: 51.5074,
    longitude: -0.1278,
    accuracy: 15,
    compact: true,
  },
};

export const WithoutAccuracy: Story = {
  args: {
    latitude: 40.7128,
    longitude: -74.006,
    label: 'New York, USA',
  },
};

export const HighAccuracy: Story = {
  args: {
    latitude: 48.8566,
    longitude: 2.3522,
    accuracy: 3,
    label: 'Paris, France',
  },
};

export const LowAccuracy: Story = {
  args: {
    latitude: -33.8688,
    longitude: 151.2093,
    accuracy: 150,
    label: 'Sydney, Australia',
  },
};
