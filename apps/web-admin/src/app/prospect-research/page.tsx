'use client';

import axios from 'axios';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';
import { Search, Copy, ExternalLink, Building2, Mail, Check, Loader2 } from 'lucide-react';

interface ResearchResult {
  id: string;
  companyName: string;
  website: string;
  linkedinUrl: string;
  industry: string;
  companiesHouseData: {
    registrationNumber?: string;
    incorporationDate?: string;
    companyStatus?: string;
    sicCodes?: string[];
    registeredAddress?: string;
    directors?: string[];
    annualRevenue?: string;
    employeeCount?: string;
  };
  generatedEmail: string;
  createdAt: string;
}

export default function ProspectResearchPage() {
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [industry, setIndustry] = useState('');
  const [sourceContext, setSourceContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [editedEmail, setEditedEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<ResearchResult[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/api/marketing/prospects/research');
      setHistory(response.data.data || []);
    } catch {
      // API may not exist yet
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const response = await api.post('/api/marketing/prospects/research', {
        companyName,
        website,
        linkedinUrl,
        industry,
        sourceContext,
      });
      const data = response.data.data;
      setResult(data);
      setEditedEmail(data.generatedEmail || '');
      fetchHistory();
    } catch (err) {
      setError((axios.isAxiosError(err) && err.response?.data?.message) || 'Research failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEmail = async () => {
    await navigator.clipboard.writeText(editedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToHubSpot = async () => {
    if (!result) return;
    try {
      await api.post('/api/marketing/prospects/hubspot', {
        prospectId: result.id,
        email: editedEmail,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setError('Failed to save to HubSpot');
    }
  };

  return (
    <div className="min-h-screen bg-[#080B12]">
      <Sidebar />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Prospect Research</h1>
          <p className="text-gray-400 dark:text-gray-500 mt-1">
            Research companies and generate personalized outreach emails
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Research Form */}
        <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-400" />
            Research a Prospect
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Company Name *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-[#080B12] border border-[#1B3A6B]/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="Acme Ltd"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Website URL</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#080B12] border border-[#1B3A6B]/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="https://acme.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">LinkedIn URL</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#080B12] border border-[#1B3A6B]/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="https://linkedin.com/company/acme"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Industry Sector
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#080B12] border border-[#1B3A6B]/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select industry...</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="construction">Construction</option>
                <option value="food-beverage">Food & Beverage</option>
                <option value="pharmaceutical">Pharmaceutical</option>
                <option value="automotive">Automotive</option>
                <option value="aerospace">Aerospace & Defence</option>
                <option value="energy">Energy & Utilities</option>
                <option value="healthcare">Healthcare</option>
                <option value="logistics">Logistics & Supply Chain</option>
                <option value="professional-services">Professional Services</option>
                <option value="technology">Technology</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Source Context
              </label>
              <textarea
                value={sourceContext}
                onChange={(e) => setSourceContext(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 bg-[#080B12] border border-[#1B3A6B]/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Where did you find this prospect? Any relevant context..."
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#1B3A6B] hover:bg-[#244d8a] text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Researching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Research Company
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Research Results */}
        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Companies House Data */}
            <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                Companies House Data
              </h3>
              <div className="space-y-3">
                <InfoRow label="Company" value={result.companyName} />
                <InfoRow
                  label="Registration No."
                  value={result.companiesHouseData?.registrationNumber}
                />
                <InfoRow label="Status" value={result.companiesHouseData?.companyStatus} />
                <InfoRow
                  label="Incorporated"
                  value={result.companiesHouseData?.incorporationDate}
                />
                <InfoRow label="Address" value={result.companiesHouseData?.registeredAddress} />
                <InfoRow
                  label="SIC Codes"
                  value={result.companiesHouseData?.sicCodes?.join(', ')}
                />
                <InfoRow
                  label="Directors"
                  value={result.companiesHouseData?.directors?.join(', ')}
                />
                <InfoRow label="Revenue" value={result.companiesHouseData?.annualRevenue} />
                <InfoRow label="Employees" value={result.companiesHouseData?.employeeCount} />
              </div>
              {result.website && (
                <a
                  href={result.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                >
                  <ExternalLink className="w-3 h-3" />
                  Visit website
                </a>
              )}
            </div>

            {/* Generated Email */}
            <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" />
                Generated Email
              </h3>
              <textarea
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 bg-[#080B12] border border-[#1B3A6B]/50 rounded-lg text-gray-200 font-mono text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleCopyEmail}
                  className="px-4 py-2 bg-[#1B3A6B] hover:bg-[#244d8a] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? 'Copied!' : 'Copy Email'}
                </button>
                <button
                  onClick={handleSaveToHubSpot}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {saveSuccess ? 'Saved!' : 'Save to HubSpot'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Research History */}
        <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Research History</h2>
          {historyLoading ? (
            <div className="text-gray-400 dark:text-gray-500 text-center py-8">Loading...</div>
          ) : history.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-center py-8">
              No research history yet. Start by researching a company above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1B3A6B]/30">
                    <th className="text-left py-3 px-4 text-gray-400 dark:text-gray-500 font-medium">
                      Company
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 dark:text-gray-500 font-medium">
                      Industry
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 dark:text-gray-500 font-medium">
                      Website
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 dark:text-gray-500 font-medium">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#1B3A6B]/10 hover:bg-[#1B3A6B]/10"
                    >
                      <td className="py-3 px-4 text-white">{item.companyName}</td>
                      <td className="py-3 px-4 text-gray-300">{item.industry || '-'}</td>
                      <td className="py-3 px-4">
                        {item.website ? (
                          <a
                            href={item.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            {new URL(item.website).hostname}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-400 dark:text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-gray-400 dark:text-gray-500 text-sm">{label}</span>
      <span className="text-white text-sm text-right ml-4">{value || '-'}</span>
    </div>
  );
}
