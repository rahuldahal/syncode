import { CreateFileDto, UpdateContentDto } from './dto/file.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class FileService {
  constructor(private prisma: PrismaService) {}

  async createFile(dto: CreateFileDto) {
    try {
      // save file in the database
      const file = await this.prisma.file.create({
        data: {
          name: dto.name,
          content: dto.content,
          projectId: dto.projectId,
        },
      });

      // Return the created file
      return file;
    } catch (error) {
      console.log(error);
      throw InternalServerErrorException;
    }
  }

  // Get a file
  async getFile(id: number) {
    try {
      const file = await this.prisma.file.findFirstOrThrow({
        where: {
          id,
        },
      });

      // Return the found file
      return file;
    } catch (error) {
      console.log(error);
      throw InternalServerErrorException;
    }
  }

  // Get te content
  async updateContent(id: number, data: UpdateContentDto) {
    try {
      const updatedFile = await this.prisma.file.update({
        where: { id },
        data,
      });

      return updatedFile;
    } catch (error) {
      console.log(error);
      throw InternalServerErrorException;
    }
  }
}
