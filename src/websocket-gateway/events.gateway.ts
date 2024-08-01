import { UserService } from './../user/user.service';
import { OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

interface TSearchBody {
  username: string;
}
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
  constructor(
    private jwt: JwtService,
    private userService: UserService,
  ) {}

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

  @SubscribeMessage('search')
  async handleSearch(@MessageBody() body: TSearchBody): Promise<void> {
    const { username } = body;

    if (!username) {
      this.server.emit('searchResult', { message: 'Username not provided' });
      return;
    }

    try {
      const searchResult =
        await this.userService.findByUsernameContaining(username);

      if (searchResult && searchResult.length > 0) {
        this.server.emit('searchResult', searchResult);
      } else {
        this.server.emit('searchResult', { message: 'User not found' });
      }
    } catch (error) {
      this.server.emit('searchResult', {
        message: 'An error occurred',
        error: error.message,
      });
    }
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
