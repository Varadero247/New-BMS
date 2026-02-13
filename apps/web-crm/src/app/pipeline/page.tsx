'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@ims/ui';
import { Kanban, DollarSign, ChevronRight, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

interface DealCard {
  id: string;
  title: string;
  value: number;
  accountName?: string;
  probability: number;
  stage: string;
  expectedCloseDate?: string;
}

interface BoardColumn {
  stage: string;
  label: string;
  deals: DealCard[];
  color: string;
}

const STAGES = [
  { key: 'PROSPECTING', label: 'Prospecting', color: 'bg-gray-100 border-gray-300' },
  { key: 'QUALIFICATION', label: 'Qualification', color: 'bg-blue-50 border-blue-300' },
  { key: 'PROPOSAL', label: 'Proposal', color: 'bg-violet-50 border-violet-300' },
  { key: 'NEGOTIATION', label: 'Negotiation', color: 'bg-amber-50 border-amber-300' },
  { key: 'CLOSED_WON', label: 'Closed Won', color: 'bg-green-50 border-green-300' },
  { key: 'CLOSED_LOST', label: 'Closed Lost', color: 'bg-red-50 border-red-300' },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PipelinePage() {
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBoard();
  }, []);

  async function loadBoard() {
    try {
      setError(null);
      const res = await api.get('/deals/board');
      const boardData = res.data.data;

      if (Array.isArray(boardData)) {
        setColumns(boardData);
      } else {
        // Build columns from deals list
        const deals: DealCard[] = Array.isArray(boardData?.deals) ? boardData.deals : [];
        const built = STAGES.map(s => ({
          stage: s.key,
          label: s.label,
          color: s.color,
          deals: deals.filter((d: DealCard) => d.stage === s.key),
        }));
        setColumns(built);
      }
    } catch (err) {
      console.error('Error loading pipeline board:', err);
      setError('Failed to load pipeline data.');
      setColumns(STAGES.map(s => ({ stage: s.key, label: s.label, color: s.color, deals: [] })));
    } finally {
      setLoading(false);
    }
  }

  async function moveDeal(dealId: string, newStage: string) {
    try {
      await api.patch(`/deals/${dealId}/stage`, { stage: newStage });
      loadBoard();
    } catch (err) {
      console.error('Error moving deal:', err);
    }
  }

  function getNextStage(currentStage: string): string | null {
    const stageKeys = STAGES.map(s => s.key);
    const idx = stageKeys.indexOf(currentStage);
    if (idx < stageKeys.length - 1) return stageKeys[idx + 1];
    return null;
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-96 w-64 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pipeline</h1>
            <p className="text-gray-500 mt-1">Visual deal pipeline - click arrows to advance deals</p>
          </div>
          <Button variant="outline" onClick={loadBoard} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        <div className="flex gap-4 overflow-x-auto pb-4">
          {(columns.length > 0 ? columns : STAGES.map(s => ({ stage: s.key, label: s.label, color: s.color, deals: [] }))).map((col) => {
            const stageInfo = STAGES.find(s => s.key === col.stage);
            const totalValue = col.deals.reduce((sum, d) => sum + (d.value || 0), 0);

            return (
              <div key={col.stage} className={`min-w-[280px] w-72 rounded-lg border-2 ${stageInfo?.color || 'bg-gray-50 border-gray-200'}`}>
                <div className="p-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{col.label || stageInfo?.label}</h3>
                    <Badge className="bg-violet-100 text-violet-700">{col.deals.length}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{formatCurrency(totalValue)}</p>
                </div>

                <div className="p-2 space-y-2 max-h-[60vh] overflow-y-auto">
                  {col.deals.map((deal) => {
                    const nextStage = getNextStage(deal.stage);
                    return (
                      <Card key={deal.id} className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 text-sm">{deal.title}</h4>
                            {nextStage && (
                              <button
                                onClick={() => moveDeal(deal.id, nextStage)}
                                className="text-violet-500 hover:text-violet-700 p-1"
                                title={`Move to ${STAGES.find(s => s.key === nextStage)?.label}`}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                            <DollarSign className="h-3 w-3" />
                            <span className="font-medium text-gray-900">{formatCurrency(deal.value || 0)}</span>
                          </div>
                          {deal.accountName && (
                            <p className="text-xs text-gray-500">{deal.accountName}</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">
                              {deal.probability}% probability
                            </span>
                            {deal.expectedCloseDate && (
                              <span className="text-xs text-gray-400">
                                {new Date(deal.expectedCloseDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {col.deals.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No deals
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
