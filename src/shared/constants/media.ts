/**
 * Central MIME type and media configuration.
 * Single source of truth for both upload validation (multer) and presigned URL schema.
 */

export const ALLOWED_MIME_MAP: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'application/pdf': ['.pdf'],
};

export const ALLOWED_MIME_TYPES = Object.keys(ALLOWED_MIME_MAP);

export const IMAGE_MAX_BYTES = 10 * 1024 * 1024;   // 10 MB
export const VIDEO_MAX_BYTES = 100 * 1024 * 1024;   // 100 MB
export const PDF_MAX_BYTES = 20 * 1024 * 1024;      // 20 MB
