'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Award,
  AlertTriangle,
  FileText,
  Target,
  ClipboardCheck,
  TrendingUp,
  ArrowRight,
  Plus,
  XCircle,
  CheckCircle,
  BarChart3,
  Percent,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ExportDropdown } from '@/components/ui/export-dropdown';
import { ComplianceGauge, TrendChart, COPQChart } from '@/components/charts';
import api from '@/lib/api';
import {
  exportIncidents,
  exportIncidentsExcel,
  exportQualityMetrics,
  exportQualityMetricsExcel,
  type IncidentExportData,
  type QualityMetricsData,
} from '@/lib/export';

interface StandardSummary {
  standard: string;
  summary: {
    risks: { active: number; highCritical: number };
    incidents: { total: number; open: number; closureRate: number };
    actions: { total: number; open: number; overdue: number };
    legal: { total: number; compliant: number; complianceRate: number };
    objectives: { total: number; achieved: number; achievementRate: number };
  };
  recentIncidents: Array<{
    id: string;
    referenceNumber: string;
    title: string;
    type: string;
    severity: string;
    status: string;
    dateOccurred: string;
  }>;
  topRisks: Array<{
    id: string;
    title: string;
    riskScore: number;
    riskLevel: string;
  }>;
}

interface QualityMetricSummary {
  year: number;
  ytd: {
    copq: {
      prevention: number;
      appraisal: number;
      internalFailure: number;
      externalFailure: number;
      total: number;
    };
    dpmo: number;
    firstPassYield: number;
    processSigma: number;
    customerComplaints: number;
    ncCount: number;
  };
  monthlyTrend: Array<{
    month: number;
    dpmo: number;
    fpy: number;
  }>;
}

export default function QualityOverviewPage() {
  const [summary, setSummary] = useState<StandardSummary | null>(null);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetricSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryRes, metricsRes] = await Promise.all([
          api.get('/dashboard/summary/ISO_9001'),
          api.get('/metrics/quality/summary'),
        ]);

        setSummary(summaryRes.data.data);
        setQualityMetrics(metricsRes.data.data);
      } catch (error) {
        console.error('Failed to fetch Quality data:', error);
        // Set mock data for demo
        setQualityMetrics({
          year: new Date().getFullYear(),
          ytd: {
            copq: {
              prevention: 15000,
              appraisal: 25000,
              internalFailure: 35000,
              externalFailure: 45000,
              total: 120000,
            },
            dpmo: 3400,
            firstPassYield: 94.5,
            processSigma: 4.2,
            customerComplaints: 12,
            ncCount: 45,
          },
          monthlyTrend: [
            { month: 1, dpmo: 4200, fpy: 92 },
            { month: 2, dpmo: 3900, fpy: 93 },
            { month: 3, dpmo: 3700, fpy: 93.5 },
            { month: 4, dpmo: 3500, fpy: 94 },
            { month: 5, dpmo: 3400, fpy: 94.5 },
            { month: 6, dpmo: 3300, fpy: 95 },
          ],
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
      case 'MAJOR':
        return 'bg-red-100 text-red-700';
      case 'MINOR':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-700';
      case 'HIGH':
        return 'bg-orange-100 text-orange-700';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  const quickLinks = [
    { name: 'Processes', href: '/quality/processes', icon: BarChart3, count: summary?.summary.risks.active },
    { name: 'Non-Conformances', href: '/quality/ncs', icon: XCircle, count: summary?.summary.incidents.open },
    { name: 'Legal', href: '/quality/legal', icon: FileText, count: summary?.summary.legal.total },
    { name: 'Objectives', href: '/quality/objectives', icon: Target, count: summary?.summary.objectives.total },
    { name: 'Actions', href: '/quality/actions', icon: ClipboardCheck, count: summary?.summary.actions.open },
    { name: 'Metrics', href: '/quality/metrics', icon: TrendingUp },
  ];

  const handleExportPDF = () => {
    if (summary?.recentIncidents?.length) {
      const exportData: IncidentExportData[] = summary.recentIncidents.map((nc) => ({
        referenceNumber: nc.referenceNumber,
        title: nc.title,
        type: nc.type,
        severity: nc.severity,
        status: nc.status,
        dateOccurred: new Date(nc.dateOccurred).toLocaleDateString(),
      }));
      exportIncidents(exportData, 'ISO_9001', 'Quality Non-Conformances Report');
    }
  };

  const handleExportExcel = () => {
    if (summary?.recentIncidents?.length) {
      const exportData: IncidentExportData[] = summary.recentIncidents.map((nc) => ({
        referenceNumber: nc.referenceNumber,
        title: nc.title,
        type: nc.type,
        severity: nc.severity,
        status: nc.status,
        dateOccurred: new Date(nc.dateOccurred).toLocaleDateString(),
      }));
      exportIncidentsExcel(exportData, 'ISO_9001', 'Quality Non-Conformances Report');
    }
  };

  const getSigmaRating = (sigma: number) => {
    if (sigma >= 6) return { label: 'World Class', color: 'text-green-600' };
    if (sigma >= 5) return { label: 'Excellent', color: 'text-green-500' };
    if (sigma >= 4) return { label: 'Good', color: 'text-blue-500' };
    if (sigma >= 3) return { label: 'Average', color: 'text-yellow-500' };
    return { label: 'Needs Improvement', color: 'text-red-500' };
  };

  const sigmaRating = getSigmaRating(qualityMetrics?.ytd.processSigma || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Award className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Quality</h1>
            <p className="text-muted-foreground">ISO 9001 Management System</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ExportDropdown
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
            disabled={!summary?.recentIncidents?.length}
          />
          <Link
            href="/quality/ncs/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Report NC
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="flex flex-col items-center p-4 bg-card rounded-lg border hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
          >
            <link.icon className="w-6 h-6 text-blue-500 mb-2" />
            <span className="text-sm font-medium">{link.name}</span>
            {link.count !== undefined && (
              <span className="text-xs text-muted-foreground">{link.count}</span>
            )}
          </Link>
        ))}
      </div>

      {/* Main Stats */}
      <div className="grid lg:grid-cols-4 gap-4">
        <Card className="p-6 flex flex-col items-center">
          <ComplianceGauge
            value={summary?.summary.legal.complianceRate || 0}
            label="Legal Compliance"
            color="#3b82f6"
            size="sm"
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Process Sigma</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-blue-500">
              {qualityMetrics?.ytd.processSigma?.toFixed(1) || '0.0'}σ
            </span>
          </div>
          <div className={`mt-2 text-sm font-medium ${sigmaRating.color}`}>
            {sigmaRating.label}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">First Pass Yield</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-blue-500">
              {qualityMetrics?.ytd.firstPassYield?.toFixed(1) || 0}%
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${qualityMetrics?.ytd.firstPassYield || 0}%` }}
            ></div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Open NCs</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{summary?.summary.incidents.open || 0}</span>
            <span className="text-sm text-muted-foreground mb-1">open</span>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {qualityMetrics?.ytd.customerComplaints || 0} customer complaints
          </div>
        </Card>
      </div>

      {/* Quality Metrics Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">DPMO</h3>
          <p className="text-2xl font-bold">{qualityMetrics?.ytd.dpmo?.toLocaleString() || 0}</p>
          <p className="text-xs text-muted-foreground">Defects Per Million Opportunities</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total COPQ</h3>
          <p className="text-2xl font-bold">
            ${qualityMetrics?.ytd.copq.total?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-muted-foreground">Cost of Poor Quality (YTD)</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Actions</h3>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold">{summary?.summary.actions.open || 0}</span>
            <span className="text-sm text-muted-foreground">open</span>
          </div>
          <div className="mt-1 text-sm text-red-500">
            {summary?.summary.actions.overdue || 0} overdue
          </div>
        </Card>
      </div>

      {/* Charts and Lists */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* COPQ Breakdown */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Cost of Poor Quality Breakdown</h2>
            <Link
              href="/quality/metrics"
              className="text-sm text-blue-500 hover:underline flex items-center gap-1"
            >
              View Details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {qualityMetrics?.ytd.copq ? (
            <COPQChart
              prevention={qualityMetrics.ytd.copq.prevention}
              appraisal={qualityMetrics.ytd.copq.appraisal}
              internalFailure={qualityMetrics.ytd.copq.internalFailure}
              externalFailure={qualityMetrics.ytd.copq.externalFailure}
            />
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Prevention: ${qualityMetrics?.ytd.copq.prevention?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Appraisal: ${qualityMetrics?.ytd.copq.appraisal?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Internal: ${qualityMetrics?.ytd.copq.internalFailure?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>External: ${qualityMetrics?.ytd.copq.externalFailure?.toLocaleString() || 0}</span>
            </div>
          </div>
        </Card>

        {/* FPY Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">First Pass Yield Trend</h2>
            <Link
              href="/quality/metrics"
              className="text-sm text-blue-500 hover:underline flex items-center gap-1"
            >
              View Details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {qualityMetrics?.monthlyTrend?.length ? (
            <TrendChart
              data={qualityMetrics.monthlyTrend.map((m) => ({ month: m.month, value: m.fpy }))}
              label="FPY %"
              color="#3b82f6"
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </Card>
      </div>

      {/* Recent NCs and Process Risks */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Non-Conformances */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Non-Conformances</h2>
            <Link
              href="/quality/ncs"
              className="text-sm text-blue-500 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {summary?.recentIncidents?.length ? (
              summary.recentIncidents.map((nc) => (
                <Link
                  key={nc.id}
                  href={`/quality/ncs/${nc.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{nc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {nc.referenceNumber} • {new Date(nc.dateOccurred).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(nc.severity)}`}>
                    {nc.severity}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No recent non-conformances</p>
            )}
          </div>
        </Card>

        {/* High Risk Processes */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">High Risk Processes</h2>
            <Link
              href="/quality/processes"
              className="text-sm text-blue-500 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {summary?.topRisks?.length ? (
              summary.topRisks.map((process) => (
                <Link
                  key={process.id}
                  href={`/quality/processes/${process.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{process.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Risk Score: {process.riskScore}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskLevelColor(process.riskLevel)}`}>
                    {process.riskLevel}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No high risk processes</p>
            )}
          </div>
        </Card>
      </div>

      {/* Objectives Progress */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Quality Objectives Progress</h2>
          <Link
            href="/quality/objectives"
            className="text-sm text-blue-500 hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-3xl font-bold text-blue-500">{summary?.summary.objectives.total || 0}</p>
            <p className="text-sm text-muted-foreground">Total Objectives</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-3xl font-bold text-green-500">{summary?.summary.objectives.achieved || 0}</p>
            <p className="text-sm text-muted-foreground">Achieved</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-3xl font-bold">{summary?.summary.objectives.achievementRate || 0}%</p>
            <p className="text-sm text-muted-foreground">Achievement Rate</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
