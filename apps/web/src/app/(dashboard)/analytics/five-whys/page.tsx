'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  Plus,
  ArrowRight,
  ChevronDown,
  Save,
  Trash2,
  CheckCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

interface FiveWhyAnalysis {
  id: string;
  title: string;
  problemStatement: string;
  why1: string | null;
  why2: string | null;
  why3: string | null;
  why4: string | null;
  why5: string | null;
  rootCause: string | null;
  status: string;
  sourceType: string;
  sourceId: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function FiveWhysPage() {
  const [analyses, setAnalyses] = useState<FiveWhyAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    problemStatement: '',
    why1: '',
    why2: '',
    why3: '',
    why4: '',
    why5: '',
    rootCause: '',
    sourceType: 'INCIDENT',
    sourceId: '',
  });

  useEffect(() => {
    fetchAnalyses();
  }, []);

  async function fetchAnalyses() {
    try {
      const res = await api.get('/analytics/five-whys');
      setAnalyses(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch 5 Whys analyses:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createAnalysis() {
    setCreating(true);
    try {
      await api.post('/analytics/five-whys', formData);
      setShowForm(false);
      setFormData({
        title: '',
        problemStatement: '',
        why1: '',
        why2: '',
        why3: '',
        why4: '',
        why5: '',
        rootCause: '',
        sourceType: 'INCIDENT',
        sourceId: '',
      });
      fetchAnalyses();
    } catch (error) {
      console.error('Failed to create analysis:', error);
    } finally {
      setCreating(false);
    }
  }

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
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
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">5 Whys Analysis</h1>
            <p className="text-muted-foreground">Root cause analysis technique</p>
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
            <CardTitle>New 5 Whys Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <label className="text-sm font-medium">Problem Statement</label>
              <textarea
                value={formData.problemStatement}
                onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                placeholder="Describe the problem clearly and specifically"
                rows={3}
                className="w-full mt-1 p-3 border rounded-lg bg-background resize-none"
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium text-purple-600">The 5 Whys</h3>

              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-purple-600">{num}</span>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium">Why #{num}</label>
                    <Input
                      value={formData[`why${num}` as keyof typeof formData] as string}
                      onChange={(e) =>
                        setFormData({ ...formData, [`why${num}`]: e.target.value })
                      }
                      placeholder={num === 1 ? 'Why did this problem occur?' : 'Why?'}
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <label className="text-sm font-medium text-green-600">Root Cause</label>
              <textarea
                value={formData.rootCause}
                onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
                placeholder="Based on the 5 Whys, what is the root cause?"
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
          <CardTitle>How 5 Whys Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center justify-center py-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-lg font-bold text-red-600">!</span>
              </div>
              <p className="text-sm font-medium">Problem</p>
            </div>
            <ArrowRight className="w-6 h-6 text-muted-foreground" />
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="flex items-center gap-2">
                <div className="text-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-sm font-bold text-purple-600">W{num}</span>
                  </div>
                  <p className="text-xs">Why?</p>
                </div>
                {num < 5 && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
              </div>
            ))}
            <ArrowRight className="w-6 h-6 text-muted-foreground" />
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium">Root Cause</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            By asking &quot;Why?&quot; five times, you can peel away the layers of symptoms to reveal the root cause of a problem.
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
                  className="p-4 border rounded-lg hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium">{analysis.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(analysis.createdAt).toLocaleDateString()} • {analysis.sourceType.replace('_', ' ')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${getStatusColor(analysis.status)}`}>
                      {getStatusIcon(analysis.status)}
                      {analysis.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{analysis.problemStatement}</p>

                  <div className="space-y-2 text-sm">
                    {analysis.why1 && (
                      <div className="flex gap-2">
                        <span className="text-purple-600 font-medium">W1:</span>
                        <span>{analysis.why1}</span>
                      </div>
                    )}
                    {analysis.why2 && (
                      <div className="flex gap-2">
                        <span className="text-purple-600 font-medium">W2:</span>
                        <span>{analysis.why2}</span>
                      </div>
                    )}
                    {analysis.why3 && (
                      <div className="flex gap-2">
                        <span className="text-purple-600 font-medium">W3:</span>
                        <span>{analysis.why3}</span>
                      </div>
                    )}
                    {analysis.why4 && (
                      <div className="flex gap-2">
                        <span className="text-purple-600 font-medium">W4:</span>
                        <span>{analysis.why4}</span>
                      </div>
                    )}
                    {analysis.why5 && (
                      <div className="flex gap-2">
                        <span className="text-purple-600 font-medium">W5:</span>
                        <span>{analysis.why5}</span>
                      </div>
                    )}
                    {analysis.rootCause && (
                      <div className="flex gap-2 pt-2 border-t mt-2">
                        <span className="text-green-600 font-medium">Root Cause:</span>
                        <span className="font-medium">{analysis.rootCause}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No 5 Whys analyses yet</p>
              <p className="text-sm">Create your first analysis to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
