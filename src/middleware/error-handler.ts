import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../shared/errors/app-error';
import { logger } from '../config/logger';
import { env } from '../config';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  // AppError — bilinen, operasyonel hatalar
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // Prisma unique constraint violation
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'alan';
      res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: `Bu ${target} zaten kullanılıyor.`,
          details: [],
        },
      });
      return;
    }

    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'İlgili kayıt bulunamadı.',
          details: [],
        },
      });
      return;
    }
  }

  // Bilinmeyen hatalar
  logger.error('Beklenmeyen hata:', err);

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Sunucu hatası oluştu.',
      // Stack trace production'da asla gösterilmez
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
      details: [],
    },
  });
}
