import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PhotoAnnotation } from './photo-annotation';
import { Button } from './button';

const meta: Meta<typeof PhotoAnnotation> = {
  title: 'Components/PhotoAnnotation',
  component: PhotoAnnotation,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PhotoAnnotation>;

const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YxZjVmOSIvPjxyZWN0IHg9IjEwMCIgeT0iMTAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2U1ZTdlYiIgcng9IjgiLz48cmVjdCB4PSI0MDAiIHk9IjIwMCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlNWU3ZWIiIHJ4PSI4Ii8+PHRleHQgeD0iNDAwIiB5PSIzMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiIGZvbnQtc2l6ZT0iMTgiPkFubm90YXRlIHRoaXMgaW1hZ2U8L3RleHQ+PC9zdmc+';

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    const [result, setResult] = useState<string>('');

    if (!open) {
      return (
        <div>
          {result && <img src={result} alt="Annotated" style={{ maxWidth: '400px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />}
          <Button onClick={() => setOpen(true)} style={{ marginTop: '16px' }}>Open Annotator</Button>
        </div>
      );
    }

    return (
      <PhotoAnnotation
        imageSrc={placeholderImage}
        onSave={(annotated) => { setResult(annotated); setOpen(false); }}
        onCancel={() => setOpen(false)}
      />
    );
  },
};
