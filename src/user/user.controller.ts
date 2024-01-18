import { User } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/Decorator';
import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
@UseGuards(AuthGuard('accessToken'))
export class UserController {
  @ApiBearerAuth() // Indicates that the endpoint requires Bearer token authentication
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOkResponse({ description: 'User information retrieved successfully' })
  @ApiOperation({ summary: 'Get current user information' })
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }
}
