import { AppModule } from './app.module';
import setupSwagger from './docs/swagger';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Redirect } from './middlewares/redirect.middleware';
import { HttpExceptionFilter } from './utils/http-exception.filter';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

class CustomIoAdapter extends IoAdapter {
  constructor(
    private _app: INestApplication,
    private configService: ConfigService,
  ) {
    super(_app);
  }

  createIOServer(port: number, options?: any) {
    const corsWhitelist = this.configService.get<string>('CORS_WHITELIST');
    const allowedOrigins = corsWhitelist ? corsWhitelist.split(',') : [];

    console.log('Allowed Origins:', allowedOrigins);

    options = {
      ...options,
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
    };
    return super.createIOServer(port, options);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

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

  // Enable CORS using environment variable
  const corsWhitelist = configService.get<string>('CORS_WHITELIST');
  const allowedOrigins = corsWhitelist ? corsWhitelist.split(',') : [];

  const corsOptions: CorsOptions = {
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };

  app.useWebSocketAdapter(new CustomIoAdapter(app, configService));

  app.enableCors(corsOptions);

  const port = configService.get<number>('PORT') || 8888;
  await app.listen(port);

  new Logger('main').log(`Server is listening on port: ${port}`);
}
bootstrap();
