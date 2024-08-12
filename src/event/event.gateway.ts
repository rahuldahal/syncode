import { Server, Socket } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';
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
} from './event.interfaces';

@WebSocketGateway({
  cors: { origin: 'http://localhost:5173' },
  namespace: 'collaboration',
})
export class EventGateway implements OnModuleInit {
  constructor(private eventService: EventService) {}

  @WebSocketServer()
  server: Server;

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
    this.eventService.handleInvitation(body);
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
