// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { ModuleSchema, TargetModule } from './types';

export const MIGRATION_SCHEMAS: Record<TargetModule, ModuleSchema> = {
  NONCONFORMANCES: {
    title: 'Non-Conformance Reports',
    fields: {
      reference: { label: 'NCR Reference', type: 'string', required: true, example: 'NCR-2024-001', maxLength: 50 },
      title: { label: 'Title / Description', type: 'string', required: true, maxLength: 255 },
      detectedDate: { label: 'Date Detected', type: 'date', required: true, formats: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
      severity: { label: 'Severity', type: 'enum', required: true, values: ['CRITICAL', 'MAJOR', 'MINOR', 'OBSERVATION'] },
      status: { label: 'Status', type: 'enum', required: false, values: ['OPEN', 'IN_PROGRESS', 'CLOSED', 'VERIFIED'] },
      description: { label: 'Full Description', type: 'text', required: false },
      rootCause: { label: 'Root Cause', type: 'text', required: false },
      area: { label: 'Department / Area', type: 'string', required: false, maxLength: 100 },
      assignedTo: { label: 'Assigned To (Email)', type: 'email', required: false },
      closedDate: { label: 'Date Closed', type: 'date', required: false, formats: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
    },
  },
  INCIDENTS: {
    title: 'Incidents',
    fields: {
      reference: { label: 'Incident Reference', type: 'string', required: true, example: 'INC-2024-001' },
      title: { label: 'Incident Title', type: 'string', required: true, maxLength: 255 },
      dateOccurred: { label: 'Date Occurred', type: 'date', required: true, formats: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
      severity: { label: 'Severity', type: 'enum', required: true, values: ['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL', 'CATASTROPHIC'] },
      type: { label: 'Incident Type', type: 'string', required: false, maxLength: 100 },
      location: { label: 'Location', type: 'string', required: false, maxLength: 200 },
      injuryType: { label: 'Injury Type', type: 'string', required: false, maxLength: 100 },
      reportedBy: { label: 'Reported By (Email)', type: 'email', required: false },
      status: { label: 'Status', type: 'enum', required: false, values: ['OPEN', 'UNDER_INVESTIGATION', 'CLOSED'] },
      description: { label: 'Description', type: 'text', required: false },
    },
  },
  RISKS: {
    title: 'Risk Register',
    fields: {
      reference: { label: 'Risk Reference', type: 'string', required: true, example: 'RSK-2024-001' },
      title: { label: 'Risk Title', type: 'string', required: true, maxLength: 255 },
      description: { label: 'Risk Description', type: 'text', required: false },
      category: { label: 'Risk Category', type: 'string', required: false, maxLength: 100 },
      likelihood: { label: 'Likelihood (1-5)', type: 'integer', required: true },
      impact: { label: 'Impact (1-5)', type: 'integer', required: true },
      owner: { label: 'Risk Owner (Email)', type: 'email', required: false },
      status: { label: 'Status', type: 'enum', required: false, values: ['OPEN', 'MITIGATED', 'ACCEPTED', 'CLOSED'] },
      controls: { label: 'Existing Controls', type: 'text', required: false },
    },
  },
  DOCUMENTS: {
    title: 'Documents',
    fields: {
      title: { label: 'Document Title', type: 'string', required: true, maxLength: 255 },
      documentNumber: { label: 'Document Number', type: 'string', required: false, maxLength: 50 },
      category: { label: 'Category', type: 'string', required: false, maxLength: 100 },
      version: { label: 'Version', type: 'string', required: false, example: '1.0', maxLength: 20 },
      status: { label: 'Status', type: 'enum', required: false, values: ['DRAFT', 'REVIEW', 'APPROVED', 'OBSOLETE'] },
      author: { label: 'Author (Email)', type: 'email', required: false },
      effectiveDate: { label: 'Effective Date', type: 'date', required: false, formats: ['DD/MM/YYYY', 'YYYY-MM-DD'] },
      reviewDate: { label: 'Next Review Date', type: 'date', required: false, formats: ['DD/MM/YYYY', 'YYYY-MM-DD'] },
    },
  },
  SUPPLIERS: {
    title: 'Suppliers',
    fields: {
      name: { label: 'Supplier Name', type: 'string', required: true, maxLength: 255 },
      code: { label: 'Supplier Code', type: 'string', required: false, maxLength: 50 },
      email: { label: 'Contact Email', type: 'email', required: false },
      phone: { label: 'Phone Number', type: 'phone', required: false },
      address: { label: 'Address', type: 'text', required: false },
      category: { label: 'Category', type: 'string', required: false, maxLength: 100 },
      status: { label: 'Status', type: 'enum', required: false, values: ['ACTIVE', 'INACTIVE', 'PENDING'] },
      approvalStatus: { label: 'Approval Status', type: 'enum', required: false, values: ['APPROVED', 'CONDITIONAL', 'UNAPPROVED'] },
      riskLevel: { label: 'Risk Level', type: 'enum', required: false, values: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
    },
  },
  EMPLOYEES: {
    title: 'Employees',
    fields: {
      firstName: { label: 'First Name', type: 'string', required: true, maxLength: 100 },
      lastName: { label: 'Last Name', type: 'string', required: true, maxLength: 100 },
      email: { label: 'Work Email', type: 'email', required: true },
      department: { label: 'Department', type: 'string', required: false, maxLength: 100 },
      jobTitle: { label: 'Job Title', type: 'string', required: false, maxLength: 100 },
      startDate: { label: 'Start Date', type: 'date', required: false, formats: ['DD/MM/YYYY', 'YYYY-MM-DD'] },
      manager: { label: "Manager's Email", type: 'email', required: false },
      status: { label: 'Status', type: 'enum', required: false, values: ['ACTIVE', 'INACTIVE', 'TERMINATED'] },
    },
  },
  CALIBRATION: {
    title: 'Calibration Records',
    fields: {
      assetId: { label: 'Asset ID', type: 'string', required: true, maxLength: 50 },
      assetName: { label: 'Asset Name', type: 'string', required: true, maxLength: 255 },
      serialNumber: { label: 'Serial Number', type: 'string', required: false, maxLength: 100 },
      location: { label: 'Location', type: 'string', required: false, maxLength: 200 },
      calibrationDate: { label: 'Calibration Date', type: 'date', required: true, formats: ['DD/MM/YYYY', 'YYYY-MM-DD'] },
      nextCalibrationDate: { label: 'Next Calibration Date', type: 'date', required: true, formats: ['DD/MM/YYYY', 'YYYY-MM-DD'] },
      result: { label: 'Result', type: 'enum', required: false, values: ['PASS', 'FAIL', 'CONDITIONAL'] },
      tolerance: { label: 'Tolerance / Specification', type: 'string', required: false, maxLength: 200 },
    },
  },
  AUDITS: {
    title: 'Audits',
    fields: {
      reference: { label: 'Audit Reference', type: 'string', required: true, example: 'AUD-2024-001' },
      title: { label: 'Audit Title', type: 'string', required: true, maxLength: 255 },
      standard: { label: 'Standard', type: 'string', required: false, maxLength: 50, example: 'ISO 9001' },
      auditDate: { label: 'Audit Date', type: 'date', required: true, formats: ['DD/MM/YYYY', 'YYYY-MM-DD'] },
      auditor: { label: 'Lead Auditor (Email)', type: 'email', required: false },
      scope: { label: 'Audit Scope', type: 'text', required: false },
      status: { label: 'Status', type: 'enum', required: false, values: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
      findings: { label: 'Number of Findings', type: 'integer', required: false },
    },
  },
};
