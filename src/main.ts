import { AppModule } from './app.module';
import setupSwagger from './docs/swagger';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Redirect } from './middlewares/redirect.middleware';
import { HttpExceptionFilter } from './utils/http-exception.filter';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { IoAdapter } from '@nestjs/platform-socket.io';

class CustomIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any) {
    options = {
      ...options,
      cors: {
        origin: 'http://localhost:5173',
        credentials: true,
      },
    };
    return super.createIOServer(port, options);
  }
}

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

  app.useWebSocketAdapter(new CustomIoAdapter(app));

  app.enableCors(corsOptions);

  // .env configuration
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 8888;
  await app.listen(port);

  new Logger('main').log(`Server is listening on port: ${port}`);
}
bootstrap();
