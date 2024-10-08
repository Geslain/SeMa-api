import { faker } from '@faker-js/faker';
import * as request from 'supertest';

import { usersDtoFactory } from '../src/users/factories/users.factory';

describe('User (e2e)', () => {
  const userParams = usersDtoFactory.build();
  let user;

  describe('Successful CRUD test', () => {
    it('/users (POST)', async () => {
      const response = await request(global.app.getHttpServer())
        .post('/users')
        .send(userParams);

      const { firstname, lastname, email } = userParams;
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({ firstname, lastname, email });
      user = response.body;
    });

    it('/users (GET)', async () => {
      const response = await request(global.app.getHttpServer()).get('/users');

      expect(response.status).toBe(200);
      expect(response.body[1]).toEqual(user);
    });

    it('/users/:id (GET)', async () => {
      const response = await request(global.app.getHttpServer()).get(
        `/users/${user.id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(user);
    });

    it('/users/:id (PATCH)', async () => {
      const { ...updatedUserParams } = usersDtoFactory.build();
      const response = await request(global.app.getHttpServer())
        .patch(`/users/${user.id}`)
        .send(updatedUserParams);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(updatedUserParams);
    });

    it('/users/:id (DELETE)', async () => {
      const response = await request(global.app.getHttpServer()).delete(
        `/users/${user.id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ raw: [], affected: 1 });
    });
  });

  describe('Param verification test', () => {
    const badRequestMessage = {
      error: 'Bad Request',
      message: 'Validation failed (uuid is expected)',
      statusCode: 400,
    };

    it('/users/:id (GET)', async () => {
      const response = await request(global.app.getHttpServer()).get(
        `/users/1`,
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual(badRequestMessage);
    });

    it('/users/:id (PATCH)', async () => {
      const updatedUserParams = usersDtoFactory.build();
      const response = await request(global.app.getHttpServer())
        .patch(`/users/1`)
        .send(updatedUserParams);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(badRequestMessage);
    });

    it('/users/:id (DELETE)', async () => {
      const response = await request(global.app.getHttpServer()).delete(
        `/users/1`,
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual(badRequestMessage);
    });
  });

  describe('Not found test', () => {
    it('/users/:id (GET)', async () => {
      const response = await request(global.app.getHttpServer()).get(
        `/users/${faker.string.uuid()}`,
      );

      expect(response.status).toBe(404);
    });

    it('/users/:id (PATCH)', async () => {
      const updatedUserParams = usersDtoFactory.build();
      const response = await request(global.app.getHttpServer())
        .patch(`/users/${faker.string.uuid()}`)
        .send(updatedUserParams);

      expect(response.status).toBe(404);
    });

    it('/users/:id (DELETE)', async () => {
      const response = await request(global.app.getHttpServer()).delete(
        `/users/${faker.string.uuid()}`,
      );

      expect(response.status).toBe(404);
    });
  });

  describe('Body validation test', () => {
    ['post', 'patch'].forEach((protocol) => {
      describe(`/users (${protocol.toUpperCase()})`, () => {
        let url: string;
        if (protocol === 'patch') {
          beforeEach(async () => {
            const response = await request(global.app.getHttpServer())
              .post('/users')
              .send(usersDtoFactory.build());

            url = `/users/${response.body.id}`;
          });

          it('Should not update unauthorized user attributes', async () => {
            const response = await request(global.app.getHttpServer())
              [protocol](url)
              .send({
                ...usersDtoFactory.build(),
                createdAt: Date.now(),
                id: faker.string.uuid(),
              });

            const updatedUser = response.body;
            const statusCode = response.statusCode;

            expect(statusCode).toBe(400);
            expect(updatedUser.message).toEqual(
              expect.arrayContaining([
                'property id should not exist',
                'property createdAt should not exist',
              ]),
            );
          });
        } else {
          url = '/users/';

          it('Should check that params are not empty', async () => {
            const response = await request(global.app.getHttpServer())
              [protocol](url)
              .send();

            expect(response.status).toBe(400);

            ['firstname', 'lastname', 'email'].forEach((field) => {
              expect(response.body.message).toContain(
                `${field} should not be empty`,
              );
            });
          });
        }

        ['firstname', 'lastname'].forEach((field) => {
          describe(field, () => {
            it(`Should check that ${field} has at least 2 character`, async () => {
              const response = await request(global.app.getHttpServer())
                [protocol](url)
                .send({ [field]: 'z' });

              expect(response.status).toBe(400);
              expect(response.body.message).toContain(
                `${field} must be longer than or equal to 2 characters`,
              );
            });

            it(`Should check that ${field} is a string`, async () => {
              const response = await request(global.app.getHttpServer())
                [protocol](url)
                .send({ [field]: 111 });

              expect(response.status).toBe(400);
              expect(response.body.message).toContain(
                `${field} must be a string`,
              );
            });
          });
        });

        describe('email', () => {
          it(`Should check that email is well-formed`, async () => {
            const response = await request(global.app.getHttpServer())
              [protocol](url)
              .send({ email: 'fakemail.com' });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain(`email must be an email`);
          });
        });
      });
    });
  });
});
