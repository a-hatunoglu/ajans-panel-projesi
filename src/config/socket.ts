import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { logger } from './logger';
import { verifyAccessToken, ACCESS_TOKEN_COOKIE_NAME } from '../shared/utils/token';

interface AuthenticatedSocket extends Socket {
  userId: string;
}
import { env } from './index';

let io: SocketIOServer;

export function initSocketServer(server: HttpServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const cookieHeader = socket.request.headers.cookie;
      let token = null;

      if (cookieHeader) {
        const cookies = cookieHeader.split(';').map(c => c.trim());
        const accessTokenCookie = cookies.find(c => c.startsWith(`${ACCESS_TOKEN_COOKIE_NAME}=`));
        if (accessTokenCookie) {
          token = accessTokenCookie.split('=')[1];
        }
      }

      if (!token && socket.handshake.auth?.token) {
        token = socket.handshake.auth.token;
      }

      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const payload = verifyAccessToken(token);
      if (!payload) {
        return next(new Error('Authentication error: Invalid token'));
      }

      // Attach user ID to socket
      (socket as AuthenticatedSocket).userId = payload.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as AuthenticatedSocket).userId;
    logger.info(`🔌 Socket connected: ${socket.id} (User: ${userId})`);

    // Join a room specifically for this user to receive direct notifications
    socket.join(`user_${userId}`);

    socket.on('disconnect', () => {
      logger.info(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getSocketIO() {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Call initSocketServer first.');
  }
  return io;
}

export function emitToUser(userId: string, event: string, data: Record<string, unknown>) {
  if (!io) return;
  io.to(`user_${userId}`).emit(event, data);
}

export function emitToUsers(userIds: string[], event: string, data: Record<string, unknown>) {
  if (!io) return;
  for (const userId of userIds) {
    io.to(`user_${userId}`).emit(event, data);
  }
}
