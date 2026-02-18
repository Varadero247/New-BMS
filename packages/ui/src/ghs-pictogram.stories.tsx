import type { Meta, StoryObj } from '@storybook/react';
import { GhsPictogram, GhsPictogramGroup, type GhsPictogramType } from './ghs-pictogram';

const meta: Meta<typeof GhsPictogram> = {
  title: 'Components/GhsPictogram',
  component: GhsPictogram,
  tags: ['autodocs'],
  argTypes: {
    pictogram: {
      control: 'select',
      options: [
        'GHS01_EXPLOSIVE',
        'GHS02_FLAMMABLE',
        'GHS03_OXIDISING',
        'GHS04_GAS_UNDER_PRESSURE',
        'GHS05_CORROSIVE',
        'GHS06_TOXIC',
        'GHS07_IRRITANT_HARMFUL',
        'GHS08_HEALTH_HAZARD',
        'GHS09_ENVIRONMENTAL',
      ],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof GhsPictogram>;

export const Explosive: Story = {
  args: { pictogram: 'GHS01_EXPLOSIVE', size: 'md' },
};

export const Flammable: Story = {
  args: { pictogram: 'GHS02_FLAMMABLE', size: 'md' },
};

export const Toxic: Story = {
  args: { pictogram: 'GHS06_TOXIC', size: 'md' },
};

export const Corrosive: Story = {
  args: { pictogram: 'GHS05_CORROSIVE', size: 'md' },
};

export const Small: Story = {
  args: { pictogram: 'GHS02_FLAMMABLE', size: 'sm' },
};

export const Large: Story = {
  args: { pictogram: 'GHS06_TOXIC', size: 'lg' },
};

export const AllPictograms: Story = {
  render: () => {
    const all: GhsPictogramType[] = [
      'GHS01_EXPLOSIVE',
      'GHS02_FLAMMABLE',
      'GHS03_OXIDISING',
      'GHS04_GAS_UNDER_PRESSURE',
      'GHS05_CORROSIVE',
      'GHS06_TOXIC',
      'GHS07_IRRITANT_HARMFUL',
      'GHS08_HEALTH_HAZARD',
      'GHS09_ENVIRONMENTAL',
    ];
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {all.map((p) => (
          <div key={p} style={{ textAlign: 'center' }}>
            <GhsPictogram pictogram={p} size="md" />
            <p style={{ fontSize: '11px', marginTop: '4px', color: '#666', maxWidth: '80px' }}>
              {p.replace('GHS0', '').replace('_', ' ')}
            </p>
          </div>
        ))}
      </div>
    );
  },
};

export const PictogramGroup: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <GhsPictogramGroup
        pictograms={['GHS02_FLAMMABLE', 'GHS06_TOXIC', 'GHS05_CORROSIVE']}
        size="md"
      />
      <GhsPictogramGroup
        pictograms={[
          'GHS01_EXPLOSIVE',
          'GHS03_OXIDISING',
          'GHS04_GAS_UNDER_PRESSURE',
          'GHS09_ENVIRONMENTAL',
        ]}
        size="sm"
      />
    </div>
  ),
};
