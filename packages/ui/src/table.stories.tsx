import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './table';
import { Badge } from './badge';

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Table>;

const sampleData = [
  { id: 'WO-001', title: 'Replace HVAC filter', status: 'Open', priority: 'High', assignee: 'Alice' },
  { id: 'WO-002', title: 'Inspect fire suppression', status: 'In Progress', priority: 'Critical', assignee: 'Bob' },
  { id: 'WO-003', title: 'Lubricate conveyor belt', status: 'Closed', priority: 'Low', assignee: 'Carol' },
  { id: 'WO-004', title: 'Electrical panel audit', status: 'Open', priority: 'Medium', assignee: 'Dave' },
];

const statusVariant = (s: string) => {
  if (s === 'Open') return 'info' as const;
  if (s === 'In Progress') return 'warning' as const;
  if (s === 'Closed') return 'success' as const;
  return 'default' as const;
};

const priorityVariant = (p: string) => {
  if (p === 'Critical') return 'danger' as const;
  if (p === 'High') return 'destructive' as const;
  if (p === 'Medium') return 'warning' as const;
  return 'secondary' as const;
};

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Assignee</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleData.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.id}</TableCell>
            <TableCell>{row.title}</TableCell>
            <TableCell>
              <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={priorityVariant(row.priority)}>{row.priority}</Badge>
            </TableCell>
            <TableCell>{row.assignee}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithCaption: Story = {
  render: () => (
    <Table>
      <TableCaption>A list of work orders for the current week.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleData.slice(0, 3).map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.id}</TableCell>
            <TableCell>{row.title}</TableCell>
            <TableCell>
              <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Qty</TableHead>
          <TableHead style={{ textAlign: 'right' }}>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>HVAC Filter</TableCell>
          <TableCell>2</TableCell>
          <TableCell style={{ textAlign: 'right' }}>$48.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Lubricant (5L)</TableCell>
          <TableCell>1</TableCell>
          <TableCell style={{ textAlign: 'right' }}>$22.50</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Bearing Kit</TableCell>
          <TableCell>3</TableCell>
          <TableCell style={{ textAlign: 'right' }}>$135.00</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell style={{ textAlign: 'right' }}>$205.50</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const Empty: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={3} style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
            No records found.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const Loading: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[1, 2, 3].map((i) => (
          <TableRow key={i}>
            {[1, 2, 3].map((j) => (
              <TableCell key={j}>
                <div
                  style={{
                    height: '16px',
                    borderRadius: '4px',
                    backgroundColor: '#e5e7eb',
                    width: `${60 + Math.random() * 40}%`,
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithPagination: Story = {
  render: () => (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sampleData.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.title}</TableCell>
              <TableCell>
                <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={priorityVariant(row.priority)}>{row.priority}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.875rem', color: '#6b7280' }}>
        <span>Showing 1–4 of 48 records</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ padding: '4px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}>Previous</button>
          <button style={{ padding: '4px 12px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#3b82f6', color: '#fff' }}>1</button>
          <button style={{ padding: '4px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}>2</button>
          <button style={{ padding: '4px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}>Next</button>
        </div>
      </div>
    </div>
  ),
};
