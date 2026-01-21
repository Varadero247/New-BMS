'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  HardHat,
  AlertTriangle,
  FileText,
  Target,
  ClipboardCheck,
  TrendingUp,
  ArrowRight,
  Plus,
  Users,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ExportDropdown } from '@/components/ui/export-dropdown';
import { ComplianceGauge, TrendChart } from '@/components/charts';
import api from '@/lib/api';
import {
  exportIncidents,
  exportIncidentsExcel,
  exportSafetyMetrics,
  exportSafetyMetricsExcel,
  type IncidentExportData,
  type SafetyMetricsData,
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

interface SafetyMetricSummary {
  year: number;
  ytd: {
    hoursWorked: number;
    lostTimeInjuries: number;
    totalRecordableInjuries: number;
    daysLost: number;
    ltifr: number;
    trir: number;
    severityRate: number;
  };
  monthlyTrend: Array<{
    month: number;
    ltifr: number;
    trir: number;
  }>;
}

export default function HSOverviewPage() {
  const [summary, setSummary] = useState<StandardSummary | null>(null);
  const [safetyMetrics, setSafetyMetrics] = useState<SafetyMetricSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryRes, metricsRes] = await Promise.all([
          api.get('/dashboard/summary/ISO_45001'),
          api.get('/metrics/safety/summary'),
        ]);

        setSummary(summaryRes.data.data);
        setSafetyMetrics(metricsRes.data.data);
      } catch (error) {
        console.error('Failed to fetch H&S data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
      case 'CATASTROPHIC':
        return 'bg-red-100 text-red-700';
      case 'MAJOR':
        return 'bg-orange-100 text-orange-700';
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  const quickLinks = [
    { name: 'Risks', href: '/hs/risks', icon: AlertTriangle, count: summary?.summary.risks.active },
    { name: 'Incidents', href: '/hs/incidents', icon: FileText, count: summary?.summary.incidents.open },
    { name: 'Legal', href: '/hs/legal', icon: FileText, count: summary?.summary.legal.total },
    { name: 'Objectives', href: '/hs/objectives', icon: Target, count: summary?.summary.objectives.total },
    { name: 'Actions', href: '/hs/actions', icon: ClipboardCheck, count: summary?.summary.actions.open },
    { name: 'Metrics', href: '/hs/metrics', icon: TrendingUp },
  ];

  const handleExportPDF = () => {
    if (summary?.recentIncidents?.length) {
      const exportData: IncidentExportData[] = summary.recentIncidents.map((inc) => ({
        referenceNumber: inc.referenceNumber,
        title: inc.title,
        type: inc.type,
        severity: inc.severity,
        status: inc.status,
        dateOccurred: new Date(inc.dateOccurred).toLocaleDateString(),
      }));
      exportIncidents(exportData, 'ISO_45001', 'Health & Safety Incidents Report');
    }
  };

  const handleExportExcel = () => {
    if (summary?.recentIncidents?.length) {
      const exportData: IncidentExportData[] = summary.recentIncidents.map((inc) => ({
        referenceNumber: inc.referenceNumber,
        title: inc.title,
        type: inc.type,
        severity: inc.severity,
        status: inc.status,
        dateOccurred: new Date(inc.dateOccurred).toLocaleDateString(),
      }));
      exportIncidentsExcel(exportData, 'ISO_45001', 'Health & Safety Incidents Report');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <HardHat className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Health & Safety</h1>
            <p className="text-muted-foreground">ISO 45001 Management System</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ExportDropdown
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
            disabled={!summary?.recentIncidents?.length}
          />
          <Link
            href="/hs/incidents/new"
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Report Incident
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="flex flex-col items-center p-4 bg-card rounded-lg border hover:border-red-300 hover:bg-red-50/50 transition-colors"
          >
            <link.icon className="w-6 h-6 text-red-500 mb-2" />
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
            color="#ef4444"
            size="sm"
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Safety Rates (YTD)</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">LTIFR</span>
              <span className="text-lg font-bold">{safetyMetrics?.ytd.ltifr?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">TRIR</span>
              <span className="text-lg font-bold">{safetyMetrics?.ytd.trir?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Severity Rate</span>
              <span className="text-lg font-bold">{safetyMetrics?.ytd.severityRate?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Incidents</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-red-500">{summary?.summary.incidents.open || 0}</span>
            <span className="text-sm text-muted-foreground mb-1">open</span>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {summary?.summary.incidents.closureRate || 0}% closure rate
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Actions</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{summary?.summary.actions.open || 0}</span>
            <span className="text-sm text-muted-foreground mb-1">open</span>
          </div>
          <div className="mt-2 text-sm text-red-500">
            {summary?.summary.actions.overdue || 0} overdue
          </div>
        </Card>
      </div>

      {/* Charts and Lists */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* TRIR Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">TRIR Monthly Trend</h2>
            <Link
              href="/hs/metrics"
              className="text-sm text-red-500 hover:underline flex items-center gap-1"
            >
              View Details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {safetyMetrics?.monthlyTrend?.length ? (
            <TrendChart
              data={safetyMetrics.monthlyTrend.map((m) => ({ month: m.month, value: m.trir || 0 }))}
              label="TRIR"
              color="#ef4444"
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </Card>

        {/* Recent Incidents */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Incidents</h2>
            <Link
              href="/hs/incidents"
              className="text-sm text-red-500 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {summary?.recentIncidents?.length ? (
              summary.recentIncidents.map((incident) => (
                <Link
                  key={incident.id}
                  href={`/hs/incidents/${incident.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{incident.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {incident.referenceNumber} • {new Date(incident.dateOccurred).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                    {incident.severity}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No recent incidents</p>
            )}
          </div>
        </Card>
      </div>

      {/* Top Risks */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">High/Critical Risks</h2>
          <Link
            href="/hs/risks"
            className="text-sm text-red-500 hover:underline flex items-center gap-1"
          >
            View All Risks <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {summary?.topRisks?.length ? (
            summary.topRisks.map((risk) => (
              <Link
                key={risk.id}
                href={`/hs/risks/${risk.id}`}
                className="p-4 rounded-lg border hover:border-red-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    risk.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {risk.riskLevel}
                  </span>
                  <span className="text-sm font-medium">Score: {risk.riskScore}</span>
                </div>
                <p className="text-sm font-medium">{risk.title}</p>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground col-span-full text-center py-4">
              No high/critical risks
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
