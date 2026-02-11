'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Modal, ModalFooter, Label, Input, Textarea } from '@ims/ui';
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

const CATEGORIES = [
  'TECHNICAL', 'SOFT_SKILLS', 'COMPLIANCE', 'SAFETY',
  'MANAGEMENT', 'LEADERSHIP', 'INDUSTRY_SPECIFIC', 'OTHER',
];

const DELIVERY_METHODS = [
  'CLASSROOM', 'VIRTUAL', 'E_LEARNING', 'ON_THE_JOB',
  'WORKSHOP', 'BLENDED', 'SELF_PACED',
];

export default function TrainingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'sessions'>('courses');

  // Create Course modal state
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [courseError, setCourseError] = useState('');

  // Course form fields
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseCategory, setCourseCategory] = useState('');
  const [courseDeliveryMethod, setCourseDeliveryMethod] = useState('');
  const [courseDuration, setCourseDuration] = useState('');
  const [courseIsMandatory, setCourseIsMandatory] = useState(false);
  const [courseMaxParticipants, setCourseMaxParticipants] = useState('');
  const [coursePrerequisites, setCoursePrerequisites] = useState('');
  const [courseLearningObjectives, setCourseLearningObjectives] = useState('');
  const [courseTargetAudience, setCourseTargetAudience] = useState('');

  // Create Session modal state
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const [sessionError, setSessionError] = useState('');

  // Session form fields
  const [sessionCourseId, setSessionCourseId] = useState('');
  const [sessionStartDate, setSessionStartDate] = useState('');
  const [sessionEndDate, setSessionEndDate] = useState('');
  const [sessionLocation, setSessionLocation] = useState('');
  const [sessionInstructorName, setSessionInstructorName] = useState('');
  const [sessionMaxParticipants, setSessionMaxParticipants] = useState('');

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

  function openCourseModal() {
    setCourseError('');
    setCourseCode('');
    setCourseName('');
    setCourseDescription('');
    setCourseCategory('');
    setCourseDeliveryMethod('');
    setCourseDuration('');
    setCourseIsMandatory(false);
    setCourseMaxParticipants('');
    setCoursePrerequisites('');
    setCourseLearningObjectives('');
    setCourseTargetAudience('');
    setCourseModalOpen(true);
  }

  async function handleCreateCourse() {
    if (!courseCode || !courseName || !courseCategory || !courseDeliveryMethod || !courseDuration) {
      setCourseError('Please fill in all required fields.');
      return;
    }

    setCreatingCourse(true);
    setCourseError('');

    try {
      const payload: Record<string, unknown> = {
        code: courseCode,
        name: courseName,
        description: courseDescription || undefined,
        category: courseCategory,
        deliveryMethod: courseDeliveryMethod,
        duration: parseFloat(courseDuration),
        isMandatory: courseIsMandatory,
      };

      if (courseMaxParticipants) {
        payload.maxParticipants = parseInt(courseMaxParticipants);
      }
      if (coursePrerequisites) {
        payload.prerequisites = coursePrerequisites.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (courseLearningObjectives) {
        payload.objectives = courseLearningObjectives;
      }

      await api.post('/training/courses', payload);
      setCourseModalOpen(false);
      loadData();
    } catch (error: any) {
      const msg = error.response?.data?.error?.message;
      setCourseError(typeof msg === 'string' ? msg : 'Failed to create course.');
    } finally {
      setCreatingCourse(false);
    }
  }

  function openSessionModal() {
    setSessionError('');
    setSessionCourseId('');
    setSessionStartDate('');
    setSessionEndDate('');
    setSessionLocation('');
    setSessionInstructorName('');
    setSessionMaxParticipants('');
    setSessionModalOpen(true);
  }

  async function handleCreateSession() {
    if (!sessionCourseId || !sessionStartDate || !sessionEndDate || !sessionMaxParticipants) {
      setSessionError('Please fill in all required fields.');
      return;
    }

    setCreatingSession(true);
    setSessionError('');

    try {
      const payload: Record<string, unknown> = {
        courseId: sessionCourseId,
        startDate: sessionStartDate,
        endDate: sessionEndDate,
        maxParticipants: parseInt(sessionMaxParticipants),
        location: sessionLocation || undefined,
        instructorName: sessionInstructorName || undefined,
      };

      await api.post('/training/sessions', payload);
      setSessionModalOpen(false);
      loadData();
    } catch (error: any) {
      const msg = error.response?.data?.error?.message;
      setSessionError(typeof msg === 'string' ? msg : 'Failed to create session.');
    } finally {
      setCreatingSession(false);
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
            <Button variant="outline" className="flex items-center gap-2" onClick={openCourseModal}>
              <BookOpen className="h-4 w-4" /> New Course
            </Button>
            <Button className="flex items-center gap-2" onClick={openSessionModal}>
              <Plus className="h-4 w-4" /> Schedule Session
            </Button>
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

      {/* Create Course Modal */}
      <Modal isOpen={courseModalOpen} onClose={() => setCourseModalOpen(false)} title="New Training Course" size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {courseError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {courseError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="courseCode">Course Code *</Label>
              <Input
                id="courseCode"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g., TRN-001"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="courseName">Course Name *</Label>
              <Input
                id="courseName"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Course name"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="courseDescription">Description</Label>
            <Textarea
              id="courseDescription"
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              placeholder="Course description..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="courseCategory">Category *</Label>
              <select
                id="courseCategory"
                value={courseCategory}
                onChange={(e) => setCourseCategory(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm mt-1"
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="courseDeliveryMethod">Delivery Method *</Label>
              <select
                id="courseDeliveryMethod"
                value={courseDeliveryMethod}
                onChange={(e) => setCourseDeliveryMethod(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm mt-1"
              >
                <option value="">Select Method</option>
                {DELIVERY_METHODS.map((dm) => (
                  <option key={dm} value={dm}>
                    {dm.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="courseDuration">Duration (hours) *</Label>
              <Input
                id="courseDuration"
                type="number"
                value={courseDuration}
                onChange={(e) => setCourseDuration(e.target.value)}
                placeholder="e.g., 8"
                min="0"
                step="0.5"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="courseMaxParticipants">Max Participants</Label>
              <Input
                id="courseMaxParticipants"
                type="number"
                value={courseMaxParticipants}
                onChange={(e) => setCourseMaxParticipants(e.target.value)}
                placeholder="e.g., 30"
                min="1"
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="courseIsMandatory"
              checked={courseIsMandatory}
              onChange={(e) => setCourseIsMandatory(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="courseIsMandatory">Mandatory Course</Label>
          </div>

          <div>
            <Label htmlFor="coursePrerequisites">Prerequisites (comma-separated)</Label>
            <Input
              id="coursePrerequisites"
              value={coursePrerequisites}
              onChange={(e) => setCoursePrerequisites(e.target.value)}
              placeholder="e.g., Basic Safety, First Aid"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="courseLearningObjectives">Learning Objectives</Label>
            <Textarea
              id="courseLearningObjectives"
              value={courseLearningObjectives}
              onChange={(e) => setCourseLearningObjectives(e.target.value)}
              placeholder="Learning objectives..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="courseTargetAudience">Target Audience</Label>
            <Input
              id="courseTargetAudience"
              value={courseTargetAudience}
              onChange={(e) => setCourseTargetAudience(e.target.value)}
              placeholder="e.g., All Employees, Management"
              className="mt-1"
            />
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => setCourseModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateCourse} disabled={creatingCourse}>
            {creatingCourse ? 'Creating...' : 'Create Course'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Create Session Modal */}
      <Modal isOpen={sessionModalOpen} onClose={() => setSessionModalOpen(false)} title="Schedule Training Session" size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {sessionError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {sessionError}
            </div>
          )}

          <div>
            <Label htmlFor="sessionCourseId">Course *</Label>
            <select
              id="sessionCourseId"
              value={sessionCourseId}
              onChange={(e) => setSessionCourseId(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm mt-1"
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sessionStartDate">Start Date *</Label>
              <Input
                id="sessionStartDate"
                type="date"
                value={sessionStartDate}
                onChange={(e) => setSessionStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="sessionEndDate">End Date *</Label>
              <Input
                id="sessionEndDate"
                type="date"
                value={sessionEndDate}
                onChange={(e) => setSessionEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sessionLocation">Location</Label>
              <Input
                id="sessionLocation"
                value={sessionLocation}
                onChange={(e) => setSessionLocation(e.target.value)}
                placeholder="e.g., Room 201, Building A"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="sessionInstructorName">Instructor Name</Label>
              <Input
                id="sessionInstructorName"
                value={sessionInstructorName}
                onChange={(e) => setSessionInstructorName(e.target.value)}
                placeholder="Instructor name"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="sessionMaxParticipants">Max Participants *</Label>
            <Input
              id="sessionMaxParticipants"
              type="number"
              value={sessionMaxParticipants}
              onChange={(e) => setSessionMaxParticipants(e.target.value)}
              placeholder="e.g., 20"
              min="1"
              className="mt-1"
            />
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => setSessionModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateSession} disabled={creatingSession}>
            {creatingSession ? 'Scheduling...' : 'Schedule Session'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
