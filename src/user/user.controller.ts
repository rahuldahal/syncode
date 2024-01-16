import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UserController {
  @ApiBearerAuth() // Indicates that the endpoint requires Bearer token authentication
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOkResponse({ description: 'User information retrieved successfully' })
  @UseGuards(AuthGuard('accessToken'))
  @Get('me')
  @ApiOperation({ summary: 'Get current user information' })
  getMe(@Req() req: Request) {
    return req.user;
  }
}
