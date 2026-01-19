'use client';

import { useState } from 'react';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Mail,
  Smartphone,
  Save,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const settingsSections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'integrations', label: 'Integrations', icon: Globe },
  { id: 'system', label: 'System', icon: Database },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <section.icon className="w-4 h-4" />
                  {section.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeSection === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-medium text-primary">JD</span>
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Change Photo</Button>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">First Name</label>
                    <Input defaultValue="John" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Name</label>
                    <Input defaultValue="Doe" className="mt-1" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" defaultValue="john.doe@company.com" className="mt-1" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium">Phone</label>
                    <Input type="tel" defaultValue="+1 555-0123" className="mt-1" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure how you receive alerts and updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Notifications
                  </h3>
                  <div className="space-y-3 pl-6">
                    {[
                      { label: 'Critical alerts', description: 'Emergency and critical severity alerts' },
                      { label: 'Device status changes', description: 'When devices go offline or have errors' },
                      { label: 'Daily summary', description: 'Daily digest of building activity' },
                      { label: 'Weekly reports', description: 'Weekly energy and performance reports' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Push Notifications
                  </h3>
                  <div className="space-y-3 pl-6">
                    {[
                      { label: 'All alerts', description: 'Receive all alert notifications' },
                      { label: 'Maintenance reminders', description: 'Upcoming maintenance schedules' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your password and security options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Change Password</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Current Password</label>
                      <Input type="password" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">New Password</label>
                      <Input type="password" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Confirm New Password</label>
                      <Input type="password" className="mt-1" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">2FA Status</p>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Update Security
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Theme</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {['Light', 'Dark', 'System'].map((theme) => (
                      <button
                        key={theme}
                        className={`p-4 border rounded-lg text-center hover:border-primary ${
                          theme === 'System' ? 'border-primary bg-primary/5' : ''
                        }`}
                      >
                        <p className="font-medium">{theme}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Dashboard Layout</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {['Compact', 'Comfortable'].map((layout) => (
                      <button
                        key={layout}
                        className={`p-4 border rounded-lg text-center hover:border-primary ${
                          layout === 'Comfortable' ? 'border-primary bg-primary/5' : ''
                        }`}
                      >
                        <p className="font-medium">{layout}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'integrations' && (
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>Connect with external services and APIs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Slack', status: 'connected', description: 'Send alerts to Slack channels' },
                  { name: 'Microsoft Teams', status: 'disconnected', description: 'Integrate with Teams' },
                  { name: 'Webhook', status: 'connected', description: 'Custom webhook endpoints' },
                  { name: 'SMTP Email', status: 'connected', description: 'Email delivery service' },
                ].map((integration) => (
                  <div
                    key={integration.name}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{integration.name}</p>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                    <Button variant={integration.status === 'connected' ? 'outline' : 'default'}>
                      {integration.status === 'connected' ? 'Configure' : 'Connect'}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeSection === 'system' && (
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system-wide preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Timezone</label>
                    <select className="w-full mt-1 p-2 border rounded-lg bg-background">
                      <option>America/New_York (EST)</option>
                      <option>America/Los_Angeles (PST)</option>
                      <option>Europe/London (GMT)</option>
                      <option>Asia/Tokyo (JST)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date Format</label>
                    <select className="w-full mt-1 p-2 border rounded-lg bg-background">
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Temperature Unit</label>
                    <select className="w-full mt-1 p-2 border rounded-lg bg-background">
                      <option>Fahrenheit (°F)</option>
                      <option>Celsius (°C)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Energy Unit</label>
                    <select className="w-full mt-1 p-2 border rounded-lg bg-background">
                      <option>Kilowatt-hours (kWh)</option>
                      <option>Megawatt-hours (MWh)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
