'use client';

import { useEffect, useState } from 'react';
import {
  Layers,
  Plus,
  Save,
  Loader2,
  Package,
  Clock,
  Truck,
  Settings,
  Archive,
  MoveHorizontal,
  Lightbulb,
  AlertOctagon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

interface LeanWasteAnalysis {
  id: string;
  title: string;
  processName: string;
  defects: string[];
  overproduction: string[];
  waiting: string[];
  nonUtilizedTalent: string[];
  transportation: string[];
  inventory: string[];
  motion: string[];
  extraProcessing: string[];
  totalWastes: number;
  recommendations: string | null;
  status: string;
  createdAt: string;
}

const WASTE_CATEGORIES = [
  {
    key: 'defects',
    label: 'Defects',
    icon: AlertOctagon,
    color: 'red',
    description: 'Rework, scrap, incorrect documentation',
    examples: 'Errors requiring correction, quality issues',
  },
  {
    key: 'overproduction',
    label: 'Overproduction',
    icon: Package,
    color: 'orange',
    description: 'Producing more than needed',
    examples: 'Excess inventory, unnecessary reports',
  },
  {
    key: 'waiting',
    label: 'Waiting',
    icon: Clock,
    color: 'yellow',
    description: 'Idle time, delays',
    examples: 'Waiting for approvals, equipment, information',
  },
  {
    key: 'nonUtilizedTalent',
    label: 'Non-Utilized Talent',
    icon: Lightbulb,
    color: 'purple',
    description: 'Underutilized skills and knowledge',
    examples: 'Unused employee suggestions, skill mismatch',
  },
  {
    key: 'transportation',
    label: 'Transportation',
    icon: Truck,
    color: 'blue',
    description: 'Unnecessary movement of materials',
    examples: 'Excessive material handling, poor layout',
  },
  {
    key: 'inventory',
    label: 'Inventory',
    icon: Archive,
    color: 'teal',
    description: 'Excess stock and materials',
    examples: 'Overstocked supplies, obsolete materials',
  },
  {
    key: 'motion',
    label: 'Motion',
    icon: MoveHorizontal,
    color: 'green',
    description: 'Unnecessary movement of people',
    examples: 'Walking, searching, reaching',
  },
  {
    key: 'extraProcessing',
    label: 'Extra Processing',
    icon: Settings,
    color: 'pink',
    description: 'Doing more than required',
    examples: 'Over-engineering, redundant approvals',
  },
];

export default function LeanWastePage() {
  const [analyses, setAnalyses] = useState<LeanWasteAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    processName: '',
    defects: [''],
    overproduction: [''],
    waiting: [''],
    nonUtilizedTalent: [''],
    transportation: [''],
    inventory: [''],
    motion: [''],
    extraProcessing: [''],
    recommendations: '',
  });

  useEffect(() => {
    fetchAnalyses();
  }, []);

  async function fetchAnalyses() {
    try {
      const res = await api.get('/analytics/lean-waste');
      setAnalyses(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch Lean Waste analyses:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createAnalysis() {
    setCreating(true);
    try {
      const payload = {
        ...formData,
        defects: formData.defects.filter((s) => s.trim()),
        overproduction: formData.overproduction.filter((s) => s.trim()),
        waiting: formData.waiting.filter((s) => s.trim()),
        nonUtilizedTalent: formData.nonUtilizedTalent.filter((s) => s.trim()),
        transportation: formData.transportation.filter((s) => s.trim()),
        inventory: formData.inventory.filter((s) => s.trim()),
        motion: formData.motion.filter((s) => s.trim()),
        extraProcessing: formData.extraProcessing.filter((s) => s.trim()),
      };
      await api.post('/analytics/lean-waste', payload);
      setShowForm(false);
      setFormData({
        title: '',
        processName: '',
        defects: [''],
        overproduction: [''],
        waiting: [''],
        nonUtilizedTalent: [''],
        transportation: [''],
        inventory: [''],
        motion: [''],
        extraProcessing: [''],
        recommendations: '',
      });
      fetchAnalyses();
    } catch (error) {
      console.error('Failed to create analysis:', error);
    } finally {
      setCreating(false);
    }
  }

  const addItem = (field: keyof typeof formData) => {
    if (Array.isArray(formData[field])) {
      setFormData({
        ...formData,
        [field]: [...(formData[field] as string[]), ''],
      });
    }
  };

  const updateItem = (field: keyof typeof formData, index: number, value: string) => {
    if (Array.isArray(formData[field])) {
      const updated = [...(formData[field] as string[])];
      updated[index] = value;
      setFormData({ ...formData, [field]: updated });
    }
  };

  const removeItem = (field: keyof typeof formData, index: number) => {
    if (Array.isArray(formData[field]) && (formData[field] as string[]).length > 1) {
      setFormData({
        ...formData,
        [field]: (formData[field] as string[]).filter((_, i) => i !== index),
      });
    }
  };

  const getCategoryColor = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
      yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
      teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200' },
      green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
      pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
    };
    return colors[color] || colors.blue;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Layers className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Lean 8 Wastes</h1>
            <p className="text-muted-foreground">DOWNTIME waste identification</p>
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
            <CardTitle>New Lean Waste Analysis</CardTitle>
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
                <label className="text-sm font-medium">Process Name</label>
                <Input
                  value={formData.processName}
                  onChange={(e) => setFormData({ ...formData, processName: e.target.value })}
                  placeholder="Name of the process being analyzed"
                  className="mt-1"
                />
              </div>
            </div>

            {/* 8 Wastes Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {WASTE_CATEGORIES.map((cat) => {
                const colors = getCategoryColor(cat.color);
                const values = formData[cat.key as keyof typeof formData] as string[];
                return (
                  <div key={cat.key} className={`p-3 rounded-lg border ${colors.border} ${colors.bg}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <cat.icon className={`w-4 h-4 ${colors.text}`} />
                      <span className={`text-sm font-medium ${colors.text}`}>{cat.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{cat.description}</p>
                    <div className="space-y-1">
                      {values.map((item, idx) => (
                        <div key={idx} className="flex gap-1">
                          <Input
                            value={item}
                            onChange={(e) => updateItem(cat.key as keyof typeof formData, idx, e.target.value)}
                            placeholder="Identified waste..."
                            className="bg-white text-xs h-8"
                          />
                          {values.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => removeItem(cat.key as keyof typeof formData, idx)}
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`text-xs h-6 ${colors.text}`}
                        onClick={() => addItem(cat.key as keyof typeof formData)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t">
              <label className="text-sm font-medium text-green-600">Recommendations</label>
              <textarea
                value={formData.recommendations}
                onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                placeholder="Summarize recommendations to eliminate identified wastes"
                rows={3}
                className="w-full mt-1 p-3 border rounded-lg bg-background resize-none border-green-200"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={createAnalysis}
                disabled={creating || !formData.title || !formData.processName}
              >
                {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* DOWNTIME Acronym */}
      <Card>
        <CardHeader>
          <CardTitle>The 8 Wastes (DOWNTIME)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            {WASTE_CATEGORIES.map((cat, idx) => {
              const colors = getCategoryColor(cat.color);
              const letter = 'DOWNTIME'[idx];
              return (
                <div key={cat.key} className={`p-3 rounded-lg ${colors.bg} text-center`}>
                  <div className={`text-2xl font-bold ${colors.text} mb-1`}>{letter}</div>
                  <cat.icon className={`w-5 h-5 ${colors.text} mx-auto mb-1`} />
                  <p className={`text-xs font-medium ${colors.text}`}>{cat.label}</p>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Remember the 8 wastes with the acronym <strong>DOWNTIME</strong>: Defects, Overproduction, Waiting, Non-utilized talent, Transportation, Inventory, Motion, Extra-processing
          </p>
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
                        Process: {analysis.processName} • {new Date(analysis.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                        {analysis.totalWastes} wastes
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(analysis.status)}`}>
                        {analysis.status}
                      </span>
                    </div>
                  </div>

                  {/* Waste Summary Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    {WASTE_CATEGORIES.map((cat) => {
                      const wastes = analysis[cat.key as keyof LeanWasteAnalysis] as string[];
                      const colors = getCategoryColor(cat.color);
                      const count = wastes?.length || 0;
                      return (
                        <div key={cat.key} className={`p-2 rounded ${colors.bg}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-medium ${colors.text}`}>{cat.label}</span>
                            <span className={`text-xs font-bold ${colors.text}`}>{count}</span>
                          </div>
                          {count > 0 && (
                            <ul className="text-xs space-y-0.5">
                              {wastes.slice(0, 2).map((w, i) => (
                                <li key={i} className="truncate">• {w}</li>
                              ))}
                              {count > 2 && (
                                <li className="text-muted-foreground">+{count - 2} more</li>
                              )}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {analysis.recommendations && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm">
                        <span className="font-medium text-green-700">Recommendations:</span> {analysis.recommendations}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No Lean Waste analyses yet</p>
              <p className="text-sm">Create your first analysis to identify process wastes</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
