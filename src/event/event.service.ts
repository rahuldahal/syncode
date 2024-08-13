import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { TEmitMessage } from './types/emit.type';
import { UserService } from '../user/user.service';
import { FileService } from 'src/file/file.service';
import { WebSocketServer } from '@nestjs/websockets';

import {
  TSearchBody,
  TConnectedUsers,
  TInvitationBody,
  TFileUpdateBody,
  TConfirmationBody,
} from './types/event.type';

// TODO: validate all the body with zod(convert Typescript type into zod type with chatGPT)

export class EventService {
  // TODO: shall move this data into Redis cache
  private connectedUsers: { [id: string]: TConnectedUsers } = {}; // {"16": {socketId: "5sAK2BUIC2gRT_QqAAAB", beenInviteded: true, invitedBy: "PoykztaXOAYH8MJ9AAAD", hasInvited: XoykztaXOAYH8MJ9AAAD}
  private logger = new Logger('event-service');

  constructor(
    private jwt: JwtService,
    private userService: UserService,
    private fileService: FileService,
  ) {}

  @WebSocketServer()
  server: Server<any, TEmitMessage>;

  decodeJWT(client: Socket) {
    const authorizationHeader = client.handshake.headers['authorization'];
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new Error('Authorization header missing or invalid');
    }
    const token = authorizationHeader.split(' ')[1];
    const decoded = this.jwt.decode(token); // {sub: id, username, iat: created, exp: expiry}

    return { id: decoded.sub, username: decoded.username };
  }

  addConnectedUser(socket: Socket, user: { id: string; username: string }) {
    this.connectedUsers[user.id] = {
      socketId: socket.id,
      invitationStatus: null,
      hasInvited: null,
      invitedBy: null,
    };

    this.logger.log(this.connectedUsers);
  }

  handleDisconnect(client: Socket) {
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
        .emit('onInvitation', { message: 'The inviter is disconnected' });
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
        .emit('onInvitation', { message: 'The invitee is disconnected' });
    }

    delete this.connectedUsers[disconnectedClientId];
  }

  async handleSearch(body: TSearchBody) {
    const { username } = body;

    if (!username) {
      this.server.emit('onSearchResult', { message: 'Username not provided' });
      return;
    }

    try {
      const searchResult =
        await this.userService.findByUsernameContaining(username);

      if (searchResult && searchResult.length > 0) {
        this.server.emit('onSearchResult', searchResult);
      } else {
        this.server.emit('onSearchResult', { message: 'User not found' });
      }
    } catch (error) {
      this.server.emit('onSearchResult', {
        message: 'An error occurred',
        error: error.message,
      });
    }
  }

  handleInvitation(body: TInvitationBody) {
    const { sender, receiver, file } = body;

    if (sender === undefined || receiver === undefined || file === undefined) {
      return;
    }

    const senderInfo = this.connectedUsers[sender.id];
    const senderSocketId = this.connectedUsers[sender.id].socketId;

    if (this.connectedUsers[receiver.id] === undefined) {
      this.server
        .to(senderSocketId)
        .emit('onInvitation', { message: 'The receiver is not connected' });

      return;
    }

    const receiverSocketId = this.connectedUsers[receiver.id].socketId;

    if (senderSocketId === undefined) {
      return;
    }

    // if receiver is already been invited
    if (senderInfo.invitationStatus) {
      this.server
        .to(senderSocketId)
        .emit('onInvitation', { message: 'Already in a connection' });

      return;
    }

    this.server.to(receiverSocketId).emit('onInvitation', {
      sender,
      receiver,
      file,
    });

    return;
  }

  handleConfirmation(body: TConfirmationBody) {
    const { sender, receiver, file } = body;

    if (sender === undefined || receiver === undefined || file === undefined) {
      return;
    }

    // check if user is connected
    if (
      this.connectedUsers[sender.id] === undefined ||
      this.connectedUsers[receiver.id] === undefined
    ) {
      return;
    }

    const senderSocketId = this.connectedUsers[sender.id].socketId;
    const receiverSocketId = this.connectedUsers[receiver.id].socketId;

    this.connectedUsers[sender.id].hasInvited = receiverSocketId;
    this.connectedUsers[receiver.id].invitedBy = senderSocketId;

    this.server.to(receiverSocketId).emit('onCollab', { sender, file });
    this.server.to(senderSocketId).emit('onCollab', { receiver, file });

    return;
  }

  async handleFileUpdate(body: TFileUpdateBody) {
    const { id, content, sender, receiver } = body;

    if (id === undefined || content === undefined) {
      return;
    }

    // check if user is connected
    if (
      this.connectedUsers[sender.id] === undefined ||
      this.connectedUsers[receiver.id] === undefined
    ) {
      return;
    }

    const senderSocketId = this.connectedUsers[sender.id].socketId;
    const receiverSocketId = this.connectedUsers[receiver.id].socketId;

    try {
      const updatedContent = await this.fileService.updateContent(id, {
        content,
      });

      this.server.to(senderSocketId).emit('onFileUpdate', updatedContent);
      this.server.to(receiverSocketId).emit('onFileUpdate', updatedContent);

      return;
    } catch (error: unknown) {
      console.log(error);
    }
  }
}
