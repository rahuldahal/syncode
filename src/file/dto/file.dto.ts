import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CreateFileDto {
  @ApiProperty({ example: 'sample.js', description: 'Name of the file' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'console.log("Sample Code");',
    description: 'The actual content(code) of the file',
  })
  @IsString()
  content: string = ''; // empty by default

  @ApiProperty({
    example: 1,
    description: 'The project to which the file belongs to',
  })
  @IsInt()
  projectId: number;
}
