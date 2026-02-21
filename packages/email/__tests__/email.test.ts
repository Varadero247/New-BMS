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
