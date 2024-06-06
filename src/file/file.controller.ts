import { CreateFileDto } from './dto';
import { User } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { FileService } from './file.service';
import { GetParam, GetUser } from 'src/auth/Decorator';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('files')
@Controller('files')
@UseGuards(AuthGuard('accessToken'))
export class FileController {
  constructor(private fileService: FileService) {}

  @ApiBearerAuth()
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOperation({ summary: 'Create a new file for the current project' })
  @ApiResponse({
    status: 201,
    description: 'File created successfully',
  })
  @Post('/')
  createFile(@Body() dto: CreateFileDto) {
    return this.fileService.createFile(dto);
  }

  @ApiBearerAuth()
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOperation({ summary: 'Get all files' })
  @ApiResponse({
    status: 200,
    description: 'Files found successfully',
  })
  @Get('/')
  findAllFiles(@GetUser() user: User ){
    return this.fileService.getAllFiles(user.id);
  }

  @ApiBearerAuth()
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOperation({ summary: 'Find the file matching the id' })
  @ApiResponse({
    status: 200,
    description: 'File has been found',
  })
  @Get('/:id')
  findFile(@GetParam('id') id: string) {
    return this.fileService.getFile(parseInt(id));
  }
}
