export type EquipmentStatus = 'ACTIVE' | 'DUE_FOR_CALIBRATION' | 'UNDER_CALIBRATION' | 'OUT_OF_SERVICE' | 'RETIRED';
export type CalibrationResult = 'PASS' | 'FAIL' | 'PASS_WITH_ADJUSTMENT' | 'OUT_OF_TOLERANCE';
export type CalibrationFrequency = 'MONTHLY' | 'QUARTERLY' | 'BIANNUAL' | 'ANNUAL' | 'BIENNIALLY';
export type EquipmentType = 'MEASURING' | 'TEST' | 'MONITORING' | 'INSPECTION';
export type CertificateStatus = 'VALID' | 'EXPIRED' | 'REVOKED' | 'SUPERSEDED';

export interface EquipmentRecord {
  id: string;
  assetTag: string;
  name: string;
  type: EquipmentType;
  status: EquipmentStatus;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  location: string;
  owner: string;
  calibrationFrequency: CalibrationFrequency;
  lastCalibrationDate?: string;
  nextCalibrationDate?: string;
  calibrationIntervalDays: number;
  notes?: string;
}

export interface CalibrationCertificate {
  id: string;
  equipmentId: string;
  certificateNumber: string;
  status: CertificateStatus;
  calibratedBy: string;
  calibrationDate: string;
  expiryDate: string;
  result: CalibrationResult;
  referenceStandard?: string;
  uncertaintyValue?: number;
  notes?: string;
}
