'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@ims/ui';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

const LIKELIHOODS = ['ALMOST_CERTAIN', 'LIKELY', 'POSSIBLE', 'UNLIKELY', 'RARE'];
const CONSEQUENCES = ['INSIGNIFICANT', 'MINOR', 'MODERATE', 'MAJOR', 'CATASTROPHIC'];
const L_SCORES: Record<string, number> = {
  RARE: 1,
  UNLIKELY: 2,
  POSSIBLE: 3,
  LIKELY: 4,
  ALMOST_CERTAIN: 5,
};
const C_SCORES: Record<string, number> = {
  INSIGNIFICANT: 1,
  MINOR: 2,
  MODERATE: 3,
  MAJOR: 4,
  CATASTROPHIC: 5,
};

function getCellColor(l: number, c: number) {
  const score = l * c;
  if (score >= 15) return 'bg-red-500 text-white';
  if (score >= 10) return 'bg-orange-400 text-white';
  if (score >= 5) return 'bg-yellow-400 text-gray-900';
  return 'bg-green-400 text-white';
}

interface RiskPoint {
  id: string;
  title: string;
  likelihood: string;
  consequence: string;
  inherentScore: number;
}

export default function HeatMapPage() {
  const [risks, setRisks] = useState<RiskPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/heat-map');
        setRisks(r.data.data?.risks || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function getRisksInCell(likelihood: string, consequence: string) {
    return risks.filter((r) => r.likelihood === likelihood && r.consequence === consequence);
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Risk Heat Map</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              5x5 likelihood vs consequence matrix
            </p>
          </div>

          {loading ? (
            <div className="animate-pulse h-96 bg-gray-200 dark:bg-gray-700 rounded" />
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="flex">
                  <div
                    className="flex flex-col justify-around pr-3 text-xs text-gray-500 dark:text-gray-400 font-medium"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                  >
                    LIKELIHOOD
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-6 gap-1">
                      <div />
                      {CONSEQUENCES.map((c) => (
                        <div
                          key={c}
                          className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 pb-2"
                        >
                          {c.replace(/_/g, ' ')}
                        </div>
                      ))}
                      {LIKELIHOODS.map((l) => (
                        <>
                          <div
                            key={`label-${l}`}
                            className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 pr-2 justify-end"
                          >
                            {l.replace(/_/g, ' ')}
                          </div>
                          {CONSEQUENCES.map((c) => {
                            const cellRisks = getRisksInCell(l, c);
                            const lScore = L_SCORES[l];
                            const cScore = C_SCORES[c];
                            return (
                              <div
                                key={`${l}-${c}`}
                                className={`${getCellColor(lScore, cScore)} rounded-lg p-2 min-h-[60px] flex flex-col items-center justify-center text-center relative`}
                                role="button"
                                tabIndex={0}
                                aria-label={`${l.replace(/_/g, ' ')} likelihood x ${c.replace(/_/g, ' ')} consequence - Risk score ${lScore * cScore}${cellRisks.length > 0 ? ` - ${cellRisks.length} risk${cellRisks.length > 1 ? 's' : ''}` : ''}`}
                                title={cellRisks.map((r) => r.title).join(', ')}
                              >
                                <span className="text-xs font-bold">{lScore * cScore}</span>
                                {cellRisks.length > 0 && (
                                  <span className="absolute top-1 right-1 bg-white text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow">
                                    {cellRisks.length}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </>
                      ))}
                    </div>
                    <div className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 mt-2">
                      CONSEQUENCE
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-4 justify-center text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-green-400 rounded" /> Low (1-4)
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-yellow-400 rounded" /> Medium (5-9)
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-orange-400 rounded" /> High (10-14)
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-red-500 rounded" /> Critical (15-25)
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Risks on Map: {risks.length}
                  </p>
                  {risks.length > 0 && (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {risks.map((r) => (
                        <div key={r.id} className="flex items-center gap-2 text-sm">
                          <span
                            className={`w-3 h-3 rounded-full ${r.inherentScore >= 15 ? 'bg-red-500' : r.inherentScore >= 10 ? 'bg-orange-400' : r.inherentScore >= 5 ? 'bg-yellow-400' : 'bg-green-400'}`}
                          />
                          <span className="text-gray-700 dark:text-gray-300">{r.title}</span>
                          <span className="text-gray-400 text-xs">
                            ({r.likelihood?.replace(/_/g, ' ')} /{' '}
                            {r.consequence?.replace(/_/g, ' ')} = {r.inherentScore})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
