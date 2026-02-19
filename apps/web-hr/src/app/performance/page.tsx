'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Modal,
  ModalFooter,
  AIDisclosure } from '@ims/ui';
import {
  Plus,
  TrendingUp,
  Calendar,
  Users,
  Star,
  ClipboardList,
  RefreshCw,
  Sparkles } from 'lucide-react';
import { api, aiApi } from '@/lib/api';

interface PerformanceCycle {
  id: string;
  name: string;
  year: number;
  cycleType: string;
  startDate: string;
  endDate: string;
  status?: string;
  ratingScale: number;
  _count?: { reviews: number; goals: number };
}

interface PerformanceReview {
  id: string;
  cycleId: string;
  employeeId: string;
  reviewerId: string;
  reviewType: string;
  status: string;
  selfAssessment?: string;
  managerAssessment?: string;
  selfRating?: number;
  managerRating?: number;
  overallRating?: number;
  overallComments?: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  cycle?: { name: string; year: number };
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber?: string;
    jobTitle?: string;
  };
  reviewer?: { id: string; firstName: string; lastName: string };
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  jobTitle?: string;
}

const cycleTypeLabels: Record<string, string> = {
  ANNUAL: 'Annual',
  SEMI_ANNUAL: 'Semi-Annual',
  QUARTERLY: 'Quarterly',
  CONTINUOUS: 'Continuous' };

const cycleTypeColors: Record<string, string> = {
  ANNUAL: 'bg-blue-100 text-blue-700',
  SEMI_ANNUAL: 'bg-purple-100 text-purple-700',
  QUARTERLY: 'bg-orange-100 text-orange-700',
  CONTINUOUS: 'bg-green-100 text-green-700' };

const reviewStatusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  SELF_ASSESSMENT: 'bg-blue-100 text-blue-700',
  MANAGER_REVIEW: 'bg-yellow-100 text-yellow-700',
  CALIBRATION: 'bg-purple-100 text-purple-700',
  ACKNOWLEDGED: 'bg-indigo-100 text-indigo-700',
  COMPLETED: 'bg-green-100 text-green-700' };

const reviewTypeLabels: Record<string, string> = {
  ANNUAL: 'Annual',
  MID_YEAR: 'Mid-Year',
  QUARTERLY: 'Quarterly',
  PROBATION: 'Probation',
  PROJECT_END: 'Project End',
  AD_HOC: 'Ad Hoc' };

export default function PerformancePage() {
  const [cycles, setCycles] = useState<PerformanceCycle[]>([]);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cycles' | 'reviews'>('cycles');
  const [statusFilter, setStatusFilter] = useState('');

  // Cycle modal state
  const [cycleModalOpen, setCycleModalOpen] = useState(false);
  const [cycleSubmitting, setCycleSubmitting] = useState(false);
  const [cycleName, setCycleName] = useState('');
  const [cycleYear, setCycleYear] = useState(new Date().getFullYear());
  const [cycleType, setCycleType] = useState('ANNUAL');
  const [cycleStartDate, setCycleStartDate] = useState('');
  const [cycleEndDate, setCycleEndDate] = useState('');
  const [cycleRatingScale, setCycleRatingScale] = useState(5);

  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewEmployeeId, setReviewEmployeeId] = useState('');
  const [reviewCycleId, setReviewCycleId] = useState('');
  const [reviewReviewerId, setReviewReviewerId] = useState('');
  const [reviewType, setReviewType] = useState('ANNUAL');
  const [reviewPeriodStart, setReviewPeriodStart] = useState('');
  const [reviewPeriodEnd, setReviewPeriodEnd] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'reviews') {
      loadReviews();
    }
  }, [statusFilter, activeTab]);

  async function loadData() {
    try {
      const [cyclesRes, reviewsRes, employeesRes] = await Promise.all([
        api.get('/performance/cycles'),
        api.get('/performance/reviews'),
        api.get('/employees'),
      ]);
      setCycles(cyclesRes.data.data || []);
      setReviews(reviewsRes.data.data || []);
      setEmployees(employeesRes.data.data || []);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadReviews() {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      const res = await api.get(`/performance/reviews?${params.toString()}`);
      setReviews(res.data.data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  }

  function resetCycleForm() {
    setCycleName('');
    setCycleYear(new Date().getFullYear());
    setCycleType('ANNUAL');
    setCycleStartDate('');
    setCycleEndDate('');
    setCycleRatingScale(5);
  }

  function resetReviewForm() {
    setReviewEmployeeId('');
    setReviewCycleId('');
    setReviewReviewerId('');
    setReviewType('ANNUAL');
    setReviewPeriodStart('');
    setReviewPeriodEnd('');
  }

  async function handleCreateCycle() {
    if (!cycleName || !cycleStartDate || !cycleEndDate) return;
    setCycleSubmitting(true);
    try {
      await api.post('/performance/cycles', {
        name: cycleName,
        year: cycleYear,
        cycleType,
        startDate: cycleStartDate,
        endDate: cycleEndDate,
        ratingScale: cycleRatingScale });
      setCycleModalOpen(false);
      resetCycleForm();
      loadData();
    } catch (error) {
      console.error('Error creating cycle:', error);
    } finally {
      setCycleSubmitting(false);
    }
  }

  async function handleCreateReview() {
    if (
      !reviewEmployeeId ||
      !reviewCycleId ||
      !reviewReviewerId ||
      !reviewPeriodStart ||
      !reviewPeriodEnd
    )
      return;
    setReviewSubmitting(true);
    try {
      await api.post('/performance/reviews', {
        cycleId: reviewCycleId,
        employeeId: reviewEmployeeId,
        reviewerId: reviewReviewerId,
        reviewType: reviewType,
        periodStart: reviewPeriodStart,
        periodEnd: reviewPeriodEnd });
      setReviewModalOpen(false);
      resetReviewForm();
      loadData();
    } catch (error) {
      console.error('Error creating review:', error);
    } finally {
      setReviewSubmitting(false);
    }
  }

  async function analyzePerformance() {
    setAiLoading(true);
    setAiInsights(null);
    try {
      const res = await aiApi.post('/analyze', {
        type: 'HR_PERFORMANCE_INSIGHTS',
        context: {
          employeeName: 'Team Overview',
          department: 'All Departments',
          reviewPeriod: 'Current Cycle',
          goalsCompleted: reviews.filter((r) => r.status === 'COMPLETED').length,
          totalGoals: reviews.length } });
      setAiInsights(res.data.data.result);
    } catch (error) {
      console.error('Error getting AI insights:', error);
    } finally {
      setAiLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeCycles = cycles.filter((c) => {
    const now = new Date();
    return new Date(c.startDate) <= now && new Date(c.endDate) >= now;
  });

  const avgRating =
    reviews.filter((r) => r.overallRating).length > 0
      ? (
          reviews
            .filter((r) => r.overallRating)
            .reduce((sum, r) => sum + (r.overallRating || 0), 0) /
          reviews.filter((r) => r.overallRating).length
        ).toFixed(1)
      : 'N/A';

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Performance Reviews
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage review cycles and employee performance
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                resetCycleForm();
                setCycleModalOpen(true);
              }}
            >
              <RefreshCw className="h-4 w-4" /> New Cycle
            </Button>
            <Button
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                resetReviewForm();
                setReviewModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> New Review
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={analyzePerformance}
              disabled={aiLoading}
            >
              <Sparkles className="h-4 w-4" />
              {aiLoading ? 'Analyzing...' : 'AI Insights'}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Cycles</p>
                  <p className="text-2xl font-bold">{cycles.length}</p>
                </div>
                <RefreshCw className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Cycles</p>
                  <p className="text-2xl font-bold text-green-600">{activeCycles.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Reviews</p>
                  <p className="text-2xl font-bold text-purple-600">{reviews.length}</p>
                </div>
                <ClipboardList className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Avg Rating</p>
                  <p className="text-2xl font-bold text-amber-600">{avgRating}</p>
                </div>
                <Star className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Panel */}
        {aiInsights && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-blue-900">AI Performance Insights</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setAiInsights(null)}>
                  Dismiss
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AIDisclosure
                variant="inline"
                provider="claude"
                analysisType="Performance Analysis"
                confidence={0.85}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                {aiInsights.strengths && (
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">Team Strengths</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.strengths.map((s: string, i: number) => (
                        <li key={i} className="text-gray-700 dark:text-gray-300">
                          • {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.areasForImprovement && (
                  <div>
                    <h4 className="font-medium text-amber-700 mb-2">Areas for Improvement</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.areasForImprovement.map((a: string, i: number) => (
                        <li key={i} className="text-gray-700 dark:text-gray-300">
                          • {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.trainingRecommendations && (
                  <div>
                    <h4 className="font-medium text-blue-700 mb-2">Training Recommendations</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.trainingRecommendations.map((t: string, i: number) => (
                        <li key={i} className="text-gray-700 dark:text-gray-300">
                          • {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {aiInsights.overallSummary && (
                <p className="text-sm text-gray-600 mt-4 pt-4 border-t">
                  {aiInsights.overallSummary}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'cycles' ? 'default' : 'outline'}
            onClick={() => setActiveTab('cycles')}
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Cycles ({cycles.length})
          </Button>
          <Button
            variant={activeTab === 'reviews' ? 'default' : 'outline'}
            onClick={() => setActiveTab('reviews')}
          >
            <ClipboardList className="h-4 w-4 mr-2" /> Reviews ({reviews.length})
          </Button>
        </div>

        {/* Filters for Reviews */}
        {activeTab === 'reviews' && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-4 items-center">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm"
                >
                  <option value="">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SELF_ASSESSMENT">Self Assessment</option>
                  <option value="MANAGER_REVIEW">Manager Review</option>
                  <option value="CALIBRATION">Calibration</option>
                  <option value="ACKNOWLEDGED">Acknowledged</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cycles Tab */}
        {activeTab === 'cycles' && (
          <Card>
            <CardHeader>
              <CardTitle>Performance Cycles</CardTitle>
            </CardHeader>
            <CardContent>
              {cycles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cycles.map((cycle) => {
                    const now = new Date();
                    const isActive =
                      new Date(cycle.startDate) <= now && new Date(cycle.endDate) >= now;
                    const isPast = new Date(cycle.endDate) < now;
                    return (
                      <div
                        key={cycle.id}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 text-emerald-600" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {cycle.year}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Badge
                              className={
                                cycleTypeColors[cycle.cycleType] ||
                                'bg-gray-100 dark:bg-gray-800 text-gray-700'
                              }
                            >
                              {cycleTypeLabels[cycle.cycleType] || cycle.cycleType}
                            </Badge>
                            {isActive && (
                              <Badge className="bg-green-100 text-green-700">Active</Badge>
                            )}
                            {isPast && (
                              <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                Closed
                              </Badge>
                            )}
                          </div>
                        </div>
                        <h3 className="font-medium text-lg mb-2">{cycle.name}</h3>
                        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(cycle.startDate).toLocaleDateString()} -{' '}
                              {new Date(cycle.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-3 border-t">
                          <div className="flex items-center gap-1">
                            <ClipboardList className="h-4 w-4" />
                            {cycle._count?.reviews || 0} reviews
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {cycle._count?.goals || 0} goals
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            Scale: {cycle.ratingScale}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No performance cycles found</p>
                  <p className="text-sm mt-1">Create a cycle to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <Card>
            <CardHeader>
              <CardTitle>Performance Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          {review.employee ? (
                            <span className="text-sm font-bold text-emerald-700">
                              {review.employee.firstName[0]}
                              {review.employee.lastName[0]}
                            </span>
                          ) : (
                            <Users className="h-5 w-5 text-emerald-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {review.employee
                                ? `${review.employee.firstName} ${review.employee.lastName}`
                                : 'Unknown Employee'}
                            </span>
                            <Badge
                              className={
                                reviewStatusColors[review.status] ||
                                'bg-gray-100 dark:bg-gray-800 text-gray-700'
                              }
                            >
                              {review.status.replace('_', ' ')}
                            </Badge>
                            <Badge className="bg-indigo-50 text-indigo-700">
                              {reviewTypeLabels[review.reviewType] || review.reviewType}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            {review.cycle && (
                              <>
                                <span>
                                  {review.cycle.name} ({review.cycle.year})
                                </span>
                                <span>-</span>
                              </>
                            )}
                            {review.reviewer && (
                              <span>
                                Reviewer: {review.reviewer.firstName} {review.reviewer.lastName}
                              </span>
                            )}
                            <span>-</span>
                            <span>
                              {new Date(review.periodStart).toLocaleDateString()} -{' '}
                              {new Date(review.periodEnd).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {review.overallRating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                            <span className="text-lg font-bold text-amber-600">
                              {review.overallRating}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">
                            No rating
                          </span>
                        )}
                        {review.employee?.jobTitle && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {review.employee.jobTitle}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No reviews found</p>
                  <p className="text-sm mt-1">Create a review to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Create Cycle Modal */}
        <Modal
          isOpen={cycleModalOpen}
          onClose={() => setCycleModalOpen(false)}
          title="Create Performance Cycle"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cycle Name
              </label>
              <input
                type="text"
                value={cycleName}
                onChange={(e) => setCycleName(e.target.value)}
                placeholder="e.g., 2026 Annual Performance Review"
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  value={cycleYear}
                  onChange={(e) =>
                    setCycleYear(parseInt(e.target.value) || new Date().getFullYear())
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cycle Type
                </label>
                <select
                  value={cycleType}
                  onChange={(e) => setCycleType(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ANNUAL">Annual</option>
                  <option value="SEMI_ANNUAL">Semi-Annual</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="CONTINUOUS">Continuous</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={cycleStartDate}
                  onChange={(e) => setCycleStartDate(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={cycleEndDate}
                  onChange={(e) => setCycleEndDate(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rating Scale (max)
              </label>
              <input
                type="number"
                value={cycleRatingScale}
                onChange={(e) => setCycleRatingScale(parseInt(e.target.value) || 5)}
                min={1}
                max={10}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setCycleModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleCreateCycle}
              disabled={cycleSubmitting || !cycleName || !cycleStartDate || !cycleEndDate}
            >
              {cycleSubmitting ? 'Creating...' : 'Create Cycle'}
            </Button>
          </ModalFooter>
        </Modal>

        {/* Create Review Modal */}
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title="Create Performance Review"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Employee
              </label>
              <select
                value={reviewEmployeeId}
                onChange={(e) => setReviewEmployeeId(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select employee...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Performance Cycle
              </label>
              <select
                value={reviewCycleId}
                onChange={(e) => setReviewCycleId(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select cycle...</option>
                {cycles.map((cycle) => (
                  <option key={cycle.id} value={cycle.id}>
                    {cycle.name} ({cycle.year})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reviewer
              </label>
              <select
                value={reviewReviewerId}
                onChange={(e) => setReviewReviewerId(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select reviewer...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Review Type
              </label>
              <select
                value={reviewType}
                onChange={(e) => setReviewType(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ANNUAL">Annual</option>
                <option value="MID_YEAR">Mid-Year</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="PROBATION">Probation</option>
                <option value="PROJECT_END">Project End</option>
                <option value="AD_HOC">Ad Hoc</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Period Start
                </label>
                <input
                  type="date"
                  value={reviewPeriodStart}
                  onChange={(e) => setReviewPeriodStart(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Period End
                </label>
                <input
                  type="date"
                  value={reviewPeriodEnd}
                  onChange={(e) => setReviewPeriodEnd(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleCreateReview}
              disabled={
                reviewSubmitting ||
                !reviewEmployeeId ||
                !reviewCycleId ||
                !reviewReviewerId ||
                !reviewPeriodStart ||
                !reviewPeriodEnd
              }
            >
              {reviewSubmitting ? 'Creating...' : 'Create Review'}
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
}
