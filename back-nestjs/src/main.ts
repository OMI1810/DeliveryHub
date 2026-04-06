import { RequestMethod, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import * as cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix("api", {
    exclude: [{ path: "verify-email", method: RequestMethod.GET }],
  });

  app.use(cookieParser());

  const corsOrigins = configService
    .get<string>("CORS_ORIGINS", "http://localhost:3000")
    .split(",");

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    exposedHeaders: "set-cookie",
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle("DeliveryHub API")
    .setDescription("API documentation for DeliveryHub delivery service")
    .setVersion("1.0")
    .addBearerAuth()
    .addCookieAuth("refreshToken")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(4200);
}
bootstrap();
