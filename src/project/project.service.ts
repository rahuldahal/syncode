import { User } from '@prisma/client';
import { CreateProjectDto } from './dto/project.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async createProject(user: User, dto: CreateProjectDto) {
    try {
      // Initialize project variable to null
      let project = null;

      // Prepare required data for project creation
      const requiredData = {
        name: dto.name,
        ownerId: user.id,
      };

      // Check if collaborators are provided in the DTO
      if (dto.collaborators) {
        // Create project with collaborators
        project = await this.prisma.project.create({
          data: {
            ...requiredData,
            collaborators: {
              connect: dto.collaborators.map((collaboratorId) => ({
                id: collaboratorId,
              })),
            },
          },
        });
      } else {
        // Create project without collaborators
        project = await this.prisma.project.create({
          data: requiredData,
        });
      }

      // Return the created project
      return project;
    } catch (error) {
      console.log(error);
      throw InternalServerErrorException;
    }
  }
}
