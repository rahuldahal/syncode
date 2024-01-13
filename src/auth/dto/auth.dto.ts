import { IsAlphanumeric, IsNotEmpty, IsString } from 'class-validator';

// Pipes: https://docs.nestjs.com/pipes#class-validator
export class AuthDto {
  @IsAlphanumeric()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
