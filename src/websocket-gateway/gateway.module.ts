import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventsGateway } from './events.gateway';
import { UserService } from 'src/user/user.service';
import { FileService } from 'src/file/file.service';

@Module({
  providers: [EventsGateway, JwtService, UserService, FileService],
})
export class GatewayModule {}
