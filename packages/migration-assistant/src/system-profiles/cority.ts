// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/** Known Cority export field names → Nexara INCIDENTS field keys */
export const corityProfile: Record<string, string> = {
  'Incident Number': 'reference',
  'Incident ID': 'reference',
  'Title': 'title',
  'Incident Title': 'title',
  'Date of Incident': 'dateOccurred',
  'Incident Date': 'dateOccurred',
  'Severity': 'severity',
  'Injury Severity': 'severity',
  'Incident Location': 'location',
  'Location': 'location',
  'Injury Type': 'injuryType',
  'Type of Injury': 'injuryType',
  'Report Status': 'status',
  'Status': 'status',
  'Department': 'area',
  'Business Unit': 'area',
  'Root Cause': 'rootCause',
  'Primary Cause': 'rootCause',
  'Description': 'description',
  'Incident Description': 'description',
  'Reported By': 'reportedBy',
  'Reporter': 'reportedBy',
  'Assigned To': 'assignedTo',
};
