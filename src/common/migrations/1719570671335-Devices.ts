import { MigrationInterface, QueryRunner } from 'typeorm';

export class Devices1719570671335 implements MigrationInterface {
  name = 'Devices1719570671335';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "data_row_field" DROP CONSTRAINT "FK_2bdb9525946b2361a31b1072237"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row_field" DROP CONSTRAINT "FK_5fa3ada56c40fed856be609e8bc"`,
    );
    await queryRunner.query(
      `CREATE TABLE "device" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "deviceId" character varying NOT NULL, "accessToken" character varying NOT NULL, "ownerId" uuid NOT NULL, CONSTRAINT "PK_2dc10972aa4e27c01378dad2c72" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "project" ADD "deviceId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "data_row_field" ADD CONSTRAINT "FK_2bdb9525946b2361a31b1072237" FOREIGN KEY ("dataRowId") REFERENCES "data_row"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row_field" ADD CONSTRAINT "FK_5fa3ada56c40fed856be609e8bc" FOREIGN KEY ("fieldId") REFERENCES "field"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "device" ADD CONSTRAINT "FK_d0dab0006c7c8f3aea3fe5eaf85" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD CONSTRAINT "FK_bc5d73b5871a407f107994b4aee" FOREIGN KEY ("deviceId") REFERENCES "device"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project" DROP CONSTRAINT "FK_bc5d73b5871a407f107994b4aee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "device" DROP CONSTRAINT "FK_d0dab0006c7c8f3aea3fe5eaf85"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row_field" DROP CONSTRAINT "FK_5fa3ada56c40fed856be609e8bc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row_field" DROP CONSTRAINT "FK_2bdb9525946b2361a31b1072237"`,
    );
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "deviceId"`);
    await queryRunner.query(`DROP TABLE "device"`);
    await queryRunner.query(
      `ALTER TABLE "data_row_field" ADD CONSTRAINT "FK_5fa3ada56c40fed856be609e8bc" FOREIGN KEY ("fieldId") REFERENCES "field"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row_field" ADD CONSTRAINT "FK_2bdb9525946b2361a31b1072237" FOREIGN KEY ("dataRowId") REFERENCES "data_row"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
