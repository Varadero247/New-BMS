'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { QualityTrendChart, COPQChart } from '@ims/charts';
import { DollarSign, AlertOctagon, TrendingUp, Award, Target, BarChart3 } from 'lucide-react';
import { api } from '@/lib/api';

interface QualityMetrics {
  copq: number;
  copqBreakdown: {
    prevention: number;
    appraisal: number;
    internalFailure: number;
    externalFailure: number;
  };
  dpmo: number;
  sigma: number;
  fpy: number;
  customerComplaints: number;
  ncsThisMonth: number;
  monthlyData: {
    month: string;
    copq: number;
    dpmo: number;
    fpy: number;
  }[];
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    try {
      const response = await api.get('/metrics');
      setMetrics(response.data.data || mockMetrics);
    } catch (error) {
      console.error('Failed to load metrics:', error);
      setMetrics(mockMetrics);
    } finally {
      setLoading(false);
    }
  }

  const mockMetrics: QualityMetrics = {
    copq: 125000,
    copqBreakdown: {
      prevention: 15000,
      appraisal: 25000,
      internalFailure: 45000,
      externalFailure: 40000,
    },
    dpmo: 3400,
    sigma: 4.2,
    fpy: 96.5,
    customerComplaints: 8,
    ncsThisMonth: 12,
    monthlyData: [
      { month: 'Jul', copq: 145000, dpmo: 4200, fpy: 94.2 },
      { month: 'Aug', copq: 138000, dpmo: 3900, fpy: 95.1 },
      { month: 'Sep', copq: 132000, dpmo: 3700, fpy: 95.6 },
      { month: 'Oct', copq: 128000, dpmo: 3500, fpy: 96.0 },
      { month: 'Nov', copq: 125000, dpmo: 3400, fpy: 96.3 },
      { month: 'Dec', copq: 125000, dpmo: 3400, fpy: 96.5 },
    ],
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const data = metrics || mockMetrics;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quality Metrics</h1>
          <p className="text-gray-500 mt-1">Key performance indicators for quality management</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">COPQ</p>
                  <p className="text-3xl font-bold">${data.copq.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-red-100 rounded-full">
                  <DollarSign className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Cost of Poor Quality (Monthly)</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">DPMO</p>
                  <p className="text-3xl font-bold">{data.dpmo.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-orange-100 rounded-full">
                  <AlertOctagon className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Defects Per Million Opportunities</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Sigma Level</p>
                  <p className="text-3xl font-bold">{data.sigma.toFixed(1)}σ</p>
                </div>
                <div className="p-4 bg-purple-100 rounded-full">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Process Capability</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">First Pass Yield</p>
                  <p className="text-3xl font-bold">{data.fpy.toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-green-100 rounded-full">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Right First Time</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Customer Complaints</p>
                  <p className="text-2xl font-bold text-purple-600">{data.customerComplaints}</p>
                  <p className="text-xs text-gray-400">This month</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Nonconformances</p>
                  <p className="text-2xl font-bold text-yellow-600">{data.ncsThisMonth}</p>
                  <p className="text-xs text-gray-400">This month</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertOctagon className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* COPQ Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-red-500" />
              Cost of Poor Quality Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Prevention</p>
                <p className="text-2xl font-bold text-blue-700">${data.copqBreakdown.prevention.toLocaleString()}</p>
                <p className="text-xs text-blue-500">Training, planning, quality engineering</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Appraisal</p>
                <p className="text-2xl font-bold text-green-700">${data.copqBreakdown.appraisal.toLocaleString()}</p>
                <p className="text-xs text-green-500">Inspection, testing, audits</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">Internal Failure</p>
                <p className="text-2xl font-bold text-orange-700">${data.copqBreakdown.internalFailure.toLocaleString()}</p>
                <p className="text-xs text-orange-500">Scrap, rework, retest</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600 font-medium">External Failure</p>
                <p className="text-2xl font-bold text-red-700">${data.copqBreakdown.externalFailure.toLocaleString()}</p>
                <p className="text-xs text-red-500">Returns, warranty, complaints</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Quality Trend Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.monthlyData && (
              <QualityTrendChart
                data={data.monthlyData}
                height={350}
              />
            )}
          </CardContent>
        </Card>

        {/* Definitions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Metric Definitions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900">COPQ (Cost of Poor Quality)</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Total cost associated with producing defective products, including prevention, appraisal, and failure costs.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">DPMO (Defects Per Million Opportunities)</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Number of defects per million opportunities for defects. Lower is better.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Sigma Level</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Statistical measure of process capability. 6σ = 3.4 DPMO (world-class).
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">First Pass Yield (FPY)</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Percentage of units that pass inspection without rework or defects.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
