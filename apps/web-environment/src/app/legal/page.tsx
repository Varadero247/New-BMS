'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@ims/ui';
import { Plus, Scale, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';

interface LegalRequirement {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  source: string;
  effectiveDate: string;
  reviewDate: string;
  complianceStatus: string;
  createdAt: string;
}

export default function LegalPage() {
  const [requirements, setRequirements] = useState<LegalRequirement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequirements();
  }, []);

  async function loadRequirements() {
    try {
      const response = await api.get('/legal').catch(() => ({ data: { data: [] } }));
      setRequirements(response.data.data || []);
    } catch (error) {
      console.error('Failed to load legal requirements:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Legal Register</h1>
            <p className="text-gray-500 mt-1">Environmental legislation and compliance obligations</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Requirement
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{requirements.length}</p>
                <p className="text-sm text-gray-500">Total Requirements</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {requirements.filter(r => r.complianceStatus === 'COMPLIANT').length}
                </p>
                <p className="text-sm text-gray-500">Compliant</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">
                  {requirements.filter(r => r.complianceStatus === 'PARTIAL').length}
                </p>
                <p className="text-sm text-gray-500">Partial</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">
                  {requirements.filter(r => r.complianceStatus === 'NON_COMPLIANT').length}
                </p>
                <p className="text-sm text-gray-500">Non-Compliant</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requirements List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-green-500" />
              Environmental Legal Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded" />
                ))}
              </div>
            ) : requirements.length > 0 ? (
              <div className="space-y-4">
                {requirements.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">{req.referenceNumber}</span>
                          <Badge variant={
                            req.complianceStatus === 'COMPLIANT' ? 'secondary' :
                            req.complianceStatus === 'PARTIAL' ? 'warning' : 'destructive'
                          }>
                            {req.complianceStatus}
                          </Badge>
                        </div>
                        <h3 className="font-medium text-gray-900">{req.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{req.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span>Source: {req.source}</span>
                          <span>Review: {new Date(req.reviewDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-green-600">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Scale className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No legal requirements added yet</p>
                <Button variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Requirement
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
