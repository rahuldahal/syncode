import { Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { EventJwtGuard } from './event-jwt.guard';

export type EventMiddleware = {
  (client: Socket, next: (error?: Error) => void);
};

export function EventAuth(config: ConfigService): EventMiddleware {
  return (client: Socket, next: Function) => {
    try {
      EventJwtGuard.validateToken(client, config);
      next();
    } catch (error) {
      next(error);
    }
  };
}
