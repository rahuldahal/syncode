import { APP_PIPE } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { FileModule } from './file/file.module';
import { MyConfigModule } from './config.module';
import { EventModule } from './event/event.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectModule } from './project/project.module';
import { RedirectMiddleware } from './middlewares/redirect.middleware';
import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
  imports: [
    MyConfigModule,
    AuthModule,
    UserModule,
    PrismaModule,
    ProjectModule,
    FileModule,
    EventModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply the RedirectMiddleware to all routes
    consumer.apply(RedirectMiddleware).forRoutes('*');
  }
}
