import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <div style={{ padding: '16px 0' }}>
          <h3 style={{ marginBottom: '8px', fontWeight: '600' }}>Overview</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>This is the overview tab content with general information about this item.</p>
        </div>
      </TabsContent>
      <TabsContent value="details">
        <div style={{ padding: '16px 0' }}>
          <h3 style={{ marginBottom: '8px', fontWeight: '600' }}>Details</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>Here are the detailed specifications and additional information.</p>
        </div>
      </TabsContent>
      <TabsContent value="history">
        <div style={{ padding: '16px 0' }}>
          <h3 style={{ marginBottom: '8px', fontWeight: '600' }}>History</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>Activity timeline and revision history appears here.</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const SingleTab: Story = {
  render: () => (
    <Tabs defaultValue="info">
      <TabsList>
        <TabsTrigger value="info">Information</TabsTrigger>
      </TabsList>
      <TabsContent value="info">
        <div style={{ padding: '16px 0' }}>
          <p style={{ color: '#666', fontSize: '14px' }}>Single tab content.</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const ManyTabs: Story = {
  render: () => (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">General</TabsTrigger>
        <TabsTrigger value="tab2">Security</TabsTrigger>
        <TabsTrigger value="tab3">Notifications</TabsTrigger>
        <TabsTrigger value="tab4">Billing</TabsTrigger>
        <TabsTrigger value="tab5">Integrations</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <div style={{ padding: '16px 0' }}>
          <h3 style={{ marginBottom: '8px', fontWeight: '600' }}>General Settings</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>General configuration options for your account.</p>
        </div>
      </TabsContent>
      <TabsContent value="tab2">
        <div style={{ padding: '16px 0' }}>
          <h3 style={{ marginBottom: '8px', fontWeight: '600' }}>Security</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>Manage your security settings and passwords.</p>
        </div>
      </TabsContent>
      <TabsContent value="tab3">
        <div style={{ padding: '16px 0' }}>
          <h3 style={{ marginBottom: '8px', fontWeight: '600' }}>Notifications</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>Configure your notification preferences.</p>
        </div>
      </TabsContent>
      <TabsContent value="tab4">
        <div style={{ padding: '16px 0' }}>
          <h3 style={{ marginBottom: '8px', fontWeight: '600' }}>Billing</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>Manage your billing and subscription.</p>
        </div>
      </TabsContent>
      <TabsContent value="tab5">
        <div style={{ padding: '16px 0' }}>
          <h3 style={{ marginBottom: '8px', fontWeight: '600' }}>Integrations</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>Connect third-party services.</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const WithDisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="active">
      <TabsList>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="locked" disabled={true}>Locked</TabsTrigger>
      </TabsList>
      <TabsContent value="active">
        <div style={{ padding: '16px 0' }}>
          <p style={{ color: '#666', fontSize: '14px' }}>This tab is accessible.</p>
        </div>
      </TabsContent>
      <TabsContent value="settings">
        <div style={{ padding: '16px 0' }}>
          <p style={{ color: '#666', fontSize: '14px' }}>Settings tab content.</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const ControlledTab: Story = {
  render: () => {
    const [activeTab, setActiveTab] = React.useState('tab2');

    return (
      <div>
        <p style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
          Current tab: <strong>{activeTab}</strong>
        </p>
        <Tabs defaultValue="tab2" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="tab1">Tab A</TabsTrigger>
            <TabsTrigger value="tab2">Tab B (Default)</TabsTrigger>
            <TabsTrigger value="tab3">Tab C</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <div style={{ padding: '16px 0' }}>
              <p style={{ color: '#666', fontSize: '14px' }}>Content for Tab A</p>
            </div>
          </TabsContent>
          <TabsContent value="tab2">
            <div style={{ padding: '16px 0' }}>
              <p style={{ color: '#666', fontSize: '14px' }}>Content for Tab B (default active)</p>
            </div>
          </TabsContent>
          <TabsContent value="tab3">
            <div style={{ padding: '16px 0' }}>
              <p style={{ color: '#666', fontSize: '14px' }}>Content for Tab C</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  },
};

export const RichContent: Story = {
  render: () => (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="specs">Specifications</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <div style={{ padding: '16px 0' }}>
          <h3 style={{ marginBottom: '8px', fontWeight: '600' }}>Product Overview</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>
            This is a comprehensive product with many features designed for professional use.
          </p>
          <ul style={{ marginLeft: '20px', color: '#666', fontSize: '14px', listStyle: 'disc' }}>
            <li>Feature 1</li>
            <li>Feature 2</li>
            <li>Feature 3</li>
          </ul>
        </div>
      </TabsContent>
      <TabsContent value="specs">
        <div style={{ padding: '16px 0' }}>
          <h3 style={{ marginBottom: '8px', fontWeight: '600' }}>Technical Specifications</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee', fontSize: '14px' }}>Weight</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee', fontSize: '14px', textAlign: 'right' }}>2.5 kg</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee', fontSize: '14px' }}>Dimensions</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee', fontSize: '14px', textAlign: 'right' }}>30x20x15 cm</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee', fontSize: '14px' }}>Power</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee', fontSize: '14px', textAlign: 'right' }}>AC 220V</td>
              </tr>
            </tbody>
          </table>
        </div>
      </TabsContent>
      <TabsContent value="reviews">
        <div style={{ padding: '16px 0' }}>
          <h3 style={{ marginBottom: '8px', fontWeight: '600' }}>Customer Reviews</h3>
          <div style={{ marginTop: '12px' }}>
            <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px', marginBottom: '12px' }}>
              <p style={{ fontWeight: '500', fontSize: '14px', marginBottom: '4px' }}>★★★★★ Great product!</p>
              <p style={{ color: '#666', fontSize: '13px' }}>Highly recommend this to anyone looking for quality.</p>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
              <p style={{ fontWeight: '500', fontSize: '14px', marginBottom: '4px' }}>★★★★ Very good</p>
              <p style={{ color: '#666', fontSize: '13px' }}>Excellent value for money.</p>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  ),
};
