'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Modal, ModalFooter } from '@ims/ui';
import { Target, Edit } from 'lucide-react';
import { api } from '@/lib/api';

interface ScopeDocument {
  id: string;
  title: string;
  description: string;
  boundaries: string;
  exclusions: string;
  updatedAt: string;
  updatedBy: string;
}

export default function ScopePage() {
  const [scope, setScope] = useState<ScopeDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', boundaries: '', exclusions: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadScope();
  }, []);

  async function loadScope() {
    try {
      setError(null);
      const res = await api.get('/scope');
      setScope(res.data.data);
    } catch (err) {
      console.error('Error loading scope:', err);
      setError('Failed to load ISMS scope document.');
    } finally {
      setLoading(false);
    }
  }

  function openEditModal() {
    if (scope) {
      setForm({
        title: scope.title,
        description: scope.description,
        boundaries: scope.boundaries,
        exclusions: scope.exclusions,
      });
    }
    setEditModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (scope?.id) {
        await api.put(`/scope/${scope.id}`, form);
      } else {
        await api.post('/scope', form);
      }
      setEditModalOpen(false);
      loadScope();
    } catch (err) {
      console.error('Error saving scope:', err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ISMS Scope</h1>
            <p className="text-gray-500 mt-1">Information Security Management System scope definition</p>
          </div>
          <Button onClick={openEditModal} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700">
            <Edit className="h-4 w-4" /> Edit Scope
          </Button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

        {scope ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{scope.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{scope.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Boundaries</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{scope.boundaries}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exclusions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{scope.exclusions}</p>
              </CardContent>
            </Card>

            <div className="text-sm text-gray-400">
              Last updated: {new Date(scope.updatedAt).toLocaleDateString()} by {scope.updatedBy}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No scope document defined yet</p>
                <Button onClick={openEditModal} className="mt-4 bg-teal-600 hover:bg-teal-700">
                  Define Scope
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit ISMS Scope" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="ISMS Scope Document"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Describe the scope of the ISMS..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Boundaries</label>
            <textarea
              value={form.boundaries}
              onChange={(e) => setForm({ ...form, boundaries: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Define the boundaries of the ISMS..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exclusions</label>
            <textarea
              value={form.exclusions}
              onChange={(e) => setForm({ ...form, exclusions: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="List any exclusions..."
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
            {saving ? 'Saving...' : 'Save Scope'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
