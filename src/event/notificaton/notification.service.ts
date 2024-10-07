import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const { type, content, userId } = createNotificationDto;
    return this.prisma.notification.create({
      data: {
        type,
        content,
        userId,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
    });
  }

  async remove(id: number) {
    return this.prisma.notification.delete({
      where: { id },
    });
  }
}
