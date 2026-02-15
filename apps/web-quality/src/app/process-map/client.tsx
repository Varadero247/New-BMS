'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card, CardContent,
  Button, Modal, ModalFooter,
  Input, Label, Select,
} from '@ims/ui';
import {
  Plus, Workflow, Search, Trash2, Pencil,
  LayoutGrid, List, X, ChevronRight,
  Settings2, Target, Layers,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Process {
  id: string;
  name: string;
  owner: string;
  category: 'CORE' | 'SUPPORT' | 'MANAGEMENT';
  status: 'ACTIVE' | 'DRAFT' | 'UNDER_REVIEW';
  inputs: string[];
  outputs: string[];
  equipment: string[];
  competence: string[];
  procedures: string[];
  kpis: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'CORE', label: 'Core' },
  { value: 'SUPPORT', label: 'Support' },
  { value: 'MANAGEMENT', label: 'Management' },
] as const;

const STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
] as const;

const CATEGORY_STYLES: Record<string, string> = {
  CORE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  SUPPORT: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  MANAGEMENT: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
};

const SAMPLE_PROCESSES: Process[] = [
  {
    id: 'proc-1',
    name: 'Product Realisation',
    owner: 'Operations Manager',
    category: 'CORE',
    status: 'ACTIVE',
    inputs: ['Customer requirements', 'Design specifications', 'Raw materials'],
    outputs: ['Finished products', 'Delivery records', 'Quality records'],
    equipment: ['CNC machines', 'Assembly line', 'Test equipment'],
    competence: ['Engineering degree', 'ISO 9001 awareness', 'Safety training'],
    procedures: ['QP-001 Production Control', 'QP-005 Inspection', 'WI-102 Assembly'],
    kpis: ['On-time delivery ≥ 95%', 'Defect rate < 0.5%', 'First pass yield ≥ 98%'],
  },
  {
    id: 'proc-2',
    name: 'Internal Audit',
    owner: 'Quality Manager',
    category: 'MANAGEMENT',
    status: 'ACTIVE',
    inputs: ['Audit schedule', 'Relevant standards', 'Previous audit results'],
    outputs: ['Audit report', 'Non-conformances', 'Improvement opportunities'],
    equipment: ['Audit management software', 'Checklists'],
    competence: ['Internal auditor certification', 'ISO 9001 knowledge'],
    procedures: ['QP-010 Internal Audit', 'ISO 9001:2015 §9.2'],
    kpis: ['Audit schedule adherence ≥ 90%', 'NCR closure within 30 days'],
  },
  {
    id: 'proc-3',
    name: 'Supplier Management',
    owner: 'Procurement Manager',
    category: 'SUPPORT',
    status: 'ACTIVE',
    inputs: ['Purchase requirements', 'Supplier list', 'Evaluation criteria'],
    outputs: ['Approved suppliers', 'Purchase orders', 'Supplier scorecard'],
    equipment: ['ERP system', 'Supplier portal'],
    competence: ['Procurement qualification', 'Negotiation skills'],
    procedures: ['QP-020 Supplier Evaluation', 'QP-021 Purchasing Control'],
    kpis: ['Supplier on-time delivery ≥ 92%', 'Approved supplier ratio ≥ 85%'],
  },
];

const STORAGE_KEY = 'ims_quality_process_map';

const emptyForm = (): Omit<Process, 'id'> => ({
  name: '',
  owner: '',
  category: 'CORE',
  status: 'DRAFT',
  inputs: [],
  outputs: [],
  equipment: [],
  competence: [],
  procedures: [],
  kpis: [],
});

// ─── Turtle Diagram Box ───────────────────────────────────────────────────────

interface TurtleBoxProps {
  title: string;
  subtitle: string;
  items: string[];
  colorClass: string;
  borderClass: string;
  titleColorClass: string;
  onUpdate: (items: string[]) => void;
}

function TurtleBox({
  title,
  subtitle,
  items,
  colorClass,
  borderClass,
  titleColorClass,
  onUpdate,
}: TurtleBoxProps) {
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    onUpdate([...items, trimmed]);
    setNewItem('');
  };

  const removeItem = (idx: number) => {
    onUpdate(items.filter((_, i) => i !== idx));
  };

  return (
    <div className={`rounded-xl border-2 p-4 ${colorClass} ${borderClass} flex flex-col gap-2 min-h-[140px]`}>
      <div>
        <p className={`text-xs font-bold uppercase tracking-wider ${titleColorClass}`}>{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <ul className="flex flex-col gap-1 flex-1">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="flex items-start justify-between gap-1 text-xs text-foreground group"
          >
            <span className="flex items-start gap-1">
              <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 opacity-50" />
              {item}
            </span>
            <button
              type="button"
              onClick={() => removeItem(idx)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 shrink-0 mt-0.5"
              aria-label={`Remove ${item}`}
            >
              <X className="h-3 w-3" />
            </button>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-xs text-muted-foreground italic">No items yet</li>
        )}
      </ul>
      <div className="flex gap-1 mt-1">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }}
          placeholder="Add item..."
          className="flex-1 text-xs px-2 py-1 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <button
          type="button"
          onClick={addItem}
          className="text-xs px-2 py-1 rounded-md bg-brand-600 text-white hover:bg-brand-700 transition-colors"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProcessMapClient() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [view, setView] = useState<'list' | 'turtle'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Process, 'id'>>(emptyForm());

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProcesses(JSON.parse(stored));
      } else {
        setProcesses(SAMPLE_PROCESSES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_PROCESSES));
      }
    } catch {
      setProcesses(SAMPLE_PROCESSES);
    }
  }, []);

  const persist = useCallback((next: Process[]) => {
    setProcesses(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* empty */ }
  }, []);

  // Filtered list
  const filtered = processes.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.owner.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCategory || p.category === filterCategory;
    const matchStatus = !filterStatus || p.status === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  const selectedProcess = processes.find((p) => p.id === selectedId) ?? processes[0] ?? null;

  // Modal helpers
  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (p: Process) => {
    setEditingId(p.id);
    setForm({ name: p.name, owner: p.owner, category: p.category, status: p.status, inputs: [...p.inputs], outputs: [...p.outputs], equipment: [...p.equipment], competence: [...p.competence], procedures: [...p.procedures], kpis: [...p.kpis] });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.owner.trim()) return;
    if (editingId) {
      persist(processes.map((p) => p.id === editingId ? { ...form, id: editingId } : p));
    } else {
      const newProc: Process = { ...form, id: `proc-${Date.now()}` };
      persist([...processes, newProc]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this process?')) return;
    const next = processes.filter((p) => p.id !== id);
    persist(next);
    if (selectedId === id) setSelectedId(null);
  };

  // Update turtle diagram items for selected process
  const updateTurtleField = (field: keyof Omit<Process, 'id' | 'name' | 'owner' | 'category' | 'status'>, items: string[]) => {
    if (!selectedProcess) return;
    const updated = processes.map((p) =>
      p.id === selectedProcess.id ? { ...p, [field]: items } : p
    );
    persist(updated);
  };

  // Stats
  const stats = {
    total: processes.length,
    active: processes.filter((p) => p.status === 'ACTIVE').length,
    core: processes.filter((p) => p.category === 'CORE').length,
    support: processes.filter((p) => p.category === 'SUPPORT').length,
    management: processes.filter((p) => p.category === 'MANAGEMENT').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Process Map</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ISO 9001:2015 §4.4 — Process Approach &amp; Turtle Diagrams
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${view === 'list' ? 'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <List className="h-4 w-4" /> List
            </button>
            <button
              type="button"
              onClick={() => setView('turtle')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${view === 'turtle' ? 'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <LayoutGrid className="h-4 w-4" /> Turtle
            </button>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Add Process
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Workflow, bg: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600 dark:text-blue-400' },
          { label: 'Active', value: stats.active, icon: Target, bg: 'bg-green-50 dark:bg-green-900/20', iconColor: 'text-green-600 dark:text-green-400' },
          { label: 'Core', value: stats.core, icon: Layers, bg: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600 dark:text-blue-400' },
          { label: 'Support', value: stats.support, icon: Settings2, bg: 'bg-green-50 dark:bg-green-900/20', iconColor: 'text-green-600 dark:text-green-400' },
          { label: 'Management', value: stats.management, icon: Workflow, bg: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-600 dark:text-purple-400' },
        ].map(({ label, value, icon: Icon, bg, iconColor }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${bg}`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ─── LIST VIEW ─────────────────────────────────────────────────────────── */}
      {view === 'list' && (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search processes or owner..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                  <option value="">All Categories</option>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </Select>
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="">All Statuses</option>
                  {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                {filtered.length === 0 ? (
                  <div className="p-12 text-center">
                    <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Processes Found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {processes.length === 0 ? 'Add your first process to get started.' : 'Try adjusting your filters.'}
                    </p>
                    {processes.length === 0 && (
                      <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Process</Button>
                    )}
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="text-left p-3 font-semibold text-foreground">Process Name</th>
                        <th className="text-left p-3 font-semibold text-foreground">Owner</th>
                        <th className="text-left p-3 font-semibold text-foreground">Category</th>
                        <th className="text-left p-3 font-semibold text-foreground">Status</th>
                        <th className="text-left p-3 font-semibold text-foreground hidden lg:table-cell">Inputs</th>
                        <th className="text-left p-3 font-semibold text-foreground hidden lg:table-cell">Outputs</th>
                        <th className="text-left p-3 font-semibold text-foreground hidden xl:table-cell">KPIs</th>
                        <th className="text-right p-3 font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filtered.map((p) => (
                        <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3 font-medium text-foreground">{p.name}</td>
                          <td className="p-3 text-muted-foreground">{p.owner}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_STYLES[p.category]}`}>
                              {CATEGORIES.find((c) => c.value === p.category)?.label}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[p.status]}`}>
                              {STATUSES.find((s) => s.value === p.status)?.label}
                            </span>
                          </td>
                          <td className="p-3 hidden lg:table-cell">
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {p.inputs.slice(0, 2).join(', ')}{p.inputs.length > 2 ? ` +${p.inputs.length - 2}` : ''}
                            </span>
                          </td>
                          <td className="p-3 hidden lg:table-cell">
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {p.outputs.slice(0, 2).join(', ')}{p.outputs.length > 2 ? ` +${p.outputs.length - 2}` : ''}
                            </span>
                          </td>
                          <td className="p-3 hidden xl:table-cell">
                            <span className="text-xs text-muted-foreground">{p.kpis.length} KPI{p.kpis.length !== 1 ? 's' : ''}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => { setSelectedId(p.id); setView('turtle'); }}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                                title="View Turtle Diagram"
                              >
                                <LayoutGrid className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openEdit(p)}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(p.id)}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ─── TURTLE DIAGRAM VIEW ──────────────────────────────────────────────── */}
      {view === 'turtle' && (
        <>
          {/* Process selector */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3 items-center">
                <Label className="text-sm font-medium text-foreground shrink-0">Select Process:</Label>
                <Select
                  value={selectedProcess?.id ?? ''}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="flex-1 min-w-[200px]"
                >
                  {processes.length === 0 && <option value="">No processes — add one first</option>}
                  {processes.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Select>
                {selectedProcess && (
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_STYLES[selectedProcess.category]}`}>
                      {CATEGORIES.find((c) => c.value === selectedProcess.category)?.label}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[selectedProcess.status]}`}>
                      {STATUSES.find((s) => s.value === selectedProcess.status)?.label}
                    </span>
                    <span className="text-xs text-muted-foreground">Owner: {selectedProcess.owner}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedProcess ? (
            <div className="space-y-4">
              {/* Turtle Diagram Layout */}
              {/*
                  Layout (7-cell grid):
                  [equipment]  [process center]  [competence]
                  [inputs]     [process center]  [outputs]
                  [procedures] [process center]  [kpis]
              */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
                {/* Left column */}
                <div className="grid grid-rows-3 gap-4">
                  {/* Equipment (top-left) */}
                  <TurtleBox
                    title="With What?"
                    subtitle="Equipment &amp; Infrastructure"
                    items={selectedProcess.equipment}
                    colorClass="bg-blue-50 dark:bg-blue-950/30"
                    borderClass="border-blue-200 dark:border-blue-800"
                    titleColorClass="text-blue-700 dark:text-blue-300"
                    onUpdate={(items) => updateTurtleField('equipment', items)}
                  />
                  {/* Inputs (middle-left) */}
                  <TurtleBox
                    title="Inputs"
                    subtitle="Materials &amp; Information"
                    items={selectedProcess.inputs}
                    colorClass="bg-amber-50 dark:bg-amber-950/30"
                    borderClass="border-amber-200 dark:border-amber-800"
                    titleColorClass="text-amber-700 dark:text-amber-300"
                    onUpdate={(items) => updateTurtleField('inputs', items)}
                  />
                  {/* Procedures (bottom-left) */}
                  <TurtleBox
                    title="How?"
                    subtitle="Procedures &amp; Methods"
                    items={selectedProcess.procedures}
                    colorClass="bg-orange-50 dark:bg-orange-950/30"
                    borderClass="border-orange-200 dark:border-orange-800"
                    titleColorClass="text-orange-700 dark:text-orange-300"
                    onUpdate={(items) => updateTurtleField('procedures', items)}
                  />
                </div>

                {/* Center: Process box */}
                <div className="flex items-center justify-center">
                  <div className="w-48 lg:w-52 h-full flex flex-col">
                    <div className="flex-1 flex items-center justify-center rounded-2xl border-2 border-brand-300 dark:border-brand-600 bg-brand-50 dark:bg-brand-900/20 p-6 shadow-sm">
                      <div className="text-center">
                        <div className="h-10 w-10 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Workflow className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-sm font-bold text-brand-900 dark:text-brand-100 leading-tight">{selectedProcess.name}</p>
                        <p className="text-xs text-brand-600 dark:text-brand-400 mt-2">{selectedProcess.owner}</p>
                        <div className="mt-3 flex flex-col gap-1 items-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_STYLES[selectedProcess.category]}`}>
                            {CATEGORIES.find((c) => c.value === selectedProcess.category)?.label}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[selectedProcess.status]}`}>
                            {STATUSES.find((s) => s.value === selectedProcess.status)?.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="grid grid-rows-3 gap-4">
                  {/* Competence (top-right) */}
                  <TurtleBox
                    title="With Whom?"
                    subtitle="Competence &amp; Training"
                    items={selectedProcess.competence}
                    colorClass="bg-green-50 dark:bg-green-950/30"
                    borderClass="border-green-200 dark:border-green-800"
                    titleColorClass="text-green-700 dark:text-green-300"
                    onUpdate={(items) => updateTurtleField('competence', items)}
                  />
                  {/* Outputs (middle-right) */}
                  <TurtleBox
                    title="Outputs"
                    subtitle="Products &amp; Records"
                    items={selectedProcess.outputs}
                    colorClass="bg-purple-50 dark:bg-purple-950/30"
                    borderClass="border-purple-200 dark:border-purple-800"
                    titleColorClass="text-purple-700 dark:text-purple-300"
                    onUpdate={(items) => updateTurtleField('outputs', items)}
                  />
                  {/* KPIs (bottom-right) */}
                  <TurtleBox
                    title="KPIs"
                    subtitle="Metrics &amp; Criteria"
                    items={selectedProcess.kpis}
                    colorClass="bg-teal-50 dark:bg-teal-950/30"
                    borderClass="border-teal-200 dark:border-teal-800"
                    titleColorClass="text-teal-700 dark:text-teal-300"
                    onUpdate={(items) => updateTurtleField('kpis', items)}
                  />
                </div>
              </div>

              {/* Edit / Delete bar */}
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">
                  Click any box to add or remove items. Changes are saved automatically.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(selectedProcess)}>
                    <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit Process
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(selectedProcess.id)} className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 dark:border-red-800">
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Process Selected</h3>
                <p className="text-sm text-muted-foreground mb-4">Add a process first, then select it to view its Turtle Diagram.</p>
                <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Process</Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ─── ADD / EDIT MODAL ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Process' : 'Add Process'}
        size="lg"
      >
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {/* Basic Info */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 border-b border-border pb-2">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Process Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Product Realisation"
                />
              </div>
              <div>
                <Label>Process Owner *</Label>
                <Input
                  value={form.owner}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })}
                  placeholder="e.g. Quality Manager"
                />
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Process['category'] })}>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Process['status'] })}>
                  {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
              </div>
            </div>
          </div>

          {/* Turtle fields — quick text entry in modal */}
          {(
            [
              { field: 'inputs' as const, label: 'Inputs', placeholder: 'Customer order, raw materials...' },
              { field: 'outputs' as const, label: 'Outputs', placeholder: 'Finished goods, delivery note...' },
              { field: 'equipment' as const, label: 'Equipment / Infrastructure', placeholder: 'CNC machine, ERP system...' },
              { field: 'competence' as const, label: 'Competence / Training', placeholder: 'ISO 9001 awareness, engineering degree...' },
              { field: 'procedures' as const, label: 'Procedures / Methods', placeholder: 'QP-001 Production Control...' },
              { field: 'kpis' as const, label: 'KPIs', placeholder: 'On-time delivery ≥ 95%...' },
            ] as const
          ).map(({ field, label, placeholder }) => (
            <ModalFieldList
              key={field}
              label={label}
              items={form[field]}
              placeholder={placeholder}
              onUpdate={(items) => setForm({ ...form, [field]: items })}
            />
          ))}
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={!form.name.trim() || !form.owner.trim()}
          >
            {editingId ? 'Update Process' : 'Create Process'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

// ─── Modal Field List helper ──────────────────────────────────────────────────

function ModalFieldList({
  label,
  items,
  placeholder,
  onUpdate,
}: {
  label: string;
  items: string[];
  placeholder: string;
  onUpdate: (items: string[]) => void;
}) {
  const [newItem, setNewItem] = useState('');

  const add = () => {
    const t = newItem.trim();
    if (!t) return;
    onUpdate([...items, t]);
    setNewItem('');
  };

  const remove = (idx: number) => onUpdate(items.filter((_, i) => i !== idx));

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1 rounded-lg border border-border bg-muted/20 p-3 space-y-1.5">
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground italic">No items yet</p>
        )}
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-1.5 text-foreground">
              <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
              {item}
            </span>
            <button
              type="button"
              onClick={() => remove(idx)}
              className="text-muted-foreground hover:text-red-500 transition-colors shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            placeholder={placeholder}
            className="flex-1 text-sm px-2 py-1 rounded border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="button"
            onClick={add}
            className="px-2 py-1 rounded bg-brand-600 text-white text-xs hover:bg-brand-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
