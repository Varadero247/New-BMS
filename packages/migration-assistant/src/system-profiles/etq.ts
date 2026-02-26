// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/** Known ETQ Reliance export field names → Nexara NONCONFORMANCES field keys */
export const etqProfile: Record<string, string> = {
  'NCR Number': 'reference',
  'NC Number': 'reference',
  'Document Number': 'reference',
  'Problem Description': 'title',
  'Title': 'title',
  'Detection Date': 'detectedDate',
  'Date Detected': 'detectedDate',
  'Date Opened': 'detectedDate',
  'Classification': 'severity',
  'Severity': 'severity',
  'Disposition': 'status',
  'Status': 'status',
  'Root Cause Analysis': 'rootCause',
  'Root Cause': 'rootCause',
  'Responsible Person': 'assignedTo',
  'Owner': 'assignedTo',
  'Area/Department': 'area',
  'Department': 'area',
  'Description': 'description',
  'Detailed Description': 'description',
  'Date Closed': 'closedDate',
  'Closed Date': 'closedDate',
};
