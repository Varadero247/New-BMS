// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/** Known Intelex export field names → Nexara INCIDENTS/NCR field keys */
export const intelexProfile: Record<string, string> = {
  'Incident Title': 'title',
  'Incident Name': 'title',
  'Incident Date': 'dateOccurred',
  'Date of Incident': 'dateOccurred',
  'Incident Type': 'type',
  'Type': 'type',
  'Severity Level': 'severity',
  'Severity': 'severity',
  'Location': 'location',
  'Incident Location': 'location',
  'Reported By': 'reportedBy',
  'Reported By (User)': 'reportedBy',
  'Status': 'status',
  'Incident Status': 'status',
  'Root Cause': 'rootCause',
  'Root Cause Category': 'rootCause',
  'Corrective Action': 'correctiveAction',
  'Description': 'description',
  'Incident Description': 'description',
  'Department': 'area',
  'Area': 'area',
  'Assigned To': 'assignedTo',
  'Owner': 'assignedTo',
  'Reference Number': 'reference',
  'Incident Number': 'reference',
  'ID': 'reference',
};
