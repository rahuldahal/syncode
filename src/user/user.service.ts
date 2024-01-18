import { UpdateUserDto } from './dto';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async updateUser(dto: UpdateUserDto, userId: User['id']) {
    const data = {};
    // filter falsy data
    Object.keys(dto).forEach((key) => {
      if (dto[key]) {
        data[key] = dto[key];
      }
    });

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID: ${userId} not found`);
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data,
      });

      // TODO: refactor the functionality
      delete updatedUser.password;

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  // TODO: update password
}
