import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { NotFoundInterceptor } from './common/interceptors/not-found.interceptor';
import { BaseEntity } from './common/base-entity/base-entity.entity';
import { Field } from './fields/entities/field.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('SeMa Api')
    .setDescription('The SeMa Api description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [BaseEntity, Field],
  });
  SwaggerModule.setup('api', app, document);

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.enableCors();
  app.useGlobalInterceptors(new NotFoundInterceptor());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.listen(3000);
}
bootstrap();
