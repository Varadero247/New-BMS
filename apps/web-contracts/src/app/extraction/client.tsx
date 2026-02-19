'use client';

import { useState } from 'react';
import { Card, CardContent, Button, Badge, Label, Textarea } from '@ims/ui';
import { Sparkles, Loader2, FileText, Calendar, DollarSign, Tag } from 'lucide-react';
import { api } from '@/lib/api';

interface ExtractionResult {
  extracted: {
    parties: string[];
    dates: string[];
    values: string[];
    keyTerms: string[];
  };
  aiNote: string;
}

export default function ExtractionClient() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState('');

  async function handleAnalyze() {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await api.post('/extraction/analyze', { text });
      setResult(response.data.data);
    } catch (err) {
      setError((err as any).response?.data?.error?.message || 'Failed to analyze text');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">AI Extraction</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Extract key information from contract text using AI
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <Label className="text-base font-semibold">Contract Text</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Paste contract text below to extract parties, dates, values, and key terms
                </p>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={16}
                  placeholder="Paste your contract text here...

Example:
This Agreement is entered into on January 15, 2026 between Acme Corporation (the 'Vendor') and Global Industries Ltd. (the 'Client'). The total contract value is $250,000 USD, payable in quarterly installments. The term of this agreement shall be 24 months from the effective date. Either party may terminate with 90 days written notice..."
                  className="mt-2"
                />
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {text.length} characters
                  </span>
                  <Button
                    onClick={handleAnalyze}
                    disabled={loading || !text.trim()}
                    className="flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Analyze Text
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            {result ? (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-violet-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Parties</h3>
                    </div>
                    {result.extracted.parties.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {result.extracted.parties.map((p, i) => (
                          <Badge key={i} variant="outline" className="text-sm">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                        No parties detected
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Dates</h3>
                    </div>
                    {result.extracted.dates.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {result.extracted.dates.map((d, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-sm bg-blue-50 dark:bg-blue-900/20"
                          >
                            {d}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                        No dates detected
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Values</h3>
                    </div>
                    {result.extracted.values.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {result.extracted.values.map((v, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-sm bg-green-50 dark:bg-green-900/20"
                          >
                            {v}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                        No values detected
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Tag className="h-5 w-5 text-amber-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Key Terms</h3>
                    </div>
                    {result.extracted.keyTerms.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {result.extracted.keyTerms.map((t, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-sm bg-amber-50 dark:bg-amber-900/20"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                        No key terms detected
                      </p>
                    )}
                  </CardContent>
                </Card>

                {result.aiNote && (
                  <Card className="border-violet-200 dark:border-violet-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-violet-600" />
                        <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                          AI Note
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{result.aiNote}</p>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              !loading && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Sparkles className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Paste contract text and click "Analyze Text" to extract key information
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                      The AI will identify parties, dates, monetary values, and key terms
                    </p>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
