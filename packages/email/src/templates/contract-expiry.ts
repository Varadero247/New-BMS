// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
interface ContractExpiryVars {
  contractName: string;
  vendor: string;
  endDate: string;
  daysRemaining: number;
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

export function contractExpiryEmail(vars: ContractExpiryVars): {
  subject: string;
  html: string;
  text: string;
} {
  const urgency =
    vars.daysRemaining <= 7 ? 'URGENT: ' : vars.daysRemaining <= 14 ? 'ACTION REQUIRED: ' : '';

  const subject = `${urgency}Contract "${vars.contractName}" expires in ${vars.daysRemaining} days`;

  const html = `${header('Contract Expiry Notice')}
<p>This is a reminder that the following contract is approaching its expiry date:</p>
<div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 16px 0;">
  <p style="margin: 4px 0;"><strong>Contract:</strong> ${vars.contractName}</p>
  <p style="margin: 4px 0;"><strong>Vendor:</strong> ${vars.vendor}</p>
  <p style="margin: 4px 0;"><strong>End Date:</strong> ${vars.endDate}</p>
  <p style="margin: 4px 0;"><strong>Days Remaining:</strong> <span style="color: ${vars.daysRemaining <= 7 ? '#dc2626' : '#d97706'}; font-weight: bold;">${vars.daysRemaining}</span></p>
</div>
<p>Please review this contract and take appropriate action to renew, renegotiate, or terminate before the expiry date.</p>
<a href="{{dashboardUrl}}" style="display: inline-block; background: #1B3A6B; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;">View in Dashboard</a>
${footer}`;

  const text = `Contract Expiry Notice

Contract: ${vars.contractName}
Vendor: ${vars.vendor}
End Date: ${vars.endDate}
Days Remaining: ${vars.daysRemaining}

Please review this contract and take appropriate action before the expiry date.`;

  return { subject, html, text };
}
