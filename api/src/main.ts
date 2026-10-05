import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule
    // {
    //   instrument: ObserveInstrument,
    // }
  );

  // Semua route diawali /api, contoh: POST /api/auth/login
  app.setGlobalPrefix('api');

  // Validasi semua input di server (sesuai spec)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // buang field yang tidak ada di DTO
      forbidNonWhitelisted: true, // tolak field asing
      transform: true, // ubah payload ke tipe DTO
    }),
  );

  // CORS hanya berlaku untuk browser. Postman tidak terpengaruh.
  const allowedOrigins = [process.env.WEB_URL, 'http://localhost:8000'].filter(
    Boolean,
  ) as string[];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 8000);
}
await bootstrap();
