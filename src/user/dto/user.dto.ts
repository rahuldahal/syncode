import { ApiProperty } from '@nestjs/swagger';
import {
  IsAlpha,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    required: false,
    description: 'Optional. New first name of the user.',
  })
  @IsOptional()
  @IsAlpha()
  @IsString()
  firstname?: string;

  @ApiProperty({
    required: false,
    description: 'Optional. New last name of the user.',
  })
  @IsOptional()
  @IsAlpha()
  @IsString()
  lastname?: string;

  @ApiProperty({
    required: false,
    description: 'Optional. URL of the new profile picture.',
  })
  @IsOptional()
  @IsUrl()
  @IsString()
  picture?: string;
}

export class UpdatePasswordDto {
  @ApiProperty({ description: 'Current password of the user.' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    description: 'New password for the user.',
  })
  @IsString()
  @IsNotEmpty()
  // TODO: use @Matches(Regex) to specify te pattern
  newPassword: string;
}
