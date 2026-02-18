interface MonthlyReportVars {
  month: string;
  monthNumber: number;
  snapshot: {
    mrr: number | string | null;
    arr: number | string | null;
    customers: number;
    newCustomers: number;
    churnedCustomers: number;
    mrrGrowthPct: number | string | null;
    revenueChurnPct: number | string | null;
    pipelineValue: number | string | null;
    wonDeals: number;
    winRate: number | string | null;
    newLeads: number;
    founderSalary: number | string | null;
    founderLoanPayment: number | string | null;
    founderDividend: number | string | null;
    founderTotalIncome: number | string | null;
    founderDirLoanPayment?: number | string | null;
    founderDirLoanInterest?: number | string | null;
    founderDirLoanPrincipal?: number | string | null;
    founderDirLoanBalance?: number | string | null;
    founderStarterLoanPayment?: number | string | null;
    founderStarterLoanInterest?: number | string | null;
    founderStarterLoanPrincipal?: number | string | null;
    founderStarterLoanBalance?: number | string | null;
    aiSummary?: string | null;
    aiAlerts?: number | string | null;
    aiRecommendations?: number | string | null;
    trajectory?: string | null;
  };
  planTarget?: {
    plannedMrr: number | string | null;
    plannedCustomers: number;
    plannedNewCustomers: number;
    plannedChurnPct: number | string | null;
  };
}

function fmt(value: unknown): string {
  return `£${Number(value || 0).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function pct(value: unknown): string {
  return `${Number(value || 0).toFixed(1)}%`;
}

function varianceColor(actual: number, planned: number): string {
  if (planned === 0) return '#6b7280';
  const ratio = actual / planned;
  if (ratio >= 1.05) return '#16a34a';
  if (ratio >= 0.95) return '#6b7280';
  return '#dc2626';
}

function trajectoryBadge(trajectory?: string | null): string {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    AHEAD: { bg: '#dcfce7', color: '#16a34a', label: 'AHEAD OF PLAN' },
    ON_TRACK: { bg: '#dbeafe', color: '#2563eb', label: 'ON TRACK' },
    BEHIND: { bg: '#fee2e2', color: '#dc2626', label: 'BEHIND PLAN' },
  };
  const style = map[trajectory || 'ON_TRACK'] || map.ON_TRACK;
  return `<span style="display:inline-block;padding:4px 12px;border-radius:12px;background:${style.bg};color:${style.color};font-weight:600;font-size:12px;">${style.label}</span>`;
}

export function monthlyReportEmail(vars: MonthlyReportVars) {
  const { month, monthNumber, snapshot, planTarget } = vars;
  const monthLabel = new Date(month + '-01').toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
  const alerts: string[] = Array.isArray(snapshot.aiAlerts) ? snapshot.aiAlerts : [];
  const recommendations: unknown[] = Array.isArray(snapshot.aiRecommendations)
    ? snapshot.aiRecommendations
    : [];
  const greenFlags: string[] = [];
  const redFlags: string[] = [];

  // Classify alerts
  if (planTarget) {
    if (Number(snapshot.mrr) >= Number(planTarget.plannedMrr))
      greenFlags.push(`MRR at or above plan (${fmt(snapshot.mrr)})`);
    else
      redFlags.push(`MRR below plan: ${fmt(snapshot.mrr)} vs ${fmt(planTarget.plannedMrr)} target`);

    if (snapshot.customers >= planTarget.plannedCustomers)
      greenFlags.push(`Customer count on track (${snapshot.customers})`);
    else
      redFlags.push(
        `Customers below plan: ${snapshot.customers} vs ${planTarget.plannedCustomers} target`
      );

    if (Number(snapshot.revenueChurnPct) <= Number(planTarget.plannedChurnPct))
      greenFlags.push(`Churn within target (${pct(snapshot.revenueChurnPct)})`);
    else
      redFlags.push(
        `Churn above target: ${pct(snapshot.revenueChurnPct)} vs ${pct(planTarget.plannedChurnPct)} plan`
      );
  }
  alerts.forEach((a) => redFlags.push(a));

  // Build KPI rows
  const kpiRows = [
    {
      label: 'MRR',
      actual: fmt(snapshot.mrr),
      plan: planTarget ? fmt(planTarget.plannedMrr) : 'N/A',
      color: planTarget
        ? varianceColor(Number(snapshot.mrr), Number(planTarget.plannedMrr))
        : '#6b7280',
    },
    {
      label: 'ARR',
      actual: fmt(snapshot.arr),
      plan: planTarget ? fmt(Number(planTarget.plannedMrr) * 12) : 'N/A',
      color: planTarget
        ? varianceColor(Number(snapshot.arr), Number(planTarget.plannedMrr) * 12)
        : '#6b7280',
    },
    {
      label: 'Customers',
      actual: String(snapshot.customers),
      plan: planTarget ? String(planTarget.plannedCustomers) : 'N/A',
      color: planTarget
        ? varianceColor(snapshot.customers, planTarget.plannedCustomers)
        : '#6b7280',
    },
    {
      label: 'New Customers',
      actual: String(snapshot.newCustomers),
      plan: planTarget ? String(planTarget.plannedNewCustomers) : 'N/A',
      color: planTarget
        ? varianceColor(snapshot.newCustomers, planTarget.plannedNewCustomers)
        : '#6b7280',
    },
    {
      label: 'Revenue Churn',
      actual: pct(snapshot.revenueChurnPct),
      plan: planTarget ? pct(planTarget.plannedChurnPct) : 'N/A',
      color: planTarget
        ? varianceColor(Number(planTarget.plannedChurnPct), Number(snapshot.revenueChurnPct))
        : '#6b7280',
    },
    { label: 'Pipeline', actual: fmt(snapshot.pipelineValue), plan: 'N/A', color: '#6b7280' },
    { label: 'Win Rate', actual: pct(snapshot.winRate), plan: 'N/A', color: '#6b7280' },
  ];

  const kpiRowsHtml = kpiRows
    .map(
      (r) =>
        `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:500;">${r.label}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${r.plan}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">${r.actual}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;"><span style="color:${r.color};font-weight:600;">${r.color === '#16a34a' ? '↑' : r.color === '#dc2626' ? '↓' : '—'}</span></td>
    </tr>`
    )
    .join('');

  const greenFlagsHtml =
    greenFlags.length > 0
      ? greenFlags.map((f) => `<div style="padding:6px 0;">✅ ${f}</div>`).join('')
      : '<div style="color:#6b7280;">No green flags this month</div>';

  const redFlagsHtml =
    redFlags.length > 0
      ? redFlags.map((f) => `<div style="padding:6px 0;">🔴 ${f}</div>`).join('')
      : '<div style="color:#6b7280;">No red flags — great month!</div>';

  const recsHtml =
    recommendations.length > 0
      ? `<table style="width:100%;border-collapse:collapse;margin-top:12px;">
        <thead><tr style="background:#f9fafb;">
          <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;">Metric</th>
          <th style="padding:8px 12px;text-align:right;font-size:12px;color:#6b7280;">Current</th>
          <th style="padding:8px 12px;text-align:right;font-size:12px;color:#6b7280;">Suggested</th>
          <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;">Rationale</th>
        </tr></thead>
        <tbody>${recommendations
          .map(
            (r: Record<string, unknown>) =>
              `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${r.metric}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${fmt(r.current)}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">${fmt(r.suggested)}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">${r.rationale}</td>
          </tr>`
          )
          .join('')}</tbody>
      </table>`
      : '<p style="color:#6b7280;">No recalibration proposals this month.</p>';

  const platformUrl = process.env.PLATFORM_URL || 'https://app.nexara.io';

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 640px; margin: 0 auto; padding: 20px; background: #f5f5f5;">

<!-- Section 1: Header -->
<div style="background: linear-gradient(135deg, #0F2440 0%, #1B3A6B 100%); border-radius: 12px 12px 0 0; padding: 28px; color: white;">
  <h1 style="margin: 0; font-size: 22px;">Monthly Performance Report</h1>
  <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">${monthLabel} — Month ${monthNumber} of 36</p>
  <div style="margin-top: 12px;">${trajectoryBadge(snapshot.trajectory)}</div>
</div>

<div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 28px;">

<!-- Section 2: KPI Scorecard -->
<h2 style="font-size: 16px; color: #0F2440; border-bottom: 2px solid #1B3A6B; padding-bottom: 8px; margin-top: 0;">KPI Scorecard</h2>
<table style="width: 100%; border-collapse: collapse;">
  <thead><tr style="background: #f9fafb;">
    <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;">Metric</th>
    <th style="padding:8px 12px;text-align:right;font-size:12px;color:#6b7280;">Plan</th>
    <th style="padding:8px 12px;text-align:right;font-size:12px;color:#6b7280;">Actual</th>
    <th style="padding:8px 12px;text-align:center;font-size:12px;color:#6b7280;">Var</th>
  </tr></thead>
  <tbody>${kpiRowsHtml}</tbody>
</table>

<!-- Section 3: AI Executive Summary -->
<h2 style="font-size: 16px; color: #0F2440; border-bottom: 2px solid #1B3A6B; padding-bottom: 8px; margin-top: 28px;">AI Executive Summary</h2>
<p style="font-size: 14px; color: #374151; line-height: 1.7;">${snapshot.aiSummary || 'AI analysis not available for this month.'}</p>

<!-- Section 4: Green & Red Flags -->
<div style="display: flex; gap: 16px; margin-top: 28px;">
  <div style="flex: 1;">
    <h3 style="font-size: 14px; color: #16a34a; margin-bottom: 8px;">Green Flags</h3>
    ${greenFlagsHtml}
  </div>
  <div style="flex: 1;">
    <h3 style="font-size: 14px; color: #dc2626; margin-bottom: 8px;">Red Flags & Actions</h3>
    ${redFlagsHtml}
  </div>
</div>

<!-- Section 5: Month 12 ARR Confidence -->
<h2 style="font-size: 16px; color: #0F2440; border-bottom: 2px solid #1B3A6B; padding-bottom: 8px; margin-top: 28px;">Month 12 ARR Confidence</h2>
<div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin-top: 8px;">
  <p style="margin: 0; font-size: 14px; color: #0369a1;">
    Based on current trajectory (<strong>${snapshot.trajectory || 'ON_TRACK'}</strong>),
    Month 12 ARR target is <strong>£576,000</strong>
    (${fmt(snapshot.mrr)} MRR × 12 = ${fmt(Number(snapshot.arr))} current ARR).
  </p>
</div>

<!-- Section 6: Recalibration Proposals -->
<h2 style="font-size: 16px; color: #0F2440; border-bottom: 2px solid #1B3A6B; padding-bottom: 8px; margin-top: 28px;">Recalibration Proposals</h2>
${recsHtml}
<div style="text-align: center; margin-top: 16px;">
  <a href="${platformUrl}/monthly-review" style="display:inline-block;background:#1B3A6B;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">REVIEW & APPROVE TARGETS</a>
</div>

<!-- Section 7: Founder Income Summary -->
<h2 style="font-size: 16px; color: #0F2440; border-bottom: 2px solid #1B3A6B; padding-bottom: 8px; margin-top: 28px;">Founder Income</h2>
<table style="width: 100%; border-collapse: collapse;">
  <tr><td style="padding:6px 0;">Salary</td><td style="text-align:right;font-weight:600;">${fmt(snapshot.founderSalary)}</td></tr>
  <tr><td style="padding:6px 0;color:#4b5563;">Director's Loan (£320K)</td><td style="text-align:right;font-weight:600;color:#dc2626;">-${fmt(snapshot.founderDirLoanPayment || 0)}</td></tr>
  <tr><td style="padding:2px 0 2px 16px;font-size:12px;color:#6b7280;">Interest / Principal</td><td style="text-align:right;font-size:12px;color:#6b7280;">${fmt(snapshot.founderDirLoanInterest || 0)} / ${fmt(snapshot.founderDirLoanPrincipal || 0)} — Bal: ${fmt(snapshot.founderDirLoanBalance || 0)}</td></tr>
  <tr><td style="padding:6px 0;color:#4b5563;">Starter Loan (£30K)</td><td style="text-align:right;font-weight:600;color:#dc2626;">-${fmt(snapshot.founderStarterLoanPayment || 0)}</td></tr>
  <tr><td style="padding:2px 0 2px 16px;font-size:12px;color:#6b7280;">Interest / Principal</td><td style="text-align:right;font-size:12px;color:#6b7280;">${fmt(snapshot.founderStarterLoanInterest || 0)} / ${fmt(snapshot.founderStarterLoanPrincipal || 0)} — Bal: ${fmt(snapshot.founderStarterLoanBalance || 0)}</td></tr>
  <tr><td style="padding:6px 0;">Dividend</td><td style="text-align:right;font-weight:600;color:#16a34a;">${fmt(snapshot.founderDividend)}</td></tr>
  <tr style="border-top:2px solid #1B3A6B;"><td style="padding:8px 0;font-weight:700;">Total Net Income</td><td style="text-align:right;font-weight:700;font-size:16px;">${fmt(snapshot.founderTotalIncome)}</td></tr>
</table>

</div>

<!-- Footer -->
<div style="background: #0F2440; border-radius: 0 0 12px 12px; padding: 20px; text-align: center;">
  <a href="${platformUrl}/growth-dashboard" style="color: #93c5fd; text-decoration: none; font-size: 13px; margin: 0 12px;">Dashboard</a>
  <a href="${platformUrl}/monthly-review" style="color: #93c5fd; text-decoration: none; font-size: 13px; margin: 0 12px;">Review History</a>
  <p style="color: #6b7280; font-size: 11px; margin: 12px 0 0;">Nexara Monthly Performance Report — Auto-generated</p>
</div>

</body></html>`;

  const text = `Nexara Monthly Performance Report — ${monthLabel} (Month ${monthNumber})
Status: ${snapshot.trajectory || 'ON_TRACK'}
MRR: ${fmt(snapshot.mrr)} | Customers: ${snapshot.customers} | Growth: ${pct(snapshot.mrrGrowthPct)}
${snapshot.aiSummary || 'No AI summary available.'}
Founder income: ${fmt(snapshot.founderTotalIncome)} net
View full report: ${platformUrl}/monthly-review`;

  return {
    subject: `Nexara M${monthNumber} Report — ${fmt(snapshot.mrr)} MRR | ${snapshot.trajectory || 'ON_TRACK'} | ${monthLabel}`,
    html,
    text,
  };
}
