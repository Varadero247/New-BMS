'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface CollateralItem {
  id: string;
  title: string;
  description: string | null;
  type: string;
  accessTier: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  downloadCount: number;
  createdAt: string;
}

const typeIcons: Record<string, string> = {
  CASE_STUDY: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  WHITEPAPER: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  BROCHURE: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2',
  PRESENTATION: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z',
  VIDEO: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  EMAIL_TEMPLATE: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  SOCIAL_KIT: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
};

const typeLabels: Record<string, string> = {
  CASE_STUDY: 'Case Study',
  WHITEPAPER: 'Whitepaper',
  BROCHURE: 'Brochure',
  PRESENTATION: 'Presentation',
  VIDEO: 'Video',
  EMAIL_TEMPLATE: 'Email Template',
  SOCIAL_KIT: 'Social Kit',
};

export default function CollateralPage() {
  const router = useRouter();
  const [items, setItems] = useState<CollateralItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('partner_token');
    if (!token) { router.push('/login'); return; }
    fetchCollateral();
  }, []);

  const fetchCollateral = async () => {
    setError('');
    try {
      const res = await api.get('/api/collateral');
      setItems(res.data.data || []);
    } catch (err) {
      console.error('Failed to load collateral', err);
      setError('Failed to load collateral. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (item: CollateralItem) => {
    try {
      const res = await api.get(`/api/collateral/${item.id}/download`);
      window.open(res.data.data.fileUrl, '_blank');
      fetchCollateral();
    } catch (err) {
      console.error('Failed to download collateral', err);
      setError('Failed to download file. Please try again.');
    }
  };

  const filteredItems = filter ? items.filter((i) => i.type === filter) : items;
  const types = [...new Set(items.map((i) => i.type))];

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-8">Co-Marketing Collateral</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between">
              <p className="text-sm text-red-400">{error}</p>
              <button onClick={() => setError('')} className="text-red-500 hover:text-red-300 ml-4 text-sm">Dismiss</button>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setFilter('')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                !filter ? 'bg-[#1B3A6B] text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === t ? 'bg-[#1B3A6B] text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {typeLabels[t] || t}
              </button>
            ))}
          </div>

          {/* Collateral Grid */}
          {filteredItems.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-gray-500">
              No collateral available{filter ? ` for ${typeLabels[filter] || filter}` : ''}.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-gray-800 rounded-lg shrink-0">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d={typeIcons[item.type] || typeIcons.CASE_STUDY} />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white text-sm truncate">{item.title}</h3>
                      <span className="text-xs text-gray-500">{typeLabels[item.type] || item.type}</span>
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">{item.description}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-800">
                    <span className="text-xs text-gray-500">{item.downloadCount} downloads</span>
                    <button
                      onClick={() => handleDownload(item)}
                      className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
