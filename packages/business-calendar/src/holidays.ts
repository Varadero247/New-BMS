// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { Holiday } from './types';

export const HOLIDAYS: Holiday[] = [
  // ── GB 2023 ──────────────────────────────────────────────────────────────
  { date: '2023-01-01', name: "New Year's Day", country: 'GB' },
  { date: '2023-01-02', name: "New Year's Day (observed)", country: 'GB' },
  { date: '2023-04-07', name: 'Good Friday', country: 'GB' },
  { date: '2023-04-10', name: 'Easter Monday', country: 'GB' },
  { date: '2023-05-01', name: 'Early May Bank Holiday', country: 'GB' },
  { date: '2023-05-08', name: 'Coronation Bank Holiday', country: 'GB' },
  { date: '2023-05-29', name: 'Spring Bank Holiday', country: 'GB' },
  { date: '2023-08-28', name: 'Summer Bank Holiday', country: 'GB' },
  { date: '2023-12-25', name: 'Christmas Day', country: 'GB' },
  { date: '2023-12-26', name: 'Boxing Day', country: 'GB' },

  // ── GB 2024 ──────────────────────────────────────────────────────────────
  { date: '2024-01-01', name: "New Year's Day", country: 'GB' },
  { date: '2024-03-29', name: 'Good Friday', country: 'GB' },
  { date: '2024-04-01', name: 'Easter Monday', country: 'GB' },
  { date: '2024-05-06', name: 'Early May Bank Holiday', country: 'GB' },
  { date: '2024-05-27', name: 'Spring Bank Holiday', country: 'GB' },
  { date: '2024-08-26', name: 'Summer Bank Holiday', country: 'GB' },
  { date: '2024-12-25', name: 'Christmas Day', country: 'GB' },
  { date: '2024-12-26', name: 'Boxing Day', country: 'GB' },

  // ── GB 2025 ──────────────────────────────────────────────────────────────
  { date: '2025-01-01', name: "New Year's Day", country: 'GB' },
  { date: '2025-04-18', name: 'Good Friday', country: 'GB' },
  { date: '2025-04-21', name: 'Easter Monday', country: 'GB' },
  { date: '2025-05-05', name: 'Early May Bank Holiday', country: 'GB' },
  { date: '2025-05-26', name: 'Spring Bank Holiday', country: 'GB' },
  { date: '2025-08-25', name: 'Summer Bank Holiday', country: 'GB' },
  { date: '2025-12-25', name: 'Christmas Day', country: 'GB' },
  { date: '2025-12-26', name: 'Boxing Day', country: 'GB' },

  // ── GB 2026 ──────────────────────────────────────────────────────────────
  { date: '2026-01-01', name: "New Year's Day", country: 'GB' },
  { date: '2026-04-03', name: 'Good Friday', country: 'GB' },
  { date: '2026-04-06', name: 'Easter Monday', country: 'GB' },
  { date: '2026-05-04', name: 'Early May Bank Holiday', country: 'GB' },
  { date: '2026-05-25', name: 'Spring Bank Holiday', country: 'GB' },
  { date: '2026-08-31', name: 'Summer Bank Holiday', country: 'GB' },
  { date: '2026-12-25', name: 'Christmas Day', country: 'GB' },
  { date: '2026-12-28', name: 'Boxing Day (observed)', country: 'GB' },

  // ── GB 2027 ──────────────────────────────────────────────────────────────
  { date: '2027-01-01', name: "New Year's Day", country: 'GB' },
  { date: '2027-03-26', name: 'Good Friday', country: 'GB' },
  { date: '2027-03-29', name: 'Easter Monday', country: 'GB' },
  { date: '2027-05-03', name: 'Early May Bank Holiday', country: 'GB' },
  { date: '2027-05-31', name: 'Spring Bank Holiday', country: 'GB' },
  { date: '2027-08-30', name: 'Summer Bank Holiday', country: 'GB' },
  { date: '2027-12-27', name: 'Christmas Day (observed)', country: 'GB' },
  { date: '2027-12-28', name: 'Boxing Day (observed)', country: 'GB' },

  // ── GB 2028 ──────────────────────────────────────────────────────────────
  { date: '2028-01-03', name: "New Year's Day (observed)", country: 'GB' },
  { date: '2028-04-14', name: 'Good Friday', country: 'GB' },
  { date: '2028-04-17', name: 'Easter Monday', country: 'GB' },
  { date: '2028-05-01', name: 'Early May Bank Holiday', country: 'GB' },
  { date: '2028-05-29', name: 'Spring Bank Holiday', country: 'GB' },
  { date: '2028-08-28', name: 'Summer Bank Holiday', country: 'GB' },
  { date: '2028-12-25', name: 'Christmas Day', country: 'GB' },
  { date: '2028-12-26', name: 'Boxing Day', country: 'GB' },

  // ── US 2023 ──────────────────────────────────────────────────────────────
  { date: '2023-01-01', name: "New Year's Day", country: 'US' },
  { date: '2023-01-02', name: "New Year's Day (observed)", country: 'US' },
  { date: '2023-01-16', name: 'Martin Luther King Jr Day', country: 'US' },
  { date: '2023-02-20', name: "Presidents' Day", country: 'US' },
  { date: '2023-05-29', name: 'Memorial Day', country: 'US' },
  { date: '2023-06-19', name: 'Juneteenth', country: 'US' },
  { date: '2023-07-04', name: 'Independence Day', country: 'US' },
  { date: '2023-09-04', name: 'Labor Day', country: 'US' },
  { date: '2023-11-10', name: "Veterans' Day (observed)", country: 'US' },
  { date: '2023-11-23', name: 'Thanksgiving', country: 'US' },
  { date: '2023-12-25', name: 'Christmas Day', country: 'US' },

  // ── US 2024 ──────────────────────────────────────────────────────────────
  { date: '2024-01-01', name: "New Year's Day", country: 'US' },
  { date: '2024-01-15', name: 'Martin Luther King Jr Day', country: 'US' },
  { date: '2024-02-19', name: "Presidents' Day", country: 'US' },
  { date: '2024-05-27', name: 'Memorial Day', country: 'US' },
  { date: '2024-06-19', name: 'Juneteenth', country: 'US' },
  { date: '2024-07-04', name: 'Independence Day', country: 'US' },
  { date: '2024-09-02', name: 'Labor Day', country: 'US' },
  { date: '2024-11-11', name: "Veterans' Day", country: 'US' },
  { date: '2024-11-28', name: 'Thanksgiving', country: 'US' },
  { date: '2024-12-25', name: 'Christmas Day', country: 'US' },

  // ── US 2025 ──────────────────────────────────────────────────────────────
  { date: '2025-01-01', name: "New Year's Day", country: 'US' },
  { date: '2025-01-20', name: 'Martin Luther King Jr Day', country: 'US' },
  { date: '2025-02-17', name: "Presidents' Day", country: 'US' },
  { date: '2025-05-26', name: 'Memorial Day', country: 'US' },
  { date: '2025-06-19', name: 'Juneteenth', country: 'US' },
  { date: '2025-07-04', name: 'Independence Day', country: 'US' },
  { date: '2025-09-01', name: 'Labor Day', country: 'US' },
  { date: '2025-11-11', name: "Veterans' Day", country: 'US' },
  { date: '2025-11-27', name: 'Thanksgiving', country: 'US' },
  { date: '2025-12-25', name: 'Christmas Day', country: 'US' },

  // ── US 2026 ──────────────────────────────────────────────────────────────
  { date: '2026-01-01', name: "New Year's Day", country: 'US' },
  { date: '2026-01-19', name: 'Martin Luther King Jr Day', country: 'US' },
  { date: '2026-02-16', name: "Presidents' Day", country: 'US' },
  { date: '2026-05-25', name: 'Memorial Day', country: 'US' },
  { date: '2026-06-19', name: 'Juneteenth', country: 'US' },
  { date: '2026-07-04', name: 'Independence Day', country: 'US' },
  { date: '2026-09-07', name: 'Labor Day', country: 'US' },
  { date: '2026-11-11', name: "Veterans' Day", country: 'US' },
  { date: '2026-11-26', name: 'Thanksgiving', country: 'US' },
  { date: '2026-12-25', name: 'Christmas Day', country: 'US' },

  // ── US 2027 ──────────────────────────────────────────────────────────────
  { date: '2027-01-01', name: "New Year's Day", country: 'US' },
  { date: '2027-01-18', name: 'Martin Luther King Jr Day', country: 'US' },
  { date: '2027-02-15', name: "Presidents' Day", country: 'US' },
  { date: '2027-05-31', name: 'Memorial Day', country: 'US' },
  { date: '2027-06-18', name: 'Juneteenth (observed)', country: 'US' },
  { date: '2027-07-04', name: 'Independence Day', country: 'US' },
  { date: '2027-09-06', name: 'Labor Day', country: 'US' },
  { date: '2027-11-11', name: "Veterans' Day", country: 'US' },
  { date: '2027-11-25', name: 'Thanksgiving', country: 'US' },
  { date: '2027-12-24', name: 'Christmas Day (observed)', country: 'US' },

  // ── US 2028 ──────────────────────────────────────────────────────────────
  { date: '2028-01-01', name: "New Year's Day", country: 'US' },
  { date: '2028-01-17', name: 'Martin Luther King Jr Day', country: 'US' },
  { date: '2028-02-21', name: "Presidents' Day", country: 'US' },
  { date: '2028-05-29', name: 'Memorial Day', country: 'US' },
  { date: '2028-06-19', name: 'Juneteenth', country: 'US' },
  { date: '2028-07-04', name: 'Independence Day', country: 'US' },
  { date: '2028-09-04', name: 'Labor Day', country: 'US' },
  { date: '2028-11-10', name: "Veterans' Day (observed)", country: 'US' },
  { date: '2028-11-23', name: 'Thanksgiving', country: 'US' },
  { date: '2028-12-25', name: 'Christmas Day', country: 'US' },

  // ── AE 2023 ──────────────────────────────────────────────────────────────
  { date: '2023-01-01', name: "New Year's Day", country: 'AE' },
  { date: '2023-04-21', name: 'Eid Al Fitr (est.)', country: 'AE' },
  { date: '2023-04-22', name: 'Eid Al Fitr 2nd (est.)', country: 'AE' },
  { date: '2023-04-23', name: 'Eid Al Fitr 3rd (est.)', country: 'AE' },
  { date: '2023-06-28', name: 'Arafat Day (est.)', country: 'AE' },
  { date: '2023-06-29', name: 'Eid Al Adha (est.)', country: 'AE' },
  { date: '2023-06-30', name: 'Eid Al Adha 2nd (est.)', country: 'AE' },
  { date: '2023-07-01', name: 'Eid Al Adha 3rd (est.)', country: 'AE' },
  { date: '2023-12-02', name: 'UAE National Day', country: 'AE' },
  { date: '2023-12-03', name: 'UAE National Day 2nd', country: 'AE' },

  // ── AE 2024 ──────────────────────────────────────────────────────────────
  { date: '2024-01-01', name: "New Year's Day", country: 'AE' },
  { date: '2024-04-09', name: 'Eid Al Fitr (est.)', country: 'AE' },
  { date: '2024-04-10', name: 'Eid Al Fitr 2nd (est.)', country: 'AE' },
  { date: '2024-04-11', name: 'Eid Al Fitr 3rd (est.)', country: 'AE' },
  { date: '2024-06-16', name: 'Arafat Day (est.)', country: 'AE' },
  { date: '2024-06-17', name: 'Eid Al Adha (est.)', country: 'AE' },
  { date: '2024-06-18', name: 'Eid Al Adha 2nd (est.)', country: 'AE' },
  { date: '2024-06-19', name: 'Eid Al Adha 3rd (est.)', country: 'AE' },
  { date: '2024-12-02', name: 'UAE National Day', country: 'AE' },
  { date: '2024-12-03', name: 'UAE National Day 2nd', country: 'AE' },

  // ── AE 2025 ──────────────────────────────────────────────────────────────
  { date: '2025-01-01', name: "New Year's Day", country: 'AE' },
  { date: '2025-03-30', name: 'Eid Al Fitr (est.)', country: 'AE' },
  { date: '2025-03-31', name: 'Eid Al Fitr 2nd (est.)', country: 'AE' },
  { date: '2025-04-01', name: 'Eid Al Fitr 3rd (est.)', country: 'AE' },
  { date: '2025-06-06', name: 'Arafat Day (est.)', country: 'AE' },
  { date: '2025-06-07', name: 'Eid Al Adha (est.)', country: 'AE' },
  { date: '2025-06-08', name: 'Eid Al Adha 2nd (est.)', country: 'AE' },
  { date: '2025-06-09', name: 'Eid Al Adha 3rd (est.)', country: 'AE' },
  { date: '2025-12-02', name: 'UAE National Day', country: 'AE' },
  { date: '2025-12-03', name: 'UAE National Day 2nd', country: 'AE' },

  // ── AE 2026 ──────────────────────────────────────────────────────────────
  { date: '2026-01-01', name: "New Year's Day", country: 'AE' },
  { date: '2026-03-19', name: 'Eid Al Fitr (est.)', country: 'AE' },
  { date: '2026-03-20', name: 'Eid Al Fitr 2nd (est.)', country: 'AE' },
  { date: '2026-03-21', name: 'Eid Al Fitr 3rd (est.)', country: 'AE' },
  { date: '2026-05-26', name: 'Arafat Day (est.)', country: 'AE' },
  { date: '2026-05-27', name: 'Eid Al Adha (est.)', country: 'AE' },
  { date: '2026-05-28', name: 'Eid Al Adha 2nd (est.)', country: 'AE' },
  { date: '2026-05-29', name: 'Eid Al Adha 3rd (est.)', country: 'AE' },
  { date: '2026-12-02', name: 'UAE National Day', country: 'AE' },
  { date: '2026-12-03', name: 'UAE National Day 2nd', country: 'AE' },

  // ── AE 2027 ──────────────────────────────────────────────────────────────
  { date: '2027-01-01', name: "New Year's Day", country: 'AE' },
  { date: '2027-03-09', name: 'Eid Al Fitr (est.)', country: 'AE' },
  { date: '2027-03-10', name: 'Eid Al Fitr 2nd (est.)', country: 'AE' },
  { date: '2027-03-11', name: 'Eid Al Fitr 3rd (est.)', country: 'AE' },
  { date: '2027-05-15', name: 'Arafat Day (est.)', country: 'AE' },
  { date: '2027-05-16', name: 'Eid Al Adha (est.)', country: 'AE' },
  { date: '2027-05-17', name: 'Eid Al Adha 2nd (est.)', country: 'AE' },
  { date: '2027-05-18', name: 'Eid Al Adha 3rd (est.)', country: 'AE' },
  { date: '2027-12-02', name: 'UAE National Day', country: 'AE' },
  { date: '2027-12-03', name: 'UAE National Day 2nd', country: 'AE' },

  // ── AE 2028 ──────────────────────────────────────────────────────────────
  { date: '2028-01-01', name: "New Year's Day", country: 'AE' },
  { date: '2028-02-26', name: 'Eid Al Fitr (est.)', country: 'AE' },
  { date: '2028-02-27', name: 'Eid Al Fitr 2nd (est.)', country: 'AE' },
  { date: '2028-02-28', name: 'Eid Al Fitr 3rd (est.)', country: 'AE' },
  { date: '2028-05-03', name: 'Arafat Day (est.)', country: 'AE' },
  { date: '2028-05-04', name: 'Eid Al Adha (est.)', country: 'AE' },
  { date: '2028-05-05', name: 'Eid Al Adha 2nd (est.)', country: 'AE' },
  { date: '2028-05-06', name: 'Eid Al Adha 3rd (est.)', country: 'AE' },
  { date: '2028-12-02', name: 'UAE National Day', country: 'AE' },
  { date: '2028-12-03', name: 'UAE National Day 2nd', country: 'AE' },

  // ── AU 2023 ──────────────────────────────────────────────────────────────
  { date: '2023-01-01', name: "New Year's Day", country: 'AU' },
  { date: '2023-01-02', name: "New Year's Day (observed)", country: 'AU' },
  { date: '2023-01-26', name: 'Australia Day', country: 'AU' },
  { date: '2023-04-07', name: 'Good Friday', country: 'AU' },
  { date: '2023-04-08', name: 'Easter Saturday', country: 'AU' },
  { date: '2023-04-09', name: 'Easter Sunday', country: 'AU' },
  { date: '2023-04-10', name: 'Easter Monday', country: 'AU' },
  { date: '2023-04-25', name: 'ANZAC Day', country: 'AU' },
  { date: '2023-12-25', name: 'Christmas Day', country: 'AU' },
  { date: '2023-12-26', name: 'Boxing Day', country: 'AU' },

  // ── AU 2024 ──────────────────────────────────────────────────────────────
  { date: '2024-01-01', name: "New Year's Day", country: 'AU' },
  { date: '2024-01-26', name: 'Australia Day', country: 'AU' },
  { date: '2024-03-29', name: 'Good Friday', country: 'AU' },
  { date: '2024-03-30', name: 'Easter Saturday', country: 'AU' },
  { date: '2024-03-31', name: 'Easter Sunday', country: 'AU' },
  { date: '2024-04-01', name: 'Easter Monday', country: 'AU' },
  { date: '2024-04-25', name: 'ANZAC Day', country: 'AU' },
  { date: '2024-12-25', name: 'Christmas Day', country: 'AU' },
  { date: '2024-12-26', name: 'Boxing Day', country: 'AU' },

  // ── AU 2025 ──────────────────────────────────────────────────────────────
  { date: '2025-01-01', name: "New Year's Day", country: 'AU' },
  { date: '2025-01-27', name: 'Australia Day (observed)', country: 'AU' },
  { date: '2025-04-18', name: 'Good Friday', country: 'AU' },
  { date: '2025-04-19', name: 'Easter Saturday', country: 'AU' },
  { date: '2025-04-20', name: 'Easter Sunday', country: 'AU' },
  { date: '2025-04-21', name: 'Easter Monday', country: 'AU' },
  { date: '2025-04-25', name: 'ANZAC Day', country: 'AU' },
  { date: '2025-12-25', name: 'Christmas Day', country: 'AU' },
  { date: '2025-12-26', name: 'Boxing Day', country: 'AU' },

  // ── AU 2026 ──────────────────────────────────────────────────────────────
  { date: '2026-01-01', name: "New Year's Day", country: 'AU' },
  { date: '2026-01-26', name: 'Australia Day', country: 'AU' },
  { date: '2026-04-03', name: 'Good Friday', country: 'AU' },
  { date: '2026-04-04', name: 'Easter Saturday', country: 'AU' },
  { date: '2026-04-05', name: 'Easter Sunday', country: 'AU' },
  { date: '2026-04-06', name: 'Easter Monday', country: 'AU' },
  { date: '2026-04-25', name: 'ANZAC Day', country: 'AU' },
  { date: '2026-12-25', name: 'Christmas Day', country: 'AU' },
  { date: '2026-12-28', name: 'Boxing Day (observed)', country: 'AU' },

  // ── AU 2027 ──────────────────────────────────────────────────────────────
  { date: '2027-01-01', name: "New Year's Day", country: 'AU' },
  { date: '2027-01-26', name: 'Australia Day', country: 'AU' },
  { date: '2027-03-26', name: 'Good Friday', country: 'AU' },
  { date: '2027-03-27', name: 'Easter Saturday', country: 'AU' },
  { date: '2027-03-28', name: 'Easter Sunday', country: 'AU' },
  { date: '2027-03-29', name: 'Easter Monday', country: 'AU' },
  { date: '2027-04-25', name: 'ANZAC Day', country: 'AU' },
  { date: '2027-12-25', name: 'Christmas Day', country: 'AU' },
  { date: '2027-12-27', name: 'Boxing Day (observed)', country: 'AU' },

  // ── AU 2028 ──────────────────────────────────────────────────────────────
  { date: '2028-01-01', name: "New Year's Day", country: 'AU' },
  { date: '2028-01-26', name: 'Australia Day', country: 'AU' },
  { date: '2028-04-14', name: 'Good Friday', country: 'AU' },
  { date: '2028-04-15', name: 'Easter Saturday', country: 'AU' },
  { date: '2028-04-16', name: 'Easter Sunday', country: 'AU' },
  { date: '2028-04-17', name: 'Easter Monday', country: 'AU' },
  { date: '2028-04-25', name: 'ANZAC Day', country: 'AU' },
  { date: '2028-12-25', name: 'Christmas Day', country: 'AU' },
  { date: '2028-12-26', name: 'Boxing Day', country: 'AU' },
];

export function getHolidays(country: string, year?: number): Holiday[] {
  return HOLIDAYS.filter(h => {
    if (h.country !== country) return false;
    if (year !== undefined && !h.date.startsWith(String(year))) return false;
    return true;
  });
}

export function isHoliday(date: Date | string, country: string): boolean {
  const d = typeof date === 'string' ? date : date.toISOString().slice(0, 10);
  return HOLIDAYS.some(h => h.date === d && h.country === country);
}
