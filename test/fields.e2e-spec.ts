import { faker } from '@faker-js/faker';
import * as request from 'supertest';

import { Field, FieldType } from '../src/fields/entities/field.entity';
import { fieldsDtoFactory } from '../src/fields/factories/fields.factory';

describe('Field (e2e)', () => {
  const fieldParams = fieldsDtoFactory.build();
  let field;

  describe('Successful CRUD test', () => {
    it('/fields (POST)', async () => {
      const response = await request(global.app.getHttpServer())
        .post('/fields')
        .send(fieldParams);

      expect(response.body).toMatchObject(fieldParams);
      expect(response.status).toBe(201);
      field = response.body;
    });

    it('/fields (GET)', async () => {
      const response = await request(global.app.getHttpServer()).get('/fields');

      expect(response.status).toBe(200);
      expect(response.body[0]).toEqual(field);
    });

    it('/fields/:id (GET)', async () => {
      const response = await request(global.app.getHttpServer()).get(
        `/fields/${field.id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(field);
    });

    it('/fields/:id (PATCH)', async () => {
      const updatedFieldParams = fieldsDtoFactory.build();
      const response = await request(global.app.getHttpServer())
        .patch(`/fields/${field.id}`)
        .send(updatedFieldParams);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(updatedFieldParams);
    });

    it('/fields/:id (DELETE)', async () => {
      const response = await request(global.app.getHttpServer()).delete(
        `/fields/${field.id}`,
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

    it('/fields/:id (GET)', async () => {
      const response = await request(global.app.getHttpServer()).get(
        `/fields/1`,
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual(badRequestMessage);
    });

    it('/fields/:id (PATCH)', async () => {
      const updatedFieldParams = fieldsDtoFactory.build();
      const response = await request(global.app.getHttpServer())
        .patch(`/fields/1`)
        .send(updatedFieldParams);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(badRequestMessage);
    });

    it('/fields/:id (DELETE)', async () => {
      const response = await request(global.app.getHttpServer()).delete(
        `/fields/1`,
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual(badRequestMessage);
    });
  });

  describe('Not found test', () => {
    it('/fields/:id (GET)', async () => {
      const response = await request(global.app.getHttpServer()).get(
        `/fields/${faker.string.uuid()}`,
      );

      expect(response.status).toBe(404);
    });

    it('/fields/:id (PATCH)', async () => {
      const updatedFieldParams = fieldsDtoFactory.build();
      const response = await request(global.app.getHttpServer())
        .patch(`/fields/${faker.string.uuid()}`)
        .send(updatedFieldParams);

      expect(response.status).toBe(404);
    });

    it('/fields/:id (DELETE)', async () => {
      const response = await request(global.app.getHttpServer()).delete(
        `/fields/${faker.string.uuid()}`,
      );

      expect(response.status).toBe(404);
    });
  });

  describe('Body validation test', () => {
    ['post', 'patch'].forEach((protocol) => {
      describe(`/fields (${protocol.toUpperCase()})`, () => {
        let url: string;
        let field: Field;
        if (protocol === 'patch') {
          beforeEach(async () => {
            const response = await request(global.app.getHttpServer())
              .post('/fields')
              .send(fieldsDtoFactory.build());

            url = `/fields/${response.body.id}`;
            field = response.body;
          });

          it('Should not update unauthorized field attributes', async () => {
            const response = await request(global.app.getHttpServer())
              [protocol](url)
              .send({
                ...fieldsDtoFactory.build(),
                createdAt: Date.now(),
                id: faker.string.uuid(),
              });

            const updatedField = response.body;

            expect(updatedField.created_at).toBe(field.created_at);
            expect(updatedField.id).toBe(field.id);
          });
        } else {
          url = '/fields/';

          it('Should check that params are not empty', async () => {
            const response = await request(global.app.getHttpServer())
              [protocol](url)
              .send();

            expect(response.status).toBe(400);

            ['name', 'type'].forEach((field) => {
              expect(response.body.message).toContain(
                `${field} should not be empty`,
              );
            });
          });
        }

        ['name'].forEach((field) => {
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
        describe('type', () => {
          it(`Should check that type is enum value`, async () => {
            const response = await request(global.app.getHttpServer())
              [protocol](url)
              .send({ type: 'wrong_type' });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain(
              'type must be one of the following values: text, date, list',
            );

            for (const [, value] of Object.entries(FieldType)) {
              const fieldDto = fieldsDtoFactory.build({ type: value });
              const response = await request(global.app.getHttpServer())
                [protocol](url)
                .send({
                  ...fieldDto,
                  type: value,
                });

              expect(response.status).toBe(protocol === 'post' ? 201 : 200);
            }
          });
        });

        describe('value', () => {
          it("Should be an array if field's type is 'list'", async () => {
            const response = await request(global.app.getHttpServer())
              [protocol](url)
              .send(
                fieldsDtoFactory.build({ type: FieldType.LIST, values: [] }),
              );

            expect(response.body.message).toContain(
              "You must add at least one value for type 'list' field",
            );
            expect(response.status).toBe(400);
          });

          it("Should be not need array if field's type is not 'list'", async () => {
            for (const fieldType of Object.values(FieldType).filter(
              (fieldType) => fieldType !== FieldType.LIST,
            )) {
              const response = await request(global.app.getHttpServer())
                [protocol](url)
                .send(fieldsDtoFactory.build({ type: fieldType }));

              expect(response.status).toBe(protocol === 'post' ? 201 : 200);
            }
          });

          it(`Should have at least one value`, async () => {
            const response = await request(global.app.getHttpServer())
              [protocol](url)
              .send(
                fieldsDtoFactory.build({ type: FieldType.LIST, values: [] }),
              );

            expect(response.body.message).toContain(
              "You must add at least one value for type 'list' field",
            );
            expect(response.status).toBe(400);
          });
        });
      });
    });
  });
});
