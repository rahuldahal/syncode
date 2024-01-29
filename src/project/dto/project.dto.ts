import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'project537', description: 'Name of the project' })
  @IsString()
  name: string;

  @ApiProperty({
    example: [2, 3],
    description: 'An array containing the ID of the project contributors',
  })
  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  collaborators?: number[];
}
