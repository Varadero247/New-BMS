'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@ims/ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type ChangelogCategory = 'new_feature' | 'improvement' | 'bug_fix' | 'security';

interface ChangelogEntry {
  id: string;
  title: string;
  description: string;
  category: ChangelogCategory;
  modules: string[];
  publishedAt: string;
  isPublished: boolean;
}

const categoryLabels: Record<ChangelogCategory, { label: string; className: string }> = {
  new_feature: { label: 'New Feature', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  improvement: { label: 'Improvement', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  bug_fix: { label: 'Bug Fix', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  security: { label: 'Security', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export default function ChangelogPage() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ChangelogCategory>('new_feature');
  const [modules, setModules] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchEntries = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/changelog/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setEntries(json.data.entries);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/changelog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          modules: modules.split(',').map((m) => m.trim()).filter(Boolean),
          isPublished,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setTitle('');
        setDescription('');
        setCategory('new_feature');
        setModules('');
        setIsPublished(true);
        setShowForm(false);
        fetchEntries();
      }
    } catch {
      // silent fail
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Changelog Management"
        description="Create and manage platform changelog entries visible to all users."
        actions={
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
          >
            {showForm ? 'Cancel' : 'New Entry'}
          </button>
        }
      />

      {/* Create form */}
      {showForm && (
        <div className="mt-6 bg-card border border-border rounded-xl p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Create Changelog Entry</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. New Risk Matrix Visualisation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                maxLength={2000}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Describe the change in detail..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ChangelogCategory)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="new_feature">New Feature</option>
                  <option value="improvement">Improvement</option>
                  <option value="bug_fix">Bug Fix</option>
                  <option value="security">Security</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Modules (comma-separated)</label>
                <input
                  type="text"
                  value={modules}
                  onChange={(e) => setModules(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g. Quality, H&S, Platform"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-600"
                id="isPublished"
              />
              <label htmlFor="isPublished" className="text-sm text-foreground">Publish immediately</label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !title.trim() || !description.trim()}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating...' : 'Create Entry'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Entries list */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Loading changelog entries...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No changelog entries yet. Create one above.</div>
        ) : (
          entries.map((entry) => {
            const chip = categoryLabels[entry.category];
            return (
              <div key={entry.id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded ${chip.className}`}>
                      {chip.label}
                    </span>
                    {!entry.isPublished && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        Draft
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.publishedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-foreground">{entry.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{entry.description}</p>
                {entry.modules.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {entry.modules.map((mod) => (
                      <span key={mod} className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground">
                        {mod}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
