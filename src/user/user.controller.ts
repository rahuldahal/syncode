import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';

@Controller('users')
export class UserController {
  @UseGuards(AuthGuard('accessToken'))
  @Get('me')
  getMe(@Req() req: Request) {
    return req.user;
  }
}
