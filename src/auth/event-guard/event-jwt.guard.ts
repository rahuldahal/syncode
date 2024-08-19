import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  JsonWebTokenError,
  JwtPayload,
  TokenExpiredError,
  verify,
} from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';

@Injectable()
export class EventJwtGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() !== 'ws') {
      return true;
    }

    const client: Socket = context.switchToWs().getClient();
    const { authorization } = client.handshake.headers; // using test tools like Postman
    // const authorization = client.handshake.auth; // using client side Socket.io

    EventJwtGuard.validateToken(client, this.config);

    return true;
  }

  static validateToken(client: Socket, config: ConfigService) {
    const { authorization } = client.handshake.headers;
    Logger.log(authorization);
    if (!authorization) {
      throw new Error('Authorization header is missing');
    }
    const token: string = authorization.split('Bearer ')[1];
    if (!token) {
      throw new Error('Token is missing from authorization header');
    }
    try {
      const payload = verify(token, config.get('JWT_SECRET')) as JwtPayload;

      return { id: payload.sub, username: payload.username };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new Error('Token expired');
      } else if (error instanceof JsonWebTokenError) {
        throw new Error('Invalid token pattern');
      } else if (error.message === 'jwt must be provided') {
        throw new Error('Token not found');
      } else {
        throw new Error('Error occurred during authorization');
      }
    }
  }
}
