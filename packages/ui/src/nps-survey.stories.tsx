import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { NpsSurvey } from './nps-survey';

const meta: Meta<typeof NpsSurvey> = {
  title: 'Components/NpsSurvey',
  component: NpsSurvey,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NpsSurvey>;

export const Default: Story = {
  render: () => {
    const [result, setResult] = useState<string>('');
    const [visible, setVisible] = useState(true);

    if (!visible) {
      return (
        <div>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            Survey dismissed. Result: {result || 'No submission'}
          </p>
          <button
            onClick={() => { setVisible(true); setResult(''); }}
            style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer' }}
          >
            Show Again
          </button>
        </div>
      );
    }

    return (
      <NpsSurvey
        onSubmit={(score, comment) => {
          setResult(`Score: ${score}${comment ? `, Comment: ${comment}` : ''}`);
          setTimeout(() => setVisible(false), 2000);
        }}
        onDismiss={() => setVisible(false)}
      />
    );
  },
};
