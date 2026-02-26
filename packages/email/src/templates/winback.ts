// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
interface WinBackVars {
  firstName: string;
  companyName: string;
  cancelDate: string;
  reactivateUrl: string;
  exportUrl: string;
  reasonLinks?: {
    price: string;
    features: string;
    time: string;
    competitor: string;
    business: string;
  };
  couponCode?: string;
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

export function cancellationConfirmEmail(vars: WinBackVars) {
  return {
    subject: 'Your Nexara subscription has been cancelled',
    html: `${header('Subscription Cancelled')}
<p>Hi ${vars.firstName},</p>
<p>Your Nexara subscription has been cancelled effective <strong>${vars.cancelDate}</strong>.</p>
<ul>
  <li>You have <strong>30 days</strong> to export your data</li>
  <li>All your records remain accessible until then</li>
</ul>
${cta(vars.reactivateUrl, 'Changed Your Mind? Reactivate')}
<p style="margin-top: 16px;">${cta(vars.exportUrl, 'Export Your Data')}</p>
<p>We're sorry to see you go.</p>
<p>Best,<br>The Nexara Team</p>
${footer}`,
    text: `Hi ${vars.firstName}, Your Nexara subscription has been cancelled. You have 30 days to export your data at ${vars.exportUrl}. Reactivate at ${vars.reactivateUrl}.`,
  };
}

export function day3ReasonEmail(vars: WinBackVars) {
  const links = vars.reasonLinks;
  return {
    subject: "We'd love to understand — what made you cancel?",
    html: `${header('Help Us Improve')}
<p>Hi ${vars.firstName},</p>
<p>We'd love to understand why you cancelled. Click the reason that fits best:</p>
<div style="margin: 20px 0;">
  ${
    links
      ? `
  <p><a href="${links.price}" style="color: #1B3A6B; font-weight: 600;">Too expensive</a></p>
  <p><a href="${links.features}" style="color: #1B3A6B; font-weight: 600;">Missing a feature I need</a></p>
  <p><a href="${links.time}" style="color: #1B3A6B; font-weight: 600;">Not enough time to implement</a></p>
  <p><a href="${links.competitor}" style="color: #1B3A6B; font-weight: 600;">Switching to a different solution</a></p>
  <p><a href="${links.business}" style="color: #1B3A6B; font-weight: 600;">Business circumstances changed</a></p>
  `
      : "<p>We'd love your feedback.</p>"
  }
</div>
<p>Your response helps us build a better product.</p>
<p>Best,<br>The Nexara Team</p>
${footer}`,
    text: `Hi ${vars.firstName}, We'd love to understand why you cancelled. Your feedback helps us improve.`,
  };
}

export function day7PriceEmail(vars: WinBackVars) {
  return {
    subject: "We'd love to keep you — here's a plan that works better",
    html: `${header('A Better Plan for You')}
<p>Hi ${vars.firstName},</p>
<p>We heard pricing was a concern. Here's what we can offer:</p>
<div style="background: #f0fdf4; border: 2px solid #16a34a; border-radius: 8px; padding: 20px; margin: 16px 0; text-align: center;">
  <h2 style="margin: 0; color: #16a34a;">15% off + switch to annual billing</h2>
  <p style="margin: 8px 0 0;">That's a significant saving on your current plan</p>
</div>
${cta(vars.reactivateUrl, 'Reactivate with Discount')}
<p>Best,<br>The Nexara Team</p>
${footer}`,
    text: `Hi ${vars.firstName}, Get 15% off plus annual billing savings. Reactivate at ${vars.reactivateUrl}.`,
  };
}

export function day14FinalEmail(vars: WinBackVars) {
  return {
    subject: 'Last chance — your data is still here, waiting for you',
    html: `${header('Your Data is Waiting')}
<p>Hi ${vars.firstName},</p>
<p>Your Nexara data is still safe, but it won't be for much longer. Here's our best offer:</p>
<div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 16px 0; text-align: center;">
  <h2 style="margin: 0; color: #d97706;">20% off for 6 months</h2>
  ${vars.couponCode ? `<p style="margin: 8px 0 0;">Code: <strong>${vars.couponCode}</strong></p>` : ''}
</div>
${cta(vars.reactivateUrl, 'Reactivate Now')}
<p>Best,<br>The Nexara Team</p>
${footer}`,
    text: `Hi ${vars.firstName}, Your data is still here. Get 20% off for 6 months. Reactivate at ${vars.reactivateUrl}.`,
  };
}

export function day30PurgeEmail(vars: WinBackVars) {
  return {
    subject: 'Your data will be deleted in 7 days — export now or reactivate',
    html: `${header('Data Deletion Notice')}
<p>Hi ${vars.firstName},</p>
<p><strong>Important:</strong> Your Nexara data will be permanently deleted in <strong>7 days</strong>.</p>
<p>To keep your data, either:</p>
${cta(vars.exportUrl, 'Export Your Data Now')}
<p>or</p>
${cta(vars.reactivateUrl, 'Reactivate Your Account')}
<p>After deletion, your data cannot be recovered.</p>
<p>Best,<br>The Nexara Team</p>
${footer}`,
    text: `Hi ${vars.firstName}, Your data will be deleted in 7 days. Export at ${vars.exportUrl} or reactivate at ${vars.reactivateUrl}.`,
  };
}
