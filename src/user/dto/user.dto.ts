import { IsAlpha, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsAlpha()
  @IsString()
  firstname?: string;

  @IsOptional()
  @IsAlpha()
  @IsString()
  lastname?: string;

  @IsOptional()
  @IsUrl()
  @IsString()
  picture?: string;
}
