'use client';

import { useEffect, useState } from 'react';
import {
  GitBranch,
  Plus,
  Save,
  Trash2,
  CheckCircle,
  Clock,
  Loader2,
  Users,
  Settings,
  Wrench,
  FileText,
  Leaf,
  Ruler,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

interface FishboneAnalysis {
  id: string;
  title: string;
  problemStatement: string;
  manpower: string[];
  method: string[];
  machine: string[];
  material: string[];
  environment: string[];
  measurement: string[];
  rootCause: string | null;
  status: string;
  sourceType: string;
  createdAt: string;
}

const CATEGORIES = [
  { key: 'manpower', label: 'Manpower (People)', icon: Users, color: 'blue' },
  { key: 'method', label: 'Method (Process)', icon: FileText, color: 'green' },
  { key: 'machine', label: 'Machine (Equipment)', icon: Settings, color: 'orange' },
  { key: 'material', label: 'Material', icon: Wrench, color: 'purple' },
  { key: 'environment', label: 'Environment', icon: Leaf, color: 'teal' },
  { key: 'measurement', label: 'Measurement', icon: Ruler, color: 'pink' },
];

export default function FishbonePage() {
  const [analyses, setAnalyses] = useState<FishboneAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    problemStatement: '',
    manpower: [''],
    method: [''],
    machine: [''],
    material: [''],
    environment: [''],
    measurement: [''],
    rootCause: '',
    sourceType: 'INCIDENT',
  });

  useEffect(() => {
    fetchAnalyses();
  }, []);

  async function fetchAnalyses() {
    try {
      const res = await api.get('/analytics/fishbone');
      setAnalyses(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch Fishbone analyses:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createAnalysis() {
    setCreating(true);
    try {
      // Filter out empty strings from arrays
      const payload = {
        ...formData,
        manpower: formData.manpower.filter((s) => s.trim()),
        method: formData.method.filter((s) => s.trim()),
        machine: formData.machine.filter((s) => s.trim()),
        material: formData.material.filter((s) => s.trim()),
        environment: formData.environment.filter((s) => s.trim()),
        measurement: formData.measurement.filter((s) => s.trim()),
      };
      await api.post('/analytics/fishbone', payload);
      setShowForm(false);
      setFormData({
        title: '',
        problemStatement: '',
        manpower: [''],
        method: [''],
        machine: [''],
        material: [''],
        environment: [''],
        measurement: [''],
        rootCause: '',
        sourceType: 'INCIDENT',
      });
      fetchAnalyses();
    } catch (error) {
      console.error('Failed to create analysis:', error);
    } finally {
      setCreating(false);
    }
  }

  const addCauseToCategory = (category: keyof typeof formData) => {
    if (Array.isArray(formData[category])) {
      setFormData({
        ...formData,
        [category]: [...(formData[category] as string[]), ''],
      });
    }
  };

  const updateCauseInCategory = (category: keyof typeof formData, index: number, value: string) => {
    if (Array.isArray(formData[category])) {
      const updated = [...(formData[category] as string[])];
      updated[index] = value;
      setFormData({ ...formData, [category]: updated });
    }
  };

  const removeCauseFromCategory = (category: keyof typeof formData, index: number) => {
    if (Array.isArray(formData[category]) && (formData[category] as string[]).length > 1) {
      const updated = (formData[category] as string[]).filter((_, i) => i !== index);
      setFormData({ ...formData, [category]: updated });
    }
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

  const getCategoryColor = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
      green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
      teal: { bg: 'bg-teal-100', text: 'text-teal-600', border: 'border-teal-200' },
      pink: { bg: 'bg-pink-100', text: 'text-pink-600', border: 'border-pink-200' },
    };
    return colors[color] || colors.blue;
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
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
            <GitBranch className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Fishbone Diagram</h1>
            <p className="text-muted-foreground">Ishikawa / Cause & Effect Analysis</p>
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
            <CardTitle>New Fishbone Analysis</CardTitle>
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
                  <option value="INCIDENT">H&S Incident</option>
                  <option value="ENVIRONMENTAL_EVENT">Environmental Event</option>
                  <option value="NON_CONFORMANCE">Non-Conformance</option>
                  <option value="GENERAL">General</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Problem Statement (Effect)</label>
              <textarea
                value={formData.problemStatement}
                onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                placeholder="What is the problem or effect you are analyzing?"
                rows={2}
                className="w-full mt-1 p-3 border rounded-lg bg-background resize-none"
              />
            </div>

            {/* 6M Categories */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATEGORIES.map((cat) => {
                const colors = getCategoryColor(cat.color);
                return (
                  <div key={cat.key} className={`p-4 rounded-lg border ${colors.border} ${colors.bg}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <cat.icon className={`w-5 h-5 ${colors.text}`} />
                      <span className={`font-medium ${colors.text}`}>{cat.label}</span>
                    </div>
                    <div className="space-y-2">
                      {(formData[cat.key as keyof typeof formData] as string[]).map((cause, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            value={cause}
                            onChange={(e) =>
                              updateCauseInCategory(cat.key as keyof typeof formData, idx, e.target.value)
                            }
                            placeholder={`${cat.label} cause...`}
                            className="bg-white"
                          />
                          {(formData[cat.key as keyof typeof formData] as string[]).length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCauseFromCategory(cat.key as keyof typeof formData, idx)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        className={colors.text}
                        onClick={() => addCauseToCategory(cat.key as keyof typeof formData)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Cause
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t">
              <label className="text-sm font-medium text-green-600">Root Cause Conclusion</label>
              <textarea
                value={formData.rootCause}
                onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
                placeholder="Based on the analysis, what are the primary root causes?"
                rows={2}
                className="w-full mt-1 p-3 border rounded-lg bg-background resize-none border-green-200"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={createAnalysis} disabled={creating || !formData.title || !formData.problemStatement}>
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
          <CardTitle>The 6M Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => {
              const colors = getCategoryColor(cat.color);
              return (
                <div key={cat.key} className={`p-3 rounded-lg ${colors.bg} text-center`}>
                  <cat.icon className={`w-6 h-6 ${colors.text} mx-auto mb-2`} />
                  <p className={`text-sm font-medium ${colors.text}`}>{cat.label.split(' ')[0]}</p>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            The Fishbone diagram organizes potential causes into 6 categories (6M) to systematically identify root causes.
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
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="p-4 border rounded-lg hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{analysis.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(analysis.createdAt).toLocaleDateString()} • {analysis.sourceType.replace('_', ' ')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(analysis.status)}`}>
                      {analysis.status}
                    </span>
                  </div>

                  <div className="p-3 bg-red-50 rounded-lg mb-4">
                    <p className="text-sm font-medium text-red-700">Effect: {analysis.problemStatement}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    {CATEGORIES.map((cat) => {
                      const causes = analysis[cat.key as keyof FishboneAnalysis] as string[];
                      const colors = getCategoryColor(cat.color);
                      if (!causes || causes.length === 0) return null;
                      return (
                        <div key={cat.key} className={`p-2 rounded ${colors.bg}`}>
                          <p className={`text-xs font-medium ${colors.text} mb-1`}>{cat.label.split(' ')[0]}</p>
                          <ul className="text-xs space-y-1">
                            {causes.map((cause, idx) => (
                              <li key={idx}>• {cause}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>

                  {analysis.rootCause && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm">
                        <span className="font-medium text-green-700">Root Cause:</span> {analysis.rootCause}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No Fishbone analyses yet</p>
              <p className="text-sm">Create your first analysis to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
