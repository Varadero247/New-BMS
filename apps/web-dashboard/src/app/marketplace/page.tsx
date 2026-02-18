'use client';

import { useEffect, useState } from 'react';
import { Search, Download, Star, CheckCircle, Package, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Plugin {
  id: string;
  name: string;
  slug: string;
  description: string;
  author: string;
  authorEmail: string;
  category: string;
  iconUrl: string | null;
  status: string;
  rating: number;
  downloadCount: number;
  isPublic: boolean;
  installed?: boolean;
}

const CATEGORIES = [
  'All',
  'Integration',
  'Reporting',
  'Automation',
  'Compliance',
  'Analytics',
  'Communication',
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  Integration: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
  Reporting: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
  Automation: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
  Compliance: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
  Analytics: 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300',
  Communication: 'bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i <= Math.round(rating)
              ? 'text-yellow-500 fill-yellow-500'
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function MarketplacePage() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [installingId, setInstallingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/marketplace/plugins');
        setPlugins(res.data.data || []);
      } catch {
        setError('Failed to load plugins. Please try again later.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleInstall(pluginId: string) {
    setInstallingId(pluginId);
    try {
      await api.post(`/marketplace/plugins/${pluginId}/install`);
      setPlugins((prev) =>
        prev.map((p) =>
          p.id === pluginId ? { ...p, installed: true, downloadCount: p.downloadCount + 1 } : p
        )
      );
    } catch {
      setError('Installation failed. Please try again.');
    } finally {
      setInstallingId(null);
    }
  }

  const filtered = plugins.filter((p) => {
    const matchSearch =
      searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchSearch && matchCategory;
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6 max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 bg-gray-200 dark:bg-gray-700 rounded-lg" />
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Marketplace</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Discover and install plugins to extend your IMS platform
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <label htmlFor="marketplace-search" className="sr-only">
            Search plugins
          </label>
          <Search
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500"
            aria-hidden="true"
          />
          <input
            id="marketplace-search"
            type="text"
            placeholder="Search plugins by name, description, or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Plugin grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No plugins found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((plugin) => (
              <div
                key={plugin.id}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 hover:shadow-md transition-shadow"
              >
                {/* Top row: icon + category */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {plugin.iconUrl ? (
                      <img
                        src={plugin.iconUrl}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                        <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight">
                        {plugin.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">by {plugin.author}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      CATEGORY_COLORS[plugin.category] ||
                      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {plugin.category}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                  {plugin.description}
                </p>

                {/* Rating + downloads */}
                <div className="flex items-center justify-between mb-4">
                  <StarRating rating={plugin.rating} />
                  <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    {plugin.downloadCount.toLocaleString()}
                  </span>
                </div>

                {/* Status badge + install button */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      plugin.status === 'PUBLISHED'
                        ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                        : plugin.status === 'BETA'
                          ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {plugin.status}
                  </span>

                  {plugin.installed ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                      <CheckCircle className="h-3.5 w-3.5" /> Installed
                    </span>
                  ) : (
                    <button
                      onClick={() => handleInstall(plugin.id)}
                      disabled={installingId === plugin.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {installingId === plugin.id ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" /> Installing...
                        </>
                      ) : (
                        <>
                          <Download className="h-3 w-3" /> Install
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
