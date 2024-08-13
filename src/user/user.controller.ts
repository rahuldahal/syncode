import { User } from '@prisma/client';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/Decorator';
import { UpdatePasswordDto, UpdateUserDto } from './dto';

import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
@UseGuards(AuthGuard('accessToken'))
export class UserController {
  constructor(private userService: UserService) {}

  @ApiBearerAuth() // Indicates that the endpoint requires Bearer token authentication
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOkResponse({ description: 'User information retrieved successfully' })
  @ApiOperation({ summary: 'Get current user information' })
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @ApiBearerAuth()
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOkResponse({ description: 'User information updated successfully' })
  @ApiOperation({ summary: 'Update current user information' })
  @Patch('me')
  @ApiBody({ type: UpdateUserDto })
  updateMe(@Body() dto: UpdateUserDto, @GetUser() user: User) {
    return this.userService.updateUser(user.id, dto);
  }

  @ApiBearerAuth()
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOkResponse({ description: 'Password updated successfully' })
  @ApiOperation({ summary: 'Update current user password' })
  @Patch('me/password')
  @HttpCode(200)
  @ApiBody({ type: UpdatePasswordDto })
  updatePassword(@Body() dto: UpdatePasswordDto, @GetUser() user: User) {
    return this.userService.updatePassword(dto, user.id);
  }
}
