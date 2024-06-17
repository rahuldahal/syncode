import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway, JwtService],
})
export class GatewayModule {}
