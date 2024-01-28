import { User } from '@prisma/client';
import { CreateProjectDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/Decorator';
import { AuthGuard } from '@nestjs/passport';
import { ProjectService } from './project.service';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';

@ApiTags('projects')
@Controller('projects')
@UseGuards(AuthGuard('accessToken'))
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Post('/')
  createProject(@Body() dto: CreateProjectDto, @GetUser() user: User) {
    console.log(dto);

    return this.projectService.createProject(user, dto);
  }
}
