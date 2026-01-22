'use client';

import { useEffect, useState } from 'react';
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
  Bot,
  Key,
  Zap,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  Brain,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

interface AISettings {
  id: string;
  provider: 'OPENAI' | 'ANTHROPIC' | 'GROK';
  apiKey: string;
  model: string;
  defaultPrompt: string;
  isActive: boolean;
  usageCount: number;
  lastUsed: string | null;
}

const settingsSections = [
  { id: 'ai', label: 'AI Configuration', icon: Bot },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'integrations', label: 'Integrations', icon: Globe },
  { id: 'system', label: 'System', icon: Database },
];

const aiProviders = [
  {
    id: 'OPENAI',
    name: 'OpenAI',
    description: 'GPT-4o and GPT-4 models',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    icon: '🤖',
  },
  {
    id: 'ANTHROPIC',
    name: 'Anthropic',
    description: 'Claude 3.5 and Claude 3 models',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    icon: '🧠',
  },
  {
    id: 'GROK',
    name: 'xAI Grok',
    description: 'Grok-2 models',
    models: ['grok-2', 'grok-2-mini'],
    icon: '⚡',
  },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('ai');
  const [aiSettings, setAiSettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // AI Settings form state
  const [selectedProvider, setSelectedProvider] = useState<'OPENAI' | 'ANTHROPIC' | 'GROK'>('OPENAI');
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [defaultPrompt, setDefaultPrompt] = useState(
    'Analyze this incident/risk and provide:\n1. Likely root causes\n2. Contributing factors\n3. Recommended corrective actions\n4. Preventive measures\n5. Risk assessment'
  );

  useEffect(() => {
    fetchAISettings();
  }, []);

  async function fetchAISettings() {
    try {
      const res = await api.get('/ai/settings');
      if (res.data.data) {
        const settings = res.data.data;
        setAiSettings(settings);
        setSelectedProvider(settings.provider);
        setApiKey(settings.apiKey || '');
        setSelectedModel(settings.model);
        setDefaultPrompt(settings.defaultPrompt);
      }
    } catch (error) {
      console.error('Failed to fetch AI settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveAISettings() {
    setSaving(true);
    setTestResult(null);
    try {
      const payload = {
        provider: selectedProvider,
        apiKey: apiKey,
        model: selectedModel,
        defaultPrompt: defaultPrompt,
        isActive: true,
      };

      if (aiSettings) {
        await api.put('/ai/settings', payload);
      } else {
        await api.post('/ai/settings', payload);
      }

      setTestResult({ success: true, message: 'AI settings saved successfully!' });
      fetchAISettings();
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.response?.data?.error || 'Failed to save AI settings',
      });
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      // Simple test by attempting a minimal analysis
      const res = await api.post('/ai/analyze', {
        sourceType: 'INCIDENT',
        sourceId: 'test',
        context: 'Test connection - please respond with OK',
      });
      setTestResult({ success: true, message: 'Connection successful! AI provider is working.' });
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.response?.data?.error || 'Connection failed. Check your API key.',
      });
    } finally {
      setTesting(false);
    }
  }

  const currentProviderModels = aiProviders.find((p) => p.id === selectedProvider)?.models || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <Settings className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Settings & AI</h1>
          <p className="text-muted-foreground">Manage your account and AI analysis configuration</p>
        </div>
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
          {activeSection === 'ai' && (
            <>
              {/* AI Provider Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Provider
                  </CardTitle>
                  <CardDescription>
                    Select your AI provider for automated analysis of incidents, risks, and non-conformances
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    {aiProviders.map((provider) => (
                      <button
                        key={provider.id}
                        onClick={() => {
                          setSelectedProvider(provider.id as 'OPENAI' | 'ANTHROPIC' | 'GROK');
                          setSelectedModel(provider.models[0]);
                        }}
                        className={`p-4 border rounded-lg text-left transition-colors ${
                          selectedProvider === provider.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:border-primary/50'
                        }`}
                      >
                        <div className="text-2xl mb-2">{provider.icon}</div>
                        <p className="font-medium">{provider.name}</p>
                        <p className="text-xs text-muted-foreground">{provider.description}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* API Key & Model */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    API Configuration
                  </CardTitle>
                  <CardDescription>
                    Enter your API key and select the model to use
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">API Key</label>
                    <div className="relative mt-1">
                      <Input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={`Enter your ${aiProviders.find((p) => p.id === selectedProvider)?.name} API key`}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your API key is encrypted and stored securely
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Model</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full mt-1 p-2 border rounded-lg bg-background"
                    >
                      {currentProviderModels.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={testConnection} variant="outline" disabled={testing || !apiKey}>
                      {testing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4 mr-2" />
                      )}
                      Test Connection
                    </Button>
                  </div>

                  {testResult && (
                    <div
                      className={`flex items-center gap-2 p-3 rounded-lg ${
                        testResult.success
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      <span className="text-sm">{testResult.message}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Default Prompt */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Analysis Prompt
                  </CardTitle>
                  <CardDescription>
                    Customize the default prompt used for AI analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Default Analysis Prompt</label>
                    <textarea
                      value={defaultPrompt}
                      onChange={(e) => setDefaultPrompt(e.target.value)}
                      rows={6}
                      className="w-full mt-1 p-3 border rounded-lg bg-background resize-none"
                      placeholder="Enter instructions for the AI..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This prompt will be used when analyzing incidents, risks, and non-conformances
                    </p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setDefaultPrompt(
                          'Analyze this incident/risk and provide:\n1. Likely root causes\n2. Contributing factors\n3. Recommended corrective actions\n4. Preventive measures\n5. Risk assessment'
                        )
                      }
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset to Default
                    </Button>
                    <Button onClick={saveAISettings} disabled={saving}>
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save AI Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Stats */}
              {aiSettings && (
                <Card>
                  <CardHeader>
                    <CardTitle>Usage Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <p className="text-2xl font-bold">{aiSettings.usageCount}</p>
                        <p className="text-xs text-muted-foreground">Total Analyses</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <p className="text-2xl font-bold">
                          {aiSettings.isActive ? '✓' : '✗'}
                        </p>
                        <p className="text-xs text-muted-foreground">Status</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <p className="text-2xl font-bold">{aiSettings.provider}</p>
                        <p className="text-xs text-muted-foreground">Provider</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <p className="text-sm font-medium truncate">
                          {aiSettings.lastUsed
                            ? new Date(aiSettings.lastUsed).toLocaleDateString()
                            : 'Never'}
                        </p>
                        <p className="text-xs text-muted-foreground">Last Used</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* How AI Analysis Works */}
              <Card>
                <CardHeader>
                  <CardTitle>How AI Analysis Works</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">1</span>
                      </div>
                      <div>
                        <p className="font-medium">Create an Incident or Risk</p>
                        <p className="text-sm text-muted-foreground">
                          Enter the details of an incident, risk, or non-conformance in the system
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">2</span>
                      </div>
                      <div>
                        <p className="font-medium">Request AI Analysis</p>
                        <p className="text-sm text-muted-foreground">
                          Click the &quot;Analyze with AI&quot; button to send the data to your configured AI provider
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">3</span>
                      </div>
                      <div>
                        <p className="font-medium">Review Suggestions</p>
                        <p className="text-sm text-muted-foreground">
                          The AI will suggest root causes, corrective actions, and preventive measures
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">4</span>
                      </div>
                      <div>
                        <p className="font-medium">Accept or Modify</p>
                        <p className="text-sm text-muted-foreground">
                          Accept the suggestions as-is or modify them before applying to the record
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

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
                      { label: 'Critical incidents', description: 'High severity incidents and accidents' },
                      { label: 'Overdue actions', description: 'When CAPA items become overdue' },
                      { label: 'Training expiry', description: 'Upcoming training expiration reminders' },
                      { label: 'Weekly compliance report', description: 'Weekly compliance summary' },
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
                      { label: 'All incidents', description: 'Receive all incident notifications' },
                      { label: 'Action assignments', description: 'When you are assigned an action' },
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
                <CardDescription>Configure system-wide preferences for IMS</CardDescription>
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
                    <label className="text-sm font-medium">Risk Matrix Size</label>
                    <select className="w-full mt-1 p-2 border rounded-lg bg-background">
                      <option>5×5 (Standard)</option>
                      <option>4×4 (Simple)</option>
                      <option>6×6 (Detailed)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Reference Number Prefix</label>
                    <Input defaultValue="INC" className="mt-1" placeholder="e.g., INC, HSE, ENV" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Used for generating incident reference numbers
                    </p>
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
