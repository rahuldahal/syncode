import { UserService } from './../user/user.service';
import { OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

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

interface TConfirmationBody extends TInvitationBody {
  senderSocketId: string;
  receiverSocketId: string;
}

interface TConnectedUsers {
  socketId: string;
  invitationStatus: 'inviter' | 'invitee' | null;
  hasInvited: string | null; // socket ID
  invitedBy: string | null; // socket ID
}

@WebSocketGateway({ cors: { origin: 'http://localhost:5173' } })
export class EventsGateway implements OnModuleInit {
  constructor(
    private jwt: JwtService,
    private userService: UserService,
  ) {}

  @WebSocketServer()
  server: Server;

  // TODO: shall move this data into Redis cache
  private connectedUsers: { [id: string]: TConnectedUsers } = {}; // {"16": {socketId: "5sAK2BUIC2gRT_QqAAAB", beenInviteded: true, invitedBy: "PoykztaXOAYH8MJ9AAAD", hasInvited: XoykztaXOAYH8MJ9AAAD}

  getConnectedUser(socket: Socket) {
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

      this.connectedUsers[user.id] = {
        socketId: socket.id,
        invitationStatus: null,
        hasInvited: null,
        invitedBy: null,
      };
      console.log(this.connectedUsers);
    });
  }

  handleDisconnect(client: Socket): void {
    const connectedUsersId = Object.keys(this.connectedUsers);
    const disconnectedClientId = connectedUsersId.find(
      (id) => this.connectedUsers[id].socketId === client.id,
    );

    if (!disconnectedClientId) return;

    const { invitationStatus, hasInvited, invitedBy } =
      this.connectedUsers[disconnectedClientId];

    // Send the appropriate message based on the invitation status
    if (invitationStatus === 'inviter') {
      // relation being: This client being a inviter, has relation with the invitee
      // Invitee's perspective: They were "invitedBy" this client
      const inviteeClientId = connectedUsersId.find(
        (id) => this.connectedUsers[id].invitedBy === client.id,
      );

      // clear data on memory
      this.connectedUsers[inviteeClientId].invitationStatus = null;
      this.connectedUsers[inviteeClientId].invitedBy = null;

      this.server
        .to(hasInvited)
        .emit('onInvitation', 'The inviter is disconnected');
    } else if (invitationStatus === 'invitee') {
      // relation being: This client being a invitee, has relation with the inviter
      // Inviter's perspective: They "hasInvited" this client

      const inviterClientId = connectedUsersId.find(
        (id) => this.connectedUsers[id].hasInvited === client.id,
      );

      // clear data on memory
      this.connectedUsers[inviterClientId].invitationStatus = null;
      this.connectedUsers[inviterClientId].hasInvited = null;

      this.server
        .to(invitedBy)
        .emit('onInvitation', 'The invitee is disconnected');
    }

    delete this.connectedUsers[disconnectedClientId];
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
  handleInvitation(@MessageBody() body: TInvitationBody) {
    const { sender, receiver, filename } = body;

    if (
      sender === undefined ||
      receiver === undefined ||
      filename === undefined
    ) {
      return;
    }

    const senderInfo = this.connectedUsers[sender.id];
    const senderSocketId = this.connectedUsers[sender.id].socketId;

    if (this.connectedUsers[receiver] === undefined) {
      this.server
        .to(senderSocketId)
        .emit('onInvitation', 'The receiver is not connected');

      return;
    }

    const receiverSocketId = this.connectedUsers[receiver].socketId;

    if (senderSocketId === undefined) {
      return;
    }

    // if receiver is already been invited
    if (senderInfo.invitationStatus) {
      this.server
        .to(senderSocketId)
        .emit('onInvitation', 'Already in a connection');

      return;
    }

    this.connectedUsers[sender.id].hasInvited = receiverSocketId;
    this.connectedUsers[receiver].invitedBy = senderSocketId;
    this.server.to(receiverSocketId).emit('onInvitation', {
      sender,
      senderSocketId,
      receiver,
      receiverSocketId,
      filename,
    });

    return;
  }

  @SubscribeMessage('confirm')
  handleConfirmation(@MessageBody() body: TConfirmationBody) {
    const { sender, senderSocketId, receiver, receiverSocketId, filename } =
      body;

    if (
      sender === undefined ||
      senderSocketId === undefined ||
      receiver === undefined ||
      receiverSocketId === undefined ||
      filename === undefined
    ) {
      return;
    }

    // validate socketIds
  }
}
