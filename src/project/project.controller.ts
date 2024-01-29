import { User } from '@prisma/client';
import { CreateProjectDto } from './dto';
import { GetUser } from 'src/auth/Decorator';
import { AuthGuard } from '@nestjs/passport';
import { ProjectService } from './project.service';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('projects')
@Controller('projects')
@UseGuards(AuthGuard('accessToken'))
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @ApiBearerAuth()
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOperation({ summary: 'Create a new project for the current user' })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
  })
  @ApiOkResponse({ description: 'User information updated successfully' })
  @Post('/')
  createProject(@Body() dto: CreateProjectDto, @GetUser() user: User) {
    return this.projectService.createProject(user, dto);
  }
}
