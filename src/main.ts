import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestInterceptor } from './global/bad-request-exception/bad-request-exception.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  app.useGlobalInterceptors(new BadRequestInterceptor());
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
