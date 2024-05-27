import { ValidationPipe } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { PostgreSqlContainer } from '@testcontainers/postgresql';

import { AppModule } from '../../src/app.module';
import { NotFoundInterceptor } from '../../src/utils/interceptors/not-found.interceptor';

module.exports = async () => {
  global.pg = await new PostgreSqlContainer('postgres:latest')
    .withExposedPorts({ container: 5432, host: 55044 })
    .withDatabase(process.env.DATABASE_NAME)
    .withUsername(process.env.DATABASE_USERNAME)
    .withPassword(process.env.DATABASE_PASSWORD)
    .start();

  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
    providers: [
      {
        provide: APP_INTERCEPTOR,
        useClass: NotFoundInterceptor,
      },
      {
        provide: APP_PIPE,
        useFactory: () => new ValidationPipe({ stopAtFirstError: true }),
      },
    ],
  }).compile();

  global.app = moduleFixture.createNestApplication();

  await global.app.init();
};
