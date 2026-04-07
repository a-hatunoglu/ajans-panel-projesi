import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { ACCESS_TOKEN_COOKIE_NAME, verifyAccessToken } from '../shared/utils/token';
import { UnauthorizedError } from '../shared/errors/app-error';

function getBearerToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return undefined;
  }

  return authHeader.split(' ')[1];
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const cookieToken = req.cookies?.[ACCESS_TOKEN_COOKIE_NAME];
    const bearerToken = getBearerToken(req);
    const candidateTokens = [cookieToken, bearerToken].filter((token): token is string => Boolean(token));

    if (candidateTokens.length === 0) {
      throw new UnauthorizedError('Kimlik doğrulama gerekli.');
    }

    let payload: ReturnType<typeof verifyAccessToken> | null = null;

    for (const token of candidateTokens) {
      try {
        payload = verifyAccessToken(token);
        break;
      } catch {
        payload = null;
      }
    }

    if (!payload) {
      throw new UnauthorizedError('Geçersiz veya süresi dolmuş token.');
    }

    const user = await prisma.user.findFirst({
      where: {
        id: payload.userId,
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('Geçersiz veya süresi dolmuş token.');
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as Request['user'] extends undefined ? never : NonNullable<Request['user']>['role'],
    };

    next();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      next(err);
      return;
    }

    next(new UnauthorizedError('Geçersiz veya süresi dolmuş token.'));
  }
}
