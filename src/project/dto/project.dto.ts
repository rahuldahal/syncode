import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'project537', description: 'Name of the project' })
  @IsString()
  name: string;

  @ApiProperty({ example: 3, description: 'ID of the project owner' })
  @IsInt()
  ownerId: number;
}
