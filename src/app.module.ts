import { APP_PIPE } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MyConfigModule } from './config.module';
import { PrismaModule } from './prisma/prisma.module';
import { Module, ValidationPipe } from '@nestjs/common';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
  imports: [MyConfigModule, AuthModule, UserModule, PrismaModule],
})
export class AppModule {}
