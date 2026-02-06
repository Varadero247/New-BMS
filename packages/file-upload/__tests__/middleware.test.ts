import path from 'path';
import {
  generateSecureFilename,
  getFileInfo,
} from '../src/middleware';

describe('File Upload Middleware', () => {
  describe('generateSecureFilename', () => {
    it('should generate a random filename', () => {
      const filename1 = generateSecureFilename('document.pdf');
      const filename2 = generateSecureFilename('document.pdf');

      expect(filename1).not.toBe(filename2);
    });

    it('should preserve file extension', () => {
      expect(generateSecureFilename('file.pdf')).toMatch(/\.pdf$/);
      expect(generateSecureFilename('image.jpg')).toMatch(/\.jpg$/);
      expect(generateSecureFilename('doc.docx')).toMatch(/\.docx$/);
    });

    it('should convert extension to lowercase', () => {
      expect(generateSecureFilename('file.PDF')).toMatch(/\.pdf$/);
      expect(generateSecureFilename('image.JPG')).toMatch(/\.jpg$/);
    });

    it('should generate hex-based filename', () => {
      const filename = generateSecureFilename('test.pdf');
      // Should be: timestamp-randomhex.ext
      expect(filename).toMatch(/^[a-z0-9]+-[a-f0-9]{32}\.pdf$/);
    });

    it('should not contain original filename', () => {
      const original = 'my-secret-document.pdf';
      const generated = generateSecureFilename(original);
      expect(generated).not.toContain('my-secret-document');
    });
  });

  describe('getFileInfo', () => {
    it('should return file info object', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test-document.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        destination: '/uploads',
        filename: 'abc123.pdf',
        path: '/uploads/abc123.pdf',
        size: 1024,
        stream: null as any,
        buffer: Buffer.alloc(0),
      };

      const info = getFileInfo(mockFile);

      expect(info.originalName).toBe('test-document.pdf');
      expect(info.filename).toBe('abc123.pdf');
      expect(info.path).toBe('/uploads/abc123.pdf');
      expect(info.size).toBe(1024);
      expect(info.mimeType).toBe('application/pdf');
      expect(info.url).toBe('/uploads/abc123.pdf');
    });

    it('should sanitize original filename in response', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: '../../../etc/passwd',
        encoding: '7bit',
        mimetype: 'text/plain',
        destination: '/uploads',
        filename: 'abc123.txt',
        path: '/uploads/abc123.txt',
        size: 100,
        stream: null as any,
        buffer: Buffer.alloc(0),
      };

      const info = getFileInfo(mockFile);
      expect(info.originalName).not.toContain('..');
      expect(info.originalName).not.toContain('/');
    });

    it('should use custom base URL if set', () => {
      const originalEnv = process.env.FILE_BASE_URL;
      process.env.FILE_BASE_URL = 'https://cdn.example.com/files';

      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        destination: '/uploads',
        filename: 'abc123.pdf',
        path: '/uploads/abc123.pdf',
        size: 1024,
        stream: null as any,
        buffer: Buffer.alloc(0),
      };

      const info = getFileInfo(mockFile);
      expect(info.url).toBe('https://cdn.example.com/files/abc123.pdf');

      process.env.FILE_BASE_URL = originalEnv;
    });
  });
});
