export type AssetStatus = 'PLANNING' | 'ACQUIRED' | 'IN_SERVICE' | 'UNDER_MAINTENANCE' | 'RETIRED' | 'DISPOSED';
export type AssetCategory = 'EQUIPMENT' | 'VEHICLE' | 'IT_HARDWARE' | 'FACILITY' | 'TOOL' | 'INSTRUMENT';
export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE' | 'PREDICTIVE' | 'CONDITION_BASED';
export type DepreciationMethod = 'STRAIGHT_LINE' | 'DECLINING_BALANCE' | 'UNITS_OF_PRODUCTION';
export type ConditionRating = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';

export interface AssetRecord {
  id: string;
  name: string;
  category: AssetCategory;
  status: AssetStatus;
  acquisitionDate: string;
  acquisitionCost: number;
  usefulLifeYears: number;
  salvageValue: number;
  location: string;
  assignedTo?: string;
  condition: ConditionRating;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  notes?: string;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  type: MaintenanceType;
  scheduledDate: string;
  completedDate?: string;
  technician?: string;
  cost?: number;
  description: string;
  outcome?: string;
}

export interface DepreciationResult {
  assetId: string;
  method: DepreciationMethod;
  annualDepreciation: number;
  bookValue: number;
  depreciationToDate: number;
  yearsElapsed: number;
}
