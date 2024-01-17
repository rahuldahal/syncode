import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { Redirect } from './middlewares/redirect.middleware';
import setupSwagger from './docs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    })
  );

  // Apply middleware for redirection
  app.use(Redirect());

  // Set the global prefix for all routes
  app.setGlobalPrefix('api/v1');

  // Swagger docs configuration
  setupSwagger(app);

  // .env configuration
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 8888;
  await app.listen(port);
}
bootstrap();
