import { APP_PIPE } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
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
  imports: [MyConfigModule, AuthModule, PrismaModule],
})
export class AppModule {}
