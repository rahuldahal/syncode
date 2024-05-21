import { signInDto, signUpDto } from './dto';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiBody({ type: signUpDto, description: 'User registration information' })
  @HttpCode(201)
  // DTO: Data Transfer Object more - https://docs.nestjs.com/techniques/validation
  signUp(@Body() dto: signUpDto) {
    return this.authService.signUp(dto);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Sign in an existing user' })
  @ApiBody({ type: signInDto, description: 'User credentials for sign-in' })
  @HttpCode(200)
  signIn(@Body() dto: signInDto) {
    return this.authService.signIn(dto);
  }
}
