// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/** Known SharePoint list export field names → Nexara field keys */
export const sharepointProfile: Record<string, string> = {
  'Title': 'title',
  'Created': 'createdAt',
  'Modified': 'updatedAt',
  'Created By': 'createdBy',
  'Modified By': 'updatedBy',
  'Status': 'status',
  'Category': 'category',
  'Description': 'description',
  'Due Date': 'dueDate',
  'Assigned To': 'assignedTo',
  'Priority': 'severity',
  'Department': 'area',
  'Location': 'location',
  'Reference': 'reference',
  'ID': 'reference',
  'Item Number': 'reference',
  'Date': 'dateOccurred',
  'Issue Date': 'detectedDate',
  'Reported By': 'reportedBy',
  'Owner': 'assignedTo',
  'Resolution': 'rootCause',
  'Comments': 'description',
  'Notes': 'description',
};
