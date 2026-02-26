// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
interface DsarAcknowledgmentVars {
  requesterName: string;
  requestType: string;
  deadlineDate: string;
}

interface DsarCompletionVars {
  requesterName: string;
  requestType: string;
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
This email was sent in compliance with GDPR Article 12.</p>
</div></body></html>`;

const TYPE_LABELS: Record<string, string> = {
  ACCESS: 'Data Access (Article 15)',
  RECTIFICATION: 'Data Rectification (Article 16)',
  ERASURE: 'Data Erasure / Right to be Forgotten (Article 17)',
  PORTABILITY: 'Data Portability (Article 20)',
  RESTRICTION: 'Restriction of Processing (Article 18)',
  OBJECTION: 'Objection to Processing (Article 21)',
};

export function dsarAcknowledgmentEmail(vars: DsarAcknowledgmentVars): {
  subject: string;
  html: string;
  text: string;
} {
  const typeLabel = TYPE_LABELS[vars.requestType] || vars.requestType;

  const subject = `Your data request has been received — ${typeLabel}`;

  const html = `${header('Data Request Acknowledged')}
<p>Dear ${vars.requesterName},</p>
<p>We have received your data subject access request and are processing it in accordance with GDPR regulations.</p>
<div style="background: #f0f4ff; border-radius: 8px; padding: 20px; margin: 16px 0;">
  <p style="margin: 4px 0;"><strong>Request Type:</strong> ${typeLabel}</p>
  <p style="margin: 4px 0;"><strong>Deadline for Response:</strong> ${vars.deadlineDate}</p>
</div>
<p>Under GDPR, we are required to respond to your request within 30 days. We will contact you if we need any additional information to verify your identity or clarify your request.</p>
<p>If you have any questions, please reply to this email.</p>
<p>Best regards,<br>The Nexara Data Protection Team</p>
${footer}`;

  const text = `Dear ${vars.requesterName},

We have received your data subject access request.

Request Type: ${typeLabel}
Deadline for Response: ${vars.deadlineDate}

Under GDPR, we are required to respond within 30 days. We will contact you if we need additional information.

Best regards,
The Nexara Data Protection Team`;

  return { subject, html, text };
}

export function dsarCompletionEmail(vars: DsarCompletionVars): {
  subject: string;
  html: string;
  text: string;
} {
  const typeLabel = TYPE_LABELS[vars.requestType] || vars.requestType;

  const subject = `Your data request has been completed — ${typeLabel}`;

  const html = `${header('Data Request Completed')}
<p>Dear ${vars.requesterName},</p>
<p>We are writing to confirm that your data subject request has been processed and completed.</p>
<div style="background: #ecfdf5; border-radius: 8px; padding: 20px; margin: 16px 0;">
  <p style="margin: 4px 0;"><strong>Request Type:</strong> ${typeLabel}</p>
  <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">Completed</span></p>
</div>
<p>If this was a data access or portability request, the relevant data has been included or will be sent separately in a secure format.</p>
<p>If you believe your request has not been fully addressed, you have the right to lodge a complaint with your local data protection authority.</p>
<p>Best regards,<br>The Nexara Data Protection Team</p>
${footer}`;

  const text = `Dear ${vars.requesterName},

Your data subject request has been completed.

Request Type: ${typeLabel}
Status: Completed

If you believe your request has not been fully addressed, you have the right to lodge a complaint with your local data protection authority.

Best regards,
The Nexara Data Protection Team`;

  return { subject, html, text };
}
