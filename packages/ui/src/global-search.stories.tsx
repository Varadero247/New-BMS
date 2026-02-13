import type { Meta, StoryObj } from '@storybook/react';
import { GlobalSearch, type SearchResult } from './global-search';

const meta: Meta<typeof GlobalSearch> = {
  title: 'Components/GlobalSearch',
  component: GlobalSearch,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GlobalSearch>;

const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    title: 'Health & Safety Dashboard',
    description: 'Main dashboard for health and safety',
    href: '/health-safety',
    category: 'H&S',
  },
  {
    id: '2',
    title: 'Risk Assessment',
    description: 'Create and manage risk assessments',
    href: '/health-safety/risks',
    category: 'H&S',
  },
  {
    id: '3',
    title: 'Environment Events',
    description: 'Track environmental events',
    href: '/environment/events',
    category: 'ENV',
  },
  {
    id: '4',
    title: 'Quality Non-Conformances',
    description: 'Manage quality issues',
    href: '/quality/nonconformances',
    category: 'QA',
  },
  {
    id: '5',
    title: 'Settings',
    description: 'System configuration',
    href: '/settings',
    category: 'SYS',
  },
];

export const Default: Story = {
  args: {
    placeholder: 'Search across all modules...',
    onSearch: async (query: string) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockSearchResults.filter(
        result =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.description?.toLowerCase().includes(query.toLowerCase())
      );
    },
    onSelect: (result: SearchResult) => {
      alert(`Selected: ${result.title}`);
    },
  },
};

export const WithHints: Story = {
  args: {
    placeholder: 'Type to search (try "health", "risk", "environment")...',
    onSearch: async (query: string) => {
      await new Promise(resolve => setTimeout(resolve, 250));
      return mockSearchResults.filter(
        result =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.description?.toLowerCase().includes(query.toLowerCase())
      );
    },
    onSelect: (result: SearchResult) => {
      console.log('Selected:', result);
    },
  },
};

export const LotsOfResults: Story = {
  args: {
    placeholder: 'Search modules...',
    onSearch: async (query: string) => {
      await new Promise(resolve => setTimeout(resolve, 400));
      const allResults: SearchResult[] = [
        ...mockSearchResults,
        {
          id: '6',
          title: 'Incident Report #001',
          description: 'Safety incident on 2024-01-15',
          href: '/health-safety/incidents/1',
          category: 'H&S',
        },
        {
          id: '7',
          title: 'Energy Consumption Report',
          description: 'Monthly energy usage analysis',
          href: '/energy/reports/monthly',
          category: 'ENR',
        },
        {
          id: '8',
          title: 'Audit Log',
          description: 'System audit trail and activity log',
          href: '/settings/audit-log',
          category: 'SYS',
        },
        {
          id: '9',
          title: 'User Management',
          description: 'Manage system users and permissions',
          href: '/settings/users',
          category: 'SYS',
        },
        {
          id: '10',
          title: 'Compliance Calendar',
          description: 'Regulatory compliance dates and deadlines',
          href: '/compliance/calendar',
          category: 'COMP',
        },
      ];
      return allResults.filter(
        result =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.description?.toLowerCase().includes(query.toLowerCase())
      );
    },
    onSelect: (result: SearchResult) => {
      alert(`Navigating to: ${result.href}`);
    },
  },
};

export const SlowSearch: Story = {
  args: {
    placeholder: 'Search... (simulates slow network)',
    debounceMs: 500,
    onSearch: async (query: string) => {
      // Simulate slow network request
      await new Promise(resolve => setTimeout(resolve, 1500));
      return mockSearchResults.filter(
        result =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.description?.toLowerCase().includes(query.toLowerCase())
      );
    },
    onSelect: (result: SearchResult) => {
      console.log('Selected:', result);
    },
  },
};

export const NoResults: Story = {
  args: {
    placeholder: 'Try searching for "xyz" to see no results...',
    onSearch: async (query: string) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Only return results if query contains "test"
      return query.toLowerCase().includes('test')
        ? mockSearchResults
        : [];
    },
    onSelect: (result: SearchResult) => {
      console.log('Selected:', result);
    },
  },
};

export const WithIcons: Story = {
  args: {
    placeholder: 'Search with icons...',
    onSearch: async (query: string) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const resultsWithIcons: SearchResult[] = [
        {
          id: '1',
          title: 'Health & Safety',
          description: 'Dashboard and risk management',
          href: '/health-safety',
          category: 'H&S',
          icon: '🏥',
        },
        {
          id: '2',
          title: 'Environment',
          description: 'Environmental aspects and events',
          href: '/environment',
          category: 'ENV',
          icon: '🌍',
        },
        {
          id: '3',
          title: 'Quality',
          description: 'Quality assurance and controls',
          href: '/quality',
          category: 'QA',
          icon: '✓',
        },
        {
          id: '4',
          title: 'Settings',
          description: 'System configuration',
          href: '/settings',
          category: 'SYS',
          icon: '⚙️',
        },
      ];
      return resultsWithIcons.filter(
        result =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.description?.toLowerCase().includes(query.toLowerCase())
      );
    },
    onSelect: (result: SearchResult) => {
      console.log('Selected:', result);
    },
  },
};

export const CustomDebounce: Story = {
  args: {
    placeholder: 'Fast debounce (100ms)...',
    debounceMs: 100,
    onSearch: async (query: string) => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockSearchResults.filter(
        result =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.description?.toLowerCase().includes(query.toLowerCase())
      );
    },
    onSelect: (result: SearchResult) => {
      console.log('Selected:', result);
    },
  },
};

export const EmptyState: Story = {
  args: {
    placeholder: 'No results will appear...',
    onSearch: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [];
    },
    onSelect: (result: SearchResult) => {
      console.log('Selected:', result);
    },
  },
};
