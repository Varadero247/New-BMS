// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
// Configuration
export {
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_BY_TYPE,
  ALLOWED_MIME_TYPES,
  getAllAllowedMimeTypes,
  ALLOWED_EXTENSIONS,
  EXTENSION_TO_MIME,
  DANGEROUS_SIGNATURES,
  DANGEROUS_FILENAME_PATTERNS,
} from './config';

// Validators
export {
  validateFileSize,
  validateMimeType,
  validateExtension,
  validateExtensionMimeMatch,
  validateFilename,
  validateFileContent,
  validateFile,
  sanitizeFilename,
  type FileValidationResult,
  type FileInfo,
} from './validators';

// Middleware
export {
  createUploader,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  validateUploadedFile,
  handleUploadError,
  generateSecureFilename,
  getFileInfo,
  type UploadOptions,
} from './middleware';
