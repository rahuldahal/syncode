import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { TEmitInfo } from './types/emit.type';
import { UserService } from '../user/user.service';
import { Injectable, Logger } from '@nestjs/common';
import { FileService } from 'src/file/file.service';

import {
  TSearchBody,
  TConnectedUsers,
  TCollaborationBody,
  TFileUpdateBody,
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

      // clear data on memory
      this.connectedUsers[hasInvited].invitationStatus = null;
      this.connectedUsers[hasInvited].invitedBy = null;

      emitInfo.receiver = hasInvited;
      emitInfo.messageName = 'onInvitation';
      emitInfo.messageValue = 'The inviter is disconnected';

      return emitInfo;
    } else if (invitationStatus === 'invitee') {
      // relation being: This client being a invitee, has relation with the inviter
      // Inviter's perspective: They "hasInvited" this client

      // clear data on memory
      this.connectedUsers[invitedBy].invitationStatus = null;
      this.connectedUsers[invitedBy].hasInvited = null;

      emitInfo.receiver = invitedBy;
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

  handleInvitation(body: TCollaborationBody, client: Socket) {
    const { sender, receiver, file } = body;
    const emitInfo: TEmitInfo = {
      receiver: null,
      messageName: 'onInvitation',
      messageValue: null,
    };

    const currentUserId = Object.keys(this.connectedUsers).find(
      (user) => this.connectedUsers[user].socketId === client.id,
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

    this.connectedUsers[sender.id].invitationStatus = 'pending';
    this.connectedUsers[receiver.id].invitationStatus = 'pending';

    emitInfo.receiver = this.connectedUsers[receiver.id].socketId;
    emitInfo.messageValue = {
      sender,
      receiver,
      file,
    };

    return emitInfo;
  }

  // TODO: update collaboratedProjects, and collaborators columns on the database
  handleConfirmation(body: TCollaborationBody, client: Socket) {
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

    if (
      this.connectedUsers[sender.id].invitationStatus !== 'pending' ||
      this.connectedUsers[receiver.id].invitationStatus !== 'pending'
    ) {
      emitInfo.receiver = client.id;
      emitInfo.messageValue = 'Provided data is invalid';

      return emitInfo;
    }

    const receiverSocketId = this.connectedUsers[receiver.id].socketId;
    const senderSocketId = this.connectedUsers[sender.id].socketId;

    // check if collaborator(current user) is the one that was invited
    if (client.id !== receiverSocketId) {
      emitInfo.receiver = client.id;
      emitInfo.messageValue = 'Provided data is invalid';

      return emitInfo;
    }

    const currentUserId = Object.keys(this.connectedUsers).find(
      (user) => this.connectedUsers[user].socketId === client.id,
    );

    // check if already in collaboration
    if (
      this.connectedUsers[currentUserId].invitationStatus === 'inviter' ||
      this.connectedUsers[currentUserId].invitationStatus === 'invitee'
    ) {
      emitInfo.receiver = client.id;
      emitInfo.messageValue = 'Already in a connection';

      return emitInfo;
    }

    this.connectedUsers[sender.id].hasInvited = receiverSocketId;
    this.connectedUsers[sender.id].invitationStatus = 'inviter';
    this.connectedUsers[receiver.id].invitedBy = senderSocketId;
    this.connectedUsers[receiver.id].invitationStatus = 'invitee';

    // TODO: When token expired, error is thrown by the middleware. Handle it gracefully

    emitInfo.receiver = [receiverSocketId, senderSocketId];
    emitInfo.messageValue = {
      sender,
      receiver,
      file,
    };

    return emitInfo;
  }

  async handleFileUpdate(body: TFileUpdateBody, client: Socket) {
    const { file, sender, receiver } = body;
    const emitInfo: TEmitInfo = {
      receiver: null,
      messageName: 'onFileUpdate',
      messageValue: null,
    };

    if (file.id === undefined || file.content === undefined) {
      return;
    }
    this.logger.log(this.connectedUsers);

    // check if user is connected
    if (
      this.connectedUsers[sender.id] === undefined ||
      this.connectedUsers[receiver.id] === undefined
    ) {
      emitInfo.receiver = client.id;
      emitInfo.messageValue = 'Provided data is invalid';

      return emitInfo;
    }

    if (
      this.connectedUsers[sender.id].invitationStatus === null ||
      this.connectedUsers[receiver.id].invitationStatus === null ||
      this.connectedUsers[sender.id].invitationStatus === 'pending' ||
      this.connectedUsers[receiver.id].invitationStatus === 'pending'
    ) {
      emitInfo.receiver = client.id;
      emitInfo.messageValue = 'Provided data is invalid';

      return emitInfo;
    }

    const receiverSocketId = this.connectedUsers[receiver.id].socketId;
    const senderSocketId = this.connectedUsers[sender.id].socketId;

    try {
      const { updatedContent } = await this.fileService.updateContent(
        file.id,
        file,
      );

      emitInfo.receiver = [senderSocketId, receiverSocketId];
      emitInfo.messageValue = updatedContent;

      return emitInfo;
    } catch (error: any) {
      this.logger.error(error.message);
    }
  }
}
