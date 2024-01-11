import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MyConfigModule } from './config.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [MyConfigModule, AuthModule, PrismaModule],
})
export class AppModule {}
