'use client';

import Link from 'next/link';
import {
  TrendingUp,
  HelpCircle,
  GitBranch,
  BarChart3,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const analyticsTools = [
  {
    name: '5 Whys',
    description: 'Root cause analysis by asking "Why?" five times',
    href: '/analytics/five-whys',
    icon: HelpCircle,
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
  },
  {
    name: 'Fishbone Diagram',
    description: 'Ishikawa cause & effect analysis using 6M categories',
    href: '/analytics/fishbone',
    icon: GitBranch,
    color: 'indigo',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-600',
  },
  {
    name: 'Pareto Analysis',
    description: '80/20 rule to identify vital few contributors',
    href: '/analytics/pareto',
    icon: BarChart3,
    color: 'amber',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-600',
  },
  {
    name: 'Bow-Tie Analysis',
    description: 'Risk barrier analysis with threats and consequences',
    href: '/analytics/bow-tie',
    icon: Shield,
    color: 'cyan',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-600',
  },
  {
    name: 'Lean 8 Wastes',
    description: 'DOWNTIME waste identification in processes',
    href: '/analytics/lean-waste',
    icon: Layers,
    color: 'emerald',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-600',
  },
  {
    name: 'Monthly Trends',
    description: 'Track IMS metrics and performance over time',
    href: '/analytics/trends',
    icon: TrendingUp,
    color: 'violet',
    bgColor: 'bg-violet-100',
    textColor: 'text-violet-600',
  },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Analytics & Workflows</h1>
          <p className="text-muted-foreground">Root cause analysis and continuous improvement tools</p>
        </div>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Tools Overview</CardTitle>
          <CardDescription>
            Use these quality and lean tools to analyze incidents, identify root causes, and drive continuous improvement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsTools.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="group p-4 border rounded-lg hover:border-primary/50 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 ${tool.bgColor} rounded-lg flex items-center justify-center shrink-0`}>
                    <tool.icon className={`w-5 h-5 ${tool.textColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium group-hover:text-primary transition-colors">{tool.name}</h3>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* When to Use Each Tool */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Root Cause Analysis Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">5 Whys</p>
                <p className="text-sm text-muted-foreground">
                  Best for simple problems with a single root cause. Quick and effective for immediate analysis.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                <GitBranch className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium">Fishbone Diagram</p>
                <p className="text-sm text-muted-foreground">
                  Best for complex problems with multiple potential causes. Organizes causes into categories.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="font-medium">Pareto Analysis</p>
                <p className="text-sm text-muted-foreground">
                  Best for prioritizing issues. Identifies the vital few causes that contribute to most problems.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk & Process Improvement Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-cyan-600" />
              </div>
              <div>
                <p className="font-medium">Bow-Tie Analysis</p>
                <p className="text-sm text-muted-foreground">
                  Best for risk assessment. Visualizes threats, barriers, and consequences around a top event.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium">Lean 8 Wastes</p>
                <p className="text-sm text-muted-foreground">
                  Best for process improvement. Identifies and eliminates waste using DOWNTIME framework.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <p className="font-medium">Monthly Trends</p>
                <p className="text-sm text-muted-foreground">
                  Best for tracking performance. Monitor key metrics over time to identify patterns.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Process Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Analysis Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-4 py-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-lg font-bold text-red-600">1</span>
              </div>
              <p className="text-sm font-medium">Incident Occurs</p>
              <p className="text-xs text-muted-foreground">Record the event</p>
            </div>
            <ArrowRight className="w-6 h-6 text-muted-foreground" />
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-lg font-bold text-purple-600">2</span>
              </div>
              <p className="text-sm font-medium">Quick Analysis</p>
              <p className="text-xs text-muted-foreground">5 Whys for simple issues</p>
            </div>
            <ArrowRight className="w-6 h-6 text-muted-foreground" />
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-lg font-bold text-indigo-600">3</span>
              </div>
              <p className="text-sm font-medium">Deep Analysis</p>
              <p className="text-xs text-muted-foreground">Fishbone for complex issues</p>
            </div>
            <ArrowRight className="w-6 h-6 text-muted-foreground" />
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-lg font-bold text-amber-600">4</span>
              </div>
              <p className="text-sm font-medium">Prioritize</p>
              <p className="text-xs text-muted-foreground">Pareto to focus efforts</p>
            </div>
            <ArrowRight className="w-6 h-6 text-muted-foreground" />
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-lg font-bold text-green-600">5</span>
              </div>
              <p className="text-sm font-medium">Take Action</p>
              <p className="text-xs text-muted-foreground">Implement CAPA</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
