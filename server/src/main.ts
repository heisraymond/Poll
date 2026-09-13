import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Main (main.ts)');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = parseInt(configService.get('PORT', '3000'));
  const clientPort = parseInt(configService.get('CLIENT_PORT', '8080'));

  app.enableCors({
    origin: [
      `http://localhost:${clientPort}`,
      /^http:\/\/192\.168\.1\.([1-9]|[1-9]\d):8080$/,
    ],
    credentials: true,
  });

  await app.listen(port);

  logger.log(`Server running on port ${port}`);
}
bootstrap();
