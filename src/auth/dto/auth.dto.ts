import { IsAlphanumeric, IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @IsAlphanumeric()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
