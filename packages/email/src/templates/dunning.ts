// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
interface DunningVars {
  customerName: string;
  amount: string;
  currency?: string;
  invoiceNumber?: string;
  billingUrl?: string;
  supportEmail?: string;
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
<p style="font-size: 12px; color: #999; text-align: center;">Nexara IMS &mdash; Integrated Management System<br>
<a href="mailto:billing@nexara.app" style="color: #999;">Contact Billing Support</a></p>
</div></body></html>`;

const cta = (url: string, text: string) =>
  `<a href="${url}" style="display: inline-block; background: #1B3A6B; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;">${text}</a>`;

/**
 * Day 0 — Immediate notification that payment failed
 */
export function dunningDay0Email(vars: DunningVars) {
  const billingUrl = vars.billingUrl || 'https://app.nexara.app/billing';
  const supportEmail = vars.supportEmail || 'billing@nexara.app';

  return {
    subject: `Payment failed for your Nexara subscription (${vars.amount})`,
    html: `${header('Payment Failed')}
<p>Hi ${vars.customerName},</p>
<p>We were unable to process your payment of <strong>${vars.currency || 'GBP'} ${vars.amount}</strong>${vars.invoiceNumber ? ` (Invoice: ${vars.invoiceNumber})` : ''}.</p>
<p>This is likely due to an expired card or insufficient funds. Please update your payment method to avoid any disruption to your service.</p>
${cta(billingUrl, 'Update Payment Method')}
<p>If you believe this is an error, please contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
<p>Best regards,<br>The Nexara Billing Team</p>
${footer}`,
    text: `Hi ${vars.customerName}, We were unable to process your payment of ${vars.currency || 'GBP'} ${vars.amount}. Please update your payment method at ${billingUrl}. Contact ${supportEmail} if you need help.`,
  };
}

/**
 * Day 3 — Gentle reminder
 */
export function dunningDay3Email(vars: DunningVars) {
  const billingUrl = vars.billingUrl || 'https://app.nexara.app/billing';
  const supportEmail = vars.supportEmail || 'billing@nexara.app';

  return {
    subject: `Reminder: Payment of ${vars.amount} still outstanding`,
    html: `${header('Payment Reminder')}
<p>Hi ${vars.customerName},</p>
<p>This is a friendly reminder that your payment of <strong>${vars.currency || 'GBP'} ${vars.amount}</strong> is still outstanding.</p>
<p>We will attempt to charge your payment method again shortly. To ensure uninterrupted access to Nexara, please update your payment details if needed.</p>
${cta(billingUrl, 'Update Payment Method')}
<p>Need help? Reply to this email or contact <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
<p>Best regards,<br>The Nexara Billing Team</p>
${footer}`,
    text: `Hi ${vars.customerName}, Your payment of ${vars.currency || 'GBP'} ${vars.amount} is still outstanding. Please update your payment method at ${billingUrl}.`,
  };
}

/**
 * Day 7 — Urgent notice with access warning
 */
export function dunningDay7Email(vars: DunningVars) {
  const billingUrl = vars.billingUrl || 'https://app.nexara.app/billing';
  const supportEmail = vars.supportEmail || 'billing@nexara.app';

  return {
    subject: `Action required: Your Nexara access may be affected`,
    html: `${header('Urgent: Payment Required')}
<p>Hi ${vars.customerName},</p>
<p>Your payment of <strong>${vars.currency || 'GBP'} ${vars.amount}</strong> remains unpaid. We have attempted to process this payment multiple times without success.</p>
<div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 16px 0;">
  <p style="margin: 0; font-weight: 600; color: #92400e;">Your account access may be restricted if payment is not received within the next 7 days.</p>
</div>
<p>Please update your payment method immediately to maintain access to all your compliance data and management tools.</p>
${cta(billingUrl, 'Pay Now')}
<p>If you are experiencing difficulties, please reach out to <a href="mailto:${supportEmail}">${supportEmail}</a> and we will work with you to find a solution.</p>
<p>Best regards,<br>The Nexara Billing Team</p>
${footer}`,
    text: `Hi ${vars.customerName}, URGENT: Your payment of ${vars.currency || 'GBP'} ${vars.amount} is overdue. Your access may be restricted within 7 days. Please pay now at ${billingUrl}.`,
  };
}

/**
 * Day 14 — Final notice before cancellation
 */
export function dunningDay14Email(vars: DunningVars) {
  const billingUrl = vars.billingUrl || 'https://app.nexara.app/billing';
  const supportEmail = vars.supportEmail || 'billing@nexara.app';

  return {
    subject: `Final notice: Your Nexara subscription will be cancelled`,
    html: `${header('Final Notice')}
<p>Hi ${vars.customerName},</p>
<p>Despite multiple attempts, we have been unable to collect your payment of <strong>${vars.currency || 'GBP'} ${vars.amount}</strong>.</p>
<div style="background: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 16px; margin: 16px 0;">
  <p style="margin: 0; font-weight: 600; color: #991b1b;">Your subscription will be cancelled if payment is not received today. All data will be retained for 30 days after cancellation.</p>
</div>
<p>To keep your account active and retain access to your compliance management system, please update your payment method now.</p>
${cta(billingUrl, 'Pay Now to Keep Your Account')}
<p>If you have already made this payment, please disregard this email. For any questions, contact <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
<p>Best regards,<br>The Nexara Billing Team</p>
${footer}`,
    text: `Hi ${vars.customerName}, FINAL NOTICE: Your payment of ${vars.currency || 'GBP'} ${vars.amount} is overdue and your subscription will be cancelled. Pay now at ${billingUrl} to keep your account. Data retained for 30 days after cancellation.`,
  };
}
