'use client';

import { useEffect, useState } from 'react';
import {
  BarChart3,
  Plus,
  Save,
  Trash2,
  Loader2,
  RefreshCw,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ParetoChart } from '@/components/charts';
import api from '@/lib/api';

interface ParetoAnalysis {
  id: string;
  title: string;
  description: string | null;
  categories: { category: string; count: number; cumulative: number }[];
  sourceType: string;
  createdAt: string;
}

export default function ParetoPage() {
  const [analyses, setAnalyses] = useState<ParetoAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sourceType: 'INCIDENT',
    categories: [{ category: '', count: 0 }],
  });

  useEffect(() => {
    fetchAnalyses();
  }, []);

  async function fetchAnalyses() {
    try {
      const res = await api.get('/analytics/pareto');
      setAnalyses(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch Pareto analyses:', error);
    } finally {
      setLoading(false);
    }
  }

  async function generateFromData() {
    setGenerating(true);
    try {
      const res = await api.post('/analytics/pareto/generate', {
        sourceType: formData.sourceType,
        title: formData.title || `${formData.sourceType} Pareto Analysis`,
      });
      setShowForm(false);
      fetchAnalyses();
    } catch (error) {
      console.error('Failed to generate Pareto:', error);
    } finally {
      setGenerating(false);
    }
  }

  async function createAnalysis() {
    setCreating(true);
    try {
      // Calculate cumulative percentages
      const total = formData.categories.reduce((sum, cat) => sum + cat.count, 0);
      let cumSum = 0;
      const categoriesWithCumulative = formData.categories
        .filter((cat) => cat.category && cat.count > 0)
        .sort((a, b) => b.count - a.count)
        .map((cat) => {
          cumSum += cat.count;
          return {
            ...cat,
            cumulative: Math.round((cumSum / total) * 100),
          };
        });

      await api.post('/analytics/pareto', {
        ...formData,
        categories: categoriesWithCumulative,
      });
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        sourceType: 'INCIDENT',
        categories: [{ category: '', count: 0 }],
      });
      fetchAnalyses();
    } catch (error) {
      console.error('Failed to create analysis:', error);
    } finally {
      setCreating(false);
    }
  }

  const addCategory = () => {
    setFormData({
      ...formData,
      categories: [...formData.categories, { category: '', count: 0 }],
    });
  };

  const updateCategory = (index: number, field: 'category' | 'count', value: string | number) => {
    const updated = [...formData.categories];
    if (field === 'count') {
      updated[index] = { ...updated[index], count: Number(value) || 0 };
    } else {
      updated[index] = { ...updated[index], category: value as string };
    }
    setFormData({ ...formData, categories: updated });
  };

  const removeCategory = (index: number) => {
    if (formData.categories.length > 1) {
      setFormData({
        ...formData,
        categories: formData.categories.filter((_, i) => i !== index),
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Pareto Analysis</h1>
            <p className="text-muted-foreground">80/20 Rule - Focus on vital few</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Analysis
        </Button>
      </div>

      {/* New Analysis Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Pareto Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Analysis title"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Source Type</label>
                <select
                  value={formData.sourceType}
                  onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-lg bg-background"
                >
                  <option value="INCIDENT">H&S Incidents</option>
                  <option value="ENVIRONMENTAL_EVENT">Environmental Events</option>
                  <option value="NON_CONFORMANCE">Non-Conformances</option>
                  <option value="CUSTOM">Custom Data</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the analysis"
                className="mt-1"
              />
            </div>

            {/* Auto-generate option */}
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm font-medium text-amber-700 mb-2">Auto-Generate from Data</p>
              <p className="text-xs text-amber-600 mb-3">
                Automatically generate a Pareto chart from existing {formData.sourceType.toLowerCase().replace('_', ' ')} data.
              </p>
              <Button
                variant="outline"
                onClick={generateFromData}
                disabled={generating}
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Generate from Data
              </Button>
            </div>

            {/* Manual data entry */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Categories & Counts</label>
                <Button variant="ghost" size="sm" onClick={addCategory}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Category
                </Button>
              </div>

              <div className="space-y-2">
                {formData.categories.map((cat, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      value={cat.category}
                      onChange={(e) => updateCategory(idx, 'category', e.target.value)}
                      placeholder="Category name"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={cat.count || ''}
                      onChange={(e) => updateCategory(idx, 'count', e.target.value)}
                      placeholder="Count"
                      className="w-24"
                    />
                    {formData.categories.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeCategory(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={createAnalysis}
                disabled={creating || !formData.title || formData.categories.every((c) => !c.category)}
              >
                {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>The Pareto Principle (80/20 Rule)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                The Pareto principle states that roughly 80% of effects come from 20% of causes.
                In quality management, this helps identify the &quot;vital few&quot; issues that have the most significant impact.
              </p>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  Focus efforts on top contributors
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  Prioritize corrective actions
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  Track improvements over time
                </li>
              </ul>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-end justify-center gap-1 h-32">
                  <div className="w-8 bg-amber-500 rounded-t" style={{ height: '100%' }}></div>
                  <div className="w-8 bg-amber-400 rounded-t" style={{ height: '70%' }}></div>
                  <div className="w-8 bg-amber-300 rounded-t" style={{ height: '40%' }}></div>
                  <div className="w-8 bg-amber-200 rounded-t" style={{ height: '20%' }}></div>
                  <div className="w-8 bg-amber-100 rounded-t" style={{ height: '10%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Bars show frequency, line shows cumulative %</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Analyses */}
      <Card>
        <CardHeader>
          <CardTitle>Previous Analyses</CardTitle>
        </CardHeader>
        <CardContent>
          {analyses.length > 0 ? (
            <div className="space-y-6">
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-medium">{analysis.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(analysis.createdAt).toLocaleDateString()} • {analysis.sourceType.replace('_', ' ')}
                      </p>
                      {analysis.description && (
                        <p className="text-sm text-muted-foreground mt-1">{analysis.description}</p>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </div>

                  {analysis.categories && analysis.categories.length > 0 && (
                    <ParetoChart data={analysis.categories} />
                  )}

                  {/* Top Contributors Summary */}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {analysis.categories?.slice(0, 4).map((cat, idx) => (
                      <div key={idx} className="p-2 bg-muted/50 rounded text-center">
                        <p className="text-lg font-bold">{cat.count}</p>
                        <p className="text-xs text-muted-foreground truncate">{cat.category}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No Pareto analyses yet</p>
              <p className="text-sm">Create your first analysis to identify the vital few</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
