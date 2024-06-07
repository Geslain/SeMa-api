import {
  CanActivate,
  ClassSerializerInterceptor,
  ExecutionContext,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import * as request from 'supertest';

import { AppModule } from '../../src/app.module';
import { NotFoundInterceptor } from '../../src/common/interceptors/not-found.interceptor';
import { userFactory } from '../../src/users/factories/user.factory';
import { AuthGuard } from '../../src/auth/auth.guard';

module.exports = async () => {
  const user = userFactory.build();
  global.pg = await new PostgreSqlContainer('postgres:latest')
    .withExposedPorts({ container: 5432, host: 55044 })
    .withDatabase(process.env.DATABASE_NAME)
    .withUsername(process.env.DATABASE_USERNAME)
    .withPassword(process.env.DATABASE_PASSWORD)
    .start();

  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(AuthGuard)
    .useClass(
      class AuthGuardMock implements CanActivate {
        async canActivate(context: ExecutionContext) {
          const req = context.switchToHttp().getRequest();
          req.user = { username: user.email }; // Your user object
          return true;
        }
      },
    )
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalInterceptors(new NotFoundInterceptor());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
    }),
  );

  global.app = app;
  global.loggedUser = user;

  await global.app.init();

  await request(app.getHttpServer()).post('/users').send({
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    password: user.password,
  });
};
