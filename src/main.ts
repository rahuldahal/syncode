import { AppModule } from './app.module';
import setupSwagger from './docs/swagger';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Redirect } from './middlewares/redirect.middleware';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { HttpExceptionFilter } from './utils/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  // Register the global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Apply middleware for redirection
  app.use(Redirect());

  // Set the global prefix for all routes
  app.setGlobalPrefix('api/v1');

  // Swagger docs configuration
  setupSwagger(app);

  // Enable CORS
  const corsOptions: CorsOptions = {
    origin: ['http://localhost:5173', 'https://co-edit.netlify.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };

  app.enableCors(corsOptions);

  // .env configuration
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 8888;
  await app.listen(port);

  new Logger('main').log(`Server is listening on port: ${port}`);
}
bootstrap();
