import multer, { StorageEngine, FileFilterCallback } from 'multer';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import {
  MAX_FILE_SIZE,
  getAllAllowedMimeTypes,
  ALLOWED_EXTENSIONS,
} from './config';
import {
  validateFilename,
  validateExtension,
  validateMimeType,
  validateFileContent,
  sanitizeFilename,
} from './validators';

export interface UploadOptions {
  /** Upload destination directory */
  destination?: string;
  /** Maximum file size in bytes */
  maxFileSize?: number;
  /** Allowed MIME types (defaults to all allowed types) */
  allowedMimeTypes?: string[];
  /** Allowed extensions (defaults to all allowed extensions) */
  allowedExtensions?: string[];
  /** Field name for single file upload */
  fieldName?: string;
  /** Maximum number of files for multi-upload */
  maxFiles?: number;
  /** Whether to validate file content (magic bytes) */
  validateContent?: boolean;
  /** Custom filename generator */
  generateFilename?: (file: Express.Multer.File) => string;
}

/**
 * Generate a secure random filename
 */
export function generateSecureFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const randomPart = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now().toString(36);
  return `${timestamp}-${randomPart}${ext}`;
}

/**
 * Create multer storage configuration
 */
function createStorage(options: UploadOptions): StorageEngine {
  const uploadDir = options.destination || path.join(process.cwd(), 'uploads');

  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const filename = options.generateFilename
        ? options.generateFilename(file)
        : generateSecureFilename(file.originalname);
      cb(null, filename);
    },
  });
}

/**
 * Create file filter for multer
 */
function createFileFilter(options: UploadOptions): (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => void {
  const allowedMimes = options.allowedMimeTypes || getAllAllowedMimeTypes();
  const allowedExts = options.allowedExtensions || ALLOWED_EXTENSIONS;

  return (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    // Validate filename
    const filenameResult = validateFilename(file.originalname);
    if (!filenameResult.valid) {
      return cb(new Error(filenameResult.error || 'Invalid filename'));
    }

    // Validate extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExts.includes(ext)) {
      return cb(new Error(`File extension '${ext}' is not allowed`));
    }

    // Validate MIME type
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error(`File type '${file.mimetype}' is not allowed`));
    }

    cb(null, true);
  };
}

/**
 * Create multer upload middleware
 */
export function createUploader(options: UploadOptions = {}): multer.Multer {
  return multer({
    storage: createStorage(options),
    fileFilter: createFileFilter(options),
    limits: {
      fileSize: options.maxFileSize || MAX_FILE_SIZE,
      files: options.maxFiles || 5,
    },
  });
}

/**
 * Create single file upload middleware
 */
export function uploadSingle(
  fieldName: string = 'file',
  options: UploadOptions = {}
): RequestHandler {
  const upload = createUploader(options);
  return upload.single(fieldName);
}

/**
 * Create multiple file upload middleware
 */
export function uploadMultiple(
  fieldName: string = 'files',
  maxCount: number = 5,
  options: UploadOptions = {}
): RequestHandler {
  const upload = createUploader({ ...options, maxFiles: maxCount });
  return upload.array(fieldName, maxCount);
}

/**
 * Create mixed file upload middleware
 */
export function uploadFields(
  fields: { name: string; maxCount: number }[],
  options: UploadOptions = {}
): RequestHandler {
  const upload = createUploader(options);
  return upload.fields(fields);
}

/**
 * Post-upload validation middleware
 * Validates file content after upload (for magic byte checking)
 */
export function validateUploadedFile(
  options: { deleteOnFail?: boolean } = {}
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    if (!file) {
      return next();
    }

    try {
      // Read file content for validation
      const buffer = fs.readFileSync(file.path);

      // Validate content (magic bytes)
      const contentResult = validateFileContent(buffer);
      if (!contentResult.valid) {
        // Delete the file if it fails validation
        if (options.deleteOnFail !== false) {
          fs.unlinkSync(file.path);
        }
        return res.status(400).json({
          error: {
            code: 'INVALID_FILE',
            message: contentResult.error,
          },
        });
      }

      next();
    } catch (error) {
      // Delete file on error
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      next(error);
    }
  };
}

/**
 * Error handling middleware for multer errors
 */
export function handleUploadError(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    let message = 'Upload error';
    let code = 'UPLOAD_ERROR';

    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File is too large';
        code = 'FILE_TOO_LARGE';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files';
        code = 'TOO_MANY_FILES';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected field';
        code = 'UNEXPECTED_FIELD';
        break;
    }

    res.status(400).json({
      error: { code, message },
    });
    return;
  }

  if (err.message.includes('not allowed') || err.message.includes('Invalid')) {
    res.status(400).json({
      error: {
        code: 'INVALID_FILE',
        message: err.message,
      },
    });
    return;
  }

  next(err);
}

/**
 * Get file info from uploaded file
 */
export function getFileInfo(file: Express.Multer.File): {
  originalName: string;
  filename: string;
  path: string;
  size: number;
  mimeType: string;
  url: string;
} {
  const baseUrl = process.env.FILE_BASE_URL || '/uploads';
  return {
    originalName: sanitizeFilename(file.originalname),
    filename: file.filename,
    path: file.path,
    size: file.size,
    mimeType: file.mimetype,
    url: `${baseUrl}/${file.filename}`,
  };
}
