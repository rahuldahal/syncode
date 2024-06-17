import { OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

interface TInvitationBody {
  sender: {
    id: number;
    username: string;
  };
  receiver: number;
  filename: string;
}

@WebSocketGateway({ cors: { origin: 'http://localhost:5173' } })
export class EventsGateway implements OnModuleInit {
  constructor(private jwt: JwtService) {}

  @WebSocketServer()
  server: Server;

  getConnectedUser(socket) {
    const authorizationHeader = socket.handshake.headers['authorization'];
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new Error('Authorization header missing or invalid');
    }
    const token = authorizationHeader.split(' ')[1];
    const decoded = this.jwt.decode(token); // {sub: id, username, iat: created, exp: expiry}

    return { id: decoded.sub, username: decoded.username };
  }

  onModuleInit() {
    this.server.on('connection', (socket) => {
      const user = this.getConnectedUser(socket);
      console.log(user);
      console.log(socket.id);
    });
  }

  @SubscribeMessage('invite')
  onInvitation(@MessageBody() body: TInvitationBody) {
    this.server.emit('onInvitation', {
      sender: body.sender.id,
      receiver: body.receiver,
      filename: body.filename,
    });
  }
}
