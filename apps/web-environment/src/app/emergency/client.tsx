'use client';

import { useEffect, useState, useCallback } from 'react';
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
  ShieldAlert,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
} from 'lucide-react';
import { api } from '@/lib/api';

interface EmergencyPlan {
  id: string;
  refNumber: string;
  title: string;
  scenario: string;
  triggerConditions: string;
  immediateResponse: string;
  notificationReqs?: string;
  containmentProcs?: string;
  impactMitigation?: string;
  recoveryActions?: string;
  reviewSchedule?: string;
  status: string;
  lastReviewDate?: string;
  nextReviewDate?: string;
  createdAt: string;
}

interface EmergencyDrill {
  id: string;
  planId: string;
  drillDate: string;
  drillType: string;
  participants: string[];
  scenario?: string;
  outcome: string;
  lessonsLearned?: string;
  actionsRequired?: string;
  conductedBy?: string;
  createdAt: string;
}

interface DashboardData {
  totalPlans: number;
  activePlans: number;
  drillsLast12Months: number;
  openIncidents: number;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-800',
  ACTIVE: 'bg-green-100 text-green-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  ARCHIVED: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
};

const OUTCOME_COLORS: Record<string, string> = {
  SATISFACTORY: 'bg-green-100 text-green-800',
  NEEDS_IMPROVEMENT: 'bg-yellow-100 text-yellow-800',
  UNSATISFACTORY: 'bg-red-100 text-red-800',
};

export default function EmergencyPreparednessPage() {
  const [activeTab, setActiveTab] = useState<'plans' | 'drills' | 'dashboard'>('plans');
  const [plans, setPlans] = useState<EmergencyPlan[]>([]);
  const [drills, setDrills] = useState<EmergencyDrill[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState({
    title: '',
    scenario: '',
    triggerConditions: '',
    immediateResponse: '',
    notificationReqs: '',
    containmentProcs: '',
    impactMitigation: '',
    recoveryActions: '',
  });

  const [showDrillModal, setShowDrillModal] = useState(false);
  const [drillForm, setDrillForm] = useState({
    planId: '',
    drillDate: '',
    drillType: 'TABLETOP',
    participants: '',
    scenario: '',
    outcome: 'SATISFACTORY',
    lessonsLearned: '',
    actionsRequired: '',
    conductedBy: '',
  });

  const fetchPlans = useCallback(async () => {
    try {
      const res = await api.get('/emergency/plans');
      setPlans(res.data.data || []);
    } catch {
      setPlans([]);
    }
  }, []);

  const fetchDrills = useCallback(async () => {
    try {
      const res = await api.get('/emergency/drills');
      setDrills(res.data.data || []);
    } catch {
      setDrills([]);
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.get('/emergency/dashboard');
      setDashboard(res.data.data || null);
    } catch {
      setDashboard(null);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPlans(), fetchDrills(), fetchDashboard()]).finally(() => setLoading(false));
  }, [fetchPlans, fetchDrills, fetchDashboard]);

  const handleCreatePlan = async () => {
    try {
      await api.post('/emergency/plans', planForm);
      setShowPlanModal(false);
      setPlanForm({
        title: '',
        scenario: '',
        triggerConditions: '',
        immediateResponse: '',
        notificationReqs: '',
        containmentProcs: '',
        impactMitigation: '',
        recoveryActions: '',
      });
      fetchPlans();
      fetchDashboard();
    } catch (err) {
      console.error('Failed to create plan', err);
    }
  };

  const handleCreateDrill = async () => {
    try {
      await api.post('/emergency/drills', {
        ...drillForm,
        participants: drillForm.participants
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setShowDrillModal(false);
      setDrillForm({
        planId: '',
        drillDate: '',
        drillType: 'TABLETOP',
        participants: '',
        scenario: '',
        outcome: 'SATISFACTORY',
        lessonsLearned: '',
        actionsRequired: '',
        conductedBy: '',
      });
      fetchDrills();
      fetchDashboard();
    } catch (err) {
      console.error('Failed to create drill', err);
    }
  };

  const activePlans = plans.filter((p) => p.status === 'ACTIVE').length;
  const totalDrills = drills.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Emergency Preparedness
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ISO 14001 Clause 8.2 - Emergency preparedness and response
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Plans</p>
                <p className="text-2xl font-bold">{plans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Plans</p>
                <p className="text-2xl font-bold">{activePlans}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ShieldAlert className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Drills Conducted</p>
                <p className="text-2xl font-bold">{totalDrills}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Open Incidents</p>
                <p className="text-2xl font-bold">{dashboard?.openIncidents ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 border-b pb-2">
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 rounded-t text-sm font-medium ${activeTab === 'plans' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}
        >
          Emergency Plans
        </button>
        <button
          onClick={() => setActiveTab('drills')}
          className={`px-4 py-2 rounded-t text-sm font-medium ${activeTab === 'drills' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}
        >
          Drills
        </button>
      </div>

      {activeTab === 'plans' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Emergency Plans</CardTitle>
              <Button onClick={() => setShowPlanModal(true)}>
                <Plus className="h-4 w-4 mr-2" /> New Plan
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Loading...</p>
            ) : plans.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No emergency plans found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500 dark:text-gray-400">
                      <th className="pb-2 pr-4">Ref</th>
                      <th className="pb-2 pr-4">Title</th>
                      <th className="pb-2 pr-4">Scenario</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2">Next Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((plan) => (
                      <tr key={plan.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 pr-4 font-mono text-xs">{plan.refNumber}</td>
                        <td className="py-3 pr-4 font-medium">{plan.title}</td>
                        <td className="py-3 pr-4 text-gray-600 max-w-xs truncate">
                          {plan.scenario}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge
                            className={STATUS_COLORS[plan.status] || 'bg-gray-100 dark:bg-gray-800'}
                          >
                            {plan.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 text-gray-500 dark:text-gray-400">
                          {plan.nextReviewDate
                            ? new Date(plan.nextReviewDate).toLocaleDateString()
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'drills' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Drill Exercises</CardTitle>
              <Button onClick={() => setShowDrillModal(true)}>
                <Plus className="h-4 w-4 mr-2" /> Log Drill
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Loading...</p>
            ) : drills.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No drills recorded.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500 dark:text-gray-400">
                      <th className="pb-2 pr-4">Date</th>
                      <th className="pb-2 pr-4">Type</th>
                      <th className="pb-2 pr-4">Participants</th>
                      <th className="pb-2 pr-4">Outcome</th>
                      <th className="pb-2">Conducted By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drills.map((drill) => (
                      <tr key={drill.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 pr-4">
                          {new Date(drill.drillDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 pr-4">{drill.drillType}</td>
                        <td className="py-3 pr-4 text-xs">
                          {drill.participants.slice(0, 3).join(', ')}
                          {drill.participants.length > 3 ? '...' : ''}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge
                            className={
                              OUTCOME_COLORS[drill.outcome] || 'bg-gray-100 dark:bg-gray-800'
                            }
                          >
                            {drill.outcome.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="py-3">{drill.conductedBy || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        title="Create Emergency Plan"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input
              value={planForm.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPlanForm({ ...planForm, title: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Scenario *</Label>
            <Textarea
              rows={2}
              value={planForm.scenario}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setPlanForm({ ...planForm, scenario: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Trigger Conditions *</Label>
            <Textarea
              rows={2}
              value={planForm.triggerConditions}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setPlanForm({ ...planForm, triggerConditions: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Immediate Response *</Label>
            <Textarea
              rows={2}
              value={planForm.immediateResponse}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setPlanForm({ ...planForm, immediateResponse: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Notification Requirements</Label>
              <Textarea
                rows={2}
                value={planForm.notificationReqs}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setPlanForm({ ...planForm, notificationReqs: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Containment Procedures</Label>
              <Textarea
                rows={2}
                value={planForm.containmentProcs}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setPlanForm({ ...planForm, containmentProcs: e.target.value })
                }
              />
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowPlanModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreatePlan}
            disabled={
              !planForm.title ||
              !planForm.scenario ||
              !planForm.triggerConditions ||
              !planForm.immediateResponse
            }
          >
            Create Plan
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showDrillModal}
        onClose={() => setShowDrillModal(false)}
        title="Log Emergency Drill"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Emergency Plan *</Label>
              <Select
                value={drillForm.planId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setDrillForm({ ...drillForm, planId: e.target.value })
                }
              >
                <option value="">Select plan...</option>
                {plans
                  .filter((p) => p.status === 'ACTIVE')
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.refNumber} - {p.title}
                    </option>
                  ))}
              </Select>
            </div>
            <div>
              <Label>Drill Date *</Label>
              <Input
                type="date"
                value={drillForm.drillDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDrillForm({ ...drillForm, drillDate: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Drill Type</Label>
              <Select
                value={drillForm.drillType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setDrillForm({ ...drillForm, drillType: e.target.value })
                }
              >
                <option value="TABLETOP">Tabletop</option>
                <option value="FUNCTIONAL">Functional</option>
                <option value="FULL_SCALE">Full Scale</option>
              </Select>
            </div>
            <div>
              <Label>Outcome</Label>
              <Select
                value={drillForm.outcome}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setDrillForm({ ...drillForm, outcome: e.target.value })
                }
              >
                <option value="SATISFACTORY">Satisfactory</option>
                <option value="NEEDS_IMPROVEMENT">Needs Improvement</option>
                <option value="UNSATISFACTORY">Unsatisfactory</option>
              </Select>
            </div>
          </div>
          <div>
            <Label>Participants (comma-separated)</Label>
            <Input
              value={drillForm.participants}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDrillForm({ ...drillForm, participants: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Lessons Learned</Label>
            <Textarea
              rows={2}
              value={drillForm.lessonsLearned}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDrillForm({ ...drillForm, lessonsLearned: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Conducted By</Label>
            <Input
              value={drillForm.conductedBy}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDrillForm({ ...drillForm, conductedBy: e.target.value })
              }
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDrillModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateDrill} disabled={!drillForm.planId || !drillForm.drillDate}>
            Log Drill
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
