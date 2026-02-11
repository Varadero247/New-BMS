'use client';

import { useEffect, useState, useCallback } from 'react';
import { FolderKanban, ListChecks, AlertCircle, AlertTriangle, Flag, DollarSign } from 'lucide-react';
import { api } from '@/lib/api';

interface DashboardStats {
  activeProjects: number;
  totalTasks: number;
  openIssues: number;
  openRisks: number;
  upcomingMilestones: number;
  budgetHealth: number;
}

export default function ProjectManagementDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    activeProjects: 0,
    totalTasks: 0,
    openIssues: 0,
    openRisks: 0,
    upcomingMilestones: 0,
    budgetHealth: 0,
  });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [projectsRes, tasksRes, issuesRes, risksRes, milestonesRes] = await Promise.all([
        api.get('/projects').catch(() => ({ data: { data: [] } })),
        api.get('/tasks').catch(() => ({ data: { data: [] } })),
        api.get('/issues').catch(() => ({ data: { data: [] } })),
        api.get('/risks').catch(() => ({ data: { data: [] } })),
        api.get('/milestones').catch(() => ({ data: { data: [] } })),
      ]);

      const projects = projectsRes.data.data || [];
      const tasks = tasksRes.data.data || [];
      const issues = issuesRes.data.data || [];
      const risks = risksRes.data.data || [];
      const milestones = milestonesRes.data.data || [];

      const activeProjects = projects.filter((p: any) => p.status === 'ACTIVE');
      const openIssues = issues.filter((i: any) => i.status === 'OPEN' || i.status === 'IN_PROGRESS');
      const openRisks = risks.filter((r: any) => r.status === 'OPEN' || r.status === 'IDENTIFIED');

      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const upcomingMilestones = milestones.filter((m: any) => {
        const planned = new Date(m.plannedDate);
        return planned >= now && planned <= thirtyDaysFromNow && m.status !== 'COMPLETED';
      });

      // Calculate budget health as percentage of projects within budget
      const projectsWithBudget = projects.filter((p: any) => p.plannedBudget && p.plannedBudget > 0);
      const withinBudget = projectsWithBudget.filter((p: any) =>
        !p.actualBudget || p.actualBudget <= p.plannedBudget
      );
      const budgetHealth = projectsWithBudget.length > 0
        ? Math.round((withinBudget.length / projectsWithBudget.length) * 100)
        : 100;

      setStats({
        activeProjects: activeProjects.length,
        totalTasks: tasks.length,
        openIssues: openIssues.length,
        openRisks: openRisks.length,
        upcomingMilestones: upcomingMilestones.length,
        budgetHealth,
      });

      setRecentProjects(projects.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Active Projects', value: stats.activeProjects, icon: FolderKanban, color: 'blue' },
    { label: 'Total Tasks', value: stats.totalTasks, icon: ListChecks, color: 'indigo' },
    { label: 'Open Issues', value: stats.openIssues, icon: AlertCircle, color: 'amber' },
    { label: 'Open Risks', value: stats.openRisks, icon: AlertTriangle, color: 'red' },
    { label: 'Upcoming Milestones', value: stats.upcomingMilestones, icon: Flag, color: 'purple' },
    { label: 'Budget Health', value: `${stats.budgetHealth}%`, icon: DollarSign, color: 'green' },
  ];

  const colorMap: Record<string, { bg: string; iconBg: string; iconText: string }> = {
    blue: { bg: 'bg-white', iconBg: 'bg-blue-100', iconText: 'text-blue-600' },
    indigo: { bg: 'bg-white', iconBg: 'bg-indigo-100', iconText: 'text-indigo-600' },
    amber: { bg: 'bg-white', iconBg: 'bg-amber-100', iconText: 'text-amber-600' },
    red: { bg: 'bg-white', iconBg: 'bg-red-100', iconText: 'text-red-600' },
    purple: { bg: 'bg-white', iconBg: 'bg-purple-100', iconText: 'text-purple-600' },
    green: { bg: 'bg-white', iconBg: 'bg-green-100', iconText: 'text-green-600' },
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Project Management Dashboard</h1>
          <p className="text-gray-500 mt-1">PMBOK / ISO 21500 Project Management</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            const colors = colorMap[card.color];
            return (
              <div key={card.label} className={`${colors.bg} rounded-lg shadow p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{card.label}</p>
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                  </div>
                  <div className={`p-3 ${colors.iconBg} rounded-full`}>
                    <Icon className={`h-6 w-6 ${colors.iconText}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-blue-600" />
              Recent Projects
            </h2>
          </div>
          <div className="p-6">
            {recentProjects.length > 0 ? (
              <div className="space-y-3">
                {recentProjects.map((project: any) => (
                  <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{project.projectName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{project.projectCode}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          project.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                          project.status === 'PLANNING' ? 'bg-blue-100 text-blue-700' :
                          project.status === 'ON_HOLD' ? 'bg-amber-100 text-amber-700' :
                          project.status === 'COMPLETED' ? 'bg-purple-100 text-purple-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {project.status}
                        </span>
                        {project.projectHealth && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            project.projectHealth === 'GREEN' ? 'bg-green-100 text-green-700' :
                            project.projectHealth === 'AMBER' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {project.projectHealth}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{project.completionPercentage || 0}%</div>
                      <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                        <div
                          className="h-2 bg-blue-600 rounded-full"
                          style={{ width: `${project.completionPercentage || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No projects found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
