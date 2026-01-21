'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Leaf,
  AlertTriangle,
  FileText,
  Target,
  ClipboardCheck,
  TrendingUp,
  ArrowRight,
  Plus,
  Droplets,
  Wind,
  Trash2,
  Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ExportDropdown } from '@/components/ui/export-dropdown';
import { ComplianceGauge, TrendChart } from '@/components/charts';
import api from '@/lib/api';
import {
  exportIncidents,
  exportIncidentsExcel,
  type IncidentExportData,
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

interface EnvironmentalMetrics {
  year: number;
  ytd: {
    energyConsumption: number;
    waterConsumption: number;
    wasteGenerated: number;
    carbonEmissions: number;
    recyclingRate: number;
  };
  monthlyTrend: Array<{
    month: number;
    energy: number;
    water: number;
    waste: number;
  }>;
}

export default function EnvironmentOverviewPage() {
  const [summary, setSummary] = useState<StandardSummary | null>(null);
  const [metrics, setMetrics] = useState<EnvironmentalMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryRes] = await Promise.all([
          api.get('/dashboard/summary/ISO_14001'),
        ]);

        setSummary(summaryRes.data.data);

        // Mock environmental metrics for now
        setMetrics({
          year: new Date().getFullYear(),
          ytd: {
            energyConsumption: 125000,
            waterConsumption: 45000,
            wasteGenerated: 2500,
            carbonEmissions: 850,
            recyclingRate: 72,
          },
          monthlyTrend: [
            { month: 1, energy: 12000, water: 4200, waste: 220 },
            { month: 2, energy: 11500, water: 4000, waste: 210 },
            { month: 3, energy: 10800, water: 3800, waste: 200 },
            { month: 4, energy: 10200, water: 3600, waste: 195 },
            { month: 5, energy: 9800, water: 3500, waste: 190 },
            { month: 6, energy: 10500, water: 3900, waste: 205 },
          ],
        });
      } catch (error) {
        console.error('Failed to fetch Environment data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
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

  const getSignificanceColor = (level: string) => {
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
    { name: 'Aspects', href: '/environment/aspects', icon: Leaf, count: summary?.summary.risks.active },
    { name: 'Events', href: '/environment/events', icon: FileText, count: summary?.summary.incidents.open },
    { name: 'Legal', href: '/environment/legal', icon: FileText, count: summary?.summary.legal.total },
    { name: 'Objectives', href: '/environment/objectives', icon: Target, count: summary?.summary.objectives.total },
    { name: 'Actions', href: '/environment/actions', icon: ClipboardCheck, count: summary?.summary.actions.open },
    { name: 'Metrics', href: '/environment/metrics', icon: TrendingUp },
  ];

  const handleExportPDF = () => {
    if (summary?.recentIncidents?.length) {
      const exportData: IncidentExportData[] = summary.recentIncidents.map((event) => ({
        referenceNumber: event.referenceNumber,
        title: event.title,
        type: event.type,
        severity: event.severity,
        status: event.status,
        dateOccurred: new Date(event.dateOccurred).toLocaleDateString(),
      }));
      exportIncidents(exportData, 'ISO_14001', 'Environmental Events Report');
    }
  };

  const handleExportExcel = () => {
    if (summary?.recentIncidents?.length) {
      const exportData: IncidentExportData[] = summary.recentIncidents.map((event) => ({
        referenceNumber: event.referenceNumber,
        title: event.title,
        type: event.type,
        severity: event.severity,
        status: event.status,
        dateOccurred: new Date(event.dateOccurred).toLocaleDateString(),
      }));
      exportIncidentsExcel(exportData, 'ISO_14001', 'Environmental Events Report');
    }
  };

  const environmentalIndicators = [
    {
      name: 'Energy',
      value: metrics?.ytd.energyConsumption || 0,
      unit: 'kWh',
      icon: Zap,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100',
    },
    {
      name: 'Water',
      value: metrics?.ytd.waterConsumption || 0,
      unit: 'm³',
      icon: Droplets,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Waste',
      value: metrics?.ytd.wasteGenerated || 0,
      unit: 'kg',
      icon: Trash2,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100',
    },
    {
      name: 'CO₂',
      value: metrics?.ytd.carbonEmissions || 0,
      unit: 'tonnes',
      icon: Wind,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Leaf className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Environment</h1>
            <p className="text-muted-foreground">ISO 14001 Management System</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ExportDropdown
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
            disabled={!summary?.recentIncidents?.length}
          />
          <Link
            href="/environment/events/new"
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Report Event
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="flex flex-col items-center p-4 bg-card rounded-lg border hover:border-green-300 hover:bg-green-50/50 transition-colors"
          >
            <link.icon className="w-6 h-6 text-green-500 mb-2" />
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
            color="#22c55e"
            size="sm"
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Recycling Rate</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-green-500">{metrics?.ytd.recyclingRate || 0}%</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${metrics?.ytd.recyclingRate || 0}%` }}
            ></div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Environmental Events</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-green-500">{summary?.summary.incidents.open || 0}</span>
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
          <div className="mt-2 text-sm text-green-500">
            {summary?.summary.actions.overdue || 0} overdue
          </div>
        </Card>
      </div>

      {/* Environmental Indicators */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Environmental Indicators (YTD)</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {environmentalIndicators.map((indicator) => (
            <div key={indicator.name} className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 ${indicator.bgColor} rounded-lg flex items-center justify-center`}>
                  <indicator.icon className={`w-4 h-4 ${indicator.color}`} />
                </div>
                <span className="text-sm font-medium">{indicator.name}</span>
              </div>
              <p className="text-2xl font-bold">
                {indicator.value.toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground ml-1">{indicator.unit}</span>
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Charts and Lists */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Energy Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Energy Consumption Trend</h2>
            <Link
              href="/environment/metrics"
              className="text-sm text-green-500 hover:underline flex items-center gap-1"
            >
              View Details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {metrics?.monthlyTrend?.length ? (
            <TrendChart
              data={metrics.monthlyTrend.map((m) => ({ month: m.month, value: m.energy }))}
              label="Energy (kWh)"
              color="#22c55e"
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </Card>

        {/* Recent Events */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Environmental Events</h2>
            <Link
              href="/environment/events"
              className="text-sm text-green-500 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {summary?.recentIncidents?.length ? (
              summary.recentIncidents.map((event) => (
                <Link
                  key={event.id}
                  href={`/environment/events/${event.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.referenceNumber} • {new Date(event.dateOccurred).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(event.severity)}`}>
                    {event.severity}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No recent events</p>
            )}
          </div>
        </Card>
      </div>

      {/* Significant Aspects */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Significant Environmental Aspects</h2>
          <Link
            href="/environment/aspects"
            className="text-sm text-green-500 hover:underline flex items-center gap-1"
          >
            View All Aspects <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {summary?.topRisks?.length ? (
            summary.topRisks.map((aspect) => (
              <Link
                key={aspect.id}
                href={`/environment/aspects/${aspect.id}`}
                className="p-4 rounded-lg border hover:border-green-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSignificanceColor(aspect.riskLevel)}`}>
                    {aspect.riskLevel}
                  </span>
                  <span className="text-sm font-medium">Score: {aspect.riskScore}</span>
                </div>
                <p className="text-sm font-medium">{aspect.title}</p>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground col-span-full text-center py-4">
              No significant aspects
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
