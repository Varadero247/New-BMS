'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Modal,
  ModalFooter,
  Input,
  Label,
  Select,
  Textarea,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@ims/ui';
import { Plus, BookOpen, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const TYPES = [
  'MANDATORY',
  'OPTIONAL',
  'REFRESHER',
  'INDUCTION',
  'CERTIFICATION',
  'COMPETENCY',
] as const;
const DELIVERIES = [
  'CLASSROOM',
  'ONLINE',
  'ON_THE_JOB',
  'BLENDED',
  'SELF_PACED',
  'WORKSHOP',
] as const;

interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  type: string;
  delivery: string;
  duration: number;
  validityMonths: number;
  provider: string;
  cost: number;
  maxParticipants: number;
  prerequisites: string;
  objectives: string;
  isActive: boolean;
  createdAt: string;
}

interface CourseForm {
  title: string;
  description: string;
  type: string;
  delivery: string;
  duration: string;
  validityMonths: string;
  provider: string;
  cost: string;
  maxParticipants: string;
  prerequisites: string;
  objectives: string;
  isActive: boolean;
}

const emptyForm: CourseForm = {
  title: '',
  description: '',
  type: 'MANDATORY',
  delivery: 'CLASSROOM',
  duration: '',
  validityMonths: '',
  provider: '',
  cost: '',
  maxParticipants: '',
  prerequisites: '',
  objectives: '',
  isActive: true,
};

export default function CoursesClient() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CourseForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const loadCourses = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (typeFilter !== 'all') params.status = typeFilter;
      const response = await api.get('/courses', { params });
      setCourses(response.data.data || []);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, typeFilter]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  function openCreate() {
    setForm({ ...emptyForm });
    setEditId(null);
    setModalOpen(true);
  }
  function openEdit(course: Course) {
    setForm({
      title: course.title || '',
      description: course.description || '',
      type: course.type || 'MANDATORY',
      delivery: course.delivery || 'CLASSROOM',
      duration: course.duration !== null ? String(course.duration) : '',
      validityMonths: course.validityMonths !== null ? String(course.validityMonths) : '',
      provider: course.provider || '',
      cost: course.cost !== null ? String(course.cost) : '',
      maxParticipants: course.maxParticipants !== null ? String(course.maxParticipants) : '',
      prerequisites: course.prerequisites || '',
      objectives: course.objectives || '',
      isActive: course.isActive !== false,
    });
    setEditId(course.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.title) return;
    setSaving(true);
    try {
      const payload: any = {
        ...form,
        duration: form.duration ? parseInt(form.duration) : undefined,
        validityMonths: form.validityMonths ? parseInt(form.validityMonths) : undefined,
        cost: form.cost ? parseFloat(form.cost) : undefined,
        maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : undefined,
      };
      if (editId) {
        await api.put(`/courses/${editId}`, payload);
      } else {
        await api.post('/courses', payload);
      }
      setModalOpen(false);
      loadCourses();
    } catch (err) {
      console.error('Failed to save course:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      loadCourses();
    } catch (err) {
      console.error(err);
    }
  }

  function getTypeColor(type: string) {
    switch (type) {
      case 'MANDATORY':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'CERTIFICATION':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'INDUCTION':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'REFRESHER':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Courses</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Training course catalogue management
            </p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Course
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{courses.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Courses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-red-600">
                {courses.filter((c) => c.type === 'MANDATORY').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Mandatory</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-purple-600">
                {courses.filter((c) => c.type === 'CERTIFICATION').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Certification</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {courses.filter((c) => c.isActive !== false).length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search courses"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          <select
            aria-label="Filter by type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Types</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="animate-pulse space-y-4 p-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                ))}
              </div>
            ) : courses.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Delivery</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-mono text-xs">{course.code}</TableCell>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(course.type)}`}
                          >
                            {course.type?.replace(/_/g, ' ')}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {course.delivery?.replace(/_/g, ' ') || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {course.duration ? `${course.duration}h` : '-'}
                        </TableCell>
                        <TableCell className="text-sm">{course.provider || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(course)}>
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(course.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No courses found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Course
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={editId ? 'Edit Course' : 'Add Course'}
            size="lg"
          >
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Course title"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  placeholder="Course description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Delivery</Label>
                  <Select
                    value={form.delivery}
                    onChange={(e) => setForm((p) => ({ ...p, delivery: e.target.value }))}
                  >
                    {DELIVERIES.map((d) => (
                      <option key={d} value={d}>
                        {d.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Duration (hours)</Label>
                  <Input
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
                    placeholder="e.g. 8"
                  />
                </div>
                <div>
                  <Label>Validity (months)</Label>
                  <Input
                    type="number"
                    value={form.validityMonths}
                    onChange={(e) => setForm((p) => ({ ...p, validityMonths: e.target.value }))}
                    placeholder="e.g. 12"
                  />
                </div>
                <div>
                  <Label>Cost</Label>
                  <Input
                    type="number"
                    value={form.cost}
                    onChange={(e) => setForm((p) => ({ ...p, cost: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Provider</Label>
                  <Input
                    value={form.provider}
                    onChange={(e) => setForm((p) => ({ ...p, provider: e.target.value }))}
                    placeholder="Training provider"
                  />
                </div>
                <div>
                  <Label>Max Participants</Label>
                  <Input
                    type="number"
                    value={form.maxParticipants}
                    onChange={(e) => setForm((p) => ({ ...p, maxParticipants: e.target.value }))}
                    placeholder="e.g. 20"
                  />
                </div>
              </div>
              <div>
                <Label>Prerequisites</Label>
                <Textarea
                  value={form.prerequisites}
                  onChange={(e) => setForm((p) => ({ ...p, prerequisites: e.target.value }))}
                  rows={2}
                  placeholder="Required prerequisites..."
                />
              </div>
              <div>
                <Label>Objectives</Label>
                <Textarea
                  value={form.objectives}
                  onChange={(e) => setForm((p) => ({ ...p, objectives: e.target.value }))}
                  rows={2}
                  placeholder="Learning objectives..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={saving || !form.title}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : editId ? (
                  'Update Course'
                ) : (
                  'Create Course'
                )}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
