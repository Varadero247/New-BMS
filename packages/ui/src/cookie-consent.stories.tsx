import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CookieConsent, type CookieChoices } from './cookie-consent';

const meta: Meta<typeof CookieConsent> = {
  title: 'Components/CookieConsent',
  component: CookieConsent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CookieConsent>;

export const Default: Story = {
  render: () => {
    const [choices, setChoices] = useState<CookieChoices | null>(null);
    return (
      <div>
        {choices && (
          <div
            style={{
              marginBottom: '16px',
              padding: '12px',
              background: '#f0fdf4',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          >
            Consent given: {JSON.stringify(choices)}
          </div>
        )}
        <CookieConsent onConsent={setChoices} />
      </div>
    );
  },
};
