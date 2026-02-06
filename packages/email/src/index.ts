import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailService {
  private transporter: Transporter | null = null;
  private config: EmailConfig | null = null;
  private readonly defaultFrom: string;

  constructor(config?: Partial<EmailConfig>) {
    this.defaultFrom = config?.from || process.env.EMAIL_FROM || 'noreply@ims.local';

    if (config?.host || process.env.SMTP_HOST) {
      this.config = {
        host: config?.host || process.env.SMTP_HOST || 'localhost',
        port: config?.port || parseInt(process.env.SMTP_PORT || '587', 10),
        secure: config?.secure ?? (process.env.SMTP_SECURE === 'true'),
        auth: {
          user: config?.auth?.user || process.env.SMTP_USER || '',
          pass: config?.auth?.pass || process.env.SMTP_PASS || '',
        },
        from: this.defaultFrom,
      };
      this.transporter = nodemailer.createTransport(this.config);
    }
  }

  isConfigured(): boolean {
    return this.transporter !== null;
  }

  async send(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.transporter) {
      console.warn('[EmailService] SMTP not configured, email not sent:', {
        to: options.to,
        subject: options.subject,
      });
      return { success: false, error: 'SMTP not configured' };
    }

    try {
      const mailOptions: SendMailOptions = {
        from: this.defaultFrom,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[EmailService] Failed to send email:', message);
      return { success: false, error: message };
    }
  }

  async verify(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }
}

// Email templates
export const templates = {
  passwordReset: (resetUrl: string, expiresInMinutes: number = 60): { subject: string; text: string; html: string } => ({
    subject: 'Password Reset Request - IMS',
    text: `
You requested a password reset for your IMS account.

Click the following link to reset your password:
${resetUrl}

This link will expire in ${expiresInMinutes} minutes.

If you did not request this password reset, please ignore this email or contact support if you have concerns.

- The IMS Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f8f9fa; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h1 style="color: #2563eb; margin: 0 0 20px 0; font-size: 24px;">Password Reset Request</h1>
    <p style="margin: 0 0 20px 0;">You requested a password reset for your IMS account.</p>
    <p style="margin: 0 0 20px 0;">Click the button below to reset your password:</p>
    <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Reset Password</a>
    <p style="margin: 20px 0 0 0; font-size: 14px; color: #666;">This link will expire in ${expiresInMinutes} minutes.</p>
  </div>
  <p style="font-size: 14px; color: #666; margin: 0;">If you did not request this password reset, please ignore this email or contact support if you have concerns.</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
  <p style="font-size: 12px; color: #999; margin: 0;">- The IMS Team</p>
</body>
</html>
    `.trim(),
  }),

  passwordResetConfirmation: (): { subject: string; text: string; html: string } => ({
    subject: 'Password Successfully Reset - IMS',
    text: `
Your IMS account password has been successfully reset.

If you did not make this change, please contact support immediately.

- The IMS Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Confirmation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f8f9fa; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h1 style="color: #16a34a; margin: 0 0 20px 0; font-size: 24px;">Password Successfully Reset</h1>
    <p style="margin: 0;">Your IMS account password has been successfully reset.</p>
  </div>
  <p style="font-size: 14px; color: #666; margin: 0;">If you did not make this change, please contact support immediately.</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
  <p style="font-size: 12px; color: #999; margin: 0;">- The IMS Team</p>
</body>
</html>
    `.trim(),
  }),
};

// Singleton instance
let emailService: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailService) {
    emailService = new EmailService();
  }
  return emailService;
}

export function initEmailService(config: Partial<EmailConfig>): EmailService {
  emailService = new EmailService(config);
  return emailService;
}

export default EmailService;
