import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventsGateway } from './events.gateway';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [EventsGateway, JwtService, UserService],
})
export class GatewayModule {}
