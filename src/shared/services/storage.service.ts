import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../../config';
import crypto from 'crypto';
import path from 'path';
import { logger } from '../../config/logger';

const isS3Configured = Boolean(
  env.STORAGE_S3_ACCESS_KEY &&
  env.STORAGE_S3_SECRET &&
  env.STORAGE_S3_BUCKET &&
  env.STORAGE_S3_REGION
);

let s3Client: S3Client | null = null;

if (isS3Configured) {
  s3Client = new S3Client({
    region: env.STORAGE_S3_REGION!,
    credentials: {
      accessKeyId: env.STORAGE_S3_ACCESS_KEY!,
      secretAccessKey: env.STORAGE_S3_SECRET!,
    },
    endpoint: env.STORAGE_S3_ENDPOINT,
    forcePathStyle: !!env.STORAGE_S3_ENDPOINT,
  });
}

function generateSafeFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const randomStr = crypto.randomBytes(8).toString('hex');
  return `${Date.now()}-${randomStr}${ext}`;
}

export async function uploadFile(
  fileBuffer: Buffer,
  originalFilename: string,
  mimetype: string
): Promise<string> {
  const filename = generateSafeFilename(originalFilename);
  const key = `contents/${filename}`;

  if (!s3Client || !env.STORAGE_S3_BUCKET) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Storage is not configured. Yükleme başarısız.');
    }
    logger.warn('[StorageService] S3 not configured. Using mocked fallback URL.');
    return `https://mock-storage.agencyos.app/dev/${key}`;
  }

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.STORAGE_S3_BUCKET,
        Key: key,
        Body: fileBuffer,
        ContentType: mimetype,
      })
    );

    if (env.STORAGE_S3_ENDPOINT) {
      // Basic heuristic for non-AWS S3-compatible storage URLs
      const cleanEndpoint = env.STORAGE_S3_ENDPOINT.replace(/\/$/, '');
      return `${cleanEndpoint}/${env.STORAGE_S3_BUCKET}/${key}`;
    }
    
    return `https://${env.STORAGE_S3_BUCKET}.s3.${env.STORAGE_S3_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    logger.error(`[StorageService] S3 upload failed for ${key}`, { error });
    throw new Error('Dosya yüklenemedi.');
  }
}

export async function deleteFile(url: string): Promise<void> {
  if (!s3Client || !env.STORAGE_S3_BUCKET) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Storage is not configured. Silme başarısız.');
    }
    return;
  }

  if (url.startsWith('https://mock-storage')) {
    return;
  }

  try {
    const urlObj = new URL(url);
    let key = urlObj.pathname;
    
    if (key.startsWith(`/${env.STORAGE_S3_BUCKET}/`)) {
      key = key.replace(`/${env.STORAGE_S3_BUCKET}/`, '');
    } else if (key.startsWith('/')) {
      key = key.substring(1);
    }

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: env.STORAGE_S3_BUCKET,
        Key: key,
      })
    );
  } catch (error) {
    logger.error(`[StorageService] S3 delete failed for url ${url}`, { error });
    throw new Error('Dosya silinemedi.');
  }
}
