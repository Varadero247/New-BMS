'use client';

import { useEffect, useState } from 'react';
import {
  Shield,
  Plus,
  Save,
  Trash2,
  Loader2,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

interface BowTieAnalysis {
  id: string;
  title: string;
  hazard: string;
  topEvent: string;
  threats: string[];
  preventiveBarriers: string[];
  mitigatingBarriers: string[];
  consequences: string[];
  status: string;
  sourceType: string;
  sourceId: string | null;
  createdAt: string;
}

export default function BowTiePage() {
  const [analyses, setAnalyses] = useState<BowTieAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    hazard: '',
    topEvent: '',
    threats: [''],
    preventiveBarriers: [''],
    mitigatingBarriers: [''],
    consequences: [''],
    sourceType: 'RISK',
    sourceId: '',
  });

  useEffect(() => {
    fetchAnalyses();
  }, []);

  async function fetchAnalyses() {
    try {
      const res = await api.get('/analytics/bow-tie');
      setAnalyses(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch Bow-Tie analyses:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createAnalysis() {
    setCreating(true);
    try {
      const payload = {
        ...formData,
        threats: formData.threats.filter((s) => s.trim()),
        preventiveBarriers: formData.preventiveBarriers.filter((s) => s.trim()),
        mitigatingBarriers: formData.mitigatingBarriers.filter((s) => s.trim()),
        consequences: formData.consequences.filter((s) => s.trim()),
      };
      await api.post('/analytics/bow-tie', payload);
      setShowForm(false);
      setFormData({
        title: '',
        hazard: '',
        topEvent: '',
        threats: [''],
        preventiveBarriers: [''],
        mitigatingBarriers: [''],
        consequences: [''],
        sourceType: 'RISK',
        sourceId: '',
      });
      fetchAnalyses();
    } catch (error) {
      console.error('Failed to create analysis:', error);
    } finally {
      setCreating(false);
    }
  }

  const addItem = (field: 'threats' | 'preventiveBarriers' | 'mitigatingBarriers' | 'consequences') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ''],
    });
  };

  const updateItem = (
    field: 'threats' | 'preventiveBarriers' | 'mitigatingBarriers' | 'consequences',
    index: number,
    value: string
  ) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  const removeItem = (
    field: 'threats' | 'preventiveBarriers' | 'mitigatingBarriers' | 'consequences',
    index: number
  ) => {
    if (formData[field].length > 1) {
      setFormData({
        ...formData,
        [field]: formData[field].filter((_, i) => i !== index),
      });
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
          <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-cyan-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Bow-Tie Analysis</h1>
            <p className="text-muted-foreground">Risk barrier analysis diagram</p>
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
            <CardTitle>New Bow-Tie Analysis</CardTitle>
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
                  <option value="RISK">Risk Assessment</option>
                  <option value="INCIDENT">H&S Incident</option>
                  <option value="ASPECT">Environmental Aspect</option>
                  <option value="PROCESS">Quality Process</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Hazard</label>
                <Input
                  value={formData.hazard}
                  onChange={(e) => setFormData({ ...formData, hazard: e.target.value })}
                  placeholder="The source of potential harm"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Top Event</label>
                <Input
                  value={formData.topEvent}
                  onChange={(e) => setFormData({ ...formData, topEvent: e.target.value })}
                  placeholder="The unwanted event (loss of control)"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Left Side: Threats & Preventive Barriers */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Threats */}
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-700">Threats</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => addItem('threats')}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.threats.map((threat, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={threat}
                        onChange={(e) => updateItem('threats', idx, e.target.value)}
                        placeholder="What could cause the top event?"
                        className="bg-white"
                      />
                      {formData.threats.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeItem('threats', idx)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Preventive Barriers */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-700">Preventive Barriers</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-green-600" onClick={() => addItem('preventiveBarriers')}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.preventiveBarriers.map((barrier, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={barrier}
                        onChange={(e) => updateItem('preventiveBarriers', idx, e.target.value)}
                        placeholder="Barrier to prevent the top event"
                        className="bg-white"
                      />
                      {formData.preventiveBarriers.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeItem('preventiveBarriers', idx)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side: Mitigating Barriers & Consequences */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Mitigating Barriers */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-700">Mitigating Barriers</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => addItem('mitigatingBarriers')}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.mitigatingBarriers.map((barrier, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={barrier}
                        onChange={(e) => updateItem('mitigatingBarriers', idx, e.target.value)}
                        placeholder="Barrier to reduce consequences"
                        className="bg-white"
                      />
                      {formData.mitigatingBarriers.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeItem('mitigatingBarriers', idx)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Consequences */}
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-orange-700">Consequences</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-orange-600" onClick={() => addItem('consequences')}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.consequences.map((consequence, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={consequence}
                        onChange={(e) => updateItem('consequences', idx, e.target.value)}
                        placeholder="Potential outcome if barriers fail"
                        className="bg-white"
                      />
                      {formData.consequences.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeItem('consequences', idx)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={createAnalysis}
                disabled={creating || !formData.title || !formData.hazard || !formData.topEvent}
              >
                {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* How It Works - Bow-Tie Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>Bow-Tie Diagram Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2 py-4 overflow-x-auto">
            {/* Left side - Threats */}
            <div className="flex flex-col gap-1 min-w-[100px]">
              <div className="p-2 bg-red-100 rounded text-xs text-center">Threat 1</div>
              <div className="p-2 bg-red-100 rounded text-xs text-center">Threat 2</div>
              <div className="p-2 bg-red-100 rounded text-xs text-center">Threat 3</div>
            </div>

            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />

            {/* Preventive Barriers */}
            <div className="flex flex-col gap-1 min-w-[80px]">
              <div className="p-2 bg-green-100 rounded text-xs text-center">Barrier</div>
              <div className="p-2 bg-green-100 rounded text-xs text-center">Barrier</div>
            </div>

            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />

            {/* Top Event (Center) */}
            <div className="p-4 bg-yellow-100 rounded-lg border-2 border-yellow-300 min-w-[100px]">
              <p className="text-xs font-bold text-yellow-700 text-center">TOP EVENT</p>
              <p className="text-[10px] text-yellow-600 text-center">Loss of Control</p>
            </div>

            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />

            {/* Mitigating Barriers */}
            <div className="flex flex-col gap-1 min-w-[80px]">
              <div className="p-2 bg-blue-100 rounded text-xs text-center">Barrier</div>
              <div className="p-2 bg-blue-100 rounded text-xs text-center">Barrier</div>
            </div>

            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />

            {/* Right side - Consequences */}
            <div className="flex flex-col gap-1 min-w-[100px]">
              <div className="p-2 bg-orange-100 rounded text-xs text-center">Consequence 1</div>
              <div className="p-2 bg-orange-100 rounded text-xs text-center">Consequence 2</div>
              <div className="p-2 bg-orange-100 rounded text-xs text-center">Consequence 3</div>
            </div>
          </div>
          <div className="flex justify-center gap-4 text-xs text-muted-foreground mt-4">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-100 rounded"></div> Threats
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-100 rounded"></div> Preventive
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-100 rounded"></div> Top Event
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-100 rounded"></div> Mitigating
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-100 rounded"></div> Consequences
            </span>
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
                        {new Date(analysis.createdAt).toLocaleDateString()} • {analysis.sourceType}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(analysis.status)}`}>
                      {analysis.status}
                    </span>
                  </div>

                  {/* Hazard & Top Event */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-500">Hazard</p>
                      <p className="text-sm font-medium">{analysis.hazard}</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="text-xs font-medium text-yellow-600">Top Event</p>
                      <p className="text-sm font-medium">{analysis.topEvent}</p>
                    </div>
                  </div>

                  {/* Bow-Tie Visualization */}
                  <div className="grid grid-cols-4 gap-2">
                    {/* Threats */}
                    <div className="p-2 bg-red-50 rounded">
                      <p className="text-xs font-medium text-red-600 mb-1">Threats</p>
                      <ul className="text-xs space-y-1">
                        {analysis.threats.map((t, i) => (
                          <li key={i}>• {t}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Preventive Barriers */}
                    <div className="p-2 bg-green-50 rounded">
                      <p className="text-xs font-medium text-green-600 mb-1">Preventive</p>
                      <ul className="text-xs space-y-1">
                        {analysis.preventiveBarriers.map((b, i) => (
                          <li key={i}>• {b}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Mitigating Barriers */}
                    <div className="p-2 bg-blue-50 rounded">
                      <p className="text-xs font-medium text-blue-600 mb-1">Mitigating</p>
                      <ul className="text-xs space-y-1">
                        {analysis.mitigatingBarriers.map((b, i) => (
                          <li key={i}>• {b}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Consequences */}
                    <div className="p-2 bg-orange-50 rounded">
                      <p className="text-xs font-medium text-orange-600 mb-1">Consequences</p>
                      <ul className="text-xs space-y-1">
                        {analysis.consequences.map((c, i) => (
                          <li key={i}>• {c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No Bow-Tie analyses yet</p>
              <p className="text-sm">Create your first analysis to visualize risk barriers</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
