import { ApiProperty } from '@nestjs/swagger';
import { IsAlphanumeric, IsNotEmpty, IsString } from 'class-validator';

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
