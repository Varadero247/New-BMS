import { EmailService, templates, getEmailService, initEmailService, sendEmail } from '../src/index';
import nodemailer from 'nodemailer';

jest.mock('nodemailer');
jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ warn: jest.fn(), error: jest.fn(), info: jest.fn() }),
}));

const mockSendMail = jest.fn();
const mockVerify = jest.fn();

(nodemailer.createTransport as jest.Mock).mockReturnValue({
  sendMail: mockSendMail,
  verify: mockVerify,
});

const SMTP_CONFIG = {
  host: 'smtp.test.com',
  port: 587,
  secure: false,
  auth: { user: 'test', pass: 'test' },
  from: 'test@test.com',
};

describe('EmailService', () => {
  beforeEach(() => {
    mockSendMail.mockReset();
    mockVerify.mockReset();
  });

  describe('constructor', () => {
    it('should create unconfigured service when no config provided', () => {
      const service = new EmailService();
      expect(service.isConfigured()).toBe(false);
    });

    it('should create configured service when config provided', () => {
      const service = new EmailService(SMTP_CONFIG);
      expect(service.isConfigured()).toBe(true);
    });

    it('should configure from SMTP_HOST env var', () => {
      process.env.SMTP_HOST = 'smtp.env.com';
      const service = new EmailService();
      expect(service.isConfigured()).toBe(true);
      delete process.env.SMTP_HOST;
    });

    it('should use EMAIL_FROM env var as default from address', () => {
      process.env.EMAIL_FROM = 'env@ims.local';
      const service = new EmailService({ host: 'smtp.test.com' });
      expect(service.isConfigured()).toBe(true);
      delete process.env.EMAIL_FROM;
    });
  });

  describe('send', () => {
    it('should return error when not configured', async () => {
      const service = new EmailService();
      const result = await service.send({
        to: 'user@test.com',
        subject: 'Test',
        text: 'Test message',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe('SMTP not configured');
    });

    it('should return success with messageId when send succeeds', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'msg-abc-123' });
      const service = new EmailService(SMTP_CONFIG);
      const result = await service.send({ to: 'user@test.com', subject: 'Hello', html: '<p>Hi</p>' });
      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg-abc-123');
      expect(result.error).toBeUndefined();
    });

    it('should return error when transporter throws', async () => {
      mockSendMail.mockRejectedValue(new Error('Connection refused'));
      const service = new EmailService(SMTP_CONFIG);
      const result = await service.send({ to: 'user@test.com', subject: 'Hello' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection refused');
    });

    it('should handle non-Error throws with "Unknown error"', async () => {
      mockSendMail.mockRejectedValue('string error');
      const service = new EmailService(SMTP_CONFIG);
      const result = await service.send({ to: 'user@test.com', subject: 'Hello' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
    });
  });

  describe('verify', () => {
    it('should return false when not configured', async () => {
      const service = new EmailService();
      const result = await service.verify();
      expect(result).toBe(false);
    });

    it('should return true when transporter verifies successfully', async () => {
      mockVerify.mockResolvedValue(true);
      const service = new EmailService(SMTP_CONFIG);
      const result = await service.verify();
      expect(result).toBe(true);
    });

    it('should return false when transporter verify throws', async () => {
      mockVerify.mockRejectedValue(new Error('Auth failed'));
      const service = new EmailService(SMTP_CONFIG);
      const result = await service.verify();
      expect(result).toBe(false);
    });
  });
});

describe('templates', () => {
  describe('passwordReset', () => {
    it('should generate password reset email with URL', () => {
      const resetUrl = 'https://app.test.com/reset?token=abc123';
      const template = templates.passwordReset(resetUrl, 60);

      expect(template.subject).toBe('Password Reset Request - IMS');
      expect(template.text).toContain(resetUrl);
      expect(template.text).toContain('60 minutes');
      expect(template.html).toContain(resetUrl);
      expect(template.html).toContain('60 minutes');
    });

    it('should use default expiry when not provided', () => {
      const template = templates.passwordReset('https://test.com/reset');
      expect(template.text).toContain('60 minutes');
    });

    it('should include security notice', () => {
      const template = templates.passwordReset('https://test.com/reset');
      expect(template.text).toContain('If you did not request');
      expect(template.html).toContain('If you did not request');
    });
  });

  describe('passwordResetConfirmation', () => {
    it('should generate confirmation email', () => {
      const template = templates.passwordResetConfirmation();

      expect(template.subject).toBe('Password Successfully Reset - IMS');
      expect(template.text).toContain('successfully reset');
      expect(template.html).toContain('successfully reset');
    });

    it('should include security warning', () => {
      const template = templates.passwordResetConfirmation();
      expect(template.text).toContain('contact support');
      expect(template.html).toContain('contact support');
    });
  });
});

describe('singleton functions', () => {
  beforeEach(() => {
    // Reset singleton to unconfigured state
    initEmailService({});
  });

  describe('getEmailService', () => {
    it('should return the same instance', () => {
      const service1 = getEmailService();
      const service2 = getEmailService();
      expect(service1).toBe(service2);
    });
  });

  describe('initEmailService', () => {
    it('should create new service with config', () => {
      const service = initEmailService({
        host: 'smtp.example.com',
        port: 465,
        secure: true,
        auth: { user: 'user', pass: 'pass' },
        from: 'app@example.com',
      });
      expect(service.isConfigured()).toBe(true);
    });

    it('should replace the existing singleton', () => {
      const first = initEmailService({ host: 'smtp.a.com' });
      const second = initEmailService({ host: 'smtp.b.com' });
      expect(second).not.toBe(first);
      expect(getEmailService()).toBe(second);
    });
  });

  describe('sendEmail', () => {
    it('should delegate to the singleton service and return error when unconfigured', async () => {
      initEmailService({}); // unconfigured
      const result = await sendEmail({ to: 'a@b.com', subject: 'Hi' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('SMTP not configured');
    });
  });
});

describe('EmailService — extended edge cases', () => {
  beforeEach(() => {
    mockSendMail.mockReset();
    mockVerify.mockReset();
  });

  it('send passes "to" field to transporter', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'msg-1' });
    const service = new EmailService(SMTP_CONFIG);
    await service.send({ to: 'recipient@example.com', subject: 'Subj', text: 'Body' });
    expect(mockSendMail.mock.calls[0][0].to).toBe('recipient@example.com');
  });

  it('send passes "subject" field to transporter', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'msg-2' });
    const service = new EmailService(SMTP_CONFIG);
    await service.send({ to: 'x@y.com', subject: 'My Subject' });
    expect(mockSendMail.mock.calls[0][0].subject).toBe('My Subject');
  });

  it('send passes "html" field to transporter when provided', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'msg-3' });
    const service = new EmailService(SMTP_CONFIG);
    const html = '<h1>Hello</h1>';
    await service.send({ to: 'x@y.com', subject: 'Subj', html });
    expect(mockSendMail.mock.calls[0][0].html).toBe(html);
  });

  it('send passes "text" field to transporter when provided', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'msg-4' });
    const service = new EmailService(SMTP_CONFIG);
    await service.send({ to: 'x@y.com', subject: 'Subj', text: 'Plain text body' });
    expect(mockSendMail.mock.calls[0][0].text).toBe('Plain text body');
  });

  it('isConfigured returns false after constructing with no host', () => {
    const service = new EmailService({ port: 587 }); // no host
    expect(service.isConfigured()).toBe(false);
  });

  it('templates.passwordReset with 30-minute expiry includes "30 minutes" in text', () => {
    const template = templates.passwordReset('https://test.com/reset', 30);
    expect(template.text).toContain('30 minutes');
    expect(template.html).toContain('30 minutes');
  });

  it('templates.passwordReset html contains a reset anchor tag', () => {
    const url = 'https://app.ims.local/reset?token=xyz';
    const template = templates.passwordReset(url);
    expect(template.html).toContain(`href="${url}"`);
  });

  it('templates.passwordResetConfirmation subject is correct', () => {
    const template = templates.passwordResetConfirmation();
    expect(template.subject).toBe('Password Successfully Reset - IMS');
  });

  it('initEmailService returns an EmailService instance', () => {
    const service = initEmailService({ host: 'smtp.x.com' });
    expect(service).toBeInstanceOf(EmailService);
  });
});

describe('EmailService — singleton and template completeness', () => {
  beforeEach(() => {
    mockSendMail.mockReset();
    mockVerify.mockReset();
  });

  it('sendEmail uses the current singleton (re-init replaces it)', async () => {
    initEmailService(SMTP_CONFIG);
    mockSendMail.mockResolvedValue({ messageId: 'singleton-msg' });
    const result = await sendEmail({ to: 'a@b.com', subject: 'S' });
    expect(result.success).toBe(true);
    expect(result.messageId).toBe('singleton-msg');
  });

  it('getEmailService returns an EmailService instance', () => {
    expect(getEmailService()).toBeInstanceOf(EmailService);
  });

  it('templates.passwordReset returns object with subject, text, and html', () => {
    const t = templates.passwordReset('https://reset.url/token');
    expect(t).toHaveProperty('subject');
    expect(t).toHaveProperty('text');
    expect(t).toHaveProperty('html');
  });

  it('templates.passwordResetConfirmation returns object with subject, text, and html', () => {
    const t = templates.passwordResetConfirmation();
    expect(t).toHaveProperty('subject');
    expect(t).toHaveProperty('text');
    expect(t).toHaveProperty('html');
  });

  it('EmailService send result has success:false when SMTP not configured, no messageId', async () => {
    const service = new EmailService();
    const result = await service.send({ to: 'x@y.com', subject: 'Test' });
    expect(result.success).toBe(false);
    expect(result.messageId).toBeUndefined();
  });

  it('EmailService verify returns false when not configured', async () => {
    const service = new EmailService();
    expect(await service.verify()).toBe(false);
  });
});
