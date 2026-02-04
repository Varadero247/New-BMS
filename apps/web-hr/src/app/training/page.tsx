'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@ims/ui';
import { Plus, GraduationCap, Calendar, Users, Clock, BookOpen } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Course {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  deliveryMethod: string;
  duration: number;
  isMandatory: boolean;
  _count?: { sessions: number; enrollments: number };
}

interface Session {
  id: string;
  sessionCode: string;
  startDate: string;
  endDate: string;
  status: string;
  maxParticipants: number;
  enrolledCount: number;
  course: { name: string; code: string };
}

const deliveryColors: Record<string, string> = {
  CLASSROOM: 'bg-blue-100 text-blue-700',
  VIRTUAL: 'bg-purple-100 text-purple-700',
  E_LEARNING: 'bg-green-100 text-green-700',
  ON_THE_JOB: 'bg-orange-100 text-orange-700',
  WORKSHOP: 'bg-pink-100 text-pink-700',
};

const sessionStatusColors: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function TrainingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'sessions'>('courses');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [coursesRes, sessionsRes] = await Promise.all([
        api.get('/training/courses'),
        api.get('/training/sessions'),
      ]);
      setCourses(coursesRes.data.data || []);
      setSessions(sessionsRes.data.data || []);
    } catch (error) {
      console.error('Error loading training data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-40 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const upcomingSessions = sessions.filter(s => new Date(s.startDate) > new Date() && s.status === 'SCHEDULED');

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Training & Development</h1>
            <p className="text-gray-500 mt-1">Courses, sessions, and employee development</p>
          </div>
          <div className="flex gap-2">
            <Link href="/training/courses/new">
              <Button variant="outline" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> New Course
              </Button>
            </Link>
            <Link href="/training/sessions/new">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Schedule Session
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Courses</p>
                  <p className="text-2xl font-bold">{courses.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Upcoming Sessions</p>
                  <p className="text-2xl font-bold text-green-600">{upcomingSessions.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Mandatory Courses</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {courses.filter(c => c.isMandatory).length}
                  </p>
                </div>
                <GraduationCap className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Enrollments</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {courses.reduce((sum, c) => sum + (c._count?.enrollments || 0), 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'courses' ? 'default' : 'outline'}
            onClick={() => setActiveTab('courses')}
          >
            <BookOpen className="h-4 w-4 mr-2" /> Courses ({courses.length})
          </Button>
          <Button
            variant={activeTab === 'sessions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('sessions')}
          >
            <Calendar className="h-4 w-4 mr-2" /> Sessions ({sessions.length})
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'courses' && (
          <Card>
            <CardHeader>
              <CardTitle>Training Courses</CardTitle>
            </CardHeader>
            <CardContent>
              {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <Link key={course.id} href={`/training/courses/${course.id}`}>
                      <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-blue-600" />
                            <span className="text-sm text-gray-500">{course.code}</span>
                          </div>
                          {course.isMandatory && (
                            <Badge className="bg-red-100 text-red-700">Mandatory</Badge>
                          )}
                        </div>
                        <h3 className="font-medium mb-2">{course.name}</h3>
                        {course.description && (
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{course.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className={deliveryColors[course.deliveryMethod] || 'bg-gray-100'}>
                            {course.deliveryMethod.replace('_', ' ')}
                          </Badge>
                          <Badge className="bg-gray-100 text-gray-700">{course.category}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {course.duration}h
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {course._count?.enrollments || 0} enrolled
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No courses found</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'sessions' && (
          <Card>
            <CardHeader>
              <CardTitle>Training Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length > 0 ? (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{session.course.name}</span>
                            <Badge className={sessionStatusColors[session.status] || 'bg-gray-100'}>
                              {session.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>{session.sessionCode}</span>
                            <span>•</span>
                            <span>
                              {new Date(session.startDate).toLocaleDateString()} - {new Date(session.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {session.enrolledCount} / {session.maxParticipants}
                        </p>
                        <p className="text-sm text-gray-500">participants</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No sessions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
