// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { Metadata } from 'next';
import { RegionalClient } from './client';

export const metadata: Metadata = {
  title: 'Regional & Compliance — Settings — Nexara IMS',
  description: 'Configure APAC regional settings, operating countries, and compliance notifications',
};

export default function RegionalPage() {
  return <RegionalClient />;
}
