import { EmailService, templates, getEmailService, initEmailService } from '../src/index';

describe('EmailService', () => {
  describe('constructor', () => {
    it('should create unconfigured service when no config provided', () => {
      const service = new EmailService();
      expect(service.isConfigured()).toBe(false);
    });

    it('should create configured service when config provided', () => {
      const service = new EmailService({
        host: 'smtp.test.com',
        port: 587,
        secure: false,
        auth: { user: 'test', pass: 'test' },
        from: 'test@test.com',
      });
      expect(service.isConfigured()).toBe(true);
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
  });

  describe('verify', () => {
    it('should return false when not configured', async () => {
      const service = new EmailService();
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
    // Reset singleton
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
  });
});
