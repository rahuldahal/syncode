import { User } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/project.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async createProject(user: User, dto: CreateProjectDto) {
    return { user, dto };
  }
}
