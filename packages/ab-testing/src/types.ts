export type ExperimentStatus = 'draft' | 'running' | 'paused' | 'completed' | 'archived';
export type VariantType = 'control' | 'treatment';
export type MetricType = 'conversion' | 'revenue' | 'engagement' | 'retention' | 'custom';

export interface Variant {
  id: string;
  name: string;
  type: VariantType;
  weight: number;        // 0-100 (percentage)
  config?: Record<string, unknown>;
}

export interface Experiment {
  id: string;
  name: string;
  description?: string;
  status: ExperimentStatus;
  variants: Variant[];
  startDate?: number;
  endDate?: number;
  targetAudience?: string[];
  metrics: MetricType[];
  createdAt: number;
}

export interface Assignment {
  userId: string;
  experimentId: string;
  variantId: string;
  assignedAt: number;
}

export interface ExperimentEvent {
  userId: string;
  experimentId: string;
  variantId: string;
  metricType: MetricType;
  value: number;
  timestamp: number;
}

export interface VariantStats {
  variantId: string;
  participants: number;
  conversions: number;
  conversionRate: number;
  totalRevenue: number;
  avgRevenue: number;
}

export interface ExperimentResults {
  experimentId: string;
  variantStats: VariantStats[];
  winner?: string;
  confidence?: number;
  sampleSize: number;
}
