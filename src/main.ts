import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const jsonBodyLimit = process.env.JSON_BODY_LIMIT ?? '32mb';
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
  app.use(json({ limit: jsonBodyLimit }));
  app.use(urlencoded({ limit: jsonBodyLimit, extended: true }));
  app.setGlobalPrefix('api/v1', { exclude: ['health'] });
  app.getHttpAdapter().get('/health', (_req, res) => res.json({ ok: true }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN?.split(',') ?? true,
    credentials: true,
  });
  const port = process.env.PORT ?? 4000;
  await app.listen(port);
}
void bootstrap();
