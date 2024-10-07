import { NotificationType } from '../notification.type';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  userId: number;
}
