// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
interface DigestVars {
  date: string;
  mrr: number;
  newTrials: number;
  newPaying: number;
  mrrChange: number;
  partnerDeals: number;
  topPriority: string;
  lowestHealthCustomer: string;
  renewalAtRisk: string;
  pipelineDeals: number;
  pipelineValue: number;
  closingThisWeek: string[];
  criticalCustomers: number;
  expiringTrials: number;
  aiRecommendation: string;
}

export function dailyDigestEmail(vars: DigestVars) {
  const mrrSign = vars.mrrChange >= 0 ? '+' : '';

  return {
    subject: `Nexara Daily — ${vars.date} | MRR £${vars.mrr.toLocaleString()} | ${vars.newTrials} trials | ${vars.criticalCustomers} alerts`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px;">

<div style="background: linear-gradient(135deg, #1B3A6B 0%, #2B5EA7 100%); border-radius: 12px 12px 0 0; padding: 24px; color: white;">
  <h1 style="margin: 0; font-size: 20px;">Nexara Daily — ${vars.date}</h1>
  <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">MRR £${vars.mrr.toLocaleString()} | ${vars.newTrials} new trials</p>
</div>

<div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 24px;">

<h2 style="font-size: 16px; color: #1B3A6B; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">YESTERDAY'S HIGHLIGHTS</h2>
<table style="width: 100%; border-collapse: collapse;">
  <tr><td style="padding: 6px 0;">New trials</td><td style="text-align: right; font-weight: 600;">${vars.newTrials}</td></tr>
  <tr><td style="padding: 6px 0;">New paying customers</td><td style="text-align: right; font-weight: 600;">${vars.newPaying}</td></tr>
  <tr><td style="padding: 6px 0;">MRR change</td><td style="text-align: right; font-weight: 600; color: ${vars.mrrChange >= 0 ? '#16a34a' : '#dc2626'};">${mrrSign}£${Math.abs(vars.mrrChange).toLocaleString()}</td></tr>
  <tr><td style="padding: 6px 0;">Partner deals submitted</td><td style="text-align: right; font-weight: 600;">${vars.partnerDeals}</td></tr>
</table>

<h2 style="font-size: 16px; color: #1B3A6B; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-top: 24px;">TODAY'S FOCUS</h2>
<ol style="padding-left: 20px;">
  <li style="margin-bottom: 8px;">${vars.topPriority}</li>
  <li style="margin-bottom: 8px;">${vars.lowestHealthCustomer}</li>
  <li style="margin-bottom: 8px;">${vars.renewalAtRisk}</li>
</ol>

<h2 style="font-size: 16px; color: #1B3A6B; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-top: 24px;">PIPELINE SNAPSHOT</h2>
<p>Total deals: <strong>${vars.pipelineDeals}</strong> worth <strong>£${vars.pipelineValue.toLocaleString()}</strong></p>
${vars.closingThisWeek.length > 0 ? `<p>Closing this week: ${vars.closingThisWeek.join(', ')}</p>` : ''}

<h2 style="font-size: 16px; color: #1B3A6B; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-top: 24px;">HEALTH ALERTS</h2>
<p>${vars.criticalCustomers} customers in critical zone (score &lt;40)</p>
<p>${vars.expiringTrials} trials expiring today</p>

<div style="background: #f0f4ff; border-left: 4px solid #1B3A6B; padding: 16px; margin-top: 24px; border-radius: 0 8px 8px 0;">
  <strong>ONE THING:</strong> ${vars.aiRecommendation}
</div>

</div>

<p style="font-size: 12px; color: #999; text-align: center; margin-top: 16px;">Nexara IMS — Founder Growth Dashboard<br>
<a href="{{unsubscribeUrl}}" style="color: #999;">Unsubscribe</a></p>
</body></html>`,
    text: `Nexara Daily — ${vars.date}\nMRR: £${vars.mrr}\nNew trials: ${vars.newTrials}\nNew paying: ${vars.newPaying}\nMRR change: ${mrrSign}£${Math.abs(vars.mrrChange)}\nONE THING: ${vars.aiRecommendation}`,
  };
}
