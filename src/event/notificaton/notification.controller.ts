import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Get(':userId')
  async findAll(@Param('userId') userId: number) {
    return this.notificationService.findAll(userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.notificationService.remove(id);
  }
}
