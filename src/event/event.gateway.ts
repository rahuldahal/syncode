import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { TEmitInfo } from './types/emit.type';
import { EventService } from './event.service';
import { ConfigService } from '@nestjs/config';
import { EventAuth } from './../auth/event-guard/event.middleware';
import { EventJwtGuard } from 'src/auth/event-guard/event-jwt.guard';

import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
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
@UseGuards(EventJwtGuard)
export class EventGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private eventService: EventService,
    private configService: ConfigService,
  ) {}

  @WebSocketServer()
  server: Server;

  emit({ receiver, messageName, messageValue }: TEmitInfo): void {
    this.server.to(receiver).emit(messageName, messageValue);
    return;
  }

  handleConnection(client: Socket) {
    console.log('on connection');
    const user = this.eventService.decodeJWT(client);
    this.eventService.addConnectedUser(client, user);
  }

  afterInit(client: Socket) {
    console.log('on after init');

    client.use(EventAuth(this.configService) as any);
    // const user = this.eventService.decodeJWT(client);
    // this.eventService.addConnectedUser(client, user);
  }

  handleDisconnect(client: Socket): void {
    const emitInfo = this.eventService.handleDisconnect(client);
    return emitInfo ? this.emit(emitInfo) : null;
  }

  @SubscribeMessage('search')
  async handleSearch(
    @MessageBody() body: TSearchBody,
    @ConnectedSocket() client: Socket,
  ) {
    const emitInfo = await this.eventService.handleSearch(body, client);
    return emitInfo ? this.emit(emitInfo) : null;
  }

  @SubscribeMessage('invite')
  handleInvitation(
    @MessageBody() body: TInvitationBody,
    @ConnectedSocket() client: Socket,
  ) {
    const emitInfo = this.eventService.handleInvitation(body, client);
    return emitInfo ? this.emit(emitInfo) : null;
  }

  @SubscribeMessage('confirm')
  handleConfirmation(
    @MessageBody() body: TConfirmationBody,
    @ConnectedSocket() client: Socket,
  ) {
    const emitInfo = this.eventService.handleConfirmation(body, client);
    return emitInfo ? this.emit(emitInfo) : null;
  }

  @SubscribeMessage('fileUpdate')
  async handleFileUpdate(
    @MessageBody() body: TFileUpdateBody,
    @ConnectedSocket() client: Socket,
  ) {
    const emitInfo = await this.eventService.handleFileUpdate(body, client);
    return emitInfo ? this.emit(emitInfo) : null;
  }
}
