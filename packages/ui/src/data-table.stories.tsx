import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from './data-table';
import { Badge } from './badge';

const meta: Meta<typeof DataTable> = {
  title: 'Components/DataTable',
  component: DataTable,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DataTable>;

interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  role: string;
  joinDate: string;
}

const sampleUsers: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    status: 'active',
    role: 'Admin',
    joinDate: '2023-01-15',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    status: 'active',
    role: 'Editor',
    joinDate: '2023-02-20',
  },
  {
    id: '3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    status: 'inactive',
    role: 'Viewer',
    joinDate: '2023-03-10',
  },
  {
    id: '4',
    name: 'Diana Prince',
    email: 'diana@example.com',
    status: 'pending',
    role: 'Editor',
    joinDate: '2024-01-05',
  },
  {
    id: '5',
    name: 'Eve Wilson',
    email: 'eve@example.com',
    status: 'active',
    role: 'Admin',
    joinDate: '2023-06-12',
  },
];

export const Basic: Story = {
  render: () => (
    <DataTable<User>
      columns={[
        { key: 'name', header: 'Name' },
        { key: 'email', header: 'Email' },
        { key: 'role', header: 'Role' },
      ]}
      data={sampleUsers}
      keyExtractor={(item) => item.id}
      emptyMessage="No users found"
    />
  ),
};

export const WithSelection: Story = {
  render: () => {
    const [selected, setSelected] = useState<Set<string>>(new Set());

    return (
      <div>
        <p style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
          Selected: {selected.size > 0 ? Array.from(selected).join(', ') : 'None'}
        </p>
        <DataTable<User>
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'email', header: 'Email' },
            { key: 'role', header: 'Role' },
            { key: 'status', header: 'Status' },
          ]}
          data={sampleUsers}
          keyExtractor={(item) => item.id}
          selectable={true}
          onSelectionChange={setSelected}
        />
      </div>
    );
  },
};

export const WithSorting: Story = {
  render: () => {
    const [sortKey, setSortKey] = useState<string>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleSort = (key: string, direction: 'asc' | 'desc') => {
      setSortKey(key);
      setSortDirection(direction);
    };

    return (
      <DataTable<User>
        columns={[
          { key: 'name', header: 'Name', sortable: true },
          { key: 'email', header: 'Email', sortable: true },
          { key: 'role', header: 'Role', sortable: true },
          { key: 'status', header: 'Status', sortable: true },
        ]}
        data={sampleUsers}
        keyExtractor={(item) => item.id}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
    );
  },
};

export const WithExpansion: Story = {
  render: () => (
    <DataTable<User>
      columns={[
        { key: 'name', header: 'Name' },
        { key: 'email', header: 'Email' },
        { key: 'role', header: 'Role' },
      ]}
      data={sampleUsers}
      keyExtractor={(item) => item.id}
      expandedRender={(item) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Join Date</p>
            <p style={{ fontSize: '14px' }}>{item.joinDate}</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Status</p>
            <Badge variant={item.status === 'active' ? 'success' : item.status === 'inactive' ? 'danger' : 'warning'}>
              {item.status}
            </Badge>
          </div>
        </div>
      )}
    />
  ),
};

export const WithCustomRendering: Story = {
  render: () => (
    <DataTable<User>
      columns={[
        { key: 'name', header: 'Name' },
        { key: 'email', header: 'Email' },
        {
          key: 'status',
          header: 'Status',
          render: (item) => (
            <Badge
              variant={item.status === 'active' ? 'success' : item.status === 'inactive' ? 'danger' : 'warning'}
            >
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Badge>
          ),
        },
        { key: 'role', header: 'Role' },
      ]}
      data={sampleUsers}
      keyExtractor={(item) => item.id}
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <DataTable<User>
      columns={[
        { key: 'name', header: 'Name' },
        { key: 'email', header: 'Email' },
        { key: 'role', header: 'Role' },
      ]}
      data={[]}
      keyExtractor={(item) => item.id}
      emptyMessage="No users found. Create your first user to get started."
    />
  ),
};

export const Loading: Story = {
  render: () => (
    <DataTable<User>
      columns={[
        { key: 'name', header: 'Name' },
        { key: 'email', header: 'Email' },
        { key: 'role', header: 'Role' },
        { key: 'status', header: 'Status' },
      ]}
      data={[]}
      keyExtractor={(item) => item.id}
      loading={true}
    />
  ),
};

export const WithColumnToggle: Story = {
  render: () => {
    const [selected, setSelected] = useState<Set<string>>(new Set());

    return (
      <DataTable<User>
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'email', header: 'Email' },
          { key: 'role', header: 'Role' },
          { key: 'status', header: 'Status', defaultHidden: true },
          { key: 'joinDate', header: 'Join Date' },
        ]}
        data={sampleUsers}
        keyExtractor={(item) => item.id}
        columnToggle={true}
        selectable={true}
        onSelectionChange={setSelected}
        actions={selected.size > 0 && <span>{selected.size} selected</span>}
      />
    );
  },
};

export const Complex: Story = {
  render: () => {
    const [sortKey, setSortKey] = useState<string>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const handleSort = (key: string, direction: 'asc' | 'desc') => {
      setSortKey(key);
      setSortDirection(direction);
    };

    return (
      <DataTable<User>
        columns={[
          { key: 'name', header: 'Name', sortable: true },
          { key: 'email', header: 'Email', sortable: true },
          {
            key: 'status',
            header: 'Status',
            sortable: true,
            render: (item) => (
              <Badge
                variant={item.status === 'active' ? 'success' : item.status === 'inactive' ? 'danger' : 'warning'}
              >
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Badge>
            ),
          },
          { key: 'role', header: 'Role', sortable: true },
        ]}
        data={sampleUsers}
        keyExtractor={(item) => item.id}
        selectable={true}
        onSelectionChange={setSelected}
        columnToggle={true}
        expandedRender={(item) => (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Email</p>
              <p style={{ fontSize: '14px' }}>{item.email}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Join Date</p>
              <p style={{ fontSize: '14px' }}>{item.joinDate}</p>
            </div>
          </div>
        )}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        actions={selected.size > 0 && <span style={{ fontSize: '12px' }}>{selected.size} selected</span>}
      />
    );
  },
};
