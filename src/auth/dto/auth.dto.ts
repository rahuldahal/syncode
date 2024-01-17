import { ApiProperty } from '@nestjs/swagger';
import {
  IsAlpha,
  IsAlphanumeric,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

// Pipes: https://docs.nestjs.com/pipes#class-validator
export class AuthDto {
  @IsAlphanumeric()
  @IsNotEmpty()
  @ApiProperty({
    example: 'johndoe123',
    description: 'The username of the user',
  })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'password123',
    description: 'The password of the user',
  })
  password: string;
}

export class signUpDto extends AuthDto {
  @IsOptional()
  @IsAlpha()
  @ApiProperty({
    example: 'john',
    description: 'The first-name of the user',
  })
  firstname?: string;

  @IsOptional()
  @IsAlpha()
  @ApiProperty({
    example: 'doe',
    description: 'The last-name of the user',
  })
  lastname?: string;
}

export class signInDto extends AuthDto {}
