import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventGateway } from './event.gateway';
import { EventService } from './event.service';
import { UserService } from 'src/user/user.service';
import { FileService } from 'src/file/file.service';

@Module({
  providers: [EventGateway, JwtService, UserService, FileService, EventService],
})
export class EventModule {}
