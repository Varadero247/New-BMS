'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  Globe,
  DollarSign,
  Users,
  Cpu,
  Scale,
  Leaf,
  Plus,
  X,
  Download,
  Save,
  ChevronDown,
  ChevronUp,
  Clock,
  BarChart2,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────

type ImpactLevel = 'HIGH' | 'MEDIUM' | 'LOW';
type Trend = 'INCREASING' | 'STABLE' | 'DECREASING';

interface SwotItem {
  id: string;
  text: string;
  impact: ImpactLevel;
  dateAdded: string;
}

type SwotKey = 'strengths' | 'weaknesses' | 'opportunities' | 'threats';

interface SwotData {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
  lastUpdated: string;
}

interface PestleSection {
  description: string;
  impact: ImpactLevel;
  trend: Trend;
  factors: string[];
}

type PestleKey = 'political' | 'economic' | 'social' | 'technological' | 'legal' | 'environmental';

interface PestleData {
  political: PestleSection;
  economic: PestleSection;
  social: PestleSection;
  technological: PestleSection;
  legal: PestleSection;
  environmental: PestleSection;
  lastUpdated: string;
}

// ─── Storage Keys ──────────────────────────────────────────────────────────

const SWOT_KEY = 'ims_quality_swot';
const PESTLE_KEY = 'ims_quality_pestle';

// ─── Default Data ──────────────────────────────────────────────────────────

const defaultSwot: SwotData = {
  strengths: [],
  weaknesses: [],
  opportunities: [],
  threats: [],
  lastUpdated: new Date().toISOString(),
};

const defaultPestleSection = (description: string): PestleSection => ({
  description,
  impact: 'MEDIUM',
  trend: 'STABLE',
  factors: [],
});

const defaultPestle: PestleData = {
  political: defaultPestleSection('Assess political factors affecting the organisation.'),
  economic: defaultPestleSection('Assess economic conditions impacting the QMS.'),
  social: defaultPestleSection('Assess social and demographic factors.'),
  technological: defaultPestleSection('Assess technological trends and disruptions.'),
  legal: defaultPestleSection('Assess legal and regulatory requirements.'),
  environmental: defaultPestleSection('Assess environmental considerations.'),
  lastUpdated: new Date().toISOString(),
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

// ─── Impact Badge ──────────────────────────────────────────────────────────

const impactColors: Record<ImpactLevel, string> = {
  HIGH: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  LOW: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
};

function ImpactBadge({ level }: { level: ImpactLevel }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${impactColors[level]}`}>
      {level}
    </span>
  );
}

// ─── Trend Badge ───────────────────────────────────────────────────────────

const trendIcons: Record<Trend, React.ReactNode> = {
  INCREASING: <TrendingUp className="h-3 w-3" />,
  STABLE: <BarChart2 className="h-3 w-3" />,
  DECREASING: <TrendingDown className="h-3 w-3" />,
};

const trendColors: Record<Trend, string> = {
  INCREASING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  STABLE: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  DECREASING: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
};

function TrendBadge({ trend }: { trend: Trend }) {
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${trendColors[trend]}`}>
      {trendIcons[trend]}
      {trend}
    </span>
  );
}

// ─── SWOT Quadrant ─────────────────────────────────────────────────────────

interface QuadrantConfig {
  key: SwotKey;
  label: string;
  icon: React.ReactNode;
  bg: string;
  border: string;
  titleColor: string;
  addBtnColor: string;
}

const quadrants: QuadrantConfig[] = [
  {
    key: 'strengths',
    label: 'Strengths',
    icon: <TrendingUp className="h-4 w-4" />,
    bg: 'bg-green-50 dark:bg-green-900/10',
    border: 'border-green-200 dark:border-green-800',
    titleColor: 'text-green-800 dark:text-green-300',
    addBtnColor: 'text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/20',
  },
  {
    key: 'weaknesses',
    label: 'Weaknesses',
    icon: <TrendingDown className="h-4 w-4" />,
    bg: 'bg-red-50 dark:bg-red-900/10',
    border: 'border-red-200 dark:border-red-800',
    titleColor: 'text-red-800 dark:text-red-300',
    addBtnColor: 'text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/20',
  },
  {
    key: 'opportunities',
    label: 'Opportunities',
    icon: <Zap className="h-4 w-4" />,
    bg: 'bg-blue-50 dark:bg-blue-900/10',
    border: 'border-blue-200 dark:border-blue-800',
    titleColor: 'text-blue-800 dark:text-blue-300',
    addBtnColor: 'text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/20',
  },
  {
    key: 'threats',
    label: 'Threats',
    icon: <AlertTriangle className="h-4 w-4" />,
    bg: 'bg-amber-50 dark:bg-amber-900/10',
    border: 'border-amber-200 dark:border-amber-800',
    titleColor: 'text-amber-800 dark:text-amber-300',
    addBtnColor: 'text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/20',
  },
];

interface SwotQuadrantProps {
  config: QuadrantConfig;
  items: SwotItem[];
  onAdd: (key: SwotKey) => void;
  onDelete: (key: SwotKey, id: string) => void;
  onChangeImpact: (key: SwotKey, id: string, impact: ImpactLevel) => void;
  onChangeText: (key: SwotKey, id: string, text: string) => void;
}

function SwotQuadrant({ config, items, onAdd, onDelete, onChangeImpact, onChangeText }: SwotQuadrantProps) {
  return (
    <div className={`rounded-xl border-2 p-4 flex flex-col gap-3 min-h-[260px] ${config.bg} ${config.border}`}>
      {/* Header */}
      <div className={`flex items-center gap-2 font-semibold text-base ${config.titleColor}`}>
        {config.icon}
        <span>{config.label}</span>
        <span className="ml-auto text-xs font-normal opacity-60">{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Items */}
      <div className="flex-1 space-y-2">
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground italic py-2">No items yet. Click "+ Add" to begin.</p>
        )}
        {items.map((item) => (
          <div key={item.id} className="group bg-card border border-border rounded-lg p-2.5 shadow-sm">
            <div className="flex items-start gap-2">
              <textarea
                className="flex-1 text-sm bg-transparent text-foreground resize-none outline-none leading-snug min-h-[40px]"
                value={item.text}
                onChange={(e) => onChangeText(config.key, item.id, e.target.value)}
                placeholder="Describe this item..."
                rows={2}
              />
              <button
                onClick={() => onDelete(config.key, item.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-opacity mt-0.5 shrink-0"
                aria-label="Remove item"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <select
                value={item.impact}
                onChange={(e) => onChangeImpact(config.key, item.id, e.target.value as ImpactLevel)}
                className="text-xs bg-transparent border border-border rounded px-1 py-0.5 text-foreground cursor-pointer"
              >
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(item.dateAdded).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add button */}
      <button
        onClick={() => onAdd(config.key)}
        className={`flex items-center gap-1 text-xs font-medium px-2 py-1.5 rounded-lg transition-colors ${config.addBtnColor}`}
      >
        <Plus className="h-3.5 w-3.5" />
        Add
      </button>
    </div>
  );
}

// ─── PESTLE Section Config ─────────────────────────────────────────────────

interface PestleSectionConfig {
  key: PestleKey;
  label: string;
  icon: React.ReactNode;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  description: string;
}

const pestleSections: PestleSectionConfig[] = [
  {
    key: 'political',
    label: 'Political',
    icon: <Globe className="h-4 w-4" />,
    accentBg: 'bg-purple-50 dark:bg-purple-900/10',
    accentBorder: 'border-purple-200 dark:border-purple-800',
    accentText: 'text-purple-800 dark:text-purple-300',
    description: 'Government policies, political stability, trade regulations, tax policies, labour laws.',
  },
  {
    key: 'economic',
    label: 'Economic',
    icon: <DollarSign className="h-4 w-4" />,
    accentBg: 'bg-green-50 dark:bg-green-900/10',
    accentBorder: 'border-green-200 dark:border-green-800',
    accentText: 'text-green-800 dark:text-green-300',
    description: 'Economic growth, inflation, interest rates, exchange rates, consumer confidence.',
  },
  {
    key: 'social',
    label: 'Social',
    icon: <Users className="h-4 w-4" />,
    accentBg: 'bg-blue-50 dark:bg-blue-900/10',
    accentBorder: 'border-blue-200 dark:border-blue-800',
    accentText: 'text-blue-800 dark:text-blue-300',
    description: 'Demographics, lifestyle trends, cultural attitudes, workforce availability, social norms.',
  },
  {
    key: 'technological',
    label: 'Technological',
    icon: <Cpu className="h-4 w-4" />,
    accentBg: 'bg-orange-50 dark:bg-orange-900/10',
    accentBorder: 'border-orange-200 dark:border-orange-800',
    accentText: 'text-orange-800 dark:text-orange-300',
    description: 'Emerging technologies, R&D, automation, digitalisation, cybersecurity, AI/ML.',
  },
  {
    key: 'legal',
    label: 'Legal',
    icon: <Scale className="h-4 w-4" />,
    accentBg: 'bg-red-50 dark:bg-red-900/10',
    accentBorder: 'border-red-200 dark:border-red-800',
    accentText: 'text-red-800 dark:text-red-300',
    description: 'Legislation, standards, compliance requirements, intellectual property, health & safety law.',
  },
  {
    key: 'environmental',
    label: 'Environmental',
    icon: <Leaf className="h-4 w-4" />,
    accentBg: 'bg-teal-50 dark:bg-teal-900/10',
    accentBorder: 'border-teal-200 dark:border-teal-800',
    accentText: 'text-teal-800 dark:text-teal-300',
    description: 'Climate change, sustainability, environmental regulations, waste management, carbon footprint.',
  },
];

// ─── PESTLE Panel ──────────────────────────────────────────────────────────

interface PestlePanelProps {
  config: PestleSectionConfig;
  data: PestleSection;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (key: PestleKey, updated: Partial<PestleSection>) => void;
  onAddFactor: (key: PestleKey) => void;
  onRemoveFactor: (key: PestleKey, index: number) => void;
  onChangeFactor: (key: PestleKey, index: number, value: string) => void;
}

function PestlePanel({
  config,
  data,
  isOpen,
  onToggle,
  onChange,
  onAddFactor,
  onRemoveFactor,
  onChangeFactor,
}: PestlePanelProps) {
  return (
    <div className={`rounded-xl border-2 overflow-hidden ${config.accentBorder}`}>
      {/* Header / Toggle */}
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 ${config.accentBg} transition-colors`}
      >
        <div className={`flex items-center gap-2 font-semibold ${config.accentText}`}>
          {config.icon}
          <span>{config.label}</span>
          <ImpactBadge level={data.impact} />
          <TrendBadge trend={data.trend} />
          <span className="font-normal text-xs text-muted-foreground ml-1">
            {data.factors.length} factor{data.factors.length !== 1 ? 's' : ''}
          </span>
        </div>
        <span className={config.accentText}>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {/* Body */}
      {isOpen && (
        <div className="p-4 bg-card space-y-4">
          {/* Helper text */}
          <p className="text-xs text-muted-foreground italic">{config.description}</p>

          {/* Description textarea */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Description / Notes</label>
            <textarea
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-card text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
              rows={3}
              value={data.description}
              onChange={(e) => onChange(config.key, { description: e.target.value })}
              placeholder="Describe the relevant factors and their context..."
            />
          </div>

          {/* Impact + Trend */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-foreground mb-1">Impact Rating</label>
              <select
                value={data.impact}
                onChange={(e) => onChange(config.key, { impact: e.target.value as ImpactLevel })}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-foreground mb-1">Trend</label>
              <select
                value={data.trend}
                onChange={(e) => onChange(config.key, { trend: e.target.value as Trend })}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="INCREASING">INCREASING</option>
                <option value="STABLE">STABLE</option>
                <option value="DECREASING">DECREASING</option>
              </select>
            </div>
          </div>

          {/* Specific factors */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-2">Specific Factors</label>
            <div className="space-y-2">
              {data.factors.length === 0 && (
                <p className="text-xs text-muted-foreground italic">No specific factors listed yet.</p>
              )}
              {data.factors.map((factor, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={factor}
                    onChange={(e) => onChangeFactor(config.key, idx, e.target.value)}
                    placeholder={`Factor ${idx + 1}...`}
                    className="flex-1 text-sm border border-border rounded-lg px-3 py-1.5 bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    onClick={() => onRemoveFactor(config.key, idx)}
                    className="text-muted-foreground hover:text-red-500 transition-colors"
                    aria-label="Remove factor"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => onAddFactor(config.key)}
              className={`mt-2 flex items-center gap-1 text-xs font-medium px-2 py-1.5 rounded-lg transition-colors ${config.accentText} hover:opacity-80`}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Factor
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

type Tab = 'swot' | 'pestle';

export default function ContextPage() {
  const [activeTab, setActiveTab] = useState<Tab>('swot');
  const [swot, setSwot] = useState<SwotData>(defaultSwot);
  const [pestle, setPestle] = useState<PestleData>(defaultPestle);
  const [openSections, setOpenSections] = useState<Record<PestleKey, boolean>>({
    political: true,
    economic: false,
    social: false,
    technological: false,
    legal: false,
    environmental: false,
  });
  const [saved, setSaved] = useState(false);

  // ── Load from localStorage ────────────────────────────────────────────
  useEffect(() => {
    try {
      const storedSwot = localStorage.getItem(SWOT_KEY);
      if (storedSwot) setSwot(JSON.parse(storedSwot));
      const storedPestle = localStorage.getItem(PESTLE_KEY);
      if (storedPestle) setPestle(JSON.parse(storedPestle));
    } catch {
      // ignore parse errors
    }
  }, []);

  // ── Save to localStorage ──────────────────────────────────────────────
  const handleSave = useCallback(() => {
    const now = new Date().toISOString();
    const updatedSwot = { ...swot, lastUpdated: now };
    const updatedPestle = { ...pestle, lastUpdated: now };
    localStorage.setItem(SWOT_KEY, JSON.stringify(updatedSwot));
    localStorage.setItem(PESTLE_KEY, JSON.stringify(updatedPestle));
    setSwot(updatedSwot);
    setPestle(updatedPestle);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [swot, pestle]);

  // ── Export ────────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const lines: string[] = [];
    lines.push('ISO 9001:2015 — Clause 4.1 Context of the Organisation');
    lines.push(`Exported: ${new Date().toLocaleString()}`);
    lines.push('');

    lines.push('=== SWOT ANALYSIS ===');
    lines.push('');
    for (const q of quadrants) {
      lines.push(`${q.label.toUpperCase()}:`);
      const items = swot[q.key];
      if (items.length === 0) {
        lines.push('  (none)');
      } else {
        items.forEach((item) => {
          lines.push(`  [${item.impact}] ${item.text}`);
        });
      }
      lines.push('');
    }

    lines.push('=== PESTLE ANALYSIS ===');
    lines.push('');
    for (const s of pestleSections) {
      const d = pestle[s.key];
      lines.push(`${s.label.toUpperCase()} — Impact: ${d.impact} | Trend: ${d.trend}`);
      lines.push(`  ${d.description}`);
      if (d.factors.length > 0) {
        lines.push('  Factors:');
        d.factors.forEach((f) => lines.push(`    • ${f}`));
      }
      lines.push('');
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `context-analysis-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [swot, pestle]);

  // ── SWOT handlers ─────────────────────────────────────────────────────
  const addSwotItem = useCallback((key: SwotKey) => {
    setSwot((prev) => ({
      ...prev,
      [key]: [
        ...prev[key],
        { id: newId(), text: '', impact: 'MEDIUM', dateAdded: new Date().toISOString() },
      ],
    }));
  }, []);

  const deleteSwotItem = useCallback((key: SwotKey, id: string) => {
    setSwot((prev) => ({ ...prev, [key]: prev[key].filter((i) => i.id !== id) }));
  }, []);

  const changeSwotImpact = useCallback((key: SwotKey, id: string, impact: ImpactLevel) => {
    setSwot((prev) => ({
      ...prev,
      [key]: prev[key].map((i) => (i.id === id ? { ...i, impact } : i)),
    }));
  }, []);

  const changeSwotText = useCallback((key: SwotKey, id: string, text: string) => {
    setSwot((prev) => ({
      ...prev,
      [key]: prev[key].map((i) => (i.id === id ? { ...i, text } : i)),
    }));
  }, []);

  // ── PESTLE handlers ───────────────────────────────────────────────────
  const toggleSection = useCallback((key: PestleKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const changePestle = useCallback((key: PestleKey, updated: Partial<PestleSection>) => {
    setPestle((prev) => ({ ...prev, [key]: { ...prev[key], ...updated } }));
  }, []);

  const addFactor = useCallback((key: PestleKey) => {
    setPestle((prev) => ({
      ...prev,
      [key]: { ...prev[key], factors: [...prev[key].factors, ''] },
    }));
  }, []);

  const removeFactor = useCallback((key: PestleKey, index: number) => {
    setPestle((prev) => ({
      ...prev,
      [key]: { ...prev[key], factors: prev[key].factors.filter((_, i) => i !== index) },
    }));
  }, []);

  const changeFactor = useCallback((key: PestleKey, index: number, value: string) => {
    setPestle((prev) => {
      const updated = [...prev[key].factors];
      updated[index] = value;
      return { ...prev, [key]: { ...prev[key], factors: updated } };
    });
  }, []);

  // ── Derived stats ─────────────────────────────────────────────────────
  const totalSwotItems =
    swot.strengths.length + swot.weaknesses.length + swot.opportunities.length + swot.threats.length;
  const totalPestleFactors = pestleSections.reduce((acc, s) => acc + pestle[s.key].factors.length, 0);
  const highImpactCount = [
    ...swot.strengths,
    ...swot.weaknesses,
    ...swot.opportunities,
    ...swot.threats,
  ].filter((i) => i.impact === 'HIGH').length;
  const lastUpdated = activeTab === 'swot' ? swot.lastUpdated : pestle.lastUpdated;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Context of the Organisation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ISO 9001:2015 &mdash; Clause 4.1 &mdash; SWOT &amp; PESTLE Analysis
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSave}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              saved
                ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700'
                : 'bg-card border-border text-foreground hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Save className="h-4 w-4" />
            {saved ? 'Saved!' : 'Save'}
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-600">{totalSwotItems}</div>
          <div className="text-sm text-muted-foreground">SWOT Items</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-red-600">{highImpactCount}</div>
          <div className="text-sm text-muted-foreground">High Impact</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-purple-600">{totalPestleFactors}</div>
          <div className="text-sm text-muted-foreground">PESTLE Factors</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
            <Clock className="h-3 w-3" />
            Last Updated
          </div>
          <div className="text-sm font-medium text-foreground leading-tight">
            {formatDate(lastUpdated)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('swot')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'swot'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-card border border-border text-foreground hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          SWOT Analysis
        </button>
        <button
          onClick={() => setActiveTab('pestle')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'pestle'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-card border border-border text-foreground hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          PESTLE Analysis
        </button>
      </div>

      {/* SWOT Tab */}
      {activeTab === 'swot' && (
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground bg-card border border-border rounded-lg px-4 py-2">
            <span className="font-medium text-foreground">Impact:</span>
            <ImpactBadge level="HIGH" />
            <ImpactBadge level="MEDIUM" />
            <ImpactBadge level="LOW" />
            <span className="ml-4 italic">Click on item text to edit inline. Hover to reveal delete button.</span>
          </div>

          {/* 2×2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quadrants.map((q) => (
              <SwotQuadrant
                key={q.key}
                config={q}
                items={swot[q.key]}
                onAdd={addSwotItem}
                onDelete={deleteSwotItem}
                onChangeImpact={changeSwotImpact}
                onChangeText={changeSwotText}
              />
            ))}
          </div>
        </div>
      )}

      {/* PESTLE Tab */}
      {activeTab === 'pestle' && (
        <div className="space-y-3">
          {/* Legend */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground bg-card border border-border rounded-lg px-4 py-2">
            <span className="font-medium text-foreground">Trend:</span>
            <TrendBadge trend="INCREASING" />
            <TrendBadge trend="STABLE" />
            <TrendBadge trend="DECREASING" />
            <span className="ml-4 italic">Click the section header to expand / collapse.</span>
          </div>

          {/* Accordion panels */}
          {pestleSections.map((s) => (
            <PestlePanel
              key={s.key}
              config={s}
              data={pestle[s.key]}
              isOpen={openSections[s.key]}
              onToggle={() => toggleSection(s.key)}
              onChange={changePestle}
              onAddFactor={addFactor}
              onRemoveFactor={removeFactor}
              onChangeFactor={changeFactor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
