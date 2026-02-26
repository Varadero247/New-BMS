// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
interface RenewalVars {
  firstName: string;
  companyName: string;
  renewalDate: string;
  billingUrl: string;
  calendlyUrl: string;
  couponCode?: string;
  stats?: {
    recordsCreated: number;
    auditsCompleted: number;
    documentsManaged: number;
    ncResolved: number;
    activeUsers: number;
    modulesUsed: number;
  };
}

const header = (title: string) => `
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #1B3A6B 0%, #2B5EA7 100%); border-radius: 12px 12px 0 0; padding: 30px; color: white; text-align: center;">
  <h1 style="margin: 0; font-size: 22px;">${title}</h1>
</div>
<div style="background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; padding: 30px;">`;

const footer = `
<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
<p style="font-size: 12px; color: #999; text-align: center;">Nexara IMS<br>
<a href="{{unsubscribeUrl}}" style="color: #999;">Unsubscribe</a></p>
</div></body></html>`;

const cta = (url: string, text: string) =>
  `<a href="${url}" style="display: inline-block; background: #1B3A6B; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;">${text}</a>`;

export function day90Email(vars: RenewalVars) {
  const s = vars.stats;
  return {
    subject: "Your Nexara renewal is coming up — here's your year in review",
    html: `${header('Your Year with Nexara')}
<p>Hi ${vars.firstName},</p>
<p>Your Nexara subscription renews on <strong>${vars.renewalDate}</strong>. Here's what ${vars.companyName} achieved this year:</p>
${
  s
    ? `<div style="background: #f0f4ff; border-radius: 8px; padding: 20px; margin: 16px 0;">
  <p><strong>${s.recordsCreated.toLocaleString()}</strong> records created</p>
  <p><strong>${s.auditsCompleted}</strong> audits completed</p>
  <p><strong>${s.documentsManaged.toLocaleString()}</strong> documents managed</p>
  <p><strong>${s.ncResolved}</strong> non-conformances resolved</p>
  <p><strong>${s.activeUsers}</strong> active users across <strong>${s.modulesUsed}</strong> modules</p>
</div>`
    : ''
}
${cta(vars.billingUrl, 'Renew Now & Lock In Pricing')}
${cta(vars.calendlyUrl, 'Book a Renewal Review Call')}
<p>Best,<br>The Nexara Team</p>
${footer}`,
    text: `Hi ${vars.firstName}, Your Nexara renewal is coming up on ${vars.renewalDate}. Renew now at ${vars.billingUrl}.`,
  };
}

export function day60Email(vars: RenewalVars) {
  return {
    subject: 'How your team compares — Nexara usage benchmark',
    html: `${header('Your Team vs Industry Benchmark')}
<p>Hi ${vars.firstName},</p>
<p>Here's how ${vars.companyName}'s usage compares to similar companies in your industry:</p>
<div style="background: #f0f4ff; border-radius: 8px; padding: 20px; margin: 16px 0;">
  <p>Teams your size typically manage <strong>3-4 ISO standards</strong> — we can help you expand your compliance coverage.</p>
</div>
<p>Your subscription renews on <strong>${vars.renewalDate}</strong>.</p>
${cta(vars.billingUrl, 'Renew Now')}
<p>Best,<br>The Nexara Team</p>
${footer}`,
    text: `Hi ${vars.firstName}, See how your team compares to industry benchmarks. Renewal date: ${vars.renewalDate}.`,
  };
}

export function day30Email(vars: RenewalVars) {
  return {
    subject: 'A thank-you for your first year — exclusive renewal offer inside',
    html: `${header('Exclusive Renewal Offer')}
<p>Hi ${vars.firstName},</p>
<p>As a thank you for your loyalty, here's an exclusive offer:</p>
<div style="background: #f0fdf4; border: 2px solid #16a34a; border-radius: 8px; padding: 20px; margin: 16px 0; text-align: center;">
  <h2 style="margin: 0; color: #16a34a;">5% off your renewal</h2>
  ${vars.couponCode ? `<p style="margin: 8px 0 0;">Code: <strong>${vars.couponCode}</strong> (valid 21 days)</p>` : ''}
</div>
<p>Your subscription renews on <strong>${vars.renewalDate}</strong>.</p>
${cta(vars.billingUrl, 'Renew with Discount')}
<p>Best,<br>The Nexara Team</p>
${footer}`,
    text: `Hi ${vars.firstName}, Get 5% off your renewal${vars.couponCode ? ` with code ${vars.couponCode}` : ''}. Renewal date: ${vars.renewalDate}.`,
  };
}

export function day7Email(vars: RenewalVars) {
  return {
    subject: 'Your renewal is in 7 days — special offer enclosed',
    html: `${header('Last Chance — Special Renewal Offer')}
<p>Hi ${vars.firstName},</p>
<p>Your Nexara subscription renews in <strong>7 days</strong>. We'd hate to see you go — here's our best offer:</p>
<div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 16px 0; text-align: center;">
  <h2 style="margin: 0; color: #d97706;">10% off your renewal</h2>
  ${vars.couponCode ? `<p style="margin: 8px 0 0;">Code: <strong>${vars.couponCode}</strong></p>` : ''}
</div>
${cta(vars.billingUrl, 'Renew Now')}
<p>Best,<br>The Nexara Team</p>
${footer}`,
    text: `Hi ${vars.firstName}, Your renewal is in 7 days. Get 10% off${vars.couponCode ? ` with code ${vars.couponCode}` : ''}. Renew at ${vars.billingUrl}.`,
  };
}
