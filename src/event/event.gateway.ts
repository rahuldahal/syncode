import { Server, Socket } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';
import { TEmitInfo } from './types/emit.type';
import { EventService } from './event.service';

import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  TSearchBody,
  TFileUpdateBody,
  TInvitationBody,
  TConfirmationBody,
} from './types/event.type';

@WebSocketGateway({
  cors: { origin: 'http://localhost:5173' },
  namespace: 'collaboration',
})
export class EventGateway implements OnModuleInit {
  constructor(private eventService: EventService) {}

  @WebSocketServer()
  server: Server;

  emit({ receiver, messageName, messageValue }: TEmitInfo): void {
    this.server.to(receiver).emit(messageName, messageValue);
    return;
  }

  onModuleInit() {
    this.server.on('connection', (socket: Socket) => {
      const user = this.eventService.decodeJWT(socket);
      this.eventService.addConnectedUser(socket, user);
    });
  }

  handleDisconnect(client: Socket): void {
    this.eventService.handleDisconnect(client);
  }

  @SubscribeMessage('search')
  handleSearch(@MessageBody() body: TSearchBody) {
    this.eventService.handleSearch(body);
  }

  @SubscribeMessage('invite')
  handleInvitation(@MessageBody() body: TInvitationBody) {
    const emitInfo = this.eventService.handleInvitation(body);
    return this.emit(emitInfo);
  }

  @SubscribeMessage('confirm')
  handleConfirmation(@MessageBody() body: TConfirmationBody) {
    this.eventService.handleConfirmation(body);
  }

  @SubscribeMessage('fileUpdate')
  handleFileUpdate(@MessageBody() body: TFileUpdateBody) {
    this.eventService.handleFileUpdate(body);
  }
}
