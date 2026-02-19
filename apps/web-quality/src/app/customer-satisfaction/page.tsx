'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal } from '@ims/ui';
import {
  Star,
  TrendingUp,
  Users,
  Send,
  Plus,
  Eye,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  BarChart3,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type ResponseStatus = 'Responded' | 'Pending' | 'No Response';
type Category = 'Product Quality' | 'Delivery' | 'Customer Service' | 'Price' | 'Communication';
type ActionStatus = 'Open' | 'In Progress' | 'Completed';
type ActionPriority = 'High' | 'Medium' | 'Low';

interface SurveyResponse {
  question: string;
  score: number; // 1–5
  comment?: string;
}

interface Survey {
  id: string;
  customer: string;
  email: string;
  date: string;
  overallScore: number; // 1–5
  status: ResponseStatus;
  category: Category;
  isPromoter: boolean; // score >= 4
  isDetractor: boolean; // score <= 2
  responses: SurveyResponse[];
}

interface ActionItem {
  id: string;
  title: string;
  source: string; // survey ID or category
  status: ActionStatus;
  priority: ActionPriority;
  owner: string;
  dueDate: string;
  description: string;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_SURVEYS: Survey[] = [
  {
    id: 'CS-2024-001',
    customer: 'Acme Manufacturing Ltd',
    email: 'john.smith@acme.com',
    date: '2024-03-15',
    overallScore: 5,
    status: 'Responded',
    category: 'Product Quality',
    isPromoter: true,
    isDetractor: false,
    responses: [
      {
        question: 'How satisfied are you with our product quality?',
        score: 5,
        comment: 'Excellent quality, zero defects in last 6 months.' },
      { question: 'How would you rate our delivery performance?', score: 4 },
      {
        question: 'How satisfied are you with our customer service?',
        score: 5,
        comment: 'Very responsive team.' },
      { question: 'How do you rate our pricing?', score: 4 },
      { question: 'How would you rate our communication?', score: 5 },
    ] },
  {
    id: 'CS-2024-002',
    customer: 'Global Tech Solutions',
    email: 'procurement@globaltech.com',
    date: '2024-03-12',
    overallScore: 2,
    status: 'Responded',
    category: 'Delivery',
    isPromoter: false,
    isDetractor: true,
    responses: [
      { question: 'How satisfied are you with our product quality?', score: 3 },
      {
        question: 'How would you rate our delivery performance?',
        score: 1,
        comment: 'Multiple late deliveries this quarter, causing production delays.' },
      { question: 'How satisfied are you with our customer service?', score: 3 },
      { question: 'How do you rate our pricing?', score: 3 },
      {
        question: 'How would you rate our communication?',
        score: 2,
        comment: 'Poor updates on order status.' },
    ] },
  {
    id: 'CS-2024-003',
    customer: 'Precision Parts Inc',
    email: 'quality@precisionparts.com',
    date: '2024-03-10',
    overallScore: 4,
    status: 'Responded',
    category: 'Product Quality',
    isPromoter: true,
    isDetractor: false,
    responses: [
      {
        question: 'How satisfied are you with our product quality?',
        score: 4,
        comment: 'Consistent quality, minor variations in tolerances.' },
      { question: 'How would you rate our delivery performance?', score: 5 },
      { question: 'How satisfied are you with our customer service?', score: 4 },
      { question: 'How do you rate our pricing?', score: 3 },
      { question: 'How would you rate our communication?', score: 4 },
    ] },
  {
    id: 'CS-2024-004',
    customer: 'Euro Components GmbH',
    email: 'einkauf@eurocomponents.de',
    date: '2024-03-08',
    overallScore: 3,
    status: 'Responded',
    category: 'Customer Service',
    isPromoter: false,
    isDetractor: false,
    responses: [
      { question: 'How satisfied are you with our product quality?', score: 3 },
      { question: 'How would you rate our delivery performance?', score: 3 },
      {
        question: 'How satisfied are you with our customer service?',
        score: 2,
        comment: 'Long wait times on support tickets.' },
      { question: 'How do you rate our pricing?', score: 4 },
      { question: 'How would you rate our communication?', score: 3 },
    ] },
  {
    id: 'CS-2024-005',
    customer: 'Atlantic Aerospace Corp',
    email: 'supplier-mgmt@atlantic.aero',
    date: '2024-03-05',
    overallScore: 5,
    status: 'Responded',
    category: 'Product Quality',
    isPromoter: true,
    isDetractor: false,
    responses: [
      {
        question: 'How satisfied are you with our product quality?',
        score: 5,
        comment: 'World-class quality management. AS9100 compliance is evident.' },
      { question: 'How would you rate our delivery performance?', score: 5 },
      { question: 'How satisfied are you with our customer service?', score: 5 },
      { question: 'How do you rate our pricing?', score: 4 },
      { question: 'How would you rate our communication?', score: 5 },
    ] },
  {
    id: 'CS-2024-006',
    customer: 'Midwest Automotive LLC',
    email: 'quality@midwestauto.com',
    date: '2024-02-28',
    overallScore: 4,
    status: 'Responded',
    category: 'Delivery',
    isPromoter: true,
    isDetractor: false,
    responses: [
      { question: 'How satisfied are you with our product quality?', score: 4 },
      {
        question: 'How would you rate our delivery performance?',
        score: 4,
        comment: 'On time, well packaged.' },
      { question: 'How satisfied are you with our customer service?', score: 4 },
      { question: 'How do you rate our pricing?', score: 3 },
      { question: 'How would you rate our communication?', score: 5 },
    ] },
  {
    id: 'CS-2024-007',
    customer: 'Northern Medical Devices',
    email: 'procurement@northernmed.ca',
    date: '2024-02-20',
    overallScore: 1,
    status: 'Responded',
    category: 'Product Quality',
    isPromoter: false,
    isDetractor: true,
    responses: [
      {
        question: 'How satisfied are you with our product quality?',
        score: 1,
        comment: 'Three batches with out-of-spec dimensions. NCR raised.' },
      { question: 'How would you rate our delivery performance?', score: 2 },
      { question: 'How satisfied are you with our customer service?', score: 2 },
      { question: 'How do you rate our pricing?', score: 3 },
      {
        question: 'How would you rate our communication?',
        score: 1,
        comment: 'No proactive communication about quality issues.' },
    ] },
  {
    id: 'CS-2024-008',
    customer: 'Pacific Electronics Co',
    email: 'vqa@pacificelectronics.jp',
    date: '2024-02-15',
    overallScore: 4,
    status: 'Pending',
    category: 'Communication',
    isPromoter: true,
    isDetractor: false,
    responses: [
      { question: 'How satisfied are you with our product quality?', score: 4 },
      { question: 'How would you rate our delivery performance?', score: 4 },
      { question: 'How satisfied are you with our customer service?', score: 3 },
      { question: 'How do you rate our pricing?', score: 4 },
      { question: 'How would you rate our communication?', score: 4 },
    ] },
  {
    id: 'CS-2024-009',
    customer: 'Apex Fabrication Ltd',
    email: 'operations@apexfab.co.uk',
    date: '2024-02-10',
    overallScore: 3,
    status: 'No Response',
    category: 'Price',
    isPromoter: false,
    isDetractor: false,
    responses: [] },
  {
    id: 'CS-2024-010',
    customer: 'Southern Steel Works',
    email: 'purchasing@southernsteel.com',
    date: '2024-02-05',
    overallScore: 4,
    status: 'Responded',
    category: 'Customer Service',
    isPromoter: true,
    isDetractor: false,
    responses: [
      { question: 'How satisfied are you with our product quality?', score: 4 },
      { question: 'How would you rate our delivery performance?', score: 4 },
      {
        question: 'How satisfied are you with our customer service?',
        score: 5,
        comment: 'Account manager is very proactive and knowledgeable.' },
      { question: 'How do you rate our pricing?', score: 3 },
      { question: 'How would you rate our communication?', score: 4 },
    ] },
];

const SEED_ACTIONS: ActionItem[] = [
  {
    id: 'CA-001',
    title: 'Improve delivery scheduling system',
    source: 'CS-2024-002',
    status: 'In Progress',
    priority: 'High',
    owner: 'Logistics Manager',
    dueDate: '2024-04-30',
    description:
      'Implement real-time delivery tracking and automated customer notifications to address late delivery complaints.' },
  {
    id: 'CA-002',
    title: 'Root cause analysis — dimensional non-conformances',
    source: 'CS-2024-007',
    status: 'Open',
    priority: 'High',
    owner: 'Quality Engineer',
    dueDate: '2024-04-15',
    description:
      'Investigate and resolve root cause of three batches with out-of-spec dimensions reported by Northern Medical Devices.' },
  {
    id: 'CA-003',
    title: 'Reduce support ticket response time',
    source: 'CS-2024-004',
    status: 'Open',
    priority: 'Medium',
    owner: 'Customer Service Lead',
    dueDate: '2024-05-01',
    description:
      'Target <4 hour first response time on all support tickets. Current average is 48+ hours.' },
  {
    id: 'CA-004',
    title: 'Customer communication protocol for quality events',
    source: 'CS-2024-007',
    status: 'In Progress',
    priority: 'High',
    owner: 'Quality Manager',
    dueDate: '2024-04-20',
    description:
      'Establish mandatory communication procedure within 24h of identifying any out-of-spec product dispatched to customers.' },
  {
    id: 'CA-005',
    title: 'Review pricing strategy for competitive alignment',
    source: 'Price',
    status: 'Open',
    priority: 'Low',
    owner: 'Sales Director',
    dueDate: '2024-06-30',
    description:
      'Multiple customers rated pricing below 4/5. Conduct market analysis and review pricing tiers.' },
  {
    id: 'CA-006',
    title: 'Customer satisfaction survey process improvement',
    source: 'General',
    status: 'Completed',
    priority: 'Medium',
    owner: 'Quality Coordinator',
    dueDate: '2024-03-01',
    description:
      'Increase survey response rate by introducing digital survey format and follow-up reminders.' },
];

const MONTHLY_SCORES = [
  { month: 'Mar', score: 3.1 },
  { month: 'Apr', score: 3.4 },
  { month: 'May', score: 3.6 },
  { month: 'Jun', score: 3.5 },
  { month: 'Jul', score: 3.8 },
  { month: 'Aug', score: 3.7 },
  { month: 'Sep', score: 3.9 },
  { month: 'Oct', score: 4.0 },
  { month: 'Nov', score: 4.1 },
  { month: 'Dec', score: 4.0 },
  { month: 'Jan', score: 4.2 },
  { month: 'Feb', score: 4.3 },
];

const CATEGORIES: Category[] = [
  'Product Quality',
  'Delivery',
  'Customer Service',
  'Price',
  'Communication',
];

const CATEGORY_COLORS: Record<Category, string> = {
  'Product Quality': 'bg-blue-500',
  Delivery: 'bg-purple-500',
  'Customer Service': 'bg-green-500',
  Price: 'bg-amber-500',
  Communication: 'bg-pink-500' };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 4) return 'text-green-600 dark:text-green-400';
  if (score >= 3) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function getBarColor(score: number): string {
  if (score >= 4) return 'bg-green-500';
  if (score >= 3) return 'bg-amber-500';
  return 'bg-red-500';
}

function StarRating({ score, max = 5 }: { score: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < Math.round(score)
              ? 'text-amber-400 fill-amber-400'
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      ))}
      <span className={`ml-1 text-sm font-medium ${getScoreColor(score)}`}>{score.toFixed(1)}</span>
    </div>
  );
}

function ScoreGauge({ score, max = 5 }: { score: number; max?: number }) {
  const pct = (score / max) * 100;
  const radius = 52;
  const circ = Math.PI * radius; // half circle
  const _dash = (pct / 100) * circ;

  const color = score >= 4 ? '#10B981' : score >= 3 ? '#F59E0B' : '#DC2626';

  return (
    <div className="relative flex flex-col items-center">
      <svg viewBox="0 0 120 70" className="w-32 h-20">
        {/* Background arc */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          className="text-gray-200 dark:text-gray-300"
        />
        {/* Value arc */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * 157} 157`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div className="absolute bottom-2 text-center">
        <p className="text-3xl font-bold text-foreground leading-none">{score.toFixed(1)}</p>
        <p className="text-xs text-muted-foreground">/ {max}.0</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ResponseStatus }) {
  const map: Record<ResponseStatus, { cls: string; label: string }> = {
    Responded: {
      cls: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      label: 'Responded' },
    Pending: {
      cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      label: 'Pending' },
    'No Response': {
      cls: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 dark:bg-gray-800 dark:text-gray-400',
      label: 'No Response' } };
  const { cls, label } = map[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function ActionStatusBadge({ status }: { status: ActionStatus }) {
  const map: Record<ActionStatus, { cls: string; icon: React.ReactNode }> = {
    Open: {
      cls: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      icon: <AlertCircle className="h-3 w-3" /> },
    'In Progress': {
      cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      icon: <Clock className="h-3 w-3" /> },
    Completed: {
      cls: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      icon: <CheckCircle className="h-3 w-3" /> } };
  const { cls, icon } = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${cls}`}
    >
      {icon}
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: ActionPriority }) {
  const map: Record<ActionPriority, string> = {
    High: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    Low: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 dark:bg-gray-800 dark:text-gray-400' };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[priority]}`}
    >
      {priority}
    </span>
  );
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

const LS_SURVEYS = 'ims_cs_surveys';
const LS_ACTIONS = 'ims_cs_actions';

function loadSurveys(): Survey[] {
  if (typeof window === 'undefined') return SEED_SURVEYS;
  try {
    const raw = localStorage.getItem(LS_SURVEYS);
    return raw ? JSON.parse(raw) : SEED_SURVEYS;
  } catch {
    return SEED_SURVEYS;
  }
}

function saveSurveys(surveys: Survey[]) {
  localStorage.setItem(LS_SURVEYS, JSON.stringify(surveys));
}

function loadActions(): ActionItem[] {
  if (typeof window === 'undefined') return SEED_ACTIONS;
  try {
    const raw = localStorage.getItem(LS_ACTIONS);
    return raw ? JSON.parse(raw) : SEED_ACTIONS;
  } catch {
    return SEED_ACTIONS;
  }
}

function saveActions(actions: ActionItem[]) {
  localStorage.setItem(LS_ACTIONS, JSON.stringify(actions));
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CustomerSatisfactionPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<ResponseStatus | 'All'>('All');
  const [filterMinScore, setFilterMinScore] = useState<number>(1);
  const [filterMaxScore, setFilterMaxScore] = useState<number>(5);
  const [filterActionStatus, setFilterActionStatus] = useState<ActionStatus | 'All'>('All');

  // Modals
  const [addSurveyOpen, setAddSurveyOpen] = useState(false);
  const [viewSurveyOpen, setViewSurveyOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  // Sort
  const [sortField, setSortField] = useState<keyof Survey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Add survey form
  const [form, setForm] = useState({
    customer: '',
    email: '',
    category: 'Product Quality' as Category,
    q1: 3,
    q2: 3,
    q3: 3,
    q4: 3,
    q5: 3,
    c1: '',
    c2: '',
    c3: '',
    c4: '',
    c5: '' });

  useEffect(() => {
    setSurveys(loadSurveys());
    setActions(loadActions());
    setLoading(false);
  }, []);

  // ── Derived stats ────────────────────────────────────────────────────────────

  const responded = surveys.filter((s) => s.status === 'Responded');
  const overallScore =
    responded.length > 0
      ? responded.reduce((sum, s) => sum + s.overallScore, 0) / responded.length
      : 0;
  const responseRate = surveys.length > 0 ? (responded.length / surveys.length) * 100 : 0;
  const promoters = surveys.filter((s) => s.isPromoter).length;
  const detractors = surveys.filter((s) => s.isDetractor).length;
  const nps =
    surveys.length > 0 ? Math.round(((promoters - detractors) / surveys.length) * 100) : 0;

  const categoryStats: Record<Category, { total: number; scoreSum: number; count: number }> = {
    'Product Quality': { total: 0, scoreSum: 0, count: 0 },
    Delivery: { total: 0, scoreSum: 0, count: 0 },
    'Customer Service': { total: 0, scoreSum: 0, count: 0 },
    Price: { total: 0, scoreSum: 0, count: 0 },
    Communication: { total: 0, scoreSum: 0, count: 0 } };
  surveys.forEach((s) => {
    categoryStats[s.category].total += 1;
    if (s.status === 'Responded') {
      categoryStats[s.category].scoreSum += s.overallScore;
      categoryStats[s.category].count += 1;
    }
  });
  const totalCategorySurveys = Object.values(categoryStats).reduce((sum, c) => sum + c.total, 0);

  // ── Filtered surveys ─────────────────────────────────────────────────────────

  const filteredSurveys = surveys
    .filter((s) => {
      if (filterCategory !== 'All' && s.category !== filterCategory) return false;
      if (filterStatus !== 'All' && s.status !== filterStatus) return false;
      if (s.overallScore < filterMinScore || s.overallScore > filterMaxScore) return false;
      return true;
    })
    .sort((a, b) => {
      const av = a[sortField] as string | number;
      const bv = b[sortField] as string | number;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const filteredActions = actions.filter((a) => {
    if (filterActionStatus !== 'All' && a.status !== filterActionStatus) return false;
    return true;
  });

  // ── Sort toggle ──────────────────────────────────────────────────────────────

  function toggleSort(field: keyof Survey) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  function SortIcon({ field }: { field: keyof Survey }) {
    if (sortField !== field) return <ChevronDown className="h-3 w-3 opacity-30" />;
    return sortDir === 'asc' ? (
      <ChevronUp className="h-3 w-3 text-brand-600" />
    ) : (
      <ChevronDown className="h-3 w-3 text-brand-600" />
    );
  }

  // ── Add survey ───────────────────────────────────────────────────────────────

  function handleAddSurvey() {
    const scores = [form.q1, form.q2, form.q3, form.q4, form.q5];
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const overall = Math.round(avg * 10) / 10;

    const newSurvey: Survey = {
      id: `CS-${new Date().getFullYear()}-${String(surveys.length + 1).padStart(3, '0')}`,
      customer: form.customer,
      email: form.email,
      date: new Date().toISOString().split('T')[0],
      overallScore: overall,
      status: 'Responded',
      category: form.category,
      isPromoter: overall >= 4,
      isDetractor: overall <= 2,
      responses: [
        {
          question: 'How satisfied are you with our product quality?',
          score: form.q1,
          comment: form.c1 || undefined },
        {
          question: 'How would you rate our delivery performance?',
          score: form.q2,
          comment: form.c2 || undefined },
        {
          question: 'How satisfied are you with our customer service?',
          score: form.q3,
          comment: form.c3 || undefined },
        { question: 'How do you rate our pricing?', score: form.q4, comment: form.c4 || undefined },
        {
          question: 'How would you rate our communication?',
          score: form.q5,
          comment: form.c5 || undefined },
      ] };

    const updated = [newSurvey, ...surveys];
    setSurveys(updated);
    saveSurveys(updated);
    setAddSurveyOpen(false);
    setForm({
      customer: '',
      email: '',
      category: 'Product Quality',
      q1: 3,
      q2: 3,
      q3: 3,
      q4: 3,
      q5: 3,
      c1: '',
      c2: '',
      c3: '',
      c4: '',
      c5: '' });
  }

  function handleViewSurvey(survey: Survey) {
    setSelectedSurvey(survey);
    setViewSurveyOpen(true);
  }

  function handleUpdateActionStatus(id: string, status: ActionStatus) {
    const updated = actions.map((a) => (a.id === id ? { ...a, status } : a));
    setActions(updated);
    saveActions(updated);
  }

  // ── NPS label ────────────────────────────────────────────────────────────────

  function npsLabel(score: number) {
    if (score >= 50) return { label: 'Excellent', cls: 'text-green-600 dark:text-green-400' };
    if (score >= 0) return { label: 'Good', cls: 'text-amber-600 dark:text-amber-400' };
    return { label: 'Needs Attention', cls: 'text-red-600 dark:text-red-400' };
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    );
  }

  const npsInfo = npsLabel(nps);

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <span>ISO 9001:2015</span>
              <span>·</span>
              <span>Clause 9.1.2</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Customer Satisfaction</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track, measure and analyse customer satisfaction in accordance with ISO 9001 §9.1.2
            </p>
          </div>
          <button
            onClick={() => setAddSurveyOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Survey
          </button>
        </div>

        {/* ── Summary Cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Overall Score */}
          <Card className="overflow-hidden">
            <CardContent className="pt-5 pb-4">
              <div className="flex flex-col items-center">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Overall Score
                </p>
                <ScoreGauge score={overallScore} />
                <p className={`text-xs font-medium mt-1 ${getScoreColor(overallScore)}`}>
                  {overallScore >= 4
                    ? 'Very Satisfied'
                    : overallScore >= 3
                      ? 'Satisfied'
                      : 'Unsatisfied'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Response Rate */}
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Response Rate
                </p>
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{responseRate.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {responded.length} of {surveys.length} responded
              </p>
              {/* Progress bar */}
              <div className="mt-3 h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${responseRate}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* NPS Score */}
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  NPS Score
                </p>
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className={`text-3xl font-bold ${npsInfo.cls}`}>
                {nps > 0 ? '+' : ''}
                {nps}
              </p>
              <p className={`text-xs font-medium mt-1 ${npsInfo.cls}`}>{npsInfo.label}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3 text-green-500" />
                  {promoters} promoters
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsDown className="h-3 w-3 text-red-500" />
                  {detractors} detractors
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Total Surveys */}
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Surveys
                </p>
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Send className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{surveys.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Surveys sent this period</p>
              <div className="mt-3 grid grid-cols-3 gap-1 text-xs text-center">
                <div className="bg-green-50 dark:bg-green-900/20 rounded p-1">
                  <p className="font-semibold text-green-700 dark:text-green-400">
                    {responded.length}
                  </p>
                  <p className="text-green-600 dark:text-green-500">Done</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded p-1">
                  <p className="font-semibold text-amber-700 dark:text-amber-400">
                    {surveys.filter((s) => s.status === 'Pending').length}
                  </p>
                  <p className="text-amber-600 dark:text-amber-500">Pend.</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-1">
                  <p className="font-semibold text-gray-700 dark:text-gray-300">
                    {surveys.filter((s) => s.status === 'No Response').length}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">None</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Satisfaction Trends (CSS-only bar chart) ─────────────────────── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-brand-600" />
              Monthly Satisfaction Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-52 pt-4">
              {MONTHLY_SCORES.map((d) => {
                const heightPct = (d.score / 5) * 100;
                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-1 group">
                    <div
                      className="relative w-full flex flex-col items-center justify-end"
                      style={{ height: '160px' }}
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {d.score.toFixed(1)}/5.0
                      </div>
                      {/* Bar */}
                      <div
                        className={`w-full rounded-t-sm transition-all duration-500 ${getBarColor(d.score)}`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{d.month}</span>
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-3 rounded-sm bg-green-500 inline-block" /> ≥4.0 Excellent
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-3 rounded-sm bg-amber-500 inline-block" /> ≥3.0 Good
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-3 rounded-sm bg-red-500 inline-block" /> &lt;3.0 Needs Work
              </span>
              <span className="ml-auto">Scale: 1–5</span>
            </div>
          </CardContent>
        </Card>

        {/* ── Two-column: Categories + Actions summary ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feedback Categories */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4 text-brand-600" />
                Feedback Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {CATEGORIES.map((cat) => {
                const stat = categoryStats[cat];
                const avg = stat.count > 0 ? stat.scoreSum / stat.count : 0;
                const pct =
                  totalCategorySurveys > 0 ? (stat.total / totalCategorySurveys) * 100 : 0;
                const dotColor = CATEGORY_COLORS[cat];
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
                        <span className="font-medium text-foreground">{cat}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{stat.total} surveys</span>
                        {stat.count > 0 && (
                          <span className={`font-semibold ${getScoreColor(avg)}`}>
                            avg {avg.toFixed(1)}/5
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Distribution bar */}
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${dotColor} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {/* Score bar */}
                    {stat.count > 0 && (
                      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getBarColor(avg)} transition-all duration-500 opacity-60`}
                          style={{ width: `${(avg / 5) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Donut-style summary */}
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {surveys.filter((s) => s.overallScore >= 4).length}
                  </p>
                  <p className="text-muted-foreground">Satisfied</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {surveys.filter((s) => s.overallScore === 3).length}
                  </p>
                  <p className="text-muted-foreground">Neutral</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {surveys.filter((s) => s.overallScore <= 2).length}
                  </p>
                  <p className="text-muted-foreground">Unsatisfied</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Items summary */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle className="h-4 w-4 text-brand-600" />
                  Improvement Actions
                </CardTitle>
                <select
                  value={filterActionStatus}
                  onChange={(e) => setFilterActionStatus(e.target.value as ActionStatus | 'All')}
                  className="text-xs border border-border rounded px-2 py-1 bg-background text-foreground"
                >
                  <option value="All">All Status</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 mb-4 text-center text-xs">
                {(['Open', 'In Progress', 'Completed'] as ActionStatus[]).map((s) => {
                  const count = actions.filter((a) => a.status === s).length;
                  const colors: Record<ActionStatus, string> = {
                    Open: 'text-red-600 dark:text-red-400',
                    'In Progress': 'text-blue-600 dark:text-blue-400',
                    Completed: 'text-green-600 dark:text-green-400' };
                  return (
                    <div key={s} className="bg-muted/50 rounded-lg p-2">
                      <p className={`text-xl font-bold ${colors[s]}`}>{count}</p>
                      <p className="text-muted-foreground">{s}</p>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {filteredActions.slice(0, 6).map((action) => (
                  <div
                    key={action.id}
                    className="flex items-start gap-3 p-2.5 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{action.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {action.owner} · Due {action.dueDate}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <PriorityBadge priority={action.priority} />
                      <ActionStatusBadge status={action.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Survey Results Table ─────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="h-4 w-4 text-amber-500" />
                Survey Results
              </CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                {/* Category filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as Category | 'All')}
                  className="text-xs border border-border rounded px-2 py-1.5 bg-background text-foreground"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {/* Status filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as ResponseStatus | 'All')}
                  className="text-xs border border-border rounded px-2 py-1.5 bg-background text-foreground"
                >
                  <option value="All">All Status</option>
                  <option value="Responded">Responded</option>
                  <option value="Pending">Pending</option>
                  <option value="No Response">No Response</option>
                </select>
                {/* Score range */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  Score
                  <select
                    value={filterMinScore}
                    onChange={(e) => setFilterMinScore(Number(e.target.value))}
                    className="border border-border rounded px-1.5 py-1.5 bg-background text-foreground text-xs"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  –
                  <select
                    value={filterMaxScore}
                    onChange={(e) => setFilterMaxScore(Number(e.target.value))}
                    className="border border-border rounded px-1.5 py-1.5 bg-background text-foreground text-xs"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {[
                      { label: 'Survey ID', field: 'id' as keyof Survey },
                      { label: 'Customer', field: 'customer' as keyof Survey },
                      { label: 'Date', field: 'date' as keyof Survey },
                      { label: 'Score', field: 'overallScore' as keyof Survey },
                      { label: 'Status', field: 'status' as keyof Survey },
                      { label: 'Category', field: 'category' as keyof Survey },
                    ].map(({ label, field }) => (
                      <th
                        key={field}
                        onClick={() => toggleSort(field)}
                        className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground select-none"
                      >
                        <span className="flex items-center gap-1">
                          {label}
                          <SortIcon field={field} />
                        </span>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSurveys.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-sm text-muted-foreground"
                      >
                        No surveys match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredSurveys.map((survey) => (
                      <tr key={survey.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {survey.id}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-foreground">{survey.customer}</p>
                            <p className="text-xs text-muted-foreground">{survey.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {new Date(survey.date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3">
                          {survey.status === 'No Response' ? (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Minus className="h-3 w-3" /> N/A
                            </span>
                          ) : (
                            <StarRating score={survey.overallScore} />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={survey.status} />
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-xs">
                            <span
                              className={`h-2 w-2 rounded-full ${CATEGORY_COLORS[survey.category]}`}
                            />
                            {survey.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleViewSurvey(survey)}
                            disabled={survey.responses.length === 0}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-border rounded hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
              Showing {filteredSurveys.length} of {surveys.length} surveys
            </div>
          </CardContent>
        </Card>

        {/* ── Full Action Items Table ───────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-4 w-4 text-brand-600" />
              All Improvement Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Due
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Update Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredActions.map((action) => (
                    <tr key={action.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {action.id}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{action.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">
                          {action.description}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{action.source}</td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={action.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <ActionStatusBadge status={action.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{action.owner}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{action.dueDate}</td>
                      <td className="px-4 py-3">
                        <select
                          value={action.status}
                          onChange={(e) =>
                            handleUpdateActionStatus(action.id, e.target.value as ActionStatus)
                          }
                          className="text-xs border border-border rounded px-2 py-1 bg-background text-foreground"
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Add Survey Modal ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={addSurveyOpen}
        onClose={() => setAddSurveyOpen(false)}
        title="Add Survey Response"
        size="xl"
      >
        <div className="space-y-5 mt-2">
          {/* Customer info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                value={form.customer}
                onChange={(e) => setForm((f) => ({ ...f, customer: e.target.value }))}
                placeholder="e.g. Acme Manufacturing Ltd"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="contact@customer.com"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Primary Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Questions */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Survey Questions (1–5)
            </p>
            {[
              {
                key: 'q1' as const,
                ck: 'c1' as const,
                label: 'How satisfied are you with our product quality?' },
              {
                key: 'q2' as const,
                ck: 'c2' as const,
                label: 'How would you rate our delivery performance?' },
              {
                key: 'q3' as const,
                ck: 'c3' as const,
                label: 'How satisfied are you with our customer service?' },
              { key: 'q4' as const, ck: 'c4' as const, label: 'How do you rate our pricing?' },
              {
                key: 'q5' as const,
                ck: 'c5' as const,
                label: 'How would you rate our communication?' },
            ].map(({ key, ck, label }) => (
              <div key={key} className="p-3 rounded-lg bg-muted/40 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-foreground flex-1">{label}</p>
                  <div className="flex items-center gap-1 shrink-0">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, [key]: n }))}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            n <= form[key]
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-1 text-xs font-medium text-muted-foreground w-6 text-right">
                      {form[key]}/5
                    </span>
                  </div>
                </div>
                <input
                  type="text"
                  value={form[ck]}
                  onChange={(e) => setForm((f) => ({ ...f, [ck]: e.target.value }))}
                  placeholder="Optional comment..."
                  className="w-full px-2 py-1.5 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setAddSurveyOpen(false)}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSurvey}
              disabled={!form.customer.trim()}
              className="px-4 py-2 text-sm bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save Survey
            </button>
          </div>
        </div>
      </Modal>

      {/* ── View Survey Modal ────────────────────────────────────────────────── */}
      <Modal
        isOpen={viewSurveyOpen}
        onClose={() => setViewSurveyOpen(false)}
        title={selectedSurvey ? `Survey Results — ${selectedSurvey.id}` : 'Survey Results'}
        size="lg"
      >
        {selectedSurvey && (
          <div className="space-y-4 mt-2">
            {/* Customer header */}
            <div className="p-3 rounded-lg bg-muted/40 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-semibold text-foreground">{selectedSurvey.customer}</p>
                <p className="text-xs text-muted-foreground">{selectedSurvey.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={selectedSurvey.status} />
                <span className="text-xs text-muted-foreground">{selectedSurvey.date}</span>
              </div>
            </div>

            {/* Overall score */}
            <div className="flex items-center gap-4 p-3 rounded-lg border border-border">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Overall Score
                </p>
                <StarRating score={selectedSurvey.overallScore} />
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Category
                </p>
                <span className="flex items-center gap-1.5 text-sm">
                  <span
                    className={`h-2 w-2 rounded-full ${CATEGORY_COLORS[selectedSurvey.category]}`}
                  />
                  {selectedSurvey.category}
                </span>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  NPS Type
                </p>
                <span
                  className={`text-sm font-medium ${
                    selectedSurvey.isPromoter
                      ? 'text-green-600 dark:text-green-400'
                      : selectedSurvey.isDetractor
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {selectedSurvey.isPromoter
                    ? 'Promoter'
                    : selectedSurvey.isDetractor
                      ? 'Detractor'
                      : 'Passive'}
                </span>
              </div>
            </div>

            {/* Individual responses */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Individual Responses
              </p>
              {selectedSurvey.responses.map((r, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm text-foreground flex-1">{r.question}</p>
                    <StarRating score={r.score} />
                  </div>
                  {r.comment && (
                    <p className="mt-2 text-xs text-muted-foreground italic border-l-2 border-brand-300 dark:border-brand-700 pl-2">
                      "{r.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewSurveyOpen(false)}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
