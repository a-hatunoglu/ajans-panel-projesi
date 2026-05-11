/**
 * Media File Checker
 *
 * Validates that uploaded ContentMedia files are accessible.
 * Uses HEAD requests for efficiency.
 */

import { prisma } from '../../../config/database';
import type { HealthSeverity } from './api-probe';

export type MediaCheckResult = {
  id: string;
  name: string;
  severity: HealthSeverity;
  message: string;
  totalFiles: number;
  accessible: number;
  inaccessible: number;
  /** Individual broken files (max 20 listed) */
  brokenFiles: Array<{ id: string; url: string; contentId: string }>;
};

const HEAD_TIMEOUT_MS = 3000;
const MAX_FILES_TO_CHECK = 100;

async function checkFileAccessible(url: string): Promise<boolean> {
  try {
    // If URL is relative / local path, skip HTTP check
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // Local file — just verify it's a non-empty string
      return url.length > 0;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HEAD_TIMEOUT_MS);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Run media file accessibility checks.
 */
export async function runMediaChecks(): Promise<MediaCheckResult> {
  const totalFiles = await prisma.contentMedia.count();

  if (totalFiles === 0) {
    return {
      id: 'media-check',
      name: 'Media Files',
      severity: 'healthy',
      message: 'No media files uploaded yet',
      totalFiles: 0,
      accessible: 0,
      inaccessible: 0,
      brokenFiles: [],
    };
  }

  // Sample up to MAX_FILES_TO_CHECK (most recent)
  const files = await prisma.contentMedia.findMany({
    take: MAX_FILES_TO_CHECK,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      url: true,
      contentId: true,
    },
  });

  const results = await Promise.allSettled(
    files.map(async (file) => ({
      file,
      accessible: await checkFileAccessible(file.url),
    })),
  );

  const brokenFiles: MediaCheckResult['brokenFiles'] = [];
  let accessible = 0;
  let inaccessible = 0;

  for (const result of results) {
    if (result.status === 'fulfilled') {
      if (result.value.accessible) {
        accessible++;
      } else {
        inaccessible++;
        if (brokenFiles.length < 20) {
          brokenFiles.push(result.value.file);
        }
      }
    } else {
      inaccessible++;
    }
  }

  const checkedCount = files.length;
  const severity: HealthSeverity =
    inaccessible > 0 ? (inaccessible > 5 ? 'critical' : 'warning') : 'healthy';

  return {
    id: 'media-check',
    name: 'Media Files',
    severity,
    message:
      inaccessible > 0
        ? `${inaccessible}/${checkedCount} files inaccessible (${totalFiles} total)`
        : `${accessible}/${checkedCount} files OK (${totalFiles} total)`,
    totalFiles,
    accessible,
    inaccessible,
    brokenFiles,
  };
}
