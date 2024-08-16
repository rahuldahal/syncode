import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { TEmitInfo } from './types/emit.type';
import { UserService } from '../user/user.service';
import { Injectable, Logger } from '@nestjs/common';
import { FileService } from 'src/file/file.service';

import {
  TSearchBody,
  TConnectedUsers,
  TInvitationBody,
  TFileUpdateBody,
  TConfirmationBody,
} from './types/event.type';

// TODO: validate all the body with zod(convert Typescript type into zod type with chatGPT)

@Injectable()
export class EventService {
  // TODO: shall move this data into Redis cache
  private connectedUsers: { [id: string]: TConnectedUsers } = {}; // {"16": {socketId: "5sAK2BUIC2gRT_QqAAAB", beenInviteded: true, invitedBy: "PoykztaXOAYH8MJ9AAAD", hasInvited: XoykztaXOAYH8MJ9AAAD}
  private logger = new Logger('event-service');

  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private fileService: FileService,
  ) {}

  decodeJWT(client: Socket) {
    const authorizationHeader = client.handshake.headers['authorization'];
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new Error('Authorization header missing or invalid');
    }
    const token = authorizationHeader.split(' ')[1];
    const decoded = this.jwtService.decode(token); // {sub: id, username, iat: created, exp: expiry}

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
    const emitInfo: TEmitInfo = {
      receiver: null,
      messageName: null,
      messageValue: null,
    };

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

      emitInfo.receiver = hasInvited;
      emitInfo.messageName = 'onInvitation';
      emitInfo.messageValue = 'The inviter is disconnected';

      return emitInfo;
    } else if (invitationStatus === 'invitee') {
      // relation being: This client being a invitee, has relation with the inviter
      // Inviter's perspective: They "hasInvited" this client

      const inviterClientId = connectedUsersId.find(
        (id) => this.connectedUsers[id].hasInvited === client.id,
      );

      // clear data on memory
      this.connectedUsers[inviterClientId].invitationStatus = null;
      this.connectedUsers[inviterClientId].hasInvited = null;

      emitInfo.receiver = hasInvited;
      emitInfo.messageName = 'onInvitation';
      emitInfo.messageValue = 'The invitee is disconnected';

      return emitInfo;
    }

    delete this.connectedUsers[disconnectedClientId];
  }

  async handleSearch(body: TSearchBody, client: Socket) {
    const { username } = body;

    const emitInfo: TEmitInfo = {
      receiver: client.id,
      messageName: 'onSearchResult',
      messageValue: null,
    };

    if (!username) {
      emitInfo.messageValue = 'Username not provided';
      return emitInfo;
    }

    try {
      const searchResult =
        await this.userService.findByUsernameContaining(username);

      if (searchResult && searchResult.length > 0) {
        emitInfo.messageValue = searchResult;
        return emitInfo;
      }

      emitInfo.messageValue = 'User not found';
      return emitInfo;
    } catch (error) {
      emitInfo.messageValue = 'Internal serval error';
    }
  }

  handleInvitation(body: TInvitationBody, client: Socket) {
    const { sender, receiver, file } = body;
    const emitInfo: TEmitInfo = {
      receiver: null,
      messageName: 'onInvitation',
      messageValue: null,
    };

    const currentUserId = Object.keys(this.connectedUsers).find(
      (user) => (this.connectedUsers[user].socketId = client.id),
    );

    // if sender is already in a connection
    if (this.connectedUsers[currentUserId].invitationStatus !== null) {
      emitInfo.receiver = client.id;
      emitInfo.messageValue = 'Already in a connection';

      return emitInfo;
    }

    const receiverInfo = this.connectedUsers[receiver.id];
    const senderSocketId = this.connectedUsers[sender.id].socketId;

    if (receiverInfo === undefined) {
      emitInfo.receiver = senderSocketId;
      emitInfo.messageValue = 'The receiver is not connected';

      return emitInfo;
    }

    if (senderSocketId === undefined) {
      return;
    }

    // if receiver is already been invited
    if (receiverInfo.invitationStatus) {
      emitInfo.receiver = senderSocketId;
      emitInfo.messageValue = 'Already in a connection';

      return emitInfo;
    }

    emitInfo.receiver = this.connectedUsers[receiver.id].socketId;
    emitInfo.messageValue = {
      sender,
      receiver,
      file,
    };

    return emitInfo;
  }

  handleConfirmation(body: TConfirmationBody, client: Socket) {
    const { sender, receiver, file } = body;
    const emitInfo: TEmitInfo = {
      receiver: null,
      messageName: 'onCollab',
      messageValue: null,
    };

    if (sender === undefined || receiver === undefined || file === undefined) {
      return;
    }

    // check if user is connected
    if (
      this.connectedUsers[sender.id] === undefined ||
      this.connectedUsers[receiver.id] === undefined
    ) {
      emitInfo.receiver = client.id;
      emitInfo.messageValue = 'Provided data is invalid';

      return emitInfo;
    }

    // check if collaborator(current user) is the on that was invited
    if (client.id !== this.connectedUsers[receiver.id].socketId) {
      emitInfo.receiver = client.id;
      emitInfo.messageValue = 'Provided data is invalid';

      return emitInfo;
    }

    const currentUserId = Object.keys(this.connectedUsers).find(
      (user) => (this.connectedUsers[user].socketId = client.id),
    );
    const currentUserStatus =
      this.connectedUsers[currentUserId].invitationStatus;

    // check if already in collaboration
    if (currentUserStatus !== null) {
      emitInfo.receiver = client.id;
      emitInfo.messageValue = 'Already in a connection';

      return emitInfo;
    }

    const senderSocketId = this.connectedUsers[sender.id].socketId;
    const receiverSocketId = this.connectedUsers[receiver.id].socketId;

    this.connectedUsers[sender.id].hasInvited = receiverSocketId;
    this.connectedUsers[sender.id].invitationStatus = 'inviter';
    this.connectedUsers[receiver.id].invitedBy = senderSocketId;
    this.connectedUsers[receiver.id].invitationStatus = 'invitee';

    emitInfo.receiver = [receiverSocketId, senderSocketId];
    emitInfo.messageValue = {
      sender,
      receiver,
      file,
      invitationStatus: currentUserStatus,
    };

    return emitInfo;
  }

  async handleFileUpdate(body: TFileUpdateBody, client: Socket) {
    const { id, content, sender, receiver } = body;
    const emitInfo: TEmitInfo = {
      receiver: null,
      messageName: 'onFileUpdate',
      messageValue: null,
    };

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
      const { updatedContent } = await this.fileService.updateContent(id, {
        content,
      });

      emitInfo.receiver = [senderSocketId, receiverSocketId];
      emitInfo.messageValue = updatedContent;

      return emitInfo;
    } catch (error: any) {
      this.logger.error(error.message);
    }
  }
}
