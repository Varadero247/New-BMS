// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export interface PDFSection {
  type: 'header' | 'paragraph' | 'table' | 'list' | 'divider' | 'key-value' | 'signature';
  content?: string;
  items?: string[];
  rows?: string[][];
  headers?: string[];
  pairs?: Array<{ key: string; value: string }>;
  style?: Record<string, string>;
}

export interface PDFTemplate {
  title: string;
  sections: PDFSection[];
  header?: {
    logo?: string;
    company?: string;
    subtitle?: string;
  };
  footer?: {
    text?: string;
    pageNumbers?: boolean;
  };
}

export interface PDFOptions {
  pageSize?: 'A4' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  watermark?: string;
  locale?: string;
  currency?: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  company: { name: string; address: string; taxId?: string };
  customer: { name: string; address: string; taxId?: string };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes?: string;
}

export interface ReportData {
  title: string;
  reportDate: string;
  period: string;
  author: string;
  sections: Array<{
    heading: string;
    content: string;
    metrics?: Array<{ label: string; value: string | number }>;
  }>;
  summary?: string;
}

export interface EvidencePackData {
  referenceNumber: string;
  title: string;
  module: string;
  dateGenerated: string;
  items: Array<{
    type: string;
    description: string;
    date: string;
    status: string;
    details?: string;
  }>;
  preparedBy: string;
  approvedBy?: string;
}
