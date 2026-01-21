'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@ims/ui';
import { Sparkles, Key, Check, AlertCircle, Settings, Save } from 'lucide-react';
import { aiApi } from '@/lib/api';

interface AIProvider {
  id: string;
  name: string;
  provider: 'OPENAI' | 'ANTHROPIC' | 'GROK';
  isActive: boolean;
  hasApiKey: boolean;
  model: string;
}

interface AISettings {
  defaultProvider: string;
  enableAutoAnalysis: boolean;
  analysisTypes: string[];
}

export default function AIConfigPage() {
  const [providers, setProviders] = useState<AIProvider[]>([
    { id: '1', name: 'OpenAI', provider: 'OPENAI', isActive: true, hasApiKey: true, model: 'gpt-4' },
    { id: '2', name: 'Anthropic', provider: 'ANTHROPIC', isActive: false, hasApiKey: false, model: 'claude-3-opus' },
    { id: '3', name: 'Grok', provider: 'GROK', isActive: false, hasApiKey: false, model: 'grok-1' },
  ]);
  const [settings, setSettings] = useState<AISettings>({
    defaultProvider: 'OPENAI',
    enableAutoAnalysis: true,
    analysisTypes: ['FIVE_WHYS', 'FISHBONE', 'BOW_TIE', 'PARETO'],
  });
  const [loading, setLoading] = useState(true);
  const [apiKeyInput, setApiKeyInput] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const response = await aiApi.get('/settings');
      if (response.data.data) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load AI settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveApiKey(provider: string) {
    const apiKey = apiKeyInput[provider];
    if (!apiKey) return;

    try {
      await aiApi.post('/settings/api-key', { provider, apiKey });
      setProviders(prev => prev.map(p =>
        p.provider === provider ? { ...p, hasApiKey: true } : p
      ));
      setApiKeyInput(prev => ({ ...prev, [provider]: '' }));
    } catch (error) {
      console.error('Failed to save API key:', error);
    }
  }

  async function setActiveProvider(provider: string) {
    try {
      await aiApi.post('/settings/provider', { provider });
      setSettings(prev => ({ ...prev, defaultProvider: provider }));
      setProviders(prev => prev.map(p => ({
        ...p,
        isActive: p.provider === provider,
      })));
    } catch (error) {
      console.error('Failed to set active provider:', error);
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Configuration</h1>
          <p className="text-gray-500 mt-1">Configure AI providers and analysis settings</p>
        </div>

        {/* AI Providers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Providers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className={`p-4 border rounded-lg ${
                    provider.isActive ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        provider.provider === 'OPENAI' ? 'bg-green-100' :
                        provider.provider === 'ANTHROPIC' ? 'bg-orange-100' : 'bg-blue-100'
                      }`}>
                        <Sparkles className={`h-5 w-5 ${
                          provider.provider === 'OPENAI' ? 'text-green-600' :
                          provider.provider === 'ANTHROPIC' ? 'text-orange-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{provider.name}</h3>
                        <p className="text-sm text-gray-500">Model: {provider.model}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {provider.hasApiKey ? (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          API Key Set
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          No API Key
                        </Badge>
                      )}
                      {provider.isActive && (
                        <Badge variant="default">Active</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="password"
                          placeholder={provider.hasApiKey ? '••••••••••••••••' : 'Enter API key'}
                          value={apiKeyInput[provider.provider] || ''}
                          onChange={(e) => setApiKeyInput(prev => ({
                            ...prev,
                            [provider.provider]: e.target.value,
                          }))}
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => saveApiKey(provider.provider)}
                      disabled={!apiKeyInput[provider.provider]}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Key
                    </Button>
                    {!provider.isActive && provider.hasApiKey && (
                      <Button onClick={() => setActiveProvider(provider.provider)}>
                        Set Active
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-500" />
              Analysis Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Auto-Analysis</p>
                  <p className="text-sm text-gray-500">Automatically analyze new incidents and risks</p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    enableAutoAnalysis: !prev.enableAutoAnalysis,
                  }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.enableAutoAnalysis ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.enableAutoAnalysis ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <p className="font-medium text-gray-900 mb-3">Enabled Analysis Types</p>
                <div className="flex flex-wrap gap-2">
                  {['FIVE_WHYS', 'FISHBONE', 'BOW_TIE', 'PARETO', 'ROOT_CAUSE', 'TREND'].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setSettings(prev => ({
                          ...prev,
                          analysisTypes: prev.analysisTypes.includes(type)
                            ? prev.analysisTypes.filter(t => t !== type)
                            : [...prev.analysisTypes, type],
                        }));
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        settings.analysisTypes.includes(type)
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
