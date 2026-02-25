import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const apiPrefix = process.env.API_PREFIX ?? 'api';
  const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:3000';
  const port = Number(process.env.PORT ?? 3001);

  app.setGlobalPrefix(apiPrefix);
  app.enableCors({
    origin: webOrigin,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    }),
  );

  await app.listen(port);
}

bootstrap();
