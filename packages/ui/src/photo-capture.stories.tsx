import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PhotoCapture } from './photo-capture';

const meta: Meta<typeof PhotoCapture> = {
  title: 'Components/PhotoCapture',
  component: PhotoCapture,
  tags: ['autodocs'],
  argTypes: {
    maxPhotos: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof PhotoCapture>;

export const Default: Story = {
  render: () => {
    const [photos, setPhotos] = useState<string[]>([]);
    return (
      <PhotoCapture
        onCapture={(imageData) => setPhotos((prev) => [...prev, imageData])}
        existingPhotos={photos}
        onRemove={(index) => setPhotos((prev) => prev.filter((_, i) => i !== index))}
        maxPhotos={5}
      />
    );
  },
};

export const WithExistingPhotos: Story = {
  render: () => (
    <PhotoCapture
      onCapture={() => {}}
      existingPhotos={[
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzNiODJmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTQiPlBob3RvIDE8L3RleHQ+PC9zdmc+',
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzIyYzU1ZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTQiPlBob3RvIDI8L3RleHQ+PC9zdmc+',
      ]}
      maxPhotos={5}
    />
  ),
};

export const SinglePhoto: Story = {
  render: () => {
    const [photo, setPhoto] = useState<string[]>([]);
    return (
      <PhotoCapture
        onCapture={(imageData) => setPhoto([imageData])}
        existingPhotos={photo}
        onRemove={() => setPhoto([])}
        maxPhotos={1}
      />
    );
  },
};
