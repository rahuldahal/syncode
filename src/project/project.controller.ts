import { Response } from 'express';
import { User } from '@prisma/client';
import { CreateProjectDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { ProjectService } from './project.service';
import { GetParam, GetUser } from 'src/auth/Decorator';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { handleHttpError } from 'src/utils';

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

  @ApiBearerAuth()
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOperation({ summary: 'Get all projects' })
  @ApiResponse({
    status: 200,
    description: 'Projects found successfully',
  })
  @Get('/')
  findAllProjects(@GetUser() user: User) {
    return this.projectService.getAllProjects(user.id);
  }

  @ApiBearerAuth()
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({
    status: 200,
    description: 'Deleted project successfully',
  })
  @Delete('/:id')
  deleteProject(
    @GetParam('id') id: string,
    @GetUser() user: User,
    @Res() response: Response,
  ) {
    try {
      return this.projectService.deleteProject(parseInt(id), user.id);
      // return response.sendStatus(200);
    } catch (error) {
      handleHttpError(response, error);
    }
  }
}
