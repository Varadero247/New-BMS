# @ims/email

Email sending service for IMS. Wraps nodemailer with structured logging, templates, and singleton management.

## Features

- SMTP email sending via nodemailer v7
- Built-in templates (password reset, monthly report)
- Singleton pattern with lazy initialization
- Graceful degradation when SMTP not configured (logs warning, returns error)
- Connection verification

## Usage

```typescript
import { sendEmail, getEmailService, templates } from '@ims/email';

// Send a simple email
await sendEmail({
  to: 'user@example.com',
  subject: 'Hello',
  html: '<p>Welcome to IMS</p>',
});

// Use built-in template
const resetEmail = templates.passwordReset('https://app.example.com/reset?token=abc');
await sendEmail({ to: 'user@example.com', ...resetEmail });

// Check if SMTP is configured
const service = getEmailService();
if (service.isConfigured()) {
  await service.verify(); // Test SMTP connection
}
```

## Environment Variables

| Variable      | Required | Description                                 |
| ------------- | -------- | ------------------------------------------- |
| `SMTP_HOST`   | Yes      | SMTP server hostname                        |
| `SMTP_PORT`   | No       | SMTP port (default: 587)                    |
| `SMTP_SECURE` | No       | Use TLS (default: false)                    |
| `SMTP_USER`   | Yes      | SMTP username                               |
| `SMTP_PASS`   | Yes      | SMTP password                               |
| `EMAIL_FROM`  | No       | Default sender (default: noreply@ims.local) |
