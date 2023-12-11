import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, // 요청을 우리가 원하는 타입으로 바꿔줌
    }),
  );

  // CORS 설정
  app.enableCors();

  await app.listen(3030);
}

bootstrap();
