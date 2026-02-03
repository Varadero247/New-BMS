'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@ims/ui';
import { Plus, Lightbulb, Zap, TrendingUp, CheckSquare, Target, Users } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Project {
  id: string;
  projectNumber: string;
  title: string;
  methodology: string;
  currentPhase: string;
  status: string;
  estimatedSavings?: number;
  actualSavings?: number;
}

interface KaizenEvent {
  id: string;
  eventNumber: string;
  title: string;
  area: string;
  status: string;
  startDate: string;
  endDate: string;
  estimatedSavings?: number;
}

interface Idea {
  id: string;
  ideaNumber: string;
  title: string;
  category: string;
  status: string;
  submittedAt: string;
}

const projectStatusColors: Record<string, string> = {
  PROPOSED: 'bg-gray-100 text-gray-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  ON_HOLD: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const phaseColors: Record<string, string> = {
  DEFINE: 'bg-blue-100 text-blue-700',
  MEASURE: 'bg-purple-100 text-purple-700',
  ANALYZE: 'bg-yellow-100 text-yellow-700',
  IMPROVE: 'bg-orange-100 text-orange-700',
  CONTROL: 'bg-green-100 text-green-700',
};

const ideaStatusColors: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  IMPLEMENTED: 'bg-cyan-100 text-cyan-700',
};

export default function ContinuousImprovementPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [kaizenEvents, setKaizenEvents] = useState<KaizenEvent[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'kaizen' | 'ideas'>('projects');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [projectsRes, kaizenRes, ideasRes] = await Promise.all([
        api.get('/ci/projects'),
        api.get('/ci/kaizen'),
        api.get('/ci/ideas'),
      ]);

      setProjects(projectsRes.data.data || []);
      setKaizenEvents(kaizenRes.data.data || []);
      setIdeas(ideasRes.data.data || []);
    } catch (error) {
      console.error('Failed to load CI data:', error);
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    activeProjects: projects.filter(p => p.status === 'IN_PROGRESS').length,
    completedProjects: projects.filter(p => p.status === 'COMPLETED').length,
    totalSavings: projects.reduce((sum, p) => sum + (p.actualSavings || 0), 0),
    upcomingKaizen: kaizenEvents.filter(k => new Date(k.startDate) > new Date()).length,
    newIdeas: ideas.filter(i => i.status === 'SUBMITTED').length,
    implementedIdeas: ideas.filter(i => i.status === 'IMPLEMENTED').length,
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Continuous Improvement</h1>
            <p className="text-gray-500 mt-1">Projects, Kaizen Events, and Employee Ideas</p>
          </div>
          <div className="flex gap-2">
            <Link href="/ci/projects/new">
              <Button variant="outline" className="flex items-center gap-2">
                <Target className="h-4 w-4" /> New Project
              </Button>
            </Link>
            <Link href="/ci/kaizen/new">
              <Button variant="outline" className="flex items-center gap-2">
                <Zap className="h-4 w-4" /> New Kaizen
              </Button>
            </Link>
            <Link href="/ci/ideas/new">
              <Button className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" /> Submit Idea
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Projects</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.activeProjects}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedProjects}</p>
                </div>
                <CheckSquare className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Savings</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${(stats.totalSavings / 1000).toFixed(0)}k
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Upcoming Kaizen</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.upcomingKaizen}</p>
                </div>
                <Zap className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">New Ideas</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.newIdeas}</p>
                </div>
                <Lightbulb className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Implemented</p>
                  <p className="text-2xl font-bold text-cyan-600">{stats.implementedIdeas}</p>
                </div>
                <CheckSquare className="h-8 w-8 text-cyan-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'projects' ? 'default' : 'outline'}
            onClick={() => setActiveTab('projects')}
          >
            <Target className="h-4 w-4 mr-2" /> Projects ({projects.length})
          </Button>
          <Button
            variant={activeTab === 'kaizen' ? 'default' : 'outline'}
            onClick={() => setActiveTab('kaizen')}
          >
            <Zap className="h-4 w-4 mr-2" /> Kaizen ({kaizenEvents.length})
          </Button>
          <Button
            variant={activeTab === 'ideas' ? 'default' : 'outline'}
            onClick={() => setActiveTab('ideas')}
          >
            <Lightbulb className="h-4 w-4 mr-2" /> Ideas ({ideas.length})
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'projects' && (
          <Card>
            <CardHeader>
              <CardTitle>Improvement Projects (DMAIC/DMADV)</CardTitle>
            </CardHeader>
            <CardContent>
              {projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <Link key={project.id} href={`/ci/projects/${project.id}`}>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{project.title}</span>
                            <Badge className={phaseColors[project.currentPhase] || 'bg-gray-100'}>
                              {project.currentPhase}
                            </Badge>
                            <Badge className={projectStatusColors[project.status] || 'bg-gray-100'}>
                              {project.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>{project.projectNumber}</span>
                            <span>•</span>
                            <span>{project.methodology}</span>
                            {project.estimatedSavings && (
                              <>
                                <span>•</span>
                                <span>Est. ${(project.estimatedSavings / 1000).toFixed(0)}k</span>
                              </>
                            )}
                          </div>
                        </div>
                        {project.actualSavings && (
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Actual Savings</p>
                            <p className="font-bold text-green-600">
                              ${(project.actualSavings / 1000).toFixed(0)}k
                            </p>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No projects found</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'kaizen' && (
          <Card>
            <CardHeader>
              <CardTitle>Kaizen Events</CardTitle>
            </CardHeader>
            <CardContent>
              {kaizenEvents.length > 0 ? (
                <div className="space-y-4">
                  {kaizenEvents.map((event) => (
                    <Link key={event.id} href={`/ci/kaizen/${event.id}`}>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{event.title}</span>
                            <Badge className={projectStatusColors[event.status] || 'bg-gray-100'}>
                              {event.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>{event.eventNumber}</span>
                            <span>•</span>
                            <span>{event.area}</span>
                            <span>•</span>
                            <span>
                              {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {event.estimatedSavings && (
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Est. Savings</p>
                            <p className="font-bold text-green-600">
                              ${(event.estimatedSavings / 1000).toFixed(0)}k
                            </p>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No kaizen events found</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'ideas' && (
          <Card>
            <CardHeader>
              <CardTitle>Employee Ideas</CardTitle>
            </CardHeader>
            <CardContent>
              {ideas.length > 0 ? (
                <div className="space-y-4">
                  {ideas.map((idea) => (
                    <Link key={idea.id} href={`/ci/ideas/${idea.id}`}>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{idea.title}</span>
                            <Badge className={ideaStatusColors[idea.status] || 'bg-gray-100'}>
                              {idea.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>{idea.ideaNumber}</span>
                            <span>•</span>
                            <span>{idea.category.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>Submitted: {new Date(idea.submittedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No ideas found</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
