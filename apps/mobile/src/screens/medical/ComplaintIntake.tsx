/**
 * Medical Device Complaint Intake Screen
 * Offline-capable: captures complaint details locally
 */

export interface ComplaintDraft {
  id: string;
  deviceName: string;
  lotNumber?: string;
  serialNumber?: string;
  complaintDescription: string;
  patientInvolved: boolean;
  injuryDescription?: string;
  reporterName: string;
  reporterContact: string;
  photoUris: string[];
  createdAt: string;
  synced: boolean;
}

export function createComplaintDraft(
  data: Omit<ComplaintDraft, 'id' | 'createdAt' | 'synced' | 'photoUris'>
): ComplaintDraft {
  return {
    ...data,
    id: `complaint_${Date.now()}`,
    photoUris: [],
    createdAt: new Date().toISOString(),
    synced: false,
  };
}
