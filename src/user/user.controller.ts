import { UserService } from './user.service';
import { User } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/Decorator';
import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UpdateUserDto } from './dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(AuthGuard('accessToken'))
export class UserController {
  constructor(private userService: UserService) {}

  @ApiBearerAuth() // Indicates that the endpoint requires Bearer token authentication
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOkResponse({ description: 'User information retrieved successfully' })
  @ApiOperation({ summary: 'Get current user information' })
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch('me')
  updateMe(@Body() dto: UpdateUserDto, @GetUser() user: User) {
    return this.userService.updateUser(dto, user.id);
  }
}
