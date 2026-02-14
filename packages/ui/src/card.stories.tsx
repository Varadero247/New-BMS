import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';
import { Button } from './button';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card style={{ width: '360px' }}>
      <CardContent>
        <p>This is a basic card with content.</p>
      </CardContent>
    </Card>
  ),
};

export const WithHeader: Story = {
  render: () => (
    <Card style={{ width: '360px' }}>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>A short description of this card.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here. You can put any content inside.</p>
      </CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card style={{ width: '360px' }}>
      <CardHeader>
        <CardTitle>Card with Footer</CardTitle>
        <CardDescription>This card has a footer with action buttons.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card body content.</p>
      </CardContent>
      <CardFooter style={{ gap: '8px' }}>
        <Button variant="outline" size="sm">Cancel</Button>
        <Button size="sm">Confirm</Button>
      </CardFooter>
    </Card>
  ),
};

export const Clickable: Story = {
  render: () => (
    <Card
      style={{ width: '360px', cursor: 'pointer' }}
      onClick={() => alert('Card clicked!')}
      className="hover:shadow-md transition-shadow"
    >
      <CardHeader>
        <CardTitle>Clickable Card</CardTitle>
        <CardDescription>Click anywhere on this card.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card acts as a link or interactive element.</p>
      </CardContent>
    </Card>
  ),
};

export const MetricCard: Story = {
  render: () => (
    <Card style={{ width: '240px' }}>
      <CardHeader>
        <CardDescription>Total Incidents</CardDescription>
        <CardTitle style={{ fontSize: '2rem' }}>42</CardTitle>
      </CardHeader>
      <CardContent>
        <p style={{ fontSize: '0.75rem', color: '#10B981' }}>+12% from last month</p>
      </CardContent>
    </Card>
  ),
};

export const FullExample: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      {['Open', 'In Progress', 'Closed'].map((status) => (
        <Card key={status} style={{ width: '200px' }}>
          <CardHeader>
            <CardDescription>Work Orders</CardDescription>
            <CardTitle style={{ fontSize: '1.75rem' }}>
              {status === 'Open' ? 14 : status === 'In Progress' ? 7 : 32}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{status}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};
