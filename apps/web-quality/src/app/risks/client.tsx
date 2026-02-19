'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Modal,
  ModalFooter,
  Input,
  Label,
  Select,
  Textarea,
} from '@ims/ui';
import {
  Plus,
  Users,
  AlertTriangle,
  Lightbulb,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2,
  Shield,
  FileWarning,
  TrendingUp,
} from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InterestedParty {
  id: string;
  partyName: string;
  partyType: string;
  reasonForInclusion: string;
  needsExpectations: string;
  communicationMethod: string;
  reviewFrequency: string;
  createdAt: string;
}

interface Issue {
  id: string;
  partyId: string;
  partyName?: string;
  issueOfConcern: string;
  bias: string;
  processesAffected: string;
  priority: string;
  treatmentMethod: string;
  recordReference: string;
  createdAt: string;
}

interface Risk {
  id: string;
  process: string;
  riskDescription: string;
  likelihood: number;
  previousOccurrences: string;
  lossOfContracts: number;
  harmToUser: number;
  unableToMeetTerms: number;
  violationOfRegulations: number;
  reputationImpact: number;
  costOfCorrection: number;
  riskFactor: number;
  riskLevel: string;
  treatmentOption: string;
  treatmentActions: string;
  responsiblePerson: string;
  dueDate: string;
  reviewDate: string;
  status: string;
  createdAt: string;
}

interface Opportunity {
  id: string;
  process: string;
  interestedParties: string;
  opportunityDescription: string;
  likelihood: number;
  benefitToCustomer: number;
  revenueGrowth: number;
  marketExpansion: number;
  processImprovement: number;
  complianceAdvantage: number;
  reputationGain: number;
  opportunityScore: number;
  actionToExploit: string;
  responsiblePerson: string;
  targetDate: string;
  status: string;
  createdAt: string;
}

type TabKey = 'parties' | 'issues' | 'risks' | 'opportunities';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PARTY_TYPES = ['INTERNAL', 'EXTERNAL'] as const;
const REVIEW_FREQUENCIES = ['MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL', 'BIENNIAL'] as const;
const COMMUNICATION_METHODS = ['EMAIL', 'MEETING', 'REPORT', 'PORTAL', 'PHONE', 'LETTER'] as const;

const BIAS_OPTIONS = ['RISK', 'OPPORTUNITY', 'MIXED'] as const;
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

const LIKELIHOOD_LABELS: Record<number, string> = {
  1: 'Improbable',
  2: 'Remote',
  3: 'Occasional',
  4: 'Probable',
  5: 'Frequent',
  6: 'Inevitable',
};

const CONSEQUENCE_LABELS: Record<number, string> = {
  0: 'None',
  1: 'Negligible',
  2: 'Marginal',
  3: 'Moderate',
  4: 'Critical',
  5: 'Catastrophic',
};

const TREATMENT_OPTIONS = ['AVOID', 'REDUCE', 'TRANSFER', 'ACCEPT', 'EXPLOIT', 'SHARE'] as const;

const RISK_STATUSES = ['OPEN', 'IN_PROGRESS', 'MITIGATED', 'CLOSED', 'ACCEPTED'] as const;
const OPPORTUNITY_STATUSES = [
  'IDENTIFIED',
  'EVALUATING',
  'PURSUING',
  'REALIZED',
  'CLOSED',
] as const;

const PROCESS_OPTIONS = [
  'Leadership & Planning',
  'Customer Requirements',
  'Design & Development',
  'Procurement',
  'Production / Service Delivery',
  'Monitoring & Measurement',
  'Internal Audit',
  'Management Review',
  'Document Control',
  'Human Resources',
  'Infrastructure',
  'Continual Improvement',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRiskFactorColor(factor: number): string {
  if (factor <= 6) return 'bg-green-100 text-green-800 border-green-300';
  if (factor <= 14) return 'bg-amber-100 text-amber-800 border-amber-300';
  if (factor <= 24) return 'bg-red-100 text-red-800 border-red-300';
  return 'bg-red-200 text-red-900 border-red-500';
}

function getRiskLevel(factor: number): string {
  if (factor <= 6) return 'LOW';
  if (factor <= 14) return 'MEDIUM';
  if (factor <= 24) return 'HIGH';
  return 'EXTREME';
}

function getRiskFactorBadgeVariant(
  factor: number
): 'success' | 'warning' | 'danger' | 'destructive' {
  if (factor <= 6) return 'success';
  if (factor <= 14) return 'warning';
  if (factor <= 24) return 'danger';
  return 'destructive';
}

function getBiasVariant(bias: string): 'danger' | 'success' | 'warning' {
  if (bias === 'RISK') return 'danger';
  if (bias === 'OPPORTUNITY') return 'success';
  return 'warning';
}

function getPriorityVariant(priority: string): 'success' | 'info' | 'warning' | 'destructive' {
  if (priority === 'LOW') return 'success';
  if (priority === 'MEDIUM') return 'info';
  if (priority === 'HIGH') return 'warning';
  return 'destructive';
}

function getOpportunityScoreVariant(score: number): 'success' | 'info' | 'warning' {
  if (score >= 20) return 'success';
  if (score >= 10) return 'info';
  return 'warning';
}

function calculateRiskFactor(likelihood: number, consequences: number[]): number {
  const maxConsequence = Math.max(...consequences, 0);
  return likelihood * maxConsequence;
}

function calculateOpportunityScore(likelihood: number, benefits: number[]): number {
  const maxBenefit = Math.max(...benefits, 0);
  return likelihood * maxBenefit;
}

// ---------------------------------------------------------------------------
// Empty form states
// ---------------------------------------------------------------------------

const emptyPartyForm = {
  partyName: '',
  partyType: 'INTERNAL' as string,
  reasonForInclusion: '',
  needsExpectations: '',
  communicationMethod: 'EMAIL' as string,
  reviewFrequency: 'ANNUAL' as string,
};

const emptyIssueForm = {
  partyId: '',
  issueOfConcern: '',
  bias: 'RISK' as string,
  processesAffected: '',
  priority: 'MEDIUM' as string,
  treatmentMethod: '',
  recordReference: '',
};

const emptyRiskForm = {
  process: '',
  riskDescription: '',
  likelihood: 3,
  previousOccurrences: '',
  lossOfContracts: 0,
  harmToUser: 0,
  unableToMeetTerms: 0,
  violationOfRegulations: 0,
  reputationImpact: 0,
  costOfCorrection: 0,
  treatmentOption: 'REDUCE' as string,
  treatmentActions: '',
  responsiblePerson: '',
  dueDate: '',
  reviewDate: '',
  status: 'OPEN' as string,
};

const emptyOpportunityForm = {
  process: '',
  interestedParties: '',
  opportunityDescription: '',
  likelihood: 3,
  benefitToCustomer: 0,
  revenueGrowth: 0,
  marketExpansion: 0,
  processImprovement: 0,
  complianceAdvantage: 0,
  reputationGain: 0,
  actionToExploit: '',
  responsiblePerson: '',
  targetDate: '',
  status: 'IDENTIFIED' as string,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RisksClient() {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabKey>('parties');

  // Data states
  const [parties, setParties] = useState<InterestedParty[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  // Loading
  const [loadingParties, setLoadingParties] = useState(true);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [loadingRisks, setLoadingRisks] = useState(true);
  const [loadingOpportunities, setLoadingOpportunities] = useState(true);

  // Modals
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);

  // Forms
  const [partyForm, setPartyForm] = useState(emptyPartyForm);
  const [issueForm, setIssueForm] = useState(emptyIssueForm);
  const [riskForm, setRiskForm] = useState(emptyRiskForm);
  const [opportunityForm, setOpportunityForm] = useState(emptyOpportunityForm);

  // Submitting
  const [submittingParty, setSubmittingParty] = useState(false);
  const [submittingIssue, setSubmittingIssue] = useState(false);
  const [submittingRisk, setSubmittingRisk] = useState(false);
  const [submittingOpportunity, setSubmittingOpportunity] = useState(false);

  // Filters
  const [partySearch, setPartySearch] = useState('');
  const [partyTypeFilter, setPartyTypeFilter] = useState('all');
  const [issueSearch, setIssueSearch] = useState('');
  const [issueBiasFilter, setIssueBiasFilter] = useState('all');
  const [issuePriorityFilter, setIssuePriorityFilter] = useState('all');
  const [riskSearch, setRiskSearch] = useState('');
  const [riskStatusFilter, setRiskStatusFilter] = useState('all');
  const [opportunitySearch, setOpportunitySearch] = useState('');
  const [opportunityStatusFilter, setOpportunityStatusFilter] = useState('all');

  // AI Analysis
  const [riskAiExpanded, setRiskAiExpanded] = useState(false);
  const [riskAiLoading, setRiskAiLoading] = useState(false);
  const [riskAiAnalysis, setRiskAiAnalysis] = useState('');
  const [opportunityAiExpanded, setOpportunityAiExpanded] = useState(false);
  const [opportunityAiLoading, setOpportunityAiLoading] = useState(false);
  const [opportunityAiAnalysis, setOpportunityAiAnalysis] = useState('');

  // Error
  const [error, setError] = useState('');

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------

  const fetchParties = useCallback(async () => {
    setLoadingParties(true);
    try {
      const response = await api.get('/parties');
      setParties(response.data.data || []);
    } catch (err) {
      console.error('Failed to load interested parties:', err);
    } finally {
      setLoadingParties(false);
    }
  }, []);

  const fetchIssues = useCallback(async () => {
    setLoadingIssues(true);
    try {
      const response = await api.get('/issues');
      setIssues(response.data.data || []);
    } catch (err) {
      console.error('Failed to load issues:', err);
    } finally {
      setLoadingIssues(false);
    }
  }, []);

  const fetchRisks = useCallback(async () => {
    setLoadingRisks(true);
    try {
      const response = await api.get('/risks');
      setRisks(response.data.data || []);
    } catch (err) {
      console.error('Failed to load risks:', err);
    } finally {
      setLoadingRisks(false);
    }
  }, []);

  const fetchOpportunities = useCallback(async () => {
    setLoadingOpportunities(true);
    try {
      const response = await api.get('/opportunities');
      setOpportunities(response.data.data || []);
    } catch (err) {
      console.error('Failed to load opportunities:', err);
    } finally {
      setLoadingOpportunities(false);
    }
  }, []);

  useEffect(() => {
    fetchParties();
    fetchIssues();
    fetchRisks();
    fetchOpportunities();
  }, [fetchParties, fetchIssues, fetchRisks, fetchOpportunities]);

  // ---------------------------------------------------------------------------
  // Submit handlers
  // ---------------------------------------------------------------------------

  const handleSubmitParty = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmittingParty(true);
      setError('');
      try {
        await api.post('/parties', partyForm);
        setShowPartyModal(false);
        setPartyForm(emptyPartyForm);
        fetchParties();
      } catch (err) {
        setError((err as any).response?.data?.message || 'Failed to create interested party');
        console.error('Failed to create party:', err);
      } finally {
        setSubmittingParty(false);
      }
    },
    [partyForm, fetchParties]
  );

  const handleSubmitIssue = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmittingIssue(true);
      setError('');
      try {
        await api.post('/issues', issueForm);
        setShowIssueModal(false);
        setIssueForm(emptyIssueForm);
        fetchIssues();
      } catch (err) {
        setError((err as any).response?.data?.message || 'Failed to create issue');
        console.error('Failed to create issue:', err);
      } finally {
        setSubmittingIssue(false);
      }
    },
    [issueForm, fetchIssues]
  );

  const handleSubmitRisk = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmittingRisk(true);
      setError('');
      try {
        const consequences = [
          riskForm.lossOfContracts,
          riskForm.harmToUser,
          riskForm.unableToMeetTerms,
          riskForm.violationOfRegulations,
          riskForm.reputationImpact,
          riskForm.costOfCorrection,
        ];
        const riskFactor = calculateRiskFactor(riskForm.likelihood, consequences);
        const riskLevel = getRiskLevel(riskFactor);

        await api.post('/risks', {
          ...riskForm,
          riskFactor,
          riskLevel,
          dueDate: riskForm.dueDate || undefined,
          reviewDate: riskForm.reviewDate || undefined,
        });
        setShowRiskModal(false);
        setRiskForm(emptyRiskForm);
        setRiskAiAnalysis('');
        setRiskAiExpanded(false);
        fetchRisks();
      } catch (err) {
        setError((err as any).response?.data?.message || 'Failed to create risk');
        console.error('Failed to create risk:', err);
      } finally {
        setSubmittingRisk(false);
      }
    },
    [riskForm, fetchRisks]
  );

  const handleSubmitOpportunity = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmittingOpportunity(true);
      setError('');
      try {
        const benefits = [
          opportunityForm.benefitToCustomer,
          opportunityForm.revenueGrowth,
          opportunityForm.marketExpansion,
          opportunityForm.processImprovement,
          opportunityForm.complianceAdvantage,
          opportunityForm.reputationGain,
        ];
        const opportunityScore = calculateOpportunityScore(opportunityForm.likelihood, benefits);

        await api.post('/opportunities', {
          ...opportunityForm,
          opportunityScore,
          targetDate: opportunityForm.targetDate || undefined,
        });
        setShowOpportunityModal(false);
        setOpportunityForm(emptyOpportunityForm);
        setOpportunityAiAnalysis('');
        setOpportunityAiExpanded(false);
        fetchOpportunities();
      } catch (err) {
        setError((err as any).response?.data?.message || 'Failed to create opportunity');
        console.error('Failed to create opportunity:', err);
      } finally {
        setSubmittingOpportunity(false);
      }
    },
    [opportunityForm, fetchOpportunities]
  );

  // ---------------------------------------------------------------------------
  // AI analysis handlers
  // ---------------------------------------------------------------------------

  const handleRiskAiAnalysis = useCallback(async () => {
    setRiskAiLoading(true);
    try {
      const response = await api.post('/ai/analyze-risk', {
        process: riskForm.process,
        riskDescription: riskForm.riskDescription,
        likelihood: riskForm.likelihood,
        consequences: {
          lossOfContracts: riskForm.lossOfContracts,
          harmToUser: riskForm.harmToUser,
          unableToMeetTerms: riskForm.unableToMeetTerms,
          violationOfRegulations: riskForm.violationOfRegulations,
          reputationImpact: riskForm.reputationImpact,
          costOfCorrection: riskForm.costOfCorrection,
        },
      });
      setRiskAiAnalysis(response.data.data?.analysis || 'No analysis available.');
    } catch (err) {
      setRiskAiAnalysis('AI analysis is currently unavailable. Please try again later.');
      console.error('AI analysis failed:', err);
    } finally {
      setRiskAiLoading(false);
    }
  }, [riskForm]);

  const handleOpportunityAiAnalysis = useCallback(async () => {
    setOpportunityAiLoading(true);
    try {
      const response = await api.post('/ai/analyze-opportunity', {
        process: opportunityForm.process,
        opportunityDescription: opportunityForm.opportunityDescription,
        likelihood: opportunityForm.likelihood,
        benefits: {
          benefitToCustomer: opportunityForm.benefitToCustomer,
          revenueGrowth: opportunityForm.revenueGrowth,
          marketExpansion: opportunityForm.marketExpansion,
          processImprovement: opportunityForm.processImprovement,
          complianceAdvantage: opportunityForm.complianceAdvantage,
          reputationGain: opportunityForm.reputationGain,
        },
      });
      setOpportunityAiAnalysis(response.data.data?.analysis || 'No analysis available.');
    } catch (err) {
      setOpportunityAiAnalysis('AI analysis is currently unavailable. Please try again later.');
      console.error('AI analysis failed:', err);
    } finally {
      setOpportunityAiLoading(false);
    }
  }, [opportunityForm]);

  // ---------------------------------------------------------------------------
  // Computed risk factor for real-time display
  // ---------------------------------------------------------------------------

  const computedRiskFactor = useMemo(() => {
    const consequences = [
      riskForm.lossOfContracts,
      riskForm.harmToUser,
      riskForm.unableToMeetTerms,
      riskForm.violationOfRegulations,
      riskForm.reputationImpact,
      riskForm.costOfCorrection,
    ];
    return calculateRiskFactor(riskForm.likelihood, consequences);
  }, [
    riskForm.likelihood,
    riskForm.lossOfContracts,
    riskForm.harmToUser,
    riskForm.unableToMeetTerms,
    riskForm.violationOfRegulations,
    riskForm.reputationImpact,
    riskForm.costOfCorrection,
  ]);

  const computedRiskLevel = useMemo(() => getRiskLevel(computedRiskFactor), [computedRiskFactor]);

  const computedOpportunityScore = useMemo(() => {
    const benefits = [
      opportunityForm.benefitToCustomer,
      opportunityForm.revenueGrowth,
      opportunityForm.marketExpansion,
      opportunityForm.processImprovement,
      opportunityForm.complianceAdvantage,
      opportunityForm.reputationGain,
    ];
    return calculateOpportunityScore(opportunityForm.likelihood, benefits);
  }, [
    opportunityForm.likelihood,
    opportunityForm.benefitToCustomer,
    opportunityForm.revenueGrowth,
    opportunityForm.marketExpansion,
    opportunityForm.processImprovement,
    opportunityForm.complianceAdvantage,
    opportunityForm.reputationGain,
  ]);

  // ---------------------------------------------------------------------------
  // Filtered data
  // ---------------------------------------------------------------------------

  const filteredParties = useMemo(
    () =>
      parties.filter((p) => {
        if (partyTypeFilter !== 'all' && p.partyType !== partyTypeFilter) return false;
        if (partySearch && !p.partyName.toLowerCase().includes(partySearch.toLowerCase()))
          return false;
        return true;
      }),
    [parties, partyTypeFilter, partySearch]
  );

  const filteredIssues = useMemo(
    () =>
      issues.filter((i) => {
        if (issueBiasFilter !== 'all' && i.bias !== issueBiasFilter) return false;
        if (issuePriorityFilter !== 'all' && i.priority !== issuePriorityFilter) return false;
        if (issueSearch && !i.issueOfConcern.toLowerCase().includes(issueSearch.toLowerCase()))
          return false;
        return true;
      }),
    [issues, issueBiasFilter, issuePriorityFilter, issueSearch]
  );

  const filteredRisks = useMemo(
    () =>
      risks.filter((r) => {
        if (riskStatusFilter !== 'all' && r.status !== riskStatusFilter) return false;
        if (
          riskSearch &&
          !r.riskDescription.toLowerCase().includes(riskSearch.toLowerCase()) &&
          !r.process.toLowerCase().includes(riskSearch.toLowerCase())
        )
          return false;
        return true;
      }),
    [risks, riskStatusFilter, riskSearch]
  );

  const filteredOpportunities = useMemo(
    () =>
      opportunities.filter((o) => {
        if (opportunityStatusFilter !== 'all' && o.status !== opportunityStatusFilter) return false;
        if (
          opportunitySearch &&
          !o.opportunityDescription.toLowerCase().includes(opportunitySearch.toLowerCase()) &&
          !o.process.toLowerCase().includes(opportunitySearch.toLowerCase())
        )
          return false;
        return true;
      }),
    [opportunities, opportunityStatusFilter, opportunitySearch]
  );

  // ---------------------------------------------------------------------------
  // Summary stats
  // ---------------------------------------------------------------------------

  const summaryStats = useMemo(
    () => ({
      totalParties: parties.length,
      internalParties: parties.filter((p) => p.partyType === 'INTERNAL').length,
      externalParties: parties.filter((p) => p.partyType === 'EXTERNAL').length,
      totalIssues: issues.length,
      riskIssues: issues.filter((i) => i.bias === 'RISK').length,
      highPriorityIssues: issues.filter((i) => i.priority === 'HIGH' || i.priority === 'CRITICAL')
        .length,
      totalRisks: risks.length,
      openRisks: risks.filter((r) => r.status === 'OPEN' || r.status === 'IN_PROGRESS').length,
      highRisks: risks.filter((r) => r.riskFactor >= 15).length,
      totalOpportunities: opportunities.length,
      pursuingOpportunities: opportunities.filter((o) => o.status === 'PURSUING').length,
      realizedOpportunities: opportunities.filter((o) => o.status === 'REALIZED').length,
    }),
    [parties, issues, risks, opportunities]
  );

  // ---------------------------------------------------------------------------
  // Tab definitions
  // ---------------------------------------------------------------------------

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count: number }[] = [
    {
      key: 'parties',
      label: 'Interested Parties',
      icon: <Users className="h-4 w-4" />,
      count: parties.length,
    },
    {
      key: 'issues',
      label: 'Issues',
      icon: <FileWarning className="h-4 w-4" />,
      count: issues.length,
    },
    {
      key: 'risks',
      label: 'Risk Register',
      icon: <AlertTriangle className="h-4 w-4" />,
      count: risks.length,
    },
    {
      key: 'opportunities',
      label: 'Opportunities',
      icon: <Lightbulb className="h-4 w-4" />,
      count: opportunities.length,
    },
  ];

  // ---------------------------------------------------------------------------
  // Loading spinner
  // ---------------------------------------------------------------------------

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <span className="ml-3 text-gray-500 dark:text-gray-400">Loading...</span>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Risk & Opportunity Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            ISO 9001 Clause 6.1 -- Actions to address risks and opportunities
          </p>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Interested Parties</p>
                  <p className="text-3xl font-bold">{summaryStats.totalParties}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {summaryStats.internalParties} internal / {summaryStats.externalParties}{' '}
                    external
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Issues</p>
                  <p className="text-3xl font-bold text-amber-600">{summaryStats.totalIssues}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {summaryStats.highPriorityIssues} high/critical priority
                  </p>
                </div>
                <FileWarning className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Risks Identified</p>
                  <p className="text-3xl font-bold text-red-600">{summaryStats.totalRisks}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {summaryStats.highRisks} high/extreme risk
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Opportunities</p>
                  <p className="text-3xl font-bold text-green-600">
                    {summaryStats.totalOpportunities}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {summaryStats.realizedOpportunities} realized
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-1" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.key
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* ================================================================== */}
        {/* TAB 1: INTERESTED PARTIES                                          */}
        {/* ================================================================== */}
        {activeTab === 'parties' && (
          <>
            {/* Filter bar */}
            <div className="flex items-center gap-4 mb-6">
              <Select
                value={partyTypeFilter}
                onChange={(e) => setPartyTypeFilter(e.target.value)}
                className="w-48"
              >
                <option value="all">All Types</option>
                <option value="INTERNAL">Internal</option>
                <option value="EXTERNAL">External</option>
              </Select>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  aria-label="Search parties..."
                  placeholder="Search parties..."
                  value={partySearch}
                  onChange={(e) => setPartySearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => {
                  setPartyForm(emptyPartyForm);
                  setError('');
                  setShowPartyModal(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Party
              </Button>
            </div>

            {/* Party list */}
            {loadingParties ? (
              <LoadingSpinner />
            ) : filteredParties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredParties.map((party) => (
                  <Card key={party.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{party.partyName}</CardTitle>
                        <Badge variant={party.partyType === 'INTERNAL' ? 'info' : 'secondary'}>
                          {party.partyType}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {party.needsExpectations}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                        <span>Review: {party.reviewFrequency?.replace('_', ' ')}</span>
                        <span>{party.communicationMethod}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No interested parties found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Start by identifying the interested parties relevant to your QMS.
                </p>
                <Button
                  onClick={() => {
                    setPartyForm(emptyPartyForm);
                    setError('');
                    setShowPartyModal(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Party
                </Button>
              </div>
            )}
          </>
        )}

        {/* ================================================================== */}
        {/* TAB 2: ISSUES REGISTER                                             */}
        {/* ================================================================== */}
        {activeTab === 'issues' && (
          <>
            {/* Filter bar */}
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <Select
                value={issueBiasFilter}
                onChange={(e) => setIssueBiasFilter(e.target.value)}
                className="w-40"
              >
                <option value="all">All Bias</option>
                {BIAS_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </Select>
              <Select
                value={issuePriorityFilter}
                onChange={(e) => setIssuePriorityFilter(e.target.value)}
                className="w-40"
              >
                <option value="all">All Priorities</option>
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  aria-label="Search issues..."
                  placeholder="Search issues..."
                  value={issueSearch}
                  onChange={(e) => setIssueSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => {
                  setIssueForm(emptyIssueForm);
                  setError('');
                  setShowIssueModal(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Issue
              </Button>
            </div>

            {/* Issues list */}
            {loadingIssues ? (
              <LoadingSpinner />
            ) : filteredIssues.length > 0 ? (
              <div className="space-y-4">
                {filteredIssues.map((issue) => (
                  <Card key={issue.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getBiasVariant(issue.bias)}>{issue.bias}</Badge>
                            <Badge variant={getPriorityVariant(issue.priority)}>
                              {issue.priority}
                            </Badge>
                            {issue.partyName && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Party: {issue.partyName}
                              </span>
                            )}
                          </div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {issue.issueOfConcern}
                          </h3>
                          {issue.processesAffected && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Processes: {issue.processesAffected}
                            </p>
                          )}
                          {issue.treatmentMethod && (
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                              Treatment: {issue.treatmentMethod}
                            </p>
                          )}
                        </div>
                        {issue.recordReference && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                            {issue.recordReference}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <FileWarning className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No issues registered
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Capture internal and external issues that affect your QMS.
                </p>
                <Button
                  onClick={() => {
                    setIssueForm(emptyIssueForm);
                    setError('');
                    setShowIssueModal(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Register First Issue
                </Button>
              </div>
            )}
          </>
        )}

        {/* ================================================================== */}
        {/* TAB 3: RISK REGISTER                                               */}
        {/* ================================================================== */}
        {activeTab === 'risks' && (
          <>
            {/* Filter bar */}
            <div className="flex items-center gap-4 mb-6">
              <Select
                value={riskStatusFilter}
                onChange={(e) => setRiskStatusFilter(e.target.value)}
                className="w-48"
              >
                <option value="all">All Statuses</option>
                {RISK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </Select>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  aria-label="Search risks..."
                  placeholder="Search risks..."
                  value={riskSearch}
                  onChange={(e) => setRiskSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => {
                  setRiskForm(emptyRiskForm);
                  setRiskAiAnalysis('');
                  setRiskAiExpanded(false);
                  setError('');
                  setShowRiskModal(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Risk
              </Button>
            </div>

            {/* Risks list */}
            {loadingRisks ? (
              <LoadingSpinner />
            ) : filteredRisks.length > 0 ? (
              <div className="space-y-4">
                {filteredRisks.map((risk) => (
                  <Card key={risk.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getRiskFactorColor(risk.riskFactor)}>
                              RF: {risk.riskFactor} ({risk.riskLevel})
                            </Badge>
                            <Badge
                              variant={
                                risk.status === 'OPEN'
                                  ? 'danger'
                                  : risk.status === 'IN_PROGRESS'
                                    ? 'warning'
                                    : risk.status === 'MITIGATED'
                                      ? 'success'
                                      : risk.status === 'CLOSED'
                                        ? 'secondary'
                                        : 'info'
                              }
                            >
                              {risk.status?.replace(/_/g, ' ')}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {risk.process}
                            </span>
                          </div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                            {risk.riskDescription}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
                            <span>Likelihood: {risk.likelihood}</span>
                            {risk.responsiblePerson && <span>Owner: {risk.responsiblePerson}</span>}
                            {risk.dueDate && (
                              <span>Due: {new Date(risk.dueDate).toLocaleDateString()}</span>
                            )}
                            {risk.treatmentOption && <span>Treatment: {risk.treatmentOption}</span>}
                          </div>
                        </div>
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold ${getRiskFactorColor(risk.riskFactor)}`}
                        >
                          {risk.riskFactor}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Shield className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No risks in the register
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Identify and assess risks to your quality management system processes.
                </p>
                <Button
                  onClick={() => {
                    setRiskForm(emptyRiskForm);
                    setRiskAiAnalysis('');
                    setRiskAiExpanded(false);
                    setError('');
                    setShowRiskModal(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Register First Risk
                </Button>
              </div>
            )}
          </>
        )}

        {/* ================================================================== */}
        {/* TAB 4: OPPORTUNITIES                                               */}
        {/* ================================================================== */}
        {activeTab === 'opportunities' && (
          <>
            {/* Filter bar */}
            <div className="flex items-center gap-4 mb-6">
              <Select
                value={opportunityStatusFilter}
                onChange={(e) => setOpportunityStatusFilter(e.target.value)}
                className="w-48"
              >
                <option value="all">All Statuses</option>
                {OPPORTUNITY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  aria-label="Search opportunities..."
                  placeholder="Search opportunities..."
                  value={opportunitySearch}
                  onChange={(e) => setOpportunitySearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => {
                  setOpportunityForm(emptyOpportunityForm);
                  setOpportunityAiAnalysis('');
                  setOpportunityAiExpanded(false);
                  setError('');
                  setShowOpportunityModal(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Opportunity
              </Button>
            </div>

            {/* Opportunities list */}
            {loadingOpportunities ? (
              <LoadingSpinner />
            ) : filteredOpportunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOpportunities.map((opp) => (
                  <Card key={opp.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={getOpportunityScoreVariant(opp.opportunityScore)}>
                            Score: {opp.opportunityScore}
                          </Badge>
                          <Badge
                            variant={
                              opp.status === 'REALIZED'
                                ? 'success'
                                : opp.status === 'PURSUING'
                                  ? 'info'
                                  : opp.status === 'EVALUATING'
                                    ? 'warning'
                                    : opp.status === 'CLOSED'
                                      ? 'secondary'
                                      : 'outline'
                            }
                          >
                            {opp.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {opp.process}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                        {opp.opportunityDescription}
                      </h3>
                      {opp.actionToExploit && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          Action: {opp.actionToExploit}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 dark:text-gray-500">
                        {opp.responsiblePerson && <span>Owner: {opp.responsiblePerson}</span>}
                        {opp.targetDate && (
                          <span>Target: {new Date(opp.targetDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Lightbulb className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No opportunities identified
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Capture opportunities for improvement aligned with your QMS objectives.
                </p>
                <Button
                  onClick={() => {
                    setOpportunityForm(emptyOpportunityForm);
                    setOpportunityAiAnalysis('');
                    setOpportunityAiExpanded(false);
                    setError('');
                    setShowOpportunityModal(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Identify First Opportunity
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ==================================================================== */}
      {/* MODAL: Interested Party                                              */}
      {/* ==================================================================== */}
      <Modal
        isOpen={showPartyModal}
        onClose={() => setShowPartyModal(false)}
        title="Add Interested Party"
        size="lg"
      >
        <form onSubmit={handleSubmitParty}>
          <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-2">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="ip-partyName">Party Name *</Label>
              <Input
                id="ip-partyName"
                value={partyForm.partyName}
                onChange={(e) => setPartyForm({ ...partyForm, partyName: e.target.value })}
                required
                placeholder="e.g. Employees, Regulatory Bodies, Suppliers"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ip-partyType">Party Type *</Label>
                <Select
                  id="ip-partyType"
                  value={partyForm.partyType}
                  onChange={(e) => setPartyForm({ ...partyForm, partyType: e.target.value })}
                >
                  {PARTY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="ip-reviewFrequency">Review Frequency *</Label>
                <Select
                  id="ip-reviewFrequency"
                  value={partyForm.reviewFrequency}
                  onChange={(e) => setPartyForm({ ...partyForm, reviewFrequency: e.target.value })}
                >
                  {REVIEW_FREQUENCIES.map((f) => (
                    <option key={f} value={f}>
                      {f.replace('_', ' ')}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="ip-reasonForInclusion">Reason for Inclusion *</Label>
              <Textarea
                id="ip-reasonForInclusion"
                value={partyForm.reasonForInclusion}
                onChange={(e) => setPartyForm({ ...partyForm, reasonForInclusion: e.target.value })}
                rows={2}
                required
                placeholder="Why is this party relevant to the QMS?"
              />
            </div>

            <div>
              <Label htmlFor="ip-needsExpectations">Needs & Expectations *</Label>
              <Textarea
                id="ip-needsExpectations"
                value={partyForm.needsExpectations}
                onChange={(e) => setPartyForm({ ...partyForm, needsExpectations: e.target.value })}
                rows={3}
                required
                placeholder="What does this party need/expect from the organization?"
              />
            </div>

            <div>
              <Label htmlFor="ip-communicationMethod">Communication Method</Label>
              <Select
                id="ip-communicationMethod"
                value={partyForm.communicationMethod}
                onChange={(e) =>
                  setPartyForm({ ...partyForm, communicationMethod: e.target.value })
                }
              >
                {COMMUNICATION_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowPartyModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submittingParty}>
              {submittingParty ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create Party'
              )}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* ==================================================================== */}
      {/* MODAL: Issue                                                         */}
      {/* ==================================================================== */}
      <Modal
        isOpen={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        title="Register Issue"
        size="lg"
      >
        <form onSubmit={handleSubmitIssue}>
          <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-2">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="iss-partyId">Interested Party *</Label>
              <Select
                id="iss-partyId"
                value={issueForm.partyId}
                onChange={(e) => setIssueForm({ ...issueForm, partyId: e.target.value })}
                required
              >
                <option value="">-- Select Party --</option>
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.partyName} ({p.partyType})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="iss-issueOfConcern">Issue of Concern *</Label>
              <Textarea
                id="iss-issueOfConcern"
                value={issueForm.issueOfConcern}
                onChange={(e) => setIssueForm({ ...issueForm, issueOfConcern: e.target.value })}
                rows={3}
                required
                placeholder="Describe the issue or concern raised by the interested party"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="iss-bias">Bias *</Label>
                <Select
                  id="iss-bias"
                  value={issueForm.bias}
                  onChange={(e) => setIssueForm({ ...issueForm, bias: e.target.value })}
                >
                  {BIAS_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="iss-priority">Priority *</Label>
                <Select
                  id="iss-priority"
                  value={issueForm.priority}
                  onChange={(e) => setIssueForm({ ...issueForm, priority: e.target.value })}
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="iss-processesAffected">Processes Affected</Label>
              <Input
                id="iss-processesAffected"
                value={issueForm.processesAffected}
                onChange={(e) => setIssueForm({ ...issueForm, processesAffected: e.target.value })}
                placeholder="e.g. Production, Procurement, Customer Service"
              />
            </div>

            <div>
              <Label htmlFor="iss-treatmentMethod">Treatment Method</Label>
              <Textarea
                id="iss-treatmentMethod"
                value={issueForm.treatmentMethod}
                onChange={(e) => setIssueForm({ ...issueForm, treatmentMethod: e.target.value })}
                rows={2}
                placeholder="How will this issue be addressed?"
              />
            </div>

            <div>
              <Label htmlFor="iss-recordReference">Record Reference</Label>
              <Input
                id="iss-recordReference"
                value={issueForm.recordReference}
                onChange={(e) => setIssueForm({ ...issueForm, recordReference: e.target.value })}
                placeholder="e.g. ISS-2026-001"
              />
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowIssueModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submittingIssue}>
              {submittingIssue ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                'Register Issue'
              )}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* ==================================================================== */}
      {/* MODAL: Risk Register                                                 */}
      {/* ==================================================================== */}
      <Modal
        isOpen={showRiskModal}
        onClose={() => setShowRiskModal(false)}
        title="Register Risk"
        size="full"
      >
        <form onSubmit={handleSubmitRisk}>
          <div className="max-h-[70vh] overflow-y-auto space-y-6 pr-2">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* SECTION A: IDENTIFICATION */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                A -- Identification
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="risk-process">Process *</Label>
                  <Select
                    id="risk-process"
                    value={riskForm.process}
                    onChange={(e) => setRiskForm({ ...riskForm, process: e.target.value })}
                    required
                  >
                    <option value="">-- Select Process --</option>
                    {PROCESS_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="risk-description">Risk Description *</Label>
                  <Textarea
                    id="risk-description"
                    value={riskForm.riskDescription}
                    onChange={(e) => setRiskForm({ ...riskForm, riskDescription: e.target.value })}
                    rows={3}
                    required
                    placeholder="Describe the risk and its potential impact on the process"
                  />
                </div>
              </div>
            </div>

            {/* SECTION B: PROBABILITY */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                B -- Probability
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="risk-likelihood">Likelihood (1-6) *</Label>
                  <Select
                    id="risk-likelihood"
                    value={riskForm.likelihood}
                    onChange={(e) =>
                      setRiskForm({ ...riskForm, likelihood: parseInt(e.target.value) })
                    }
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} - {LIKELIHOOD_LABELS[n]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="risk-previousOccurrences">Previous Occurrences</Label>
                  <Input
                    id="risk-previousOccurrences"
                    value={riskForm.previousOccurrences}
                    onChange={(e) =>
                      setRiskForm({ ...riskForm, previousOccurrences: e.target.value })
                    }
                    placeholder="Describe any previous occurrences"
                  />
                </div>
              </div>
            </div>

            {/* SECTION C: CONSEQUENCE */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                C -- Consequence Assessment (0-5 each)
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="risk-lossOfContracts">Loss of Contracts</Label>
                  <Select
                    id="risk-lossOfContracts"
                    value={riskForm.lossOfContracts}
                    onChange={(e) =>
                      setRiskForm({ ...riskForm, lossOfContracts: parseInt(e.target.value) })
                    }
                  >
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} - {CONSEQUENCE_LABELS[n]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="risk-harmToUser">Harm to User</Label>
                  <Select
                    id="risk-harmToUser"
                    value={riskForm.harmToUser}
                    onChange={(e) =>
                      setRiskForm({ ...riskForm, harmToUser: parseInt(e.target.value) })
                    }
                  >
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} - {CONSEQUENCE_LABELS[n]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="risk-unableToMeetTerms">Unable to Meet Terms</Label>
                  <Select
                    id="risk-unableToMeetTerms"
                    value={riskForm.unableToMeetTerms}
                    onChange={(e) =>
                      setRiskForm({ ...riskForm, unableToMeetTerms: parseInt(e.target.value) })
                    }
                  >
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} - {CONSEQUENCE_LABELS[n]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="risk-violationOfRegulations">Violation of Regulations</Label>
                  <Select
                    id="risk-violationOfRegulations"
                    value={riskForm.violationOfRegulations}
                    onChange={(e) =>
                      setRiskForm({ ...riskForm, violationOfRegulations: parseInt(e.target.value) })
                    }
                  >
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} - {CONSEQUENCE_LABELS[n]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="risk-reputationImpact">Reputation Impact</Label>
                  <Select
                    id="risk-reputationImpact"
                    value={riskForm.reputationImpact}
                    onChange={(e) =>
                      setRiskForm({ ...riskForm, reputationImpact: parseInt(e.target.value) })
                    }
                  >
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} - {CONSEQUENCE_LABELS[n]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="risk-costOfCorrection">Cost of Correction</Label>
                  <Select
                    id="risk-costOfCorrection"
                    value={riskForm.costOfCorrection}
                    onChange={(e) =>
                      setRiskForm({ ...riskForm, costOfCorrection: parseInt(e.target.value) })
                    }
                  >
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} - {CONSEQUENCE_LABELS[n]}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            {/* SECTION D: RISK SCORING */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                D -- Risk Scoring (auto-calculated)
              </h3>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Risk Factor</p>
                  <div
                    className={`px-4 py-2 rounded-lg font-bold text-lg ${getRiskFactorColor(computedRiskFactor)}`}
                  >
                    {computedRiskFactor}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Risk Level</p>
                  <Badge
                    variant={getRiskFactorBadgeVariant(computedRiskFactor)}
                    className="text-base px-4 py-1"
                  >
                    {computedRiskLevel}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 ml-4">
                  <p>
                    Likelihood ({riskForm.likelihood}) x Max Consequence (
                    {Math.max(
                      riskForm.lossOfContracts,
                      riskForm.harmToUser,
                      riskForm.unableToMeetTerms,
                      riskForm.violationOfRegulations,
                      riskForm.reputationImpact,
                      riskForm.costOfCorrection,
                      0
                    )}
                    ) = {computedRiskFactor}
                  </p>
                  <p className="text-xs mt-1">
                    GREEN: 1-6 | AMBER: 7-14 | RED: 15-24 | DARK RED: 25+
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION E: TREATMENT */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                E -- Treatment
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="risk-treatmentOption">Treatment Option *</Label>
                    <Select
                      id="risk-treatmentOption"
                      value={riskForm.treatmentOption}
                      onChange={(e) =>
                        setRiskForm({ ...riskForm, treatmentOption: e.target.value })
                      }
                    >
                      {TREATMENT_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="risk-status">Status *</Label>
                    <Select
                      id="risk-status"
                      value={riskForm.status}
                      onChange={(e) => setRiskForm({ ...riskForm, status: e.target.value })}
                    >
                      {RISK_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="risk-treatmentActions">Treatment Actions *</Label>
                  <Textarea
                    id="risk-treatmentActions"
                    value={riskForm.treatmentActions}
                    onChange={(e) => setRiskForm({ ...riskForm, treatmentActions: e.target.value })}
                    rows={3}
                    required
                    placeholder="Describe the actions to treat this risk"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="risk-responsiblePerson">Responsible Person</Label>
                    <Input
                      id="risk-responsiblePerson"
                      value={riskForm.responsiblePerson}
                      onChange={(e) =>
                        setRiskForm({ ...riskForm, responsiblePerson: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="risk-dueDate">Due Date</Label>
                    <Input
                      id="risk-dueDate"
                      type="date"
                      value={riskForm.dueDate}
                      onChange={(e) => setRiskForm({ ...riskForm, dueDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="risk-reviewDate">Review Date</Label>
                    <Input
                      id="risk-reviewDate"
                      type="date"
                      value={riskForm.reviewDate}
                      onChange={(e) => setRiskForm({ ...riskForm, reviewDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION F: AI ANALYSIS */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <button
                type="button"
                onClick={() => setRiskAiExpanded(!riskAiExpanded)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />F -- AI Risk Analysis
                </h3>
                {riskAiExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                )}
              </button>
              {riskAiExpanded && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    AI will analyze the risk description and scoring to provide recommendations.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRiskAiAnalysis}
                    disabled={riskAiLoading || !riskForm.riskDescription}
                    className="flex items-center gap-2"
                  >
                    {riskAiLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Run AI Analysis
                      </>
                    )}
                  </Button>
                  {riskAiAnalysis && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {riskAiAnalysis}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowRiskModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submittingRisk}>
              {submittingRisk ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                'Register Risk'
              )}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* ==================================================================== */}
      {/* MODAL: Opportunity                                                   */}
      {/* ==================================================================== */}
      <Modal
        isOpen={showOpportunityModal}
        onClose={() => setShowOpportunityModal(false)}
        title="Identify Opportunity"
        size="full"
      >
        <form onSubmit={handleSubmitOpportunity}>
          <div className="max-h-[70vh] overflow-y-auto space-y-6 pr-2">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* IDENTIFICATION */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                A -- Identification
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="opp-process">Process *</Label>
                    <Select
                      id="opp-process"
                      value={opportunityForm.process}
                      onChange={(e) =>
                        setOpportunityForm({ ...opportunityForm, process: e.target.value })
                      }
                      required
                    >
                      <option value="">-- Select Process --</option>
                      {PROCESS_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="opp-interestedParties">Interested Parties</Label>
                    <Input
                      id="opp-interestedParties"
                      value={opportunityForm.interestedParties}
                      onChange={(e) =>
                        setOpportunityForm({
                          ...opportunityForm,
                          interestedParties: e.target.value,
                        })
                      }
                      placeholder="Parties related to this opportunity"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="opp-description">Opportunity Description *</Label>
                  <Textarea
                    id="opp-description"
                    value={opportunityForm.opportunityDescription}
                    onChange={(e) =>
                      setOpportunityForm({
                        ...opportunityForm,
                        opportunityDescription: e.target.value,
                      })
                    }
                    rows={3}
                    required
                    placeholder="Describe the opportunity and its potential benefits"
                  />
                </div>
              </div>
            </div>

            {/* LIKELIHOOD & BENEFIT ASSESSMENT */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                B -- Likelihood & Benefit Assessment
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="opp-likelihood">Likelihood (1-6) *</Label>
                  <Select
                    id="opp-likelihood"
                    value={opportunityForm.likelihood}
                    onChange={(e) =>
                      setOpportunityForm({
                        ...opportunityForm,
                        likelihood: parseInt(e.target.value),
                      })
                    }
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} - {LIKELIHOOD_LABELS[n]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="opp-benefitToCustomer">Benefit to Customer (0-5)</Label>
                    <Select
                      id="opp-benefitToCustomer"
                      value={opportunityForm.benefitToCustomer}
                      onChange={(e) =>
                        setOpportunityForm({
                          ...opportunityForm,
                          benefitToCustomer: parseInt(e.target.value),
                        })
                      }
                    >
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} - {CONSEQUENCE_LABELS[n]}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="opp-revenueGrowth">Revenue Growth (0-5)</Label>
                    <Select
                      id="opp-revenueGrowth"
                      value={opportunityForm.revenueGrowth}
                      onChange={(e) =>
                        setOpportunityForm({
                          ...opportunityForm,
                          revenueGrowth: parseInt(e.target.value),
                        })
                      }
                    >
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} - {CONSEQUENCE_LABELS[n]}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="opp-marketExpansion">Market Expansion (0-5)</Label>
                    <Select
                      id="opp-marketExpansion"
                      value={opportunityForm.marketExpansion}
                      onChange={(e) =>
                        setOpportunityForm({
                          ...opportunityForm,
                          marketExpansion: parseInt(e.target.value),
                        })
                      }
                    >
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} - {CONSEQUENCE_LABELS[n]}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="opp-processImprovement">Process Improvement (0-5)</Label>
                    <Select
                      id="opp-processImprovement"
                      value={opportunityForm.processImprovement}
                      onChange={(e) =>
                        setOpportunityForm({
                          ...opportunityForm,
                          processImprovement: parseInt(e.target.value),
                        })
                      }
                    >
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} - {CONSEQUENCE_LABELS[n]}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="opp-complianceAdvantage">Compliance Advantage (0-5)</Label>
                    <Select
                      id="opp-complianceAdvantage"
                      value={opportunityForm.complianceAdvantage}
                      onChange={(e) =>
                        setOpportunityForm({
                          ...opportunityForm,
                          complianceAdvantage: parseInt(e.target.value),
                        })
                      }
                    >
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} - {CONSEQUENCE_LABELS[n]}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="opp-reputationGain">Reputation Gain (0-5)</Label>
                    <Select
                      id="opp-reputationGain"
                      value={opportunityForm.reputationGain}
                      onChange={(e) =>
                        setOpportunityForm({
                          ...opportunityForm,
                          reputationGain: parseInt(e.target.value),
                        })
                      }
                    >
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} - {CONSEQUENCE_LABELS[n]}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* Calculated score */}
                <div className="flex items-center gap-4 pt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Opportunity Score:</p>
                  <Badge
                    variant={getOpportunityScoreVariant(computedOpportunityScore)}
                    className="text-base px-4 py-1"
                  >
                    {computedOpportunityScore}
                  </Badge>
                </div>
              </div>
            </div>

            {/* ACTION & OWNERSHIP */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                C -- Action & Ownership
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="opp-actionToExploit">Action to Exploit *</Label>
                  <Textarea
                    id="opp-actionToExploit"
                    value={opportunityForm.actionToExploit}
                    onChange={(e) =>
                      setOpportunityForm({ ...opportunityForm, actionToExploit: e.target.value })
                    }
                    rows={3}
                    required
                    placeholder="What actions will be taken to realize this opportunity?"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="opp-responsiblePerson">Responsible Person</Label>
                    <Input
                      id="opp-responsiblePerson"
                      value={opportunityForm.responsiblePerson}
                      onChange={(e) =>
                        setOpportunityForm({
                          ...opportunityForm,
                          responsiblePerson: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="opp-targetDate">Target Date</Label>
                    <Input
                      id="opp-targetDate"
                      type="date"
                      value={opportunityForm.targetDate}
                      onChange={(e) =>
                        setOpportunityForm({ ...opportunityForm, targetDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="opp-status">Status *</Label>
                    <Select
                      id="opp-status"
                      value={opportunityForm.status}
                      onChange={(e) =>
                        setOpportunityForm({ ...opportunityForm, status: e.target.value })
                      }
                    >
                      {OPPORTUNITY_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* AI ANALYSIS */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <button
                type="button"
                onClick={() => setOpportunityAiExpanded(!opportunityAiExpanded)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />D -- AI Opportunity Analysis
                </h3>
                {opportunityAiExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                )}
              </button>
              {opportunityAiExpanded && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    AI will analyze the opportunity and provide strategic recommendations.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleOpportunityAiAnalysis}
                    disabled={opportunityAiLoading || !opportunityForm.opportunityDescription}
                    className="flex items-center gap-2"
                  >
                    {opportunityAiLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Run AI Analysis
                      </>
                    )}
                  </Button>
                  {opportunityAiAnalysis && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {opportunityAiAnalysis}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowOpportunityModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submittingOpportunity}>
              {submittingOpportunity ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                'Register Opportunity'
              )}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
